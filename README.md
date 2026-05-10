# Lifeline Church Website

Welcome to the Lifeline Church Website repository! 

This website was built specifically so that **anyone** can update the site directly from their web browser, without needing to know how to code, download any software, or use a terminal.

## How to Update the Website

Everything you need to change on the website is located in either the `content` folder (for text) or the `all_photos` folder (for pictures). 

### 📝 Changing Text (Schedules, Information, Contact, etc.)
1. Click on the `content/` folder above.
2. Click on the text file you want to edit (for example, `events.txt`).
3. Click the **Pencil Icon** (✏️) in the top right corner of the file box to edit the file.
4. Make your text changes.
5. Click the green **Commit changes...** button in the top right corner.
6. Your updates will be live on the website in about 1–2 minutes!

### 📸 Adding or Removing Photos
The website will automatically sort your photos into the gallery based on the folder you put them in.
1. Click on the `all_photos/` folder above.
2. Choose where you want the photo to go:
   - `photos/` — For the main Photo Gallery (put your photo inside the correct category folder, like `children's ministry` or `church`).
   - `land_imgs/` — For the large background slideshow on the home page.
   - `abt_us_imgs/` — For the photos in the "About Us" section.
3. Once you are inside the folder you want, click **Add file** (near the top right) and select **Upload files**.
4. Drag and drop your photos into the box.
5. Click the green **Commit changes** button.
6. The system will automatically process your photos, rebuild the gallery, and update the live website in about 1–2 minutes!

---

## For Future Developers 🛠️

If you are a developer inheriting this project, please read `constraints.md` first. 
This project purposely uses **no frontend frameworks, no bundlers, and no build steps** for the frontend code. The architecture is designed strictly so that non-technical volunteers can manage content via GitHub's web UI, relying on GitHub Actions (`repoSetup.js`) to process photos and deploy static files to GitHub Pages.
