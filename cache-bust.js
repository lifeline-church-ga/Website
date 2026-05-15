/**
 * cache-bust.js — Build-time cache busting
 *
 * Run by GitHub Actions on every deploy. Replaces static asset references
 * in HTML files with versioned URLs using the current git commit SHA.
 *
 * Usage:  node cache-bust.js
 *
 * What it does:
 *   1. Gets the short git SHA (or falls back to a timestamp)
 *   2. Finds all .html files in the repo root
 *   3. Appends ?v=<hash> to local CSS and JS references
 *   4. Writes BUILD_VERSION into script.js so fetch() calls also use it
 *   5. Removes aggressive no-cache meta tags (the version hash handles it)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── Get build version ────────────────────────────────────────────────────────
let BUILD_VERSION;
try {
    BUILD_VERSION = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
} catch {
    // Fallback if git isn't available
    BUILD_VERSION = Date.now().toString(36);
}

console.log(`🔖 Build version: ${BUILD_VERSION}`);

const ROOT = __dirname;

// ── 1. Version-stamp HTML asset references ───────────────────────────────────
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

for (const file of htmlFiles) {
    const filePath = path.join(ROOT, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Add ?v=HASH to local stylesheet links:  href="styles.css" → href="styles.css?v=abc1234"
    content = content.replace(
        /(<link\s[^>]*href=["'])([^"']+\.css)(["'][^>]*>)/gi,
        (match, before, href, after) => {
            // Skip external URLs (CDNs, Google Fonts, etc.)
            if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
                return match;
            }
            // Remove any existing query string, then add new version
            const cleanHref = href.split('?')[0];
            return `${before}${cleanHref}?v=${BUILD_VERSION}${after}`;
        }
    );

    // Add ?v=HASH to local script tags:  src="script.js" → src="script.js?v=abc1234"
    content = content.replace(
        /(<script\s[^>]*src=["'])([^"']+\.js)(["'][^>]*>)/gi,
        (match, before, src, after) => {
            if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
                return match;
            }
            const cleanSrc = src.split('?')[0];
            return `${before}${cleanSrc}?v=${BUILD_VERSION}${after}`;
        }
    );

    // Also handle bare script tags:  <script src="script.js"></script>
    content = content.replace(
        /(<script\s+src=["'])([^"']+\.js)(["']><\/script>)/gi,
        (match, before, src, after) => {
            if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
                return match;
            }
            const cleanSrc = src.split('?')[0];
            return `${before}${cleanSrc}?v=${BUILD_VERSION}${after}`;
        }
    );

    // Remove aggressive no-cache meta tags (version hash handles freshness now)
    content = content.replace(/\s*<meta\s+http-equiv=["']Cache-Control["'][^>]*>\s*/gi, '\n');
    content = content.replace(/\s*<meta\s+http-equiv=["']Pragma["'][^>]*>\s*/gi, '\n');
    content = content.replace(/\s*<meta\s+http-equiv=["']Expires["'][^>]*>\s*/gi, '\n');

    // Clean up any resulting blank lines (more than 2 consecutive)
    content = content.replace(/\n{3,}/g, '\n\n');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✅ ${file} — asset references versioned`);
}

// ── 2. Inject BUILD_VERSION into script.js ───────────────────────────────────
// Replace the Date.now() cache-buster with the stable build version
const scriptPath = path.join(ROOT, 'script.js');
if (fs.existsSync(scriptPath)) {
    let script = fs.readFileSync(scriptPath, 'utf-8');

    // Replace:  const _cacheBust = `?v=${Date.now()}`;
    // With:     const _cacheBust = '?v=abc1234';
    script = script.replace(
        /const _cacheBust\s*=\s*`\?v=\$\{Date\.now\(\)\}`;/,
        `const _cacheBust = '?v=${BUILD_VERSION}';`
    );

    fs.writeFileSync(scriptPath, script, 'utf-8');
    console.log(`  ✅ script.js — _cacheBust set to build version`);
}

// ── 3. Inject BUILD_VERSION into photos.html inline script ───────────────────
const photosPath = path.join(ROOT, 'photos.html');
if (fs.existsSync(photosPath)) {
    let photos = fs.readFileSync(photosPath, 'utf-8');

    photos = photos.replace(
        /const _cacheBust\s*=\s*`\?v=\$\{Date\.now\(\)\}`;/,
        `const _cacheBust = '?v=${BUILD_VERSION}';`
    );

    fs.writeFileSync(photosPath, photos, 'utf-8');
    console.log(`  ✅ photos.html — inline _cacheBust set to build version`);
}

console.log(`\n🎉 Cache busting complete — version ${BUILD_VERSION}`);
