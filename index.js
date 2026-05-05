/* ============================================================
   Lifeline Church — Main Script
   ============================================================
   All content is loaded from siteConfig.json so non-coders
   can edit text, colors, events, links, etc. in one place.
   ============================================================ */

// --- DOM helper ---------------------------------------------------------------
const $ = id => document.getElementById(id);

// --- Apply CSS Custom Properties from config colors --------------------------
function applyColors(colors) {
    if (!colors) return;
    const root = document.documentElement.style;
    const map = {
        primary:      '--primary',
        primaryHover: '--primary-hover',
        primaryLight: '--primary-light',
        accent:       '--accent',
        accentHover:  '--accent-hover',
        dark:         '--dark',
        darkSoft:     '--dark-soft',
        surface:      '--surface',
        surfaceAlt:   '--surface-alt',
        text:         '--text',
        textLight:    '--text-light',
    };
    for (const [key, cssVar] of Object.entries(map)) {
        if (colors[key]) root.setProperty(cssVar, colors[key]);
    }
    // Derived values
    if (colors.accent) {
        root.setProperty('--accent-soft', hexToRgba(colors.accent, 0.10));
    }
    if (colors.footerBackground) {
        root.setProperty('--footer-bg', colors.footerBackground);
    }
}

// --- Apply Hero Display settings from config ---------------------------------
function applyHeroDisplay(heroDisplay) {
    if (!heroDisplay) return;
    const root = document.documentElement.style;
    const map = {
        overlayOpacityTop:    '--hero-overlay-top',
        overlayOpacityMiddle: '--hero-overlay-mid',
        overlayOpacityBottom: '--hero-overlay-bot',
        imageBrightness:      '--hero-brightness',
        imageContrast:        '--hero-contrast',
    };
    for (const [key, cssVar] of Object.entries(map)) {
        if (heroDisplay[key] != null) root.setProperty(cssVar, heroDisplay[key]);
    }
    if (heroDisplay.crossfadeMs || (heroDisplay === undefined)) {
        // crossfadeMs comes from landingSlideshow — handled there
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

// --- Populate Landing / Hero Section -----------------------------------------
function renderLanding(cfg) {
    const content = document.querySelector('.landing-content');
    if (!content || !cfg.churchInfo) return;

    const info = cfg.churchInfo;
    content.innerHTML = `
        <h1>${info.name || ''}</h1>
        <p>${info.tagline || ''}</p>
        <p>${info.serviceDescription || ''}</p>
        <p><strong>${info.serviceTime || ''}</strong></p>
    `;

}

// --- Populate Welcome / Map Section ------------------------------------------
function renderMapSection(cfg) {
    const details = document.querySelector('.map-details');
    const iframe = document.querySelector('.map-embed iframe');
    if (!details) return;

    const info = cfg.churchInfo || {};
    const welcome = cfg.welcomeSection || {};

    details.innerHTML = `
        <h2>${welcome.heading || 'WELCOME TO LIFELINE'}</h2>
        <h3>${welcome.scheduleHeading || 'SUNDAY SCHEDULE:'}</h3>
        <p>${welcome.scheduleText || ''}</p>
        <h3>ADDRESS:</h3>
        <p>${info.name || 'Lifeline Church'}<br>${info.address || ''}</p>
        <p><i class="fas fa-phone-alt"></i> ${info.phone || ''}</p>
        <p><i class="fas fa-envelope"></i> <a href="mailto:${info.email || ''}">${info.email || ''}</a></p>
    `;

    if (iframe && cfg.mapEmbed && cfg.mapEmbed.url) {
        iframe.src = cfg.mapEmbed.url;
    }
}

// --- Populate About Us -------------------------------------------------------
function renderAboutUs(cfg) {
    const textEl = document.querySelector('.about-text');
    const imagesEl = document.querySelector('.about-images');
    if (!cfg.aboutUs) return;

    if (textEl) {
        textEl.innerHTML = `<h2>${cfg.aboutUs.heading || 'About Us'}</h2><p>${cfg.aboutUs.text || ''}</p>`;
    }

    if (imagesEl && cfg.aboutUs.images) {
        imagesEl.innerHTML = '';
        cfg.aboutUs.images.forEach((src, i) => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Church community photo ${i + 1}`;
            img.loading = 'lazy';
            img.width = 220;
            img.height = 220;
            imagesEl.appendChild(img);
        });
    }
}

// --- Populate Photos Section Header ------------------------------------------
function renderPhotosHeader(cfg) {
    const section = $('photos');
    if (!section || !cfg.photosSection) return;

    const container = section.querySelector('.container');
    const h2 = container?.querySelector('h2');
    const p = container?.querySelector('p');
    if (h2) h2.textContent = cfg.photosSection.heading || 'Our Photos';
    if (p) p.textContent = cfg.photosSection.description || '';
}

// --- Events ------------------------------------------------------------------
function renderEvents(cfg) {
    const container = $('events-container');
    const section = $('events');
    if (!container || !cfg.events) return;

    // Update section heading
    const h2 = section?.querySelector('h2');
    if (h2) h2.textContent = cfg.events.heading || 'Upcoming Events';

    const events = cfg.events.list || [];
    const fragment = document.createDocumentFragment();
    for (const evt of events) {
        const box = document.createElement('div');
        box.className = 'event-box';
        box.innerHTML = `<h3>${evt.title}</h3><p>${evt.description}</p>`;
        fragment.appendChild(box);
    }
    container.appendChild(fragment);
}

// --- Ministries / Video Section ----------------------------------------------
function renderMinistries(cfg) {
    const textEl = document.querySelector('.ministries-text');
    if (!textEl || !cfg.ministries) return;

    const m = cfg.ministries;
    let linksHtml = '';
    if (m.links && m.links.length) {
        linksHtml = '<div class="ministries-links">' +
            m.links.map(l => `<a href="${l.url}" target="_blank" class="ministries-link">${l.label}</a>`).join('') +
            '</div>';
    }

    textEl.innerHTML = `
        <h2>${m.heading || ''}</h2>
        <p>${m.text || ''}</p>
        ${linksHtml}
    `;
}

// --- Video Embed (from config) -----------------------------------------------
function loadVideoEmbed(cfg) {
    const container = $('video-container');
    if (!container) return;

    if (cfg.liveVideoEmbed && cfg.liveVideoEmbed.youtubeVideoId) {
        const videoId = cfg.liveVideoEmbed.youtubeVideoId;
        container.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    } else {
        // Fallback: try the old liveVidEmbed.txt file
        fetch('./liveVidEmbed.txt')
            .then(r => r.ok ? r.text() : Promise.reject(r.status))
            .then(html => { container.innerHTML = html; })
            .catch(() => { container.innerHTML = '<p>Video temporarily unavailable</p>'; });
    }
}

// --- Give Section ------------------------------------------------------------
function renderGive(cfg) {
    const section = $('give');
    if (!section || !cfg.give) return;

    const container = section.querySelector('.container');
    const g = cfg.give;

    let optionsHtml = '';
    if (g.options && g.options.length) {
        optionsHtml = g.options.map(opt => {
            let content = '';
            if (opt.buttonUrl) {
                content = `
                    <i class="${opt.icon}"></i>
                    <h3>${opt.title}</h3>
                    <a href="${opt.buttonUrl}" target="_blank" class="btn btn-primary">${opt.buttonText || 'GIVE'}</a>
                `;
            } else {
                content = `
                    <i class="${opt.icon}"></i>
                    <h3>${opt.title}</h3>
                    <p>${opt.text || ''}</p>
                `;
            }
            return `<div class="give-box">${content}</div>`;
        }).join('');
    }

    container.innerHTML = `
        <h2>${g.heading || 'Give'}</h2>
        <p>${g.description || ''}</p>
        <div class="give-options">${optionsHtml}</div>
    `;
}

// --- Footer ------------------------------------------------------------------
function renderFooter(cfg) {
    const footerContainer = document.querySelector('.footer-container');
    if (!footerContainer) return;

    const info = cfg.churchInfo || {};
    const social = cfg.socialLinks || {};

    let socialHtml = '';
    if (social.facebook) socialHtml += `<a href="${social.facebook}" target="_blank" class="social-icon" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>`;
    if (social.instagram) socialHtml += `<a href="${social.instagram}" target="_blank" class="social-icon" aria-label="Instagram"><i class="fab fa-instagram"></i></a>`;
    if (social.youtube) socialHtml += `<a href="${social.youtube}" target="_blank" class="social-icon" aria-label="YouTube"><i class="fab fa-youtube"></i></a>`;
    if (info.email) socialHtml += `<a href="mailto:${info.email}" class="social-icon" aria-label="Email"><i class="fas fa-envelope"></i></a>`;

    footerContainer.innerHTML = `
        <div class="footer-info">
            <p>&copy; ${info.copyrightYear || new Date().getFullYear()} ${info.name || 'Lifeline Church Atlanta'}. All Rights Reserved.</p>
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

    btn.addEventListener('click', () => nav.classList.toggle('active'));
    nav.addEventListener('click', e => {
        if (e.target.classList.contains('nav-link')) nav.classList.remove('active');
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
    document.addEventListener('scroll', onScroll, { passive: true, capture: true }); // Catch html scroll
    onScroll();
    
    // Safety checks for programmatic jumps and delayed scroll restoration
    setTimeout(onScroll, 100);
    setTimeout(onScroll, 500);
}

// --- Smooth Scroll -----------------------------------------------------------
// Temporarily disables scroll-snap during programmatic scrolling so the snap
// doesn't fight the smooth scroll animation.
let _snapEnabled = true;  // updated by applyScrollSnap

function initSmoothScroll() {
    document.addEventListener('click', e => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();

            if (_snapEnabled) {
                // Disable snap while the smooth scroll is in flight
                document.documentElement.style.scrollSnapType = 'none';

                // Re-enable snap once scrolling finishes
                const reEnable = () => {
                    document.documentElement.style.scrollSnapType = '';
                };

                // Use scrollend if available, with a safety fallback
                if ('onscrollend' in window) {
                    const handler = () => {
                        reEnable();
                        document.removeEventListener('scrollend', handler);
                    };
                    document.addEventListener('scrollend', handler, { once: true });
                    // Safety fallback in case scrollend never fires
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
// The bottom layer (bgA) always shows the current image at full opacity.
// The top layer (bgB) fades in with the NEXT image. Once the crossfade
// finishes, bgA adopts the new image and bgB hides instantly — so there
// is never a moment where both layers are transparent (no gray flash).
function initLandingSlideshow(cfg) {
    const bgA = $('landing-bg');       // bottom layer — always opacity 1
    const bgB = $('landing-bg-next');  // top layer — fades in over bgA
    if (!bgA || !bgB) return;

    const slideshow = cfg.landingSlideshow || {};
    const urls = slideshow.images || ['land_imgs/1.jpg', 'land_imgs/2.jpg', 'land_imgs/3.jpg'];
    const interval = slideshow.intervalMs || 6000;
    const transitionMs = slideshow.crossfadeMs || 1800;

    // Apply crossfade duration to CSS variable
    document.documentElement.style.setProperty('--hero-crossfade-ms', transitionMs + 'ms');

    if (urls.length < 2) {
        bgA.style.backgroundImage = `url('${urls[0] || ''}')`;
        return;
    }

    // Preload all images
    urls.forEach(url => { new Image().src = url; });

    let index = 0;
    let transitioning = false;

    bgA.style.backgroundImage = `url('${urls[0]}')`;
    bgA.style.opacity = '1';
    bgB.style.opacity = '0';

    setInterval(() => {
        if (transitioning) return;
        transitioning = true;

        index = (index + 1) % urls.length;

        // Set the next image on the TOP layer and fade it in
        bgB.style.backgroundImage = `url('${urls[index]}')`;
        bgB.style.opacity = '1';

        // After transition completes, copy the image to the bottom layer
        // and instantly hide the top layer (no visible change to the user).
        setTimeout(() => {
            bgA.style.backgroundImage = `url('${urls[index]}')`;
            // Instantly hide top layer (disable transition briefly)
            bgB.style.transition = 'none';
            bgB.style.opacity = '0';
            // Force reflow so the instant hide takes effect
            void bgB.offsetHeight;
            // Re-enable transition for the next crossfade
            bgB.style.transition = '';
            transitioning = false;
        }, transitionMs + 50);
    }, interval);
}

// --- Photo Gallery (reads gallery.json) --------------------------------------
function renderPhotoGallery() {
    const container = $('gallery-container');
    if (!container) return;

    fetch('./gallery.json')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => {
            const fragment = document.createDocumentFragment();
            for (const cat of data.categories) {
                const folder = document.createElement('div');
                folder.className = 'folder';
                folder.addEventListener('click', () => {
                    window.location.href = `photos.html?folder=${encodeURIComponent(cat.folder)}&name=${encodeURIComponent(cat.name)}`;
                });

                const label = document.createElement('div');
                label.className = 'folder-name';
                label.textContent = cat.name;
                folder.appendChild(label);
                fragment.appendChild(folder);
            }
            container.appendChild(fragment);
        })
        .catch(() => {
            container.innerHTML = '<p>Photo gallery is currently unavailable.</p>';
        });
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
function applyScrollSnap(cfg) {
    const snap = cfg.scrollSnap;
    if (snap && snap.enabled === false) {
        _snapEnabled = false;
        // Disable scroll-snap that CSS applies by default
        document.documentElement.style.scrollSnapType = 'none';
    }
}

// --- Init: Load config then build everything ---------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // These don't depend on config
    initMobileMenu();
    initSmoothScroll();

    // Load config and build all dynamic content
    fetch('./siteConfig.json')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(cfg => {
            applyColors(cfg.colors);
            applyHeroDisplay(cfg.heroDisplay);
            applyScrollSnap(cfg);
            renderLanding(cfg);
            renderMapSection(cfg);
            renderAboutUs(cfg);
            renderPhotosHeader(cfg);
            renderPhotoGallery();
            renderEvents(cfg);
            renderMinistries(cfg);
            loadVideoEmbed(cfg);
            renderGive(cfg);
            renderFooter(cfg);
            initLandingSlideshow(cfg);

            // Navbar scroll needs heroDisplay config for threshold
            const scrollThreshold = cfg.heroDisplay?.navbarScrollThreshold;
            initNavbarScroll(scrollThreshold);

            // Scroll reveal must run after content is built
            initScrollReveal();
        })
        .catch(err => {
            console.error('Failed to load siteConfig.json:', err);
            // Graceful fallback — still init slideshow and reveal
            initNavbarScroll();
            initLandingSlideshow({});
            initScrollReveal();
        });
});