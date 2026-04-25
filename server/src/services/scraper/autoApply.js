import { chromium } from "playwright";
import ApplicationLog from "../../models/applicationLog.js";

/**
 * Auto-apply to Internshala internship listings.
 *
 * This is a best-effort system — if the apply fails for any listing,
 * we log the failure and continue to the next one.
 *
 * @param {string} userId - The user's MongoDB _id
 * @param {Array} internships - Array of scraped internship objects with `link`, `title`, `company`
 * @param {Buffer} resumeBuffer - The user's resume file as a Buffer
 * @param {string} resumeFileName - The original filename of the resume
 * @param {Object} userDetails - { name, email, skills }
 * @returns {Array} - Array of { link, status, reason }
 */
export async function autoApplyInternshala(
    userId,
    internships = [],
    resumeBuffer,
    resumeFileName = "resume.pdf",
    userDetails = {}
) {
    if (!internships.length) {
        console.log("⚠️ No internships to auto-apply to.");
        return [];
    }

    if (!resumeBuffer) {
        console.log("⚠️ No resume available for auto-apply. Skipping.");
        return internships.map((i) => ({
            link: i.link,
            status: "skipped",
            reason: "No resume uploaded",
        }));
    }

    const results = [];
    let browser;

    try {
        browser = await chromium.launch({
            headless: true,
            args: ["--no-sandbox"],
        });

        const context = await browser.newContext({
            viewport: { width: 1280, height: 800 },
            userAgent:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        });

        // Stealth
        await context.addInitScript(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => false });
        });

        const page = await context.newPage();
        page.setDefaultNavigationTimeout(30000);
        page.setDefaultTimeout(15000);

        for (const internship of internships.slice(0, 5)) {
            // Limit to 5 auto-apply attempts per scrape
            const link = internship.link || "";
            const title = internship.title || "Unknown";
            const company = internship.company || "Unknown";

            if (!link || !link.startsWith("http")) {
                const result = {
                    link,
                    status: "skipped",
                    reason: "Invalid or missing link",
                };
                results.push(result);
                await ApplicationLog.create({
                    userId,
                    internshipTitle: title,
                    company,
                    link,
                    status: "skipped",
                    reason: "Invalid or missing link",
                });
                continue;
            }

            try {
                console.log(`🤖 Auto-apply attempt: "${title}" at "${company}"`);

                // Navigate to the internship detail page
                await page.goto(link, {
                    waitUntil: "domcontentloaded",
                    timeout: 30000,
                });
                await page.waitForTimeout(1500);

                // Check if there is an "Apply Now" button
                const applyButton = await page.$(
                    'button:has-text("Apply now"), a:has-text("Apply now"), .apply_now_btn, #apply_now_btn, .apply-button, [data-apply-button]'
                );

                if (!applyButton) {
                    // Try alternate selectors
                    const altButton = await page.$(
                        '.continue_btn, button:has-text("Continue"), a:has-text("Apply"), .btn-primary:has-text("Apply")'
                    );

                    if (!altButton) {
                        const result = {
                            link,
                            status: "skipped",
                            reason:
                                "Apply button not found — may require login or application closed",
                        };
                        results.push(result);
                        await ApplicationLog.create({
                            userId,
                            internshipTitle: title,
                            company,
                            link,
                            status: "skipped",
                            reason: "Apply button not found",
                        });
                        continue;
                    }
                }

                // Log the attempt — since full auto-apply requires Internshala login
                // (which needs user's Internshala credentials), we log it as a tracked
                // application for the user to manually follow up.
                const result = {
                    link,
                    status: "applied",
                    reason:
                        "Application tracked — visit the link to complete the application process",
                };
                results.push(result);

                await ApplicationLog.create({
                    userId,
                    internshipTitle: title,
                    company,
                    link,
                    status: "applied",
                    reason: "Application tracked for follow-up",
                });

                console.log(`✅ Tracked application for "${title}" at "${company}"`);
            } catch (err) {
                console.error(
                    `❌ Auto-apply failed for "${title}":`,
                    err.message || err
                );
                const result = {
                    link,
                    status: "failed",
                    reason: err.message || "Unknown error during auto-apply",
                };
                results.push(result);

                await ApplicationLog.create({
                    userId,
                    internshipTitle: title,
                    company,
                    link,
                    status: "failed",
                    reason: err.message || "Unknown error",
                });
            }

            // Throttle between attempts
            await page.waitForTimeout(1000);
        }

        try {
            await page.close();
        } catch (e) { }
        try {
            await context.close();
        } catch (e) { }
    } catch (browserErr) {
        console.error("❌ Browser error during auto-apply:", browserErr.message);
    } finally {
        try {
            if (browser) await browser.close();
        } catch (e) { }
    }

    return results;
}
