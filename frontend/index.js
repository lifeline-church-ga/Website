/* ============================================================
   Lifeline Church — Main Script
   ============================================================
   All content is loaded from plain text files in the content/
   folder so non-coders can edit text easily — no JSON syntax
   needed. Photo lists come from gallery.json (auto-generated
   by repoSetup.js).
   ============================================================ */

// --- DOM helper ---------------------------------------------------------------
const $ = id => document.getElementById(id);

// --- Text file parsers -------------------------------------------------------

/** Parse a simple key: value text file into an object. */
function parseTxt(text) {
    const result = {};
    for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex === -1) continue;
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();
        result[key] = value;
    }
    return result;
}

/** Parse a text file that has a header block and repeated item blocks
 *  separated by blank lines. Returns { header: {}, items: [{}, ...] }. */
function parseTxtBlocks(text) {
    const blocks = text.split(/\n\s*\n/).filter(b => b.trim());
    const header = parseTxt(blocks[0] || '');
    const items = blocks.slice(1).map(b => parseTxt(b));
    return { header, items };
}

/** Fetch a text file and parse as key:value. Returns {} on failure. */
function fetchTxt(path) {
    return fetch(path)
        .then(r => r.ok ? r.text() : '')
        .then(t => parseTxt(t))
        .catch(() => ({}));
}

/** Fetch a text file and parse as blocks. Returns { header:{}, items:[] } on failure. */
function fetchTxtBlocks(path) {
    return fetch(path)
        .then(r => r.ok ? r.text() : '')
        .then(t => parseTxtBlocks(t))
        .catch(() => ({ header: {}, items: [] }));
}

// --- Apply CSS Custom Properties from config colors --------------------------
function applyColors(colors) {
    if (!colors) return;
    const root = document.documentElement.style;
    const map = {
        primary:          '--primary',
        primary_hover:    '--primary-hover',
        primary_light:    '--primary-light',
        accent:           '--accent',
        accent_hover:     '--accent-hover',
        dark:             '--dark',
        dark_soft:        '--dark-soft',
        surface:          '--surface',
        surface_alt:      '--surface-alt',
        text:             '--text',
        text_light:       '--text-light',
    };
    for (const [key, cssVar] of Object.entries(map)) {
        if (colors[key]) root.setProperty(cssVar, colors[key]);
    }
    // Derived values
    if (colors.accent) {
        root.setProperty('--accent-soft', hexToRgba(colors.accent, 0.10));
    }
    if (colors.footer_background) {
        root.setProperty('--footer-bg', colors.footer_background);
    }
}

// --- Apply Hero Display settings from config ---------------------------------
function applyHeroDisplay(settings) {
    if (!settings) return;
    const root = document.documentElement.style;
    const map = {
        overlay_opacity_top:    '--hero-overlay-top',
        overlay_opacity_middle: '--hero-overlay-mid',
        overlay_opacity_bottom: '--hero-overlay-bot',
        image_brightness:       '--hero-brightness',
        image_contrast:         '--hero-contrast',
    };
    for (const [key, cssVar] of Object.entries(map)) {
        if (settings[key] != null) root.setProperty(cssVar, settings[key]);
    }
}

function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// --- HTML Escape (XSS prevention) --------------------------------------------
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// --- Populate Landing / Hero Section -----------------------------------------
function renderLanding(info) {
    const content = document.querySelector('.landing-content');
    if (!content || !info.name) return;

    content.innerHTML = `
        <h1>${info.name || ''}</h1>
        <p>${info.tagline || ''}</p>
        <p>${info.service_description || ''}</p>
        <p><strong>${info.service_time || ''}</strong></p>
    `;
}

// --- Populate Welcome / Map Section ------------------------------------------
function renderMapSection(info, mapData) {
    const details = document.querySelector('.map-details');
    const iframe = document.querySelector('.map-embed iframe');
    if (!details) return;

    details.innerHTML = `
        <h2>${info.welcome_heading || 'WELCOME TO LIFELINE'}</h2>
        <h3>${info.schedule_heading || 'SUNDAY SCHEDULE:'}</h3>
        <p>${info.schedule_text || ''}</p>
        <h3>ADDRESS:</h3>
        <p>${info.name || 'Lifeline Church'}<br>${info.address || ''}</p>
        <p><i class="fas fa-phone-alt"></i> ${info.phone || ''}</p>
        <p><i class="fas fa-envelope"></i> <a href="mailto:${info.email || ''}">${info.email || ''}</a></p>
    `;

    if (iframe && mapData && mapData.url) {
        iframe.src = mapData.url;
    }
}

