// services/scraper/internshipScraper.js
import { chromium } from "playwright";

/**
 * Scrape internships from Internshala for given posts and locations.
 * Defensive & retrying — use in controller as: scrapeInternships(user.desiredPost, user.desiredLocation)
 *
 * @param {string[]|string} desiredPosts
 * @param {string[]|string} desiredLocations
 * @param {number} limit total results to return (default 15)
 */
export async function scrapeInternships(
    desiredPosts = [],
    desiredLocations = [],
    limit = 15
) {
    // normalize inputs to arrays
    const posts = Array.isArray(desiredPosts)
        ? desiredPosts
        : String(desiredPosts || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    const locs = Array.isArray(desiredLocations)
        ? desiredLocations
        : String(desiredLocations || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

    // helper to attempt scraping with given headless flag
    async function runAttempt(headless = true) {
        const browser = await chromium.launch({ headless, args: ["--no-sandbox"] });
        const context = await browser.newContext({
            viewport: { width: 1280, height: 800 },
            userAgent:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            locale: "en-US",
            timezoneId: "Asia/Kolkata",
        });

        // basic stealth properties
        await context.addInitScript(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => false });
            Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
            Object.defineProperty(navigator, "languages", {
                get: () => ["en-US", "en"],
            });
        });

        const page = await context.newPage();
        page.setDefaultNavigationTimeout(60000);
        page.setDefaultTimeout(30000);

        const collected = [];

        // helper: slugify word to internshala-friendly form
        const slug = (s = "") =>
            String(s || "")
                .toLowerCase()
                .replace(/internship/gi, "")
                .replace(/[^\w\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-");

        // helper: try multiple URL patterns for robustness
        const buildUrls = (p, l) => {
            const pSlug = slug(p);
            const lSlug = slug(l);
            return [
                `https://internshala.com/internships/keywords-${encodeURIComponent(
                    pSlug
                )}/location-${encodeURIComponent(lSlug)}`,
                `https://internshala.com/internships/keyword-${encodeURIComponent(
                    pSlug
                )}/in-${encodeURIComponent(lSlug)}`,
                `https://internshala.com/internships/keywords-${encodeURIComponent(
                    pSlug
                )}`, // without location
            ];
        };

        // helper: auto-scroll to trigger lazy load
        const autoScroll = async (page) => {
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    let total = 0;
                    const distance = 300;
                    const timer = setInterval(() => {
                        const scrollHeight =
                            document.body.scrollHeight ||
                            document.documentElement.scrollHeight;
                        window.scrollBy(0, distance);
                        total += distance;
                        if (total >= scrollHeight - window.innerHeight - 100) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 300);
                });
            });
        };

        // iterate posts & locations
        try {
            for (const post of posts) {
                for (const loc of locs.length ? locs : [""]) {
                    // build multiple candidate URLs and try them in order
                    const urls = buildUrls(post, loc);

                    let successfulPage = false;
                    for (const url of urls) {
                        if (collected.length >= limit) break;
                        console.log("🔍 Visiting:", url);

                        try {
                            // goto url and wait for either results or fallback text
                            await page.goto(url, {
                                waitUntil: "domcontentloaded",
                                timeout: 60000,
                            });

                            // quick content length check (helps detect redirects/blocks)
                            const htmlLength = (await page.content()).length;
                            if (htmlLength < 4000) {
                                console.warn(
                                    "⚠️ page content too small, possible redirect/block",
                                    url
                                );
                                // try next url pattern
                                continue;
                            }

                            // wait for either results or no-results text or captcha indicator
                            const race = await Promise.race([
                                page
                                    .waitForSelector("[data-internship-id]", { timeout: 15000 })
                                    .then(() => "results"),
                                page
                                    .waitForSelector(
                                        ".no-result, .no-results, .no-internships, .no-data, .text-center",
                                        { timeout: 15000 }
                                    )
                                    .then(() => "noresults"),
                                page
                                    .waitForSelector(
                                        "iframe[src*='recaptcha'], [title*='captcha'], .g-recaptcha",
                                        { timeout: 15000 }
                                    )
                                    .then(() => "captcha"),
                            ]).catch(() => "timeout");

                            if (race === "captcha") {
                                console.warn(
                                    "⚠️ Captcha/blocked detected on page, aborting this URL and trying next pattern."
                                );
                                continue; // try next url pattern
                            }
                            if (race === "noresults" || race === "timeout") {
                                // attempt a small wait+scroll then check again
                                await page.waitForTimeout(2000);
                                await autoScroll(page);
                                // re-check if there are result cards at all
                                const count = await page.$$eval(
                                    "[data-internship-id], .individual_internship, .listing",
                                    (els) => els.length
                                );
                                if (!count) {
                                    console.log(
                                        `⚠️ No internships found for "${post}" @ "${loc}" using url: ${url}`
                                    );
                                    continue; // try next url pattern
                                }
                            }

                            // now we expect cards present — ensure we have enough time for lazy content
                            await autoScroll(page);
                            await page.waitForTimeout(800); // small pause

                            // extract using robust fallbacks
                            const results = await page.$$eval(
                                "[data-internship-id], .individual_internship, .listing",
                                (cards) => {
                                    return Array.from(cards)
                                        .map((card) => {
                                            // helper inside page context
                                            const getText = (q) =>
                                                card.querySelector(q)?.innerText?.trim() || "";
                                            const getAttr = (q, attr) =>
                                                card.querySelector(q)?.getAttribute(attr) || "";

                                            const title =
                                                getText("h3 a") ||
                                                getText("h3") ||
                                                getText(".profile") ||
                                                getText(".job-internship-name");
                                            const company =
                                                getText(".company_name a") ||
                                                getText(".company-name") ||
                                                getText(".link_display_like_text") ||
                                                getText(".company_name");
                                            const location =
                                                getText(".location_link") ||
                                                getText(".internship-location") ||
                                                getText(".location");
                                            const stipend =
                                                getText(".stipend") ||
                                                getText(".stipend_container") ||
                                                getText(".salary");
                                            const duration =
                                                getText(".duration") ||
                                                getText(".other_detail_item_body") ||
                                                getText(".item_body");
                                            const postedAt =
                                                getText(".status-small") ||
                                                getText(".status") ||
                                                getText(".posted_on");
                                            const link =
                                                getAttr("a.view_detail_button", "href") ||
                                                getAttr("a[href*='/internship/detail']", "href") ||
                                                getAttr("a", "href") ||
                                                "";
                                            const description =
                                                getText(".internship_other_details") ||
                                                getText(".internship_details") ||
                                                getText(".individual_internship_header") ||
                                                "";
                                            const skills = Array.from(
                                                card.querySelectorAll(
                                                    ".tags_container span, .skill_container span, .tags .tag"
                                                )
                                            )
                                                .map((el) => el.innerText.trim())
                                                .filter(Boolean);

                                            return {
                                                title,
                                                company,
                                                location,
                                                stipend,
                                                duration,
                                                postedAt,
                                                link,
                                                description,
                                                skillsRequired: skills,
                                                platform: "Internshala",
                                            };
                                        })
                                        .filter((item) => item.title && item.company);
                                }
                            );

                            if (results && results.length) {
                                // add only up to remaining limit
                                for (const r of results) {
                                    if (collected.length >= limit) break;
                                    // normalize fields
                                    collected.push({
                                        title: (r.title || "").replace(/\s+/g, " ").trim(),
                                        company: (r.company || "").replace(/\s+/g, " ").trim(),
                                        location: (r.location || "").replace(/\s+/g, " ").trim(),
                                        stipend: (r.stipend || "").replace(/\s+/g, " ").trim(),
                                        duration: (r.duration || "").replace(/\s+/g, " ").trim(),
                                        postedAt: r.postedAt || null,
                                        link: r.link || url,
                                        description: (r.description || "")
                                            .replace(/\s+/g, " ")
                                            .trim(),
                                        skillsRequired: Array.isArray(r.skillsRequired)
                                            ? r.skillsRequired
                                            : [],
                                        platform: "Internshala",
                                        scrapedAt: new Date(),
                                    });
                                }
                                successfulPage = true;
                                console.log(
                                    `✅ Found ${results.length} for "${post}" @ "${loc}" (using ${url})`
                                );
                            } else {
                                console.log(
                                    `⚠️ No usable cards extracted for "${post}" @ "${loc}" (using ${url})`
                                );
                            }

                            // if we got results from this URL pattern, move to next loc
                            if (successfulPage) break;
                        } catch (innerErr) {
                            console.error(
                                `❌ Error for URL ${url}:`,
                                innerErr && innerErr.message ? innerErr.message : innerErr
                            );
                            // if page crashed or context closed, rethrow to outer to cleanup
                        }
                    } // end urls loop

                    if (collected.length >= limit) break;
                } // end locs
                if (collected.length >= limit) break;
            } // end posts
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

    // 1) Try headless attempt
    let results = await runAttempt(true);

    // 2) If empty, retry once with headless:false (slower but bypasses some blocks)
    if ((!results || results.length === 0) && posts.length) {
        console.warn(
            "⚠️ No results in headless attempt — retrying once with headful mode..."
        );
        results = await runAttempt(false);
    }

    // final dedupe by title+company+location
    const uniq = [];
    const seen = new Set();
    for (const r of results || []) {
        const key = `${r.title}|${r.company}|${r.location}`;
        if (!seen.has(key)) {
            uniq.push(r);
            seen.add(key);
        }
    }

    return uniq.slice(0, limit);
}

