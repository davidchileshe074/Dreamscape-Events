/**
 * Dreamscape Events - Main Script (Performance Optimized)
 * Uses IntersectionObserver for scroll animations instead of scroll events
 */

(() => {
    const hidePreloader = () => {
        const preloader = document.getElementById('sitePreloader');
        if (!preloader) return;

        preloader.classList.add('is-hidden');
        preloader.setAttribute('aria-hidden', 'true');
        setTimeout(() => preloader.remove(), 520);
    };

    const finishLoading = () => {
        window.setTimeout(hidePreloader, 160);
    };

    if (document.readyState !== 'loading') {
        finishLoading();
    } else {
        document.addEventListener('DOMContentLoaded', finishLoading, { once: true });
        window.setTimeout(hidePreloader, 1800);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navItems = document.querySelectorAll('.nav-link, .dropdown-content a');

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

    // Close mobile menu when clicking a link (but not if it's a dropdown trigger)
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const isDropdownParent = item.parentElement.classList.contains('dropdown');
            const dropdownContent = item.nextElementSibling;
            
            if (navLinks.classList.contains('active')) {
                if (isDropdownParent && item.getAttribute('href') === '#') {
                    // It's a mobile dropdown trigger
                    e.preventDefault();
                    if (dropdownContent) {
                        dropdownContent.classList.toggle('active');
                        // Rotate arrow icon if it exists
                        const icon = item.querySelector('.fa-chevron-down');
                        if (icon) {
                            icon.style.transform = dropdownContent.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
                            icon.style.transition = 'transform 0.3s ease';
                        }
                    }
                } else {
                    // Regular link or sub-link, close the menu
                    navLinks.classList.remove('active');
                    const icon = navToggle.querySelector('.material-symbols-outlined');
                    if (icon) icon.textContent = 'menu';
                    
                    // Reset dropdowns for next time
                    document.querySelectorAll('.dropdown-content').forEach(dc => dc.classList.remove('active'));
                }
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
                const hasHero = document.querySelector('.hero');
                
                if (window.scrollY > 50 || !hasHero) {
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

    // 3.1 Hardset active link based on URL (for subpages)
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    navItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        if (itemHref === currentPath) {
            item.classList.add('active');
        }
    });

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
        const setSlideBackground = (slide) => {
            const bg = slide.getAttribute('data-bg');
            if (!bg) return;

            slide.style.backgroundImage = `url('${bg}')`;
            slide.removeAttribute('data-bg');
        };

        const warmHeroSlides = () => {
            slides.forEach((slide, index) => {
                if (index > 0) setSlideBackground(slide);
            });
        };

        window.setTimeout(warmHeroSlides, 1600);

        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            setSlideBackground(slides[currentSlide]);
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
    // 9. Booking Form — EmailJS + WhatsApp Submission
    const bookingForm     = document.getElementById('bookingForm');
    const bookingSuccess  = document.getElementById('bookingSuccess');
    const bookingAgainBtn = document.getElementById('bookingAgainBtn');
    const submitBtn       = document.getElementById('bookingSubmitBtn');

    // ─── FORMSUBMIT CONFIGURATION ──────────────────────────────────────────
    const FORMSUBMIT_EMAIL = 'dreamscapeevents79@gmail.com'; 
    // ────────────────────────────────────────────────────────────────────────

    const WHATSAPP_NUMBER = '260979542298';

    if (bookingForm) {

        // Set min date to today
        const dateInput = document.getElementById('bookingDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }

        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Gather values
            const name   = document.getElementById('bookingName').value.trim();
            const email  = document.getElementById('bookingEmail').value.trim();
            const phone  = document.getElementById('bookingPhone').value.trim();
            const guests = document.getElementById('bookingGuests').value.trim();
            const pkg    = document.getElementById('bookingPackage').value.trim();
            const date   = document.getElementById('bookingDate').value;
            const notes  = document.getElementById('bookingNotes').value.trim();

            // Validate required fields
            let valid = true;
            [
                { id: 'bookingName',    val: name },
                { id: 'bookingEmail',   val: email },
                { id: 'bookingPhone',   val: phone },
                { id: 'bookingGuests',  val: guests },
                { id: 'bookingPackage', val: pkg },
                { id: 'bookingDate',    val: date },
            ].forEach(({ id, val }) => {
                const el = document.getElementById(id);
                if (!val) {
                    el.classList.add('input-error');
                    valid = false;
                } else {
                    el.classList.remove('input-error');
                }
            });

            if (!valid) return;

            // Format date
            const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-ZM', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });

            // Loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:1.2rem;animation:spin 1s linear infinite;margin-right:8px;">progress_activity</span>Sending...';

            let emailSent = false;
            try {
                // Submit to FormSubmit via AJAX
                const response = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        Name: name,
                        Email: email,
                        Phone: phone,
                        Guests: guests,
                        Package: pkg,
                        Date: formattedDate,
                        Notes: notes || 'None',
                        _subject: "New Booking Request — Dreamscape Events"
                    })
                });
                if (response.ok) emailSent = true;
            } catch (err) {
                console.error('FormSubmit error:', err);
            }

            // Always open WhatsApp (works as fallback even if email fails)
            const waMessage =
                ` *New Booking Request — Dreamscape Events*\n\n` +
                ` *Name:* ${name}\n` +
                ` *Email:* ${email}\n` +
                ` *Contact:* ${phone}\n` +
                ` *Guests:* ${guests}\n` +
                ` *Package:* ${pkg}\n` +
                ` *Date:* ${formattedDate}\n` +
                (notes ? ` *Notes:* ${notes}\n` : '') +
                `\n_Sent from Dreamscape Events website_`;

            window.open(
                `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`,
                '_blank', 'noopener,noreferrer'
            );

            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-brands fa-whatsapp" style="margin-right:8px;"></i>Send Booking via WhatsApp';

            // Show success panel
            bookingForm.style.display = 'none';
            if (bookingSuccess) {
                bookingSuccess.dataset.emailSent = emailSent;
                bookingSuccess.querySelector('p').textContent = emailSent
                    ? "Your request was sent via WhatsApp and email. We'll confirm your booking shortly!"
                    : "Your request was sent via WhatsApp. We'll confirm your booking shortly.";
                bookingSuccess.style.display = 'flex';
                bookingSuccess.classList.add('show');
            }
        });

        // Clear error on input
        bookingForm.querySelectorAll('.form-control').forEach(el => {
            el.addEventListener('input', () => el.classList.remove('input-error'));
        });

        // Reset on "Make Another Booking"
        if (bookingAgainBtn) {
            bookingAgainBtn.addEventListener('click', () => {
                bookingForm.reset();
                bookingForm.style.display = 'block';
                if (bookingSuccess) {
                    bookingSuccess.style.display = 'none';
                    bookingSuccess.classList.remove('show');
                }
            });
        }
    }
});