// --- Populate About Us -------------------------------------------------------
function renderAboutUs(aboutData, gallery) {
    const textEl = document.querySelector('.about-text');
    const imagesEl = document.querySelector('.about-images');

    if (textEl && aboutData) {
        textEl.innerHTML = `<h2>${aboutData.heading || 'About Us'}</h2><p>${aboutData.text || ''}</p>`;
    }

    // Use images from gallery.json (populated by repoSetup.js)
    const imgFiles = (gallery && gallery.abt_us_imgs) || [];
    if (imagesEl && imgFiles.length) {
        imagesEl.innerHTML = '';
        imgFiles.forEach((file, i) => {
            const img = document.createElement('img');
            img.src = `../all_photos/abt_us_imgs/${file}`;
            img.alt = `Church community photo ${i + 1}`;
            img.loading = 'lazy';
            img.width = 220;
            img.height = 220;
            imagesEl.appendChild(img);
        });
    }
}

// --- Populate Photos Section Header ------------------------------------------
function renderPhotosHeader(settings) {
    const section = $('photos');
    if (!section) return;

    const container = section.querySelector('.container');
    const h2 = container?.querySelector('h2');
    const p = container?.querySelector('p');
    if (h2) h2.textContent = settings.photos_heading || 'Our Photos';
    if (p) p.textContent = settings.photos_description || '';
}

// --- Events ------------------------------------------------------------------
function renderEvents(eventsData) {
    const container = $('events-container');
    const section = $('events');
    if (!container) return;

    // Update section heading
    const h2 = section?.querySelector('h2');
    if (h2) h2.textContent = eventsData.header.heading || 'Upcoming Events';

    const fragment = document.createDocumentFragment();
    for (const evt of eventsData.items) {
        const hasFlyer = !!evt.flyer;
        const box = document.createElement('div');
        box.className = hasFlyer ? 'event-box event-box--has-flyer' : 'event-box';

        let flyerHtml = '';
        if (hasFlyer) {
            const flyerSrc = `../all_photos/event_flyers/${encodeURIComponent(evt.flyer)}`;
            flyerHtml = `<div class="event-flyer-wrap">
                <img src="${flyerSrc}" alt="Flyer for ${escapeHtml(evt.title)}" class="event-flyer" loading="lazy">
                <span class="event-flyer-zoom" title="View full flyer"><i class="fas fa-expand-alt"></i></span>
            </div>`;
        }

        box.innerHTML = `
            ${flyerHtml}
            <div class="event-box-text">
                <h3>${evt.title || ''}</h3>
                <p>${evt.description || ''}</p>
            </div>
        `;

        // Lightbox for flyer on click
        if (hasFlyer) {
            const flyerImg = box.querySelector('.event-flyer-wrap');
            flyerImg.addEventListener('click', () => openFlyerLightbox(
                `../all_photos/event_flyers/${encodeURIComponent(evt.flyer)}`,
                evt.title || 'Event Flyer'
            ));
        }

        fragment.appendChild(box);
    }
    container.appendChild(fragment);
}

// --- Flyer Lightbox -----------------------------------------------------------
function openFlyerLightbox(src, title) {
    // Reuse existing modal or create one
    let modal = $('flyer-lightbox');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'flyer-lightbox';
        modal.className = 'flyer-lightbox';
        modal.innerHTML = `
            <button class="close-btn flyer-close" aria-label="Close">&times;</button>
            <img class="flyer-lightbox-img" alt="">
        `;
        document.body.appendChild(modal);

        // Close on backdrop click or close button
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('.flyer-close')) {
                modal.style.display = 'none';
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }

    const img = modal.querySelector('.flyer-lightbox-img');
    img.src = src;
    img.alt = title;
    modal.style.display = 'flex';
}

