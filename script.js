/**
 * Menunggu DOM selesai dimuat sebelum menjalankan skrip
 */
document.addEventListener('DOMContentLoaded', function() {

    // --------------------------------------------------
    // Variabel Elemen DOM
    // --------------------------------------------------
    const header = document.getElementById('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const scrollTopBtn = document.getElementById('scrollTopBtn'); // ID ini harus ada di HTML <a> scroll top
    const yearSpan = document.getElementById('year'); // ID ini harus ada di span tahun footer
    // Selector untuk SEMUA item video yang perlu kontrol play/pause kustom
    const videoGalleryItems = document.querySelectorAll('#cinegraph .gallery-grid .gallery-item, #animatica .gallery-item');
    const snapshotImages = document.querySelectorAll('.snapshot-gallery .snapshot-img');
    const animatedSections = document.querySelectorAll('.animate-section');
    const anchorLinks = document.querySelectorAll('a[href^="#"]'); // Untuk smooth scroll

    // --------------------------------------------------
    // Fungsi Toggle Menu Mobile
    // --------------------------------------------------
    /**
     * Menampilkan atau menyembunyikan menu mobile.
     * @param {boolean} show - True untuk menampilkan, false untuk menyembunyikan.
     */
    function toggleMobileMenu(show) {
        if (!mainNav || !menuToggle) return; // Exit jika elemen tidak ditemukan

        mainNav.classList.toggle('active', show);
        document.body.classList.toggle('menu-open', show); // Untuk mencegah scroll body

        // Ganti ikon hamburger/close
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-times', show); // Ikon close
            icon.classList.toggle('fa-bars', !show); // Ikon hamburger
        }
    }

    // --------------------------------------------------
    // Fungsi Efek Scroll (Header & Tombol Scroll Top)
    // --------------------------------------------------
    /**
     * Menangani perubahan tampilan header dan tombol scroll-to-top saat halaman di-scroll.
     */
    function handleScrollEffects() {
        if (!header) return; // Exit jika header tidak ada

        const scrollY = window.scrollY;
        const scrollThresholdHeader = 50; // Jarak scroll sebelum header berubah
        const scrollThresholdTopBtn = 300; // Jarak scroll sebelum tombol muncul

        // Toggle kelas 'scrolled' pada header
        header.classList.toggle('scrolled', scrollY > scrollThresholdHeader);

        // Toggle kelas 'visible' pada tombol scroll top
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', scrollY > scrollThresholdTopBtn);
        }
    }

    // Tambahkan event listener scroll jika header ada
    if (header) {
        // { passive: true } untuk performa scroll yang lebih baik
        window.addEventListener('scroll', handleScrollEffects, { passive: true });
        // Jalankan sekali saat load untuk state awal
        handleScrollEffects();
    }

    // --------------------------------------------------
    // Setup Event Listener Menu Mobile
    // --------------------------------------------------
    /**
     * Mengatur semua event listener yang diperlukan untuk menu mobile.
     */
    function setupMobileMenu() {
        if (!menuToggle || !mainNav) return; // Exit jika elemen tidak ditemukan

        // Klik tombol toggle
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Mencegah event klik menyebar ke dokumen
            toggleMobileMenu(!mainNav.classList.contains('active'));
        });

        // Klik link di dalam menu (untuk menutup menu)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    toggleMobileMenu(false);
                }
            });
        });

        // Klik di luar area menu (untuk menutup menu)
        document.addEventListener('click', (event) => {
            if (mainNav.classList.contains('active') &&
                !mainNav.contains(event.target) && // Klik bukan di dalam nav
                !menuToggle.contains(event.target)) { // Klik bukan pada tombol toggle
                toggleMobileMenu(false);
            }
        });

        // Tekan tombol Escape (untuk menutup menu)
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && mainNav.classList.contains('active')) {
                toggleMobileMenu(false);
            }
        });
    }
    // Panggil fungsi setup menu
    setupMobileMenu();

    // --------------------------------------------------
    // Setup Kontrol Video Kustom (Cinegraph & Animatica)
    // --------------------------------------------------
    /**
     * Mengatur tombol play/pause kustom untuk elemen video yang dipilih.
     */
    function setupCustomVideoPlayers() {
        if (videoGalleryItems.length === 0) return; // Exit jika tidak ada item video

        videoGalleryItems.forEach(item => {
            const video = item.querySelector('video');
            const playButton = item.querySelector('.video-play-button');

            // Periksa apakah video dan tombol ada di dalam item ini
            if (!video || !playButton) {
                console.warn('Item galeri video tidak memiliki elemen video atau tombol play.', item);
                return; // Lanjut ke item berikutnya
            }

            const playIcon = playButton.querySelector('i');
            if (!playIcon) {
                console.warn('Tombol play tidak memiliki elemen ikon <i>.', playButton);
                return; // Lanjut ke item berikutnya
            }

            /** Memperbarui tampilan tombol play/pause */
            function updateVisualState(isPlaying) {
                item.classList.toggle('is-playing', isPlaying);
                playIcon.classList.toggle('fa-pause', isPlaying);
                playIcon.classList.toggle('fa-play', !isPlaying);
            }

            /** Mem-pause semua video lain di galeri */
            function pauseOtherVideos() {
                videoGalleryItems.forEach(otherItem => {
                    // Hanya pause video lain, bukan video yang sedang diklik
                    if (otherItem !== item) {
                        const otherVideo = otherItem.querySelector('video');
                        if (otherVideo && !otherVideo.paused) {
                            otherVideo.pause();
                        }
                    }
                });
            }

            // Event listener untuk tombol play
            playButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Mencegah klik trigger event lain
                if (video.paused || video.ended) {
                    pauseOtherVideos(); // Pause video lain dulu
                    video.play().catch(err => console.error("Kesalahan saat memutar video:", err));
                } else {
                    video.pause();
                }
            });

            // Event listener untuk klik pada video itu sendiri (opsional, bisa dihapus jika tidak mau)
            video.addEventListener('click', () => {
                if (video.paused || video.ended) {
                    pauseOtherVideos();
                    video.play().catch(err => console.error("Kesalahan saat memutar video:", err));
                } else {
                    video.pause();
                }
            });

            // Event listener untuk status video
            video.addEventListener('play', () => updateVisualState(true));
            video.addEventListener('pause', () => updateVisualState(false));
            video.addEventListener('ended', () => updateVisualState(false));

            // Set state awal tombol (jika video mungkin autoplay atau sudah diputar sebelumnya)
            updateVisualState(!video.paused);
        });
    }
    // Panggil fungsi setup video
    setupCustomVideoPlayers();

    // --------------------------------------------------
    // Fungsi Animasi Item Galeri Individual (Snapshots, Cinegraph, Animatica)
    // --------------------------------------------------
    /**
     * Menerapkan animasi stagger pada item-item di dalam container galeri.
     * @param {Element} galleryContainer - Elemen pembungkus galeri.
     * @param {string} itemSelector - Selector CSS untuk item galeri.
     * @param {string} animationName - Nama keyframe animasi CSS.
     * @param {number} staggerIncrement - Penundaan antara tiap item (detik).
     * @param {number} animationDuration - Durasi animasi (detik).
     */
    function animateGalleryItems(galleryContainer, itemSelector, animationName, staggerIncrement, animationDuration) {
        const items = Array.from(galleryContainer.querySelectorAll(itemSelector));
        if (items.length === 0) return;

        const baseDelay = 0.1; // Delay awal sebelum item pertama muncul

        items.forEach((item, index) => {
            const totalDelay = baseDelay + index * staggerIncrement;

            // Reset style dan kelas sebelum menerapkan animasi baru
            item.style.animation = '';
            item.style.opacity = '0'; // Set state awal (meskipun ada di CSS)
            item.classList.remove('anim-item'); // Hapus kelas jika ada (opsional)

            // Hapus listener lama jika ada untuk mencegah penumpukan
            const handleAnimationEnd = () => {
                item.style.animation = ''; // Hapus style animasi setelah selesai
                item.style.opacity = '1'; // Pastikan item terlihat
                item.removeEventListener('animationend', handleAnimationEnd);
            };
            item.addEventListener('animationend', handleAnimationEnd);

            // Gunakan setTimeout untuk sedikit delay sebelum menerapkan animasi
            // Ini kadang membantu browser "mendaftarkan" state awal sebelum animasi dimulai
            setTimeout(() => {
                item.classList.add('anim-item'); // Tambahkan kembali jika diperlukan oleh style lain
                item.style.opacity = '0'; // Pastikan state awal opacity 0
                item.style.animation = `${animationName} ${animationDuration}s ${totalDelay}s forwards ease-out`;
            }, 10); // Delay kecil (10ms)
        });
    }

    // --------------------------------------------------
    // Setup Animasi Scroll Menggunakan Intersection Observer
    // --------------------------------------------------
    /**
     * Mengatur Intersection Observer untuk memicu animasi saat section masuk viewport.
     */
    function setupScrollAnimations() {
        // Cek dukungan Intersection Observer
        if (!('IntersectionObserver' in window) || animatedSections.length === 0) {
            console.warn("Intersection Observer tidak didukung atau tidak ada section animasi.");
            // Tampilkan semua section jika observer tidak didukung (fallback)
            animatedSections.forEach(s => {
                s.style.opacity = '1';
                s.style.visibility = 'visible';
                s.classList.add('is-visible');
            });
            return;
        }

        // Opsi untuk Observer
        const observerOptions = {
            root: null, // relatif terhadap viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger saat 10% section terlihat
        };

        // Callback function saat section intersect
        const animationObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    const animationType = section.dataset.animation; // Ambil jenis animasi dari data-*

                    // Tambahkan kelas .is-visible untuk memicu animasi CSS
                    section.classList.add('is-visible');
                    // Set style langsung untuk memastikan visibility (jika CSS !important tidak cukup)
                    section.style.opacity = '1';
                    section.style.visibility = 'visible';

                    // Handle animasi individual untuk galeri
                    if (section.id === 'snapshots' && animationType === 'bounceUp') {
                        const gallery = section.querySelector('.snapshot-gallery');
                        if (gallery) animateGalleryItems(gallery, '.snapshot-img', 'bounceUp', 0.08, 0.8);
                    } else if (section.id === 'cinegraph' && animationType === 'bounceUp') {
                        const gallery = section.querySelector('.gallery-grid');
                        if (gallery) animateGalleryItems(gallery, '.gallery-item', 'bounceUp', 0.1, 0.8);
                    } else if (section.id === 'animatica' && animationType === 'bounceUp') {
                        const gallery = section.querySelector('.container'); // Targetkan container untuk cari .gallery-item
                        if (gallery) animateGalleryItems(gallery, '.gallery-item', 'bounceUp', 0.1, 0.8);
                    }
                    // Tidak ada lagi handling khusus untuk #make-it-happen di JS

                    // Berhenti mengamati section ini setelah animasi terpicu
                    observer.unobserve(section);
                }
            });
        };

        // Buat dan jalankan Observer
        const scrollObserver = new IntersectionObserver(animationObserverCallback, observerOptions);
        animatedSections.forEach(section => {
            // Set state awal (tersembunyi) sebelum diamati
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
            scrollObserver.observe(section);
        });
    }
    // Panggil fungsi setup animasi scroll
    setupScrollAnimations();

    // --------------------------------------------------
    // Setup Smooth Scroll untuk Anchor Links
    // --------------------------------------------------
    /**
     * Menambahkan efek smooth scroll saat mengklik link internal (#).
     */
    function setupSmoothScroll() {
        if (anchorLinks.length === 0) return; // Exit jika tidak ada anchor link

        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');

                // Handle link ke paling atas (#)
                if (targetId === '#') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }

                // Handle link ke ID section (#about, #contact, dll.)
                if (targetId?.startsWith('#') && targetId.length > 1) {
                    try {
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            e.preventDefault(); // Hanya jika target valid

                            // Kalkulasi posisi scroll dengan offset header
                            const headerOffset = header?.offsetHeight ?? 0; // Ambil tinggi header
                            const elementPosition = targetElement.getBoundingClientRect().top; // Posisi target relatif viewport
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset; // Posisi absolut dikurangi tinggi header

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });
                        } else {
                             console.warn(`Smooth scroll target '${targetId}' not found.`);
                        }
                    } catch (error) {
                        // Tangkap error jika selector tidak valid
                        console.error(`Smooth scroll error for selector '${targetId}':`, error);
                    }
                }
            });
        });
    }
    // Panggil fungsi setup smooth scroll
    setupSmoothScroll();

    // --------------------------------------------------
    // Setup Lightbox untuk Snapshots (Tambahkan jika belum ada)
    // --------------------------------------------------
    const lightbox = document.getElementById('snapshotLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');

    /** Menampilkan lightbox dengan gambar yang diklik */
    function openLightbox(src, alt) {
        if (!lightbox || !lightboxImage) return;
        lightboxImage.src = src;
        lightboxImage.alt = alt || 'Enlarged Snapshot'; // Fallback alt text
        lightbox.classList.add('active');
        document.body.classList.add('lightbox-active'); // Lock body scroll
    }

    /** Menutup lightbox */
    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.classList.remove('lightbox-active'); // Unlock body scroll
    }

    // Tambahkan event listener ke setiap gambar snapshot
    if (snapshotImages.length > 0 && lightbox) {
        snapshotImages.forEach(img => {
            img.addEventListener('click', function() {
                openLightbox(this.src, this.alt);
            });
        });

        // Event listener untuk menutup lightbox
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        // Tutup juga saat klik area overlay (di luar gambar)
        lightbox.addEventListener('click', function(e) {
            // Hanya tutup jika klik tepat pada overlay (bukan gambar atau tombol close)
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
         // Tutup dengan tombol Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && lightbox.classList.contains('active')) {
                 closeLightbox();
            }
        });
    }

    // --------------------------------------------------
    // Update Tahun di Footer
    // --------------------------------------------------
    /**
     * Memperbarui teks tahun di footer dengan tahun saat ini.
     */
    function updateFooterYear() {
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }
    // Panggil fungsi update tahun
    updateFooterYear();

}); // Akhir dari DOMContentLoaded listener
