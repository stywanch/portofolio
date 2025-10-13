/**
 * I FAI STUDIO - Portfolio Website JavaScript
 * 
 * Main functionality:
 * - Mobile menu toggle
 * - Scroll effects (header & scroll-to-top button)
 * - Custom video player controls
 * - Scroll animations with Intersection Observer
 * - Smooth scrolling for anchor links
 * - Image lightbox for snapshots
 * - Dynamic year in footer
 * 
 * @author Faisal Stywanch
 */

'use strict';

/**
 * Utility: Debounce function untuk optimasi performance
 * Membatasi eksekusi fungsi yang dipanggil berulang kali dalam waktu singkat
 */
function debounce(func, wait = 10, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const context = this;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

/**
 * Menunggu DOM selesai dimuat sebelum menjalankan skrip
 */
document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================================
    // VARIABEL ELEMEN DOM
    // ==========================================================================
    const header = document.getElementById('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const yearSpan = document.getElementById('year');
    const videoGalleryItems = document.querySelectorAll('#cinegraph .gallery-grid .gallery-item, #animatica .gallery-item');
    const snapshotImages = document.querySelectorAll('.snapshot-gallery .snapshot-img');
    const animatedSections = document.querySelectorAll('.animate-section');
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    // ==========================================================================
    // MOBILE MENU FUNCTIONALITY
    // ==========================================================================
    
    /**
     * Toggle menu mobile
     * @param {boolean} show - True untuk menampilkan, false untuk menyembunyikan
     */
    function toggleMobileMenu(show) {
        if (!mainNav || !menuToggle) return;

        mainNav.classList.toggle('active', show);
        document.body.classList.toggle('menu-open', show);
        menuToggle.setAttribute('aria-expanded', show);

        // Update ikon hamburger/close
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-times', show);
            icon.classList.toggle('fa-bars', !show);
        }
    }

    /**
     * Setup event listeners untuk mobile menu
     */
    function setupMobileMenu() {
        if (!menuToggle || !mainNav) return;

        // Click tombol toggle
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileMenu(!mainNav.classList.contains('active'));
        });

        // Click link di dalam menu
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    toggleMobileMenu(false);
                }
            });
        });

        // Click di luar menu
        document.addEventListener('click', (event) => {
            if (mainNav.classList.contains('active') &&
                !mainNav.contains(event.target) &&
                !menuToggle.contains(event.target)) {
                toggleMobileMenu(false);
            }
        });

        // Tekan Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && mainNav.classList.contains('active')) {
                toggleMobileMenu(false);
            }
        });
    }

    setupMobileMenu();

    // ==========================================================================
    // SCROLL EFFECTS (Header & Scroll-to-Top Button)
    // ==========================================================================
    
    /**
     * Handle perubahan tampilan saat scroll
     */
    function handleScrollEffects() {
        if (!header) return;

        const scrollY = window.scrollY;
        const scrollThresholdHeader = 50;
        const scrollThresholdTopBtn = 300;

        // Toggle class 'scrolled' pada header
        header.classList.toggle('scrolled', scrollY > scrollThresholdHeader);

        // Toggle visibility tombol scroll-to-top
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', scrollY > scrollThresholdTopBtn);
        }
    }

    // Gunakan debounce untuk optimasi performance
    const debouncedScrollHandler = debounce(handleScrollEffects, 10);

    if (header) {
        window.addEventListener('scroll', debouncedScrollHandler, { passive: true });
        handleScrollEffects(); // Jalankan sekali saat load
    }

    // ==========================================================================
    // CUSTOM VIDEO PLAYER CONTROLS
    // ==========================================================================
    
    /**
     * Setup kontrol play/pause untuk video gallery
     */
    function setupCustomVideoPlayers() {
        if (videoGalleryItems.length === 0) return;

        videoGalleryItems.forEach(item => {
            const video = item.querySelector('video');
            const playButton = item.querySelector('.video-play-button');

            if (!video || !playButton) {
                console.warn('Item galeri video tidak memiliki elemen video atau tombol play.', item);
                return;
            }

            const playIcon = playButton.querySelector('i');
            if (!playIcon) {
                console.warn('Tombol play tidak memiliki elemen ikon <i>.', playButton);
                return;
            }

            /**
             * Update tampilan tombol berdasarkan status video
             * @param {boolean} isPlaying
             */
            function updateVisualState(isPlaying) {
                item.classList.toggle('is-playing', isPlaying);
                playIcon.classList.toggle('fa-pause', isPlaying);
                playIcon.classList.toggle('fa-play', !isPlaying);
                playButton.setAttribute('aria-label', isPlaying ? 'Pause Video' : 'Play Video');
            }

            /**
             * Pause semua video lain di gallery
             */
            function pauseOtherVideos() {
                videoGalleryItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherVideo = otherItem.querySelector('video');
                        if (otherVideo && !otherVideo.paused) {
                            otherVideo.pause();
                        }
                    }
                });
            }

            // Event listener tombol play
            playButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (video.paused || video.ended) {
                    pauseOtherVideos();
                    video.play().catch(err => console.error('Kesalahan saat memutar video:', err));
                } else {
                    video.pause();
                }
            });

            // Event listener click pada video
            video.addEventListener('click', () => {
                if (video.paused || video.ended) {
                    pauseOtherVideos();
                    video.play().catch(err => console.error('Kesalahan saat memutar video:', err));
                } else {
                    video.pause();
                }
            });

            // Event listeners untuk status video
            video.addEventListener('play', () => updateVisualState(true));
            video.addEventListener('pause', () => updateVisualState(false));
            video.addEventListener('ended', () => updateVisualState(false));

            // Set initial state
            updateVisualState(!video.paused);
        });
    }

    setupCustomVideoPlayers();

    // ==========================================================================
    // GALLERY ITEM ANIMATIONS
    // ==========================================================================
    
    /**
     * Animate gallery items dengan stagger effect
     * @param {Element} galleryContainer - Container gallery
     * @param {string} itemSelector - CSS selector untuk item
     * @param {string} animationName - Nama keyframe animation
     * @param {number} staggerIncrement - Delay antar item (detik)
     * @param {number} animationDuration - Durasi animasi (detik)
     */
    function animateGalleryItems(galleryContainer, itemSelector, animationName, staggerIncrement, animationDuration) {
        const items = Array.from(galleryContainer.querySelectorAll(itemSelector));
        if (items.length === 0) return;

        const baseDelay = 0.1;

        items.forEach((item, index) => {
            const totalDelay = baseDelay + index * staggerIncrement;

            // Reset styles
            item.style.animation = '';
            item.style.opacity = '0';
            item.classList.remove('anim-item');

            // Handler untuk cleanup setelah animasi selesai
            const handleAnimationEnd = () => {
                item.style.animation = '';
                item.style.opacity = '1';
                item.removeEventListener('animationend', handleAnimationEnd);
            };
            item.addEventListener('animationend', handleAnimationEnd);

            // Apply animation dengan delay
            setTimeout(() => {
                item.classList.add('anim-item');
                item.style.opacity = '0';
                item.style.animation = `${animationName} ${animationDuration}s ${totalDelay}s forwards ease-out`;
            }, 10);
        });
    }

    // ==========================================================================
    // SCROLL ANIMATIONS - INTERSECTION OBSERVER
    // ==========================================================================
    
    /**
     * Setup Intersection Observer untuk animasi saat scroll
     */
    function setupScrollAnimations() {
        // Cek support Intersection Observer
        if (!('IntersectionObserver' in window) || animatedSections.length === 0) {
            console.warn('Intersection Observer tidak didukung atau tidak ada section animasi.');
            // Fallback: tampilkan semua section
            animatedSections.forEach(section => {
                section.style.opacity = '1';
                section.style.visibility = 'visible';
                section.classList.add('is-visible');
            });
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        /**
         * Callback saat section intersect dengan viewport
         */
        const animationObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    const animationType = section.dataset.animation;

                    // Trigger animasi
                    section.classList.add('is-visible');
                    section.style.opacity = '1';
                    section.style.visibility = 'visible';

                    // Handle animasi khusus untuk gallery
                    if (section.id === 'snapshots' && animationType === 'bounceUp') {
                        const gallery = section.querySelector('.snapshot-gallery');
                        if (gallery) animateGalleryItems(gallery, '.snapshot-img', 'bounceUp', 0.08, 0.8);
                    } else if (section.id === 'cinegraph' && animationType === 'bounceUp') {
                        const gallery = section.querySelector('.gallery-grid');
                        if (gallery) animateGalleryItems(gallery, '.gallery-item', 'bounceUp', 0.1, 0.8);
                    } else if (section.id === 'animatica' && animationType === 'bounceUp') {
                        const gallery = section.querySelector('.container');
                        if (gallery) animateGalleryItems(gallery, '.gallery-item', 'bounceUp', 0.1, 0.8);
                    }

                    // Stop observing setelah animasi terpicu
                    observer.unobserve(section);
                }
            });
        };

        // Create dan jalankan observer
        const scrollObserver = new IntersectionObserver(animationObserverCallback, observerOptions);
        animatedSections.forEach(section => {
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
            scrollObserver.observe(section);
        });
    }

    setupScrollAnimations();

    // ==========================================================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ==========================================================================
    
    /**
     * Setup smooth scrolling untuk internal links
     */
    function setupSmoothScroll() {
        if (anchorLinks.length === 0) return;

        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');

                // Handle link ke top (#)
                if (targetId === '#') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }

                // Handle link ke section dengan ID
                if (targetId?.startsWith('#') && targetId.length > 1) {
                    try {
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            e.preventDefault();

                            // Kalkulasi posisi dengan offset header
                            const headerOffset = header?.offsetHeight ?? 0;
                            const elementPosition = targetElement.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });
                        } else {
                            console.warn(`Target smooth scroll '${targetId}' tidak ditemukan.`);
                        }
                    } catch (error) {
                        console.error(`Error smooth scroll untuk selector '${targetId}':`, error);
                    }
                }
            });
        });
    }

    setupSmoothScroll();

    // ==========================================================================
    // SNAPSHOT LIGHTBOX
    // ==========================================================================
    
    const lightbox = document.getElementById('snapshotLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');

    /**
     * Buka lightbox dengan gambar yang diklik
     * @param {string} src - URL gambar
     * @param {string} alt - Alt text gambar
     */
    function openLightbox(src, alt) {
        if (!lightbox || !lightboxImage) return;
        lightboxImage.src = src;
        lightboxImage.alt = alt || 'Enlarged Snapshot';
        lightbox.classList.add('active');
        document.body.classList.add('lightbox-active');
    }

    /**
     * Tutup lightbox
     */
    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.classList.remove('lightbox-active');
    }

    // Setup event listeners untuk lightbox
    if (snapshotImages.length > 0 && lightbox) {
        snapshotImages.forEach(img => {
            img.addEventListener('click', function() {
                openLightbox(this.src, this.alt);
            });
            
            // Accessibility: Enter key support
            img.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    openLightbox(this.src, this.alt);
                }
            });
        });

        // Close button
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        // Close saat click overlay
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close dengan Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // ==========================================================================
    // UPDATE FOOTER YEAR
    // ==========================================================================
    
    /**
     * Update tahun di footer secara dinamis
     */
    function updateFooterYear() {
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }

    updateFooterYear();

    // ==========================================================================
    // PERFORMANCE OPTIMIZATION
    // ==========================================================================
    
    /**
     * Lazy load images yang belum terlihat (native lazy loading sudah diterapkan di HTML)
     * Fungsi ini sebagai fallback untuk browser yang tidak support native lazy loading
     */
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        console.log('Native lazy loading didukung.');
    } else {
        // Fallback untuk browser lama
        console.warn('Native lazy loading tidak didukung, gunakan polyfill jika diperlukan.');
    }

}); // End DOMContentLoaded