// --- Ministries / Video Section ----------------------------------------------
function renderMinistries(ministriesData) {
    const textEl = document.querySelector('.ministries-text');
    if (!textEl) return;

    // Parse links from the key-value data (link keys)
    const links = [];
    const raw = ministriesData._raw || '';
    for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('link:')) {
            const val = trimmed.substring(5).trim();
            const pipeIdx = val.indexOf('|');
            if (pipeIdx !== -1) {
                links.push({
                    label: val.substring(0, pipeIdx).trim(),
                    url: val.substring(pipeIdx + 1).trim()
                });
            }
        }
    }

    let linksHtml = '';
    if (links.length) {
        linksHtml = '<div class="ministries-links">' +
            links.map(l => `<a href="${encodeURI(l.url)}" target="_blank" rel="noopener noreferrer" class="ministries-link">${escapeHtml(l.label)}</a>`).join('') +
            '</div>';
    }

    textEl.innerHTML = `
        <h2>${ministriesData.heading || ''}</h2>
        <p>${ministriesData.text || ''}</p>
        ${linksHtml}
    `;
}

// --- Video Embed (from config) -----------------------------------------------
function loadVideoEmbed(videoData) {
    const container = $('video-container');
    if (!container) return;

    const videoId = videoData.youtube_video_id;
    if (videoId) {
        // Sanitize: YouTube video IDs are alphanumeric + hyphens + underscores only
        if (!/^[a-zA-Z0-9_-]+$/.test(videoId)) {
            container.innerHTML = '<p>Invalid video ID</p>';
            return;
        }
        container.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    } else {
        container.innerHTML = '<p>Video temporarily unavailable</p>';
    }
}

// --- Give Section ------------------------------------------------------------
function renderGive(giveData) {
    const section = $('give');
    if (!section) return;

    const container = section.querySelector('.container');

    let optionsHtml = '';
    if (giveData.items && giveData.items.length) {
        optionsHtml = giveData.items.map(opt => {
            let content = '';
            if (opt.button_url) {
                content = `
                    <i class="${escapeHtml(opt.icon)}"></i>
                    <h3>${escapeHtml(opt.title)}</h3>
                    <a href="${encodeURI(opt.button_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">${escapeHtml(opt.button_text || 'GIVE')}</a>
                `;
            } else {
                content = `
                    <i class="${opt.icon || ''}"></i>
                    <h3>${opt.title || ''}</h3>
                    <p>${opt.text || ''}</p>
                `;
            }
            return `<div class="give-box">${content}</div>`;
        }).join('');
    }

    container.innerHTML = `
        <h2>${giveData.header.heading || 'Give'}</h2>
        <p>${giveData.header.description || ''}</p>
        <div class="give-options">${optionsHtml}</div>
    `;
}

// --- Footer ------------------------------------------------------------------
function renderFooter(info, social) {
    const footerContainer = document.querySelector('.footer-container');
    if (!footerContainer) return;

    let socialHtml = '';
    if (social.facebook) socialHtml += `<a href="${encodeURI(social.facebook)}" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>`;
    if (social.instagram) socialHtml += `<a href="${encodeURI(social.instagram)}" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Instagram"><i class="fab fa-instagram"></i></a>`;
    if (social.youtube) socialHtml += `<a href="${encodeURI(social.youtube)}" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="YouTube"><i class="fab fa-youtube"></i></a>`;
    if (info.email) socialHtml += `<a href="mailto:${encodeURI(info.email)}" class="social-icon" aria-label="Email"><i class="fas fa-envelope"></i></a>`;

    footerContainer.innerHTML = `
        <div class="footer-info">
            <p>&copy; ${info.copyright_year || new Date().getFullYear()} ${info.name || 'Lifeline Church Atlanta'}. All Rights Reserved.</p>
            <p>${info.address || ''}</p>
        </div>
        <div class="footer-social">${socialHtml}</div>
    `;
}

// --- Mobile Menu -------------------------------------------------------------
function initMobileMenu() {
    const btn = $('mobile-menu-btn');
    const nav = $('mobile-nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', (e) => {
        nav.classList.toggle('active');
        e.stopPropagation();
    });
    
    nav.addEventListener('click', e => {
        if (e.target.classList.contains('nav-link')) nav.classList.remove('active');
    });

    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') && !nav.contains(e.target) && !btn.contains(e.target)) {
            nav.classList.remove('active');
        }
    });
}

