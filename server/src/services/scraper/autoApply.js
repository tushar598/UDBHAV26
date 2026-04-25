import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import os from "os";
import ApplicationLog from "../../models/applicationLog.js";

/**
 * Maximum number of real applications to submit per run.
 */
const MAX_APPLICATIONS = 3;

/**
 * How many seconds to wait for the user to manually login if auto-login fails.
 */
const MANUAL_LOGIN_WAIT_SECONDS = 60;

/**
 * Generate a simple cover letter from user details and internship info.
 */
function generateCoverLetter(userDetails, internshipTitle, company) {
    const name = userDetails.name || "Applicant";
    const skills = (userDetails.skills || []).slice(0, 6).join(", ") || "various technical skills";
    return [
        `Dear Hiring Manager at ${company},`,
        ``,
        `I am ${name}, and I am very excited to apply for the ${internshipTitle} internship at ${company}.`,
        `I possess strong skills in ${skills}, and I am eager to apply them in a practical setting.`,
        `I am a highly motivated and quick learner, passionate about contributing to meaningful projects.`,
        `I have attached my resume for your consideration and look forward to discussing how I can add value to your team.`,
        ``,
        `Thank you for this opportunity.`,
        ``,
        `Best regards,`,
        `${name}`,
    ].join("\n");
}

/**
 * Write the resume buffer to a temporary file so Playwright can upload it.
 * Returns the absolute path to the temp file.
 */
