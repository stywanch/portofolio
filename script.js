document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const yearSpan = document.getElementById('year');
    const videoGalleryItems = document.querySelectorAll('#cinegraph .gallery-grid .gallery-item');
    const snapshotImages = document.querySelectorAll('.snapshot-gallery .snapshot-img');
    const animatedSections = document.querySelectorAll('.animate-section');
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    function toggleMobileMenu(show) {
        if (!mainNav || !menuToggle) return;
        mainNav.classList.toggle('active', show);
        document.body.classList.toggle('menu-open', show);
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-times', show);
            icon.classList.toggle('fa-bars', !show);
        }
    }

    function handleScrollEffects() {
        if (!header) return;
        const scrollY = window.scrollY;
        const scrollThresholdHeader = 50;
        const scrollThresholdTopBtn = 300;
        header.classList.toggle('scrolled', scrollY > scrollThresholdHeader);
        if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', scrollY > scrollThresholdTopBtn);
    }
    if (header) {
        window.addEventListener('scroll', handleScrollEffects, { passive: true });
        handleScrollEffects();
    }

    function setupMobileMenu() {
        if (!menuToggle || !mainNav) return;
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileMenu(!mainNav.classList.contains('active'));
        });
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) toggleMobileMenu(false);
            });
        });
        document.addEventListener('click', (event) => {
            if (mainNav.classList.contains('active') && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) toggleMobileMenu(false);
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && mainNav.classList.contains('active')) toggleMobileMenu(false);
        });
    }
    setupMobileMenu();

    function setupCustomVideoPlayers() {
        if (videoGalleryItems.length === 0) return;
        videoGalleryItems.forEach(item => {
            const video = item.querySelector('video');
            const playButton = item.querySelector('.video-play-button');
            if (!video || !playButton) return;
            const playIcon = playButton.querySelector('i');
            if (!playIcon) return;

            function updateVisualState(isPlaying) {
                item.classList.toggle('is-playing', isPlaying);
                playIcon.classList.toggle('fa-pause', isPlaying);
                playIcon.classList.toggle('fa-play', !isPlaying);
            }

            function pauseOtherVideos() {
                videoGalleryItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherVideo = otherItem.querySelector('video');
                        if (otherVideo && !otherVideo.paused) {
                            otherVideo.pause();
                            otherItem.classList.remove('is-playing');
                            const otherPlayIcon = otherItem.querySelector('.video-play-button i');
                            if (otherPlayIcon) {
                                otherPlayIcon.classList.remove('fa-pause');
                                otherPlayIcon.classList.add('fa-play');
                            }
                        }
                    }
                });
            }

            playButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (video.paused || video.ended) {
                    pauseOtherVideos();
                    video.play().catch(err => console.error("Vid play err:", err));
                } else {
                    video.pause();
                }
            });

            video.addEventListener('click', () => {
                if (video.paused || video.ended) {
                    pauseOtherVideos();
                    video.play().catch(err => console.error("Vid play err:", err));
                } else {
                    video.pause();
                }
            });

            video.addEventListener('play', () => updateVisualState(true));
            video.addEventListener('pause', () => updateVisualState(false));
            video.addEventListener('ended', () => updateVisualState(false));
        });
    }
    setupCustomVideoPlayers();

    function animateGalleryItems(galleryContainer, itemSelector, animationName, staggerIncrement, animationDuration) {
        const items = Array.from(galleryContainer.querySelectorAll(itemSelector));
        if (items.length === 0) return;
        const baseDelay = 0.1;

        items.forEach((item, index) => {
            const totalDelay = baseDelay + index * staggerIncrement;
            item.style.animation = '';
            item.style.opacity = '0';
            item.classList.remove('anim-item');

            const handleAnimationEnd = () => {
                item.style.animation = '';
                item.style.opacity = '1';
                item.removeEventListener('animationend', handleAnimationEnd);
            };
            item.addEventListener('animationend', handleAnimationEnd);

            setTimeout(() => {
                item.classList.add('anim-item');
                item.style.animation = `${animationName} ${animationDuration}s ${totalDelay}s forwards ease-out`;
            }, 10);
        });
    }

    function setupScrollAnimations() {
        if (!('IntersectionObserver' in window) || animatedSections.length === 0) {
            animatedSections.forEach(s => {
                s.style.opacity = '1';
                s.style.visibility = 'visible';
                s.classList.add('is-visible');
            });
            return;
        }

        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

        const animationObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    const animationType = section.dataset.animation;

                    section.classList.add('is-visible');
                    section.style.opacity = '1';
                    section.style.visibility = 'visible';

                    if (section.id === 'snapshots' && animationType === 'bounceUp') {
                        const gallery = section.querySelector('.snapshot-gallery');
                        if (gallery) animateGalleryItems(gallery, '.snapshot-img', 'bounceUp', 0.08, 0.8);
                    } else if (section.id === 'cinegraph' && animationType === 'bounceUp') {
                        const gallery = section.querySelector('.gallery-grid');
                        if (gallery) animateGalleryItems(gallery, '.gallery-item', 'bounceUp', 0.1, 0.8);
                    } else if (section.id === 'make-it-happen') {
                        const mihLines = section.querySelectorAll('.mih-line .mih-content');
                        mihLines.forEach(m => {
                            m.style.animation = '';
                            m.style.paddingLeft = '100%';
                        });
                    }

                    observer.unobserve(section);
                }
            });
        };

        const scrollObserver = new IntersectionObserver(animationObserverCallback, observerOptions);
        animatedSections.forEach(section => {
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
            scrollObserver.observe(section);
        });
    }
    setupScrollAnimations();

    function setupSmoothScroll() {
        if (anchorLinks.length === 0) return;
        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                if (targetId?.startsWith('#') && targetId.length > 1) {
                    try {
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            e.preventDefault();
                            const headerOffset = header?.offsetHeight ?? 0;
                            const elementPosition = targetElement.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                        }
                    } catch (error) {
                        console.error(`Smooth scroll error for selector '${targetId}':`, error);
                    }
                }
            });
        });
    }
    setupSmoothScroll();

    function updateFooterYear() {
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    }
    updateFooterYear();
});
