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
function initNavbarScroll() {
    const navbar = $('navbar');
    if (!navbar) return;

    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

// --- Smooth Scroll -----------------------------------------------------------
function initSmoothScroll() {
    document.addEventListener('click', e => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// --- Landing Background Crossfade --------------------------------------------
function initLandingSlideshow(cfg) {
    const bgA = $('landing-bg');
    const bgB = $('landing-bg-next');
    if (!bgA || !bgB) return;

    const slideshow = cfg.landingSlideshow || {};
    const urls = slideshow.images || ['land_imgs/1.jpg', 'land_imgs/2.jpg', 'land_imgs/3.jpg'];
    const interval = slideshow.intervalMs || 6000;

    // Preload images
    urls.forEach(url => { new Image().src = url; });

    let index = 0;
    let showingA = true;

    bgA.style.backgroundImage = `url('${urls[0]}')`;

    setInterval(() => {
        index = (index + 1) % urls.length;
        const nextUrl = `url('${urls[index]}')`;

        if (showingA) {
            bgB.style.backgroundImage = nextUrl;
            bgB.style.opacity = '1';
            bgA.style.opacity = '0';
        } else {
            bgA.style.backgroundImage = nextUrl;
            bgA.style.opacity = '1';
            bgB.style.opacity = '0';
        }
        showingA = !showingA;
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

// --- Init: Load config then build everything ---------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // These don't depend on config
    initMobileMenu();
    initNavbarScroll();
    initSmoothScroll();

    // Load config and build all dynamic content
    fetch('./siteConfig.json')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(cfg => {
            applyColors(cfg.colors);
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

            // Scroll reveal must run after content is built
            initScrollReveal();
        })
        .catch(err => {
            console.error('Failed to load siteConfig.json:', err);
            // Graceful fallback — still init slideshow and reveal
            initLandingSlideshow({});
            initScrollReveal();
        });
});