// --- Navbar Scroll Effect ----------------------------------------------------
function initNavbarScroll(scrollThreshold) {
    const navbar = $('navbar');
    if (!navbar) return;
    const threshold = scrollThreshold || 80;

    const onScroll = () => {
        const currentScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        navbar.classList.toggle('scrolled', currentScroll > threshold);
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    onScroll();
    
    // Safety checks for programmatic jumps and delayed scroll restoration
    setTimeout(onScroll, 100);
    setTimeout(onScroll, 500);
}

// --- Smooth Scroll -----------------------------------------------------------
// Temporarily disables scroll-snap during programmatic scrolling so the snap
// doesn't fight the smooth scroll animation.
let _snapEnabled = true;

function initSmoothScroll() {
    document.addEventListener('click', e => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();

            if (_snapEnabled) {
                document.documentElement.style.scrollSnapType = 'none';

                const reEnable = () => {
                    document.documentElement.style.scrollSnapType = '';
                };

                if ('onscrollend' in window) {
                    const handler = () => {
                        reEnable();
                        document.removeEventListener('scrollend', handler);
                    };
                    document.addEventListener('scrollend', handler, { once: true });
                    setTimeout(reEnable, 2000);
                } else {
                    setTimeout(reEnable, 1500);
                }
            }

            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// --- Landing Background Crossfade --------------------------------------------
// Uses lazy image preloading to avoid freezing the page with large images.
// The bottom layer (bgA) always shows the current image at full opacity.
// The top layer (bgB) fades in with the NEXT image. Once the crossfade
// finishes, bgA adopts the new image and bgB hides instantly.
function initLandingSlideshow(settings, gallery) {
    const bgA = $('landing-bg');
    const bgB = $('landing-bg-next');
    if (!bgA || !bgB) return;

    // Build image URLs from gallery.json land_imgs (populated by repoSetup.js)
    const imgFiles = (gallery && gallery.land_imgs) || [];
    const urls = imgFiles.length
        ? imgFiles.map(f => `../all_photos/land_imgs/${f}`)
        : ['../all_photos/land_imgs/1.jpg', '../all_photos/land_imgs/2.jpg', '../all_photos/land_imgs/3.jpg'];
    const interval = parseInt(settings.slideshow_interval) || 6000;
    const transitionMs = parseInt(settings.crossfade_speed) || 1800;

    // Apply crossfade duration to CSS variable
    document.documentElement.style.setProperty('--hero-crossfade-ms', transitionMs + 'ms');

    if (urls.length < 2) {
        bgA.style.backgroundImage = `url('${urls[0] || ''}')`;
        return;
    }

    // Lazy preload: load the first image immediately, then load the rest
    // one-at-a-time in the background to avoid freezing the page.
    let index = 0;
    let transitioning = false;
    const preloaded = new Set();

    function preloadImage(url) {
        return new Promise(resolve => {
            if (preloaded.has(url)) { resolve(); return; }
            const img = new Image();
            img.onload = img.onerror = () => { preloaded.add(url); resolve(); };
            img.src = url;
        });
    }

    // Preload first image immediately, then start slideshow
    preloadImage(urls[0]).then(() => {
        bgA.style.backgroundImage = `url('${urls[0]}')`;
        bgA.style.opacity = '1';
        bgB.style.opacity = '0';

        // Preload remaining images lazily, one at a time, without blocking
        let preloadIdx = 1;
        function preloadNext() {
            if (preloadIdx >= urls.length) return;
            // Use requestIdleCallback if available, otherwise setTimeout
            const schedule = window.requestIdleCallback || (cb => setTimeout(cb, 200));
            schedule(() => {
                preloadImage(urls[preloadIdx]).then(() => {
                    preloadIdx++;
                    preloadNext();
                });
            });
        }
        preloadNext();

        // Start cycling
        setInterval(() => {
            if (transitioning) return;
            transitioning = true;

            index = (index + 1) % urls.length;

            bgB.style.backgroundImage = `url('${urls[index]}')`;
            bgB.style.opacity = '1';

            setTimeout(() => {
                bgA.style.backgroundImage = `url('${urls[index]}')`;
                bgB.style.transition = 'none';
                bgB.style.opacity = '0';
                void bgB.offsetHeight;
                bgB.style.transition = '';
                transitioning = false;
            }, transitionMs + 50);
        }, interval);
    });
}

// --- Photo Gallery (reads gallery.json) --------------------------------------
// Calculates the optimal number of columns so items distribute evenly across
// rows (e.g. 5 items → 3+2 instead of 4+1). Items are centered.
function renderPhotoGallery(gallery) {
    const container = $('gallery-container');
    if (!container || !gallery) return;

    const categories = gallery.categories || [];
    const count = categories.length;

    // Calculate the best column count for balanced rows
    const maxCols = 4;
    let bestCols = Math.min(count, maxCols);
    if (count > maxCols) {
        let bestScore = Infinity;
        for (let c = maxCols; c >= 2; c--) {
            const remainder = count % c;
            const score = remainder === 0 ? 0 : c - remainder;
            // Prefer higher column counts when scores are close
            // Last row must have at least ~half the items of a full row
            const lastRowItems = remainder === 0 ? c : remainder;
            if (lastRowItems >= Math.ceil(c / 2) && score < bestScore) {
                bestScore = score;
                bestCols = c;
            }
        }
        // Fallback if nothing passed the threshold
        if (bestScore === Infinity) {
            bestCols = maxCols;
        }
    }

    // Set column count as CSS variable for the grid
    container.style.setProperty('--gallery-cols', bestCols);

    const fragment = document.createDocumentFragment();
    for (const cat of categories) {
        const folder = document.createElement('div');
        folder.className = 'folder';
        folder.addEventListener('click', () => {
            sessionStorage.setItem('active_folder', cat.folder);
            sessionStorage.setItem('active_name', cat.name);
            window.location.href = `photos.html?folder=${encodeURIComponent(cat.folder)}&name=${encodeURIComponent(cat.name)}`;
        });

        const label = document.createElement('div');
        label.className = 'folder-name';
        label.textContent = cat.name;
        folder.appendChild(label);
        fragment.appendChild(folder);
    }
    container.appendChild(fragment);
}

// --- Scroll Reveal Animation -------------------------------------------------
function initScrollReveal() {
    const sections = document.querySelectorAll('.section, .section-alt');
    const revealTargets = [];

    sections.forEach(section => {
        const children = section.querySelectorAll('.container > *');
        children.forEach(child => {
            child.classList.add('reveal');
            revealTargets.push(child);
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(el => observer.observe(el));
}

// --- Apply Scroll Snap setting -----------------------------------------------
function applyScrollSnap(settings) {
    if (settings.scroll_snap === 'false') {
        _snapEnabled = false;
        document.documentElement.style.scrollSnapType = 'none';
    }
}

// --- Fetch ministries with raw text preserved for link parsing ----------------
function fetchMinistriesTxt(path) {
    return fetch(path)
        .then(r => r.ok ? r.text() : '')
        .then(t => {
            const data = parseTxt(t);
            data._raw = t;
            return data;
        })
        .catch(() => ({ _raw: '' }));
}

// --- Init: Load content files then build everything --------------------------
document.addEventListener('DOMContentLoaded', () => {
    // These don't depend on config
    initMobileMenu();
    initSmoothScroll();

    // Load all content files + gallery.json in parallel
    Promise.all([
        fetchTxt('../content/church_info.txt'),
        fetchTxt('../content/about_us.txt'),
        fetchTxtBlocks('../content/events.txt'),
        fetchMinistriesTxt('../content/ministries.txt'),
        fetchTxt('../content/video.txt'),
        fetchTxtBlocks('../content/give.txt'),
        fetchTxt('../content/social_links.txt'),
        fetchTxt('../content/map.txt'),
        fetchTxt('../content/colors.txt'),
        fetchTxt('../content/settings.txt'),
        fetch('./gallery.json').then(r => r.ok ? r.json() : {}).catch(() => ({}))
    ])
        .then(([info, aboutUs, events, ministries, video, give, social, mapData, colors, settings, gallery]) => {
            applyColors(colors);
            applyHeroDisplay(settings);
            applyScrollSnap(settings);
            renderLanding(info);
            renderMapSection(info, mapData);
            renderAboutUs(aboutUs, gallery);
            renderPhotosHeader(settings);
            renderPhotoGallery(gallery);
            renderEvents(events);
            renderMinistries(ministries);
            loadVideoEmbed(video);
            renderGive(give);
            renderFooter(info, social);
            initLandingSlideshow(settings, gallery);

            // Navbar scroll needs settings for threshold
            const scrollThreshold = parseInt(settings.navbar_scroll_threshold) || 80;
            initNavbarScroll(scrollThreshold);

            // Scroll reveal must run after content is built
            initScrollReveal();
        })
        .catch(err => {
            console.error('Failed to load content:', err);
            // Graceful fallback
            initNavbarScroll();
            initLandingSlideshow({}, {});
            initScrollReveal();
        });
});