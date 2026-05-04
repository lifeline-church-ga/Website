/**
 * scan_photos.js — Run this after adding/removing photos to regenerate gallery.json
 *
 * Usage:  node scan_photos.js
 *
 * It scans every subfolder inside ./photos/ and builds the manifest automatically.
 * Photos can have ANY filename — no renaming required.
 *
 * Category names:
 *   - If gallery.json already exists and has a name for a folder, that name is preserved.
 *   - For new folders, the folder name is title-cased (underscores/dashes → spaces).
 *   - You can always edit gallery.json by hand to set custom names; they'll survive re-scans.
 */

const fs = require('fs');
const path = require('path');

const PHOTOS_DIR = path.join(__dirname, 'photos');
const OUTPUT = path.join(__dirname, 'gallery.json');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

function titleCase(str) {
    return str.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function loadExistingNames() {
    try {
        const data = JSON.parse(fs.readFileSync(OUTPUT, 'utf-8'));
        const map = {};
        for (const cat of data.categories || []) {
            map[cat.folder] = cat.name;
        }
        return map;
    } catch {
        return {};
    }
}

function scanPhotos() {
    if (!fs.existsSync(PHOTOS_DIR)) {
        console.error(`Photos directory not found: ${PHOTOS_DIR}`);
        process.exit(1);
    }

    const existingNames = loadExistingNames();

    const folders = fs.readdirSync(PHOTOS_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name));

    const categories = folders.map(folder => {
        const folderPath = path.join(PHOTOS_DIR, folder.name);
        const files = fs.readdirSync(folderPath)
            .filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        return {
            name: existingNames[folder.name] || titleCase(folder.name),
            folder: folder.name,
            files
        };
    }).filter(cat => cat.files.length > 0);

    fs.writeFileSync(OUTPUT, JSON.stringify({ categories }, null, 2));
    console.log(`\u2705 gallery.json updated \u2014 ${categories.length} categories, ${categories.reduce((s, c) => s + c.files.length, 0)} total photos`);
    categories.forEach(c => console.log(`   ${c.name}: ${c.files.length} photos`));
}

scanPhotos();