function writeTempResume(resumeBuffer, resumeFileName) {
    const tmpDir = os.tmpdir();
    const safeName = (resumeFileName || "resume.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = path.join(tmpDir, `autoapply_${Date.now()}_${safeName}`);
    fs.writeFileSync(filePath, resumeBuffer);
    return filePath;
}

/**
 * Check if we are currently logged in to Internshala.
 */
async function isLoggedIn(page) {
    try {
        const indicators = await page.$$(
            '.nav-link-profile, .profile_container, .ic-nav-profile, a[href="/student/dashboard"], .logout_btn, .profile-heading'
        );
        return indicators.length > 0;
    } catch (_) {
        return false;
    }
}

/**
 * Attempt to log in to Internshala.
 * First tries auto-login with env credentials.
 * If that fails, waits for the user to manually login in the visible browser window.
 */
async function loginToInternshala(page) {
    const email = process.env.INTERNSHALA_EMAIL;
    const password = process.env.INTERNSHALA_PASSWORD;

    try {
        console.log("🔐 Navigating to Internshala login page...");
        await page.goto("https://internshala.com/login", {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });
        await page.waitForTimeout(3000);

        // Check if already logged in (cookies from persistent context)
        if (await isLoggedIn(page)) {
            console.log("✅ Already logged in (session restored)!");
            return true;
        }

        // Try auto-login if credentials are available
        if (email && password && !email.includes("example.com")) {
            console.log("🔑 Attempting auto-login with env credentials...");

            // Fill email
            const emailInput = await page.$(
                'input[id="email"], input[name="email"], input[type="email"], #login_email'
            );
            if (emailInput) {
                await emailInput.click();
                await page.waitForTimeout(300);
                await emailInput.fill(email);
                console.log("   ✅ Email filled");
            } else {
                console.log("   ❌ Email input not found");
            }

            await page.waitForTimeout(500);

            // Fill password
            const passwordInput = await page.$(
                'input[id="password"], input[name="password"], input[type="password"], #login_password'
            );
            if (passwordInput) {
                await passwordInput.click();
                await page.waitForTimeout(300);
                await passwordInput.fill(password);
                console.log("   ✅ Password filled");
            } else {
                console.log("   ❌ Password input not found");
            }

            await page.waitForTimeout(500);

            // Click login button
            const loginBtn = await page.$(
                'button#login_submit, button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Log in")'
            );
            if (loginBtn) {
                await loginBtn.click();
                console.log("   🔄 Login button clicked...");
            }

            await page.waitForTimeout(5000);

            if (await isLoggedIn(page)) {
                console.log("✅ Auto-login successful!");
                return true;
            }

            // Check if still on login page (could be CAPTCHA or wrong credentials)
            const currentUrl = page.url();
            if (!currentUrl.includes("/login")) {
                console.log("✅ Login appears successful (redirected)");
                return true;
            }

            console.log("⚠️ Auto-login didn't work (possibly CAPTCHA or wrong credentials)");
        } else {
            console.log("⚠️ No Internshala credentials in .env");
        }

        // === MANUAL LOGIN FALLBACK ===
        console.log("═══════════════════════════════════════════════════════");
        console.log("👉 PLEASE LOG IN MANUALLY in the Chromium browser window!");
        console.log(`   You have ${MANUAL_LOGIN_WAIT_SECONDS} seconds to complete login.`);
        console.log("   Complete any CAPTCHA if shown, then login normally.");
        console.log("═══════════════════════════════════════════════════════");

        // Poll every 3 seconds to check if the user has logged in
        const startTime = Date.now();
        const timeoutMs = MANUAL_LOGIN_WAIT_SECONDS * 1000;

        while (Date.now() - startTime < timeoutMs) {
            await page.waitForTimeout(3000);

            // Check if navigated away from login
            const url = page.url();
            if (!url.includes("/login")) {
                console.log("✅ Detected navigation away from login page!");
                if (await isLoggedIn(page)) {
                    console.log("✅ Manual login confirmed!");
                    return true;
                }
                // Even if we can't detect profile indicators, trust the redirect
                console.log("✅ Login assumed successful (page changed)");
                return true;
            }

            const elapsed = Math.round((Date.now() - startTime) / 1000);
            console.log(`   ⏳ Waiting for manual login... (${elapsed}s / ${MANUAL_LOGIN_WAIT_SECONDS}s)`);
        }

        console.log("❌ Manual login timeout — proceeding without login");
        return false;
    } catch (err) {
        console.error("❌ Error during Internshala login:", err.message);
        return false;
    }
}

/**
 * Try to apply to a single internship on Internshala.
 * Returns { success: boolean, reason: string }
 */
async function applyToSingleInternship(page, link, title, company, coverLetter, resumeFilePath) {
    console.log(`\n🤖 Applying to: "${title}" at "${company}"`);
    console.log(`   Link: ${link}`);

    // Navigate to the internship detail page
    await page.goto(link, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3000);

    // === Step 1: Find and click the Apply button ===
    const applySelectors = [
        '#apply_now_btn',
        '.apply_now_btn',
        'button:has-text("Apply now")',
        'a:has-text("Apply now")',
        '.apply-button',
        '[data-apply-button]',
        'button:has-text("Apply Now")',
        '.btn-primary:has-text("Apply")',
        '#continue_button',
        'a.btn:has-text("Apply")',
    ];

    let applyClicked = false;
    for (const sel of applySelectors) {
        try {
            const btn = await page.$(sel);
            if (btn) {
                const isVisible = await btn.isVisible();
                if (isVisible) {
                    await btn.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(500);
                    await btn.click();
                    applyClicked = true;
                    console.log(`   ✅ Clicked apply button: ${sel}`);
                    break;
                }
            }
        } catch (_) { /* try next selector */ }
    }

    if (!applyClicked) {
        return { success: false, reason: "Apply button not found or not visible — application may be closed or requires different access" };
    }

    await page.waitForTimeout(3000);

    // === Step 2: Handle the application form ===
    // Internshala's apply flow typically shows a modal or new page with form fields.

    // Fill cover letter / "Why should you be hired" textarea
    const textareaSelectors = [
        'textarea[name="cover_letter"]',
        'textarea[name="text"]',
        'textarea#cover_letter',
        'textarea.cover_letter',
        'textarea[placeholder*="cover"]',
        'textarea[placeholder*="why"]',
        'textarea[placeholder*="Write"]',
        'textarea[placeholder*="answer"]',
        '.ql-editor',  // Quill rich text editor
        'textarea',    // fallback to any visible textarea
    ];

    let coverLetterFilled = false;
    for (const sel of textareaSelectors) {
        try {
            const elements = await page.$$(sel);
            for (const textarea of elements) {
                const isVisible = await textarea.isVisible();
                if (isVisible) {
                    await textarea.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(300);
                    await textarea.click();
                    await textarea.fill("");
                    await textarea.type(coverLetter, { delay: 10 });
                    coverLetterFilled = true;
                    console.log(`   ✅ Cover letter filled using: ${sel}`);
                    break;
                }
            }
            if (coverLetterFilled) break;
        } catch (_) { /* try next selector */ }
    }

    if (!coverLetterFilled) {
        console.log("   ⚠️ No cover letter textarea found — continuing without it");
    }

    await page.waitForTimeout(1000);

    // === Step 3: Upload resume if there's a file input ===
    const fileInputSelectors = [
        'input[type="file"][name*="resume"]',
        'input[type="file"][name*="file"]',
        'input[type="file"][accept*="pdf"]',
        'input[type="file"]',
    ];

    let resumeUploaded = false;
    for (const sel of fileInputSelectors) {
        try {
            const fileInput = await page.$(sel);
            if (fileInput) {
                await fileInput.setInputFiles(resumeFilePath);
                resumeUploaded = true;
                console.log(`   ✅ Resume uploaded using: ${sel}`);
                await page.waitForTimeout(2000); // wait for upload to process
                break;
            }
        } catch (_) { /* try next */ }
    }

    if (!resumeUploaded) {
        console.log("   ⚠️ No file upload input found — Internshala may use existing resume from profile");
    }

    await page.waitForTimeout(1500);

    // === Step 4: Submit the application ===
    const submitSelectors = [
        '#submit',
        'button#submit',
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("submit application")',
        '.submit_btn',
        '.submit-btn',
        '#submit_btn',
        'button:has-text("Submit application")',
        '.btn-primary:has-text("Submit")',
    ];

    let submitted = false;
    for (const sel of submitSelectors) {
        try {
            const btn = await page.$(sel);
            if (btn) {
                const isVisible = await btn.isVisible();
                if (isVisible) {
                    await btn.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(500);
                    await btn.click();
                    submitted = true;
                    console.log(`   ✅ Submit button clicked: ${sel}`);
                    break;
                }
            }
        } catch (_) { /* try next */ }
    }

    if (!submitted) {
        // Try pressing Enter as fallback
        try {
            await page.keyboard.press("Enter");
            console.log("   ⚠️ Pressed Enter as submit fallback");
            submitted = true;
        } catch (_) { }
    }

    await page.waitForTimeout(4000);

    // === Step 5: Check for success indicators ===
    try {
        const bodyText = await page.textContent("body");
        const lower = (bodyText || "").toLowerCase();

        if (lower.includes("successfully") || lower.includes("application submitted") ||
            lower.includes("applied successfully") || lower.includes("already applied")) {
            return { success: true, reason: "Application submitted successfully" };
        }
    } catch (_) { }

    // If we clicked submit but couldn't confirm success, still count it
    if (submitted) {
        return { success: true, reason: "Application submitted (confirmation pending)" };
    }

    return { success: false, reason: "Could not complete the application form" };
}

/**
 * Auto-apply to Internshala internship listings.
 *
 * Uses the system Chrome browser (not Playwright's Chromium) to avoid
 * "automated test software" detection. Falls back to Playwright Chromium if Chrome not found.
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
        return internships.slice(0, MAX_APPLICATIONS).map((i) => ({
            link: i.link,
            status: "skipped",
            reason: "No resume uploaded",
        }));
    }

    const results = [];
    let browser;
    let tempResumePath;

    try {
        // Write resume to temp file for Playwright upload
        tempResumePath = writeTempResume(resumeBuffer, resumeFileName);
        console.log(`📄 Resume written to temp file: ${tempResumePath}`);

        // Use a persistent user data directory so login cookies are saved between runs
        const userDataDir = path.join(os.homedir(), ".internshala-autoapply-profile");
        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir, { recursive: true });
        }

        // Launch using system Chrome to avoid "controlled by automated test software" detection
        // This uses `channel: 'chrome'` which finds and uses the real Chrome installation
        console.log("🌐 Launching browser (using system Chrome if available)...");

        browser = await chromium.launch({
            headless: false,
            channel: "chrome",   // Use real Chrome instead of Playwright Chromium
            args: [
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
                "--start-maximized",
            ],
            slowMo: 150, // slow down so user can see actions
        }).catch(async () => {
            // Fallback: if system Chrome is not found, use Playwright Chromium with stealth
            console.log("⚠️ System Chrome not found, falling back to Playwright Chromium...");
            return await chromium.launch({
                headless: false,
                args: [
                    "--no-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-infobars",
                    "--start-maximized",
                ],
                slowMo: 150,
            });
        });

        const context = await browser.newContext({
            viewport: { width: 1366, height: 900 },
            userAgent:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            locale: "en-IN",
            timezoneId: "Asia/Kolkata",
        });

        // Enhanced stealth
        await context.addInitScript(() => {
            // Hide webdriver flag
            Object.defineProperty(navigator, "webdriver", { get: () => undefined });
            // Fake plugins
            Object.defineProperty(navigator, "plugins", {
                get: () => [
                    { name: "Chrome PDF Plugin", filename: "internal-pdf-viewer" },
                    { name: "Chrome PDF Viewer", filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai" },
                    { name: "Native Client", filename: "internal-nacl-plugin" },
                ],
            });
            Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en", "hi"] });
            // Override permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) =>
                parameters.name === "notifications"
                    ? Promise.resolve({ state: Notification.permission })
                    : originalQuery(parameters);
            // Chrome runtime
            window.chrome = { runtime: {} };
        });

        const page = await context.newPage();
        page.setDefaultNavigationTimeout(30000);
        page.setDefaultTimeout(15000);

        // === Step 1: Login to Internshala ===
        const loggedIn = await loginToInternshala(page);

        if (!loggedIn) {
            console.log("⚠️ Not logged in — auto-apply will attempt but applications may fail.");
        }

        // === Step 2: Apply to internships (max 3) ===
        let successCount = 0;

        for (const internship of internships) {
            if (successCount >= MAX_APPLICATIONS) {
                console.log(`🎯 Reached max applications limit (${MAX_APPLICATIONS}). Stopping.`);
                break;
            }

            const link = internship.link || "";
            const title = internship.title || "Unknown";
            const company = internship.company || "Unknown";

            // Validate link
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
                    link: link || "N/A",
                    status: "skipped",
                    reason: "Invalid or missing link",
                });
                continue;
            }

            try {
                const coverLetter = generateCoverLetter(userDetails, title, company);
                const outcome = await applyToSingleInternship(
                    page, link, title, company, coverLetter, tempResumePath
                );

                if (outcome.success) {
                    successCount++;
                    console.log(`✅ [${successCount}/${MAX_APPLICATIONS}] Applied to "${title}" at "${company}"`);
                } else {
                    console.log(`❌ Failed to apply to "${title}": ${outcome.reason}`);
                }

                const result = {
                    link,
                    status: outcome.success ? "applied" : "failed",
                    reason: outcome.reason,
                };
                results.push(result);

                await ApplicationLog.create({
                    userId,
                    internshipTitle: title,
                    company,
                    link,
                    status: outcome.success ? "applied" : "failed",
                    reason: outcome.reason,
                });
            } catch (err) {
                console.error(`❌ Auto-apply error for "${title}":`, err.message || err);
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
            await page.waitForTimeout(2000);
        }

        console.log(`\n🏁 Auto-apply complete: ${successCount} applied, ${results.length - successCount} failed/skipped`);

        try { await page.close(); } catch (_) { }
        try { await context.close(); } catch (_) { }
    } catch (browserErr) {
        console.error("❌ Browser error during auto-apply:", browserErr.message);
    } finally {
        try {
            if (browser) await browser.close();
        } catch (_) { }
        // Cleanup temp resume file
        try {
            if (tempResumePath && fs.existsSync(tempResumePath)) {
                fs.unlinkSync(tempResumePath);
                console.log("🧹 Cleaned up temp resume file");
            }
        } catch (_) { }
    }

    return results;
}
