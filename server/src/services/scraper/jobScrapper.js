import { chromium } from "playwright";

/**
 * Internshala-only job scraper
 *
 * Usage:
 *   const jobs = await scrapeJobs(["frontend developer","react"], ["Bengaluru","Remote"], 20);
 */

/* ----------------------------- Helpers ----------------------------- */

const toArray = (x) =>
    Array.isArray(x)
        ? x
        : String(x || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Try to interpret relative posted strings into Date object.
 */
function parsePostedAtToDate(text) {
    if (!text) return null;
    const t = String(text).trim().toLowerCase();

    if (!t) return null;
    const now = new Date();

    if (/(just posted|just now|posted today|today|posted few)/i.test(t)) {
        return now;
    }
    let m = t.match(/(\d+)\s*hour/);
    if (m) {
        const hours = parseInt(m[1], 10);
        return new Date(now.getTime() - hours * 3600 * 1000);
    }
    m = t.match(/(\d+)\s*min/);
    if (m) {
        const mins = parseInt(m[1], 10);
        return new Date(now.getTime() - mins * 60 * 1000);
    }
    m = t.match(/(\d+)\s*day/);
    if (m) {
        const days = parseInt(m[1], 10);
        return new Date(now.getTime() - days * 24 * 3600 * 1000);
    }
    m = t.match(/(\d+)\s*month/);
    if (m) {
        const months = parseInt(m[1], 10);
        const d = new Date(now);
        d.setMonth(d.getMonth() - months);
        return d;
    }
    m = t.match(/(\d+)\+/);
    if (m) {
        const days = parseInt(m[1], 10);
        return new Date(now.getTime() - days * 24 * 3600 * 1000);
    }

    const maybe = Date.parse(text);
    if (!Number.isNaN(maybe)) return new Date(maybe);

    return null;
}

/**
 * Compute a score for prioritization
 */
function computeScore(job, postKeywords = [], locKeywords = []) {
    const title = (job.title || "").toLowerCase();
    const location = (job.location || "").toLowerCase();
    const summary = (job.summary || "").toLowerCase();

    let score = 0;
    for (const kw of postKeywords) {
        if (!kw) continue;
        if (title.includes(kw)) score += 50;
        else if (summary.includes(kw)) score += 20;
    }

    for (const lk of locKeywords) {
        if (!lk) continue;
        if (location.includes(lk)) score += 10;
    }

    if (job.postedAtDate instanceof Date && !isNaN(job.postedAtDate)) {
        const ageMs = Date.now() - job.postedAtDate.getTime();
        const ageDays = Math.floor(ageMs / (24 * 3600 * 1000));
        if (ageDays <= 1) score += 20;
        else if (ageDays <= 3) score += 12;
        else if (ageDays <= 7) score += 6;
        else if (ageDays <= 30) score += 2;
    }

    return score;
}

/* ------------------------ Auto-scroll helper ------------------------ */
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let total = 0;
            const distance = 300;
            const timer = setInterval(() => {
                const scrollHeight =
                    document.body.scrollHeight || document.documentElement.scrollHeight;
                window.scrollBy(0, distance);
                total += distance;
                if (total >= scrollHeight - window.innerHeight - 100) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });
}

/* ----------------------------- Main ----------------------------- */

