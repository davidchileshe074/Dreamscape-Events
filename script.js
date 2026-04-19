/**
 * Dreamscape Events - Main Script (Performance Optimized)
 * Uses IntersectionObserver for scroll animations instead of scroll events
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navItems = document.querySelectorAll('.nav-link');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = navToggle.querySelector('.material-symbols-outlined');
            if (navLinks.classList.contains('active')) {
                icon.textContent = 'close';
            } else {
                icon.textContent = 'menu';
            }
        });
    }

    // Close mobile menu when clicking a link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = navToggle.querySelector('.material-symbols-outlined');
                icon.textContent = 'menu';
            }
        });
    });

    // 2. Sticky Navbar & Scroll Progress - use throttled scroll
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Scroll Progress Bar
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                if (scrollProgress) scrollProgress.style.width = scrolled + "%";

                // Sticky Navbar
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // 3. Active Link Update - use IntersectionObserver instead of scroll
    const sections = document.querySelectorAll('section[id]');
    const activeLinkObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href').includes(id)) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    });

    sections.forEach(section => activeLinkObserver.observe(section));

    // 4. Scroll Reveal - use IntersectionObserver (much more efficient)
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Stop observing once revealed - saves resources
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // 5. Update Current Year in Footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 6. Gallery Filtering & Lightbox
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    // Filtering
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                if(category === 'all' || itemCategory === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Lightbox open
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').src;
            if (lightbox && lightboxImg) {
                lightboxImg.src = imgSrc;
                lightbox.classList.add('active');
            }
        });
    });

    // Lightbox close
    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });
    }
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg) {
                lightbox.classList.remove('active');
            }
        });
    }

    // 7. Hero Image Slider
    const slides = document.querySelectorAll('.hero-slider .slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000); // 5 seconds interval
    }

    // 8. Lazy-load Google Maps iframe when it comes into view
    const mapIframe = document.querySelector('.map-container iframe[data-src]');
    if (mapIframe) {
        const mapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    mapIframe.src = mapIframe.getAttribute('data-src');
                    mapIframe.removeAttribute('data-src');
                    mapObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0
        });
        mapObserver.observe(mapIframe);
    }
});