export const scrapeJobs = async (
    desiredPost = [],
    desiredLocation = [],
    limit = 10,
    options = { maxAgeDays: 60 }
) => {
    const posts = toArray(desiredPost);
    const locs = toArray(desiredLocation);

    const postKeywords = posts.map((p) => p.toLowerCase());
    const locKeywords = locs.map((l) => l.toLowerCase());

    async function runAttempt(headless = true) {
        const browser = await chromium.launch({ headless, args: ["--no-sandbox"] });
        const context = await browser.newContext({
            viewport: { width: 1280, height: 900 },
            userAgent:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            locale: "en-US",
            timezoneId: "Asia/Kolkata",
        });

        // stealth-ish
        await context.addInitScript(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => false });
            Object.defineProperty(navigator, "languages", {
                get: () => ["en-US", "en"],
            });
        });

        const page = await context.newPage();
        page.setDefaultNavigationTimeout(60000);
        page.setDefaultTimeout(30000);

        const collected = [];

        try {
            for (const post of posts.length ? posts : [""]) {
                for (const loc of locs.length ? locs : [""]) {
                    if (collected.length >= limit) break;

                    // Build Internshala search URL
                    const p = (post || "").toLowerCase().replace(/\s+/g, "-");
                    const l = (loc || "").toLowerCase().replace(/\s+/g, "-");
                    const url = l
                        ? `https://internshala.com/internships/${encodeURIComponent(
                            p
                        )}-internship-in-${encodeURIComponent(l)}`
                        : `https://internshala.com/internships/${encodeURIComponent(
                            p
                        )}-internship`;

                    console.log(`🔍 [Internshala] Scraping:`, url);

                    try {
                        await page.goto(url, {
                            waitUntil: "domcontentloaded",
                            timeout: 60000,
                        });

                        await page.waitForTimeout(1200);
                        await autoScroll(page);
                        await page.waitForTimeout(700);

                        const selectors =
                            ".training_card, .internship_meta, .individual_internship, .internship_container";
                        let cardCount = await page
                            .$$eval(selectors, (els) => els.length)
                            .catch(() => 0);

                        if (!cardCount) {
                            await page.waitForTimeout(2000);
                            cardCount = await page
                                .$$eval(selectors, (els) => els.length)
                                .catch(() => 0);
                            if (!cardCount) {
                                console.warn(
                                    `⚠️ No cards found for Internshala ${post} @ ${loc}`
                                );
                                continue;
                            }
                        }

                        const jobs = await page.$$eval(selectors, (cards) => {
                            const results = [];
                            for (const el of cards) {
                                const qText = (s) => {
                                    try {
                                        return el.querySelector(s)?.innerText?.trim() || "";
                                    } catch (e) {
                                        return "";
                                    }
                                };

                                const title =
                                    qText(".heading_4_5") ||
                                    qText(".profile") ||
                                    qText(".heading_4_5 a") ||
                                    qText("a");
                                const company =
                                    qText(".company_name") ||
                                    qText(".company") ||
                                    qText(".sub_title") ||
                                    "";
                                const location =
                                    qText(".location_link") ||
                                    qText(".location") ||
                                    "";
                                const summary =
                                    qText(".short_description") ||
                                    qText(".internship_meta .info") ||
                                    "";
                                const salary =
                                    qText(".stipend") || "Not specified";
                                const posted =
                                    qText(".start-date, .date") ||
                                    qText(".posted") ||
                                    "";

                                let link = "";
                                try {
                                    const anchors = el.querySelectorAll("a");
                                    for (const a of anchors) {
                                        const href = a.getAttribute("href") || a.href || "";
                                        if (!href) continue;
                                        if (
                                            href.includes("/internship/") ||
                                            href.includes("/job/")
                                        ) {
                                            link = href;
                                            break;
                                        }
                                        if (!link && href.startsWith("http")) link = href;
                                    }
                                } catch (e) {
                                    link = "";
                                }

                                if (title) {
                                    results.push({
                                        title,
                                        company,
                                        location,
                                        summary,
                                        salary,
                                        posted,
                                        link,
                                    });
                                }
                            }
                            return results;
                        });

                        for (const job of jobs.slice(0, 6)) {
                            if (collected.length >= limit) break;

                            job.title = (job.title || "").replace(/\s+/g, " ").trim();
                            job.company = (job.company || "Not specified")
                                .replace(/\s+/g, " ")
                                .trim();
                            job.location = (job.location || loc || "Not specified")
                                .replace(/\s+/g, " ")
                                .trim();
                            job.summary = job.summary || "Not available";
                            job.salary = job.salary || "Not specified";
                            job.postedAt = job.posted || null;
                            job.link = job.link || "";

                            if (job.link && job.link.startsWith("/")) {
                                job.link = `https://internshala.com${job.link}`;
                            }

                            job.postedAtDate = parsePostedAtToDate(job.postedAt);
                            job.platform = "Internshala";
                            job.scrapedAt = new Date();

                            collected.push(job);
                        }

                        console.log(
                            `✅ [Internshala] Collected ${Math.min(
                                jobs.length,
                                6
                            )} jobs for "${post}" @ "${loc}"`
                        );
                    } catch (innerErr) {
                        console.error(
                            `❌ [Internshala] Error scraping ${post} @ ${loc}:`,
                            innerErr?.message || innerErr
                        );
                    }

                    await delay(600);

                    if (collected.length >= limit) break;
                } // locs
                if (collected.length >= limit) break;
            } // posts
        } finally {
            try {
                await page.close();
            } catch (e) { }
            try {
                await context.close();
            } catch (e) { }
            try {
                await browser.close();
            } catch (e) { }
        }

        return collected;
    } // runAttempt

    // run headful (visible) first
    let results = await runAttempt(false);

    // if zero results, try headless once
    if ((!results || results.length === 0) && posts.length) {
        console.warn("⚠️ No results from headful attempt — retrying headless...");
        results = await runAttempt(true);
    }

    // Dedupe by title|company|location
    const uniq = [];
    const seen = new Set();
    for (const r of results || []) {
        const key = `${(r.title || "").toLowerCase()}|${(
            r.company || ""
        ).toLowerCase()}|${(r.location || "").toLowerCase()}`;
        if (!seen.has(key)) {
            uniq.push(r);
            seen.add(key);
        }
    }

    // Filter by max age
    const maxAgeDays =
        typeof options.maxAgeDays === "number" ? options.maxAgeDays : 365;
    const recentFiltered = uniq.filter((job) => {
        if (!job.postedAtDate) return true;
        const ageDays = Math.floor(
            (Date.now() - job.postedAtDate.getTime()) / (24 * 3600 * 1000)
        );
        return ageDays <= maxAgeDays;
    });

    // Score and sort
    for (const j of recentFiltered) {
        j._score = computeScore(j, postKeywords, locKeywords);
        if (!j.postedAtDate) j.postedAtDate = new Date(0);
    }
    recentFiltered.sort((a, b) => {
        if (b._score !== a._score) return b._score - a._score;
        return b.postedAtDate.getTime() - a.postedAtDate.getTime();
    });

    // final limit
    const final = recentFiltered.slice(0, limit).map((j) => {
        const { _score, scrapedAt, postedAtDate, ...rest } = j;
        return {
            ...rest,
            score: _score,
            scrapedAt: j.scrapedAt || new Date(),
            postedAtDate: j.postedAtDate,
        };
    });

    console.log(`🎯 Total jobs returned: ${final.length}`);
    return final;
};
