/**
 * TUGAS WEB BUK DWI - PELATIHAN NUTRISI
 * Interactive JavaScript Engine
 * Features:
 * - Dual Mode: Web Scroll Mode & Presentation Slide Deck Mode
 * - Canva-Style Bottom Control Bar (Prev/Next, Indicators, Dots)
 * - Keyboard Navigation (Arrow Keys, Spacebar, ESC)
 * - Canvas Confetti Animation System
 * - Autoplay Slideshow Mode
 * - Fullscreen API Integration
 * - Interactive Contact Modal & Toast Notifications
 * - Responsive Mobile Menu
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const body = document.body;
  const slides = document.querySelectorAll('.slide-section');
  const totalSlides = slides.length;
  let currentSlideIndex = 1;
  let isPresentationMode = false;
  let autoplayInterval = null;

  // Nav Elements
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const modeToggleBtn = document.getElementById('modeToggleBtn');
  const modeLabel = modeToggleBtn.querySelector('.mode-label');

  // Bottom Bar Elements
  const prevSlideBtn = document.getElementById('prevSlideBtn');
  const nextSlideBtn = document.getElementById('nextSlideBtn');
  const slideIndicator = document.getElementById('slideIndicator');
  const slideDots = document.querySelectorAll('.slide-dots .dot');
  const confettiBtn = document.getElementById('confettiBtn');
  const autoplayBtn = document.getElementById('autoplayBtn');
  const playIcon = document.getElementById('playIcon');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  // Modal & Toast Elements
  const openContactModal = document.getElementById('openContactModal');
  const contactModal = document.getElementById('contactModal');
  const closeContactModal = document.getElementById('closeContactModal');
  const contactForm = document.getElementById('contactForm');
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  // Confetti Canvas
  const confettiCanvas = document.getElementById('confettiCanvas');
  const ctx = confettiCanvas ? confettiCanvas.getContext('2d') : null;

  // --- INITIALIZATION ---
  updateSlideUI(1);

  // ==========================================
  // 1. SLIDE NAVIGATION FUNCTIONS
  // ==========================================

  function goToSlide(index) {
    if (index < 1) index = 1;
    if (index > totalSlides) index = totalSlides;

    currentSlideIndex = index;
    updateSlideUI(currentSlideIndex);

    if (isPresentationMode) {
      // In Presentation Mode, switch active class
      slides.forEach((slide) => {
        const slideIdx = parseInt(slide.getAttribute('data-index'), 10);
        if (slideIdx === currentSlideIndex) {
          slide.classList.add('slide-active');
        } else {
          slide.classList.remove('slide-active');
        }
      });
    } else {
      // In Web Scroll Mode, smooth scroll to target section
      const targetSlide = document.getElementById(`slide-${currentSlideIndex}`);
      if (targetSlide) {
        targetSlide.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function updateSlideUI(index) {
    // Update indicator text e.g. "1 / 5"
    if (slideIndicator) {
      slideIndicator.textContent = `${index} / ${totalSlides}`;
    }

    // Update dots
    slideDots.forEach((dot) => {
      const dotIndex = parseInt(dot.getAttribute('data-slide'), 10);
      if (dotIndex === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update top navbar links
    navLinks.forEach((link) => {
      const linkIndex = parseInt(link.getAttribute('data-slide'), 10);
      if (linkIndex === index) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update Prev / Next button states
    if (prevSlideBtn) {
      prevSlideBtn.style.opacity = index === 1 ? '0.4' : '1';
      prevSlideBtn.style.pointerEvents = index === 1 ? 'none' : 'auto';
    }
    if (nextSlideBtn) {
      nextSlideBtn.style.opacity = index === totalSlides ? '0.4' : '1';
      nextSlideBtn.style.pointerEvents = index === totalSlides ? 'none' : 'auto';
    }
  }

  // Prev / Next button clicks
  if (prevSlideBtn) {
    prevSlideBtn.addEventListener('click', () => {
      if (currentSlideIndex > 1) {
        goToSlide(currentSlideIndex - 1);
      }
    });
  }

  if (nextSlideBtn) {
    nextSlideBtn.addEventListener('click', () => {
      if (currentSlideIndex < totalSlides) {
        goToSlide(currentSlideIndex + 1);
      }
    });
  }

  // Dots click
  slideDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetSlide = parseInt(dot.getAttribute('data-slide'), 10);
      goToSlide(targetSlide);
    });
  });

  // Top Nav Links click
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSlide = parseInt(link.getAttribute('data-slide'), 10);
      goToSlide(targetSlide);

      // Close mobile menu if open
      if (navMenu && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
    });
  });

  // ==========================================
  // 2. SCROLL SPY (OBSERVER FOR SCROLL MODE)
  // ==========================================
  if (!isPresentationMode && 'IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -40% 0px',
      threshold: 0.2
    };

    const slideObserver = new IntersectionObserver((entries) => {
      if (isPresentationMode) return; // Ignore in presentation mode

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index'), 10);
          if (index && index !== currentSlideIndex) {
            currentSlideIndex = index;
            updateSlideUI(currentSlideIndex);
          }
        }
      });
    }, observerOptions);

    slides.forEach((slide) => slideObserver.observe(slide));
  }

  // ==========================================
  // 3. DUAL-MODE TOGGLE (WEB SCROLL VS SLIDE PRESENTATION)
  // ==========================================
  function setMode(presentation) {
    isPresentationMode = presentation;

    if (isPresentationMode) {
      body.classList.remove('mode-scroll');
      body.classList.add('mode-presentation');
      if (modeLabel) modeLabel.textContent = 'Mode Web Scroll';
      showToast('Mode Presentasi Aktif (Gunakan Tombol Panah)');
      goToSlide(currentSlideIndex);
    } else {
      body.classList.remove('mode-presentation');
      body.classList.add('mode-scroll');
      if (modeLabel) modeLabel.textContent = 'Mode Presentasi';
      showToast('Mode Web Scroll Aktif');

      // Scroll to current slide position
      const targetSlide = document.getElementById(`slide-${currentSlideIndex}`);
      if (targetSlide) {
        targetSlide.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', () => {
      setMode(!isPresentationMode);
    });
  }

  // ==========================================
  // 4. KEYBOARD SHORTCUTS
  // ==========================================
  window.addEventListener('keydown', (e) => {
    // If contact modal is open, don't trigger slide change
    if (contactModal && contactModal.classList.contains('open')) {
      if (e.key === 'Escape') {
        closeModal();
      }
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (isPresentationMode && e.key === ' ')) {
      e.preventDefault();
      if (currentSlideIndex < totalSlides) {
        goToSlide(currentSlideIndex + 1);
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      if (currentSlideIndex > 1) {
        goToSlide(currentSlideIndex - 1);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(totalSlides);
    } else if (e.key.toLowerCase() === 'p') {
      // Shortcut 'P' to toggle Presentation mode
      setMode(!isPresentationMode);
    } else if (e.key.toLowerCase() === 'c') {
      // Shortcut 'C' for Confetti
      triggerConfetti();
    }
  });

  // ==========================================
  // 5. AUTOPLAY / SLIDESHOW
  // ==========================================
  function toggleAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
      if (playIcon) {
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      }
      showToast('Autoplay Berhenti');
    } else {
      // Automatically switch to presentation mode if not already
      if (!isPresentationMode) {
        setMode(true);
      }
      if (playIcon) {
        playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      }
      showToast('Autoplay Dimulai (5 detik per slide)');

      autoplayInterval = setInterval(() => {
        if (currentSlideIndex < totalSlides) {
          goToSlide(currentSlideIndex + 1);
        } else {
          goToSlide(1); // loop back
        }
      }, 5000);
    }
  }

  if (autoplayBtn) {
    autoplayBtn.addEventListener('click', toggleAutoplay);
  }

  // ==========================================
  // 6. FULLSCREEN TOGGLE
  // ==========================================
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn(`Fullscreen error: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // ==========================================
  // 7. RESPONSIVE MOBILE MENU
  // ==========================================
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  // ==========================================
  // 8. INTERACTIVE CONTACT MODAL & TOAST
  // ==========================================
  function openModal() {
    if (contactModal) contactModal.classList.add('open');
  }

  function closeModal() {
    if (contactModal) contactModal.classList.remove('open');
  }

  if (openContactModal) {
    openContactModal.addEventListener('click', openModal);
  }

  if (closeContactModal) {
    closeContactModal.addEventListener('click', closeModal);
  }

  if (contactModal) {
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        closeModal();
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('userName').value.trim();
      closeModal();
      contactForm.reset();
      triggerConfetti();
      showToast(`Terima kasih ${name}! Pesan Anda telah kami terima.`);
    });
  }

  function showToast(message) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // ==========================================
  // 9. CELEBRATION CONFETTI ENGINE
  // ==========================================
  let confettiParticles = [];
  let confettiAnimId = null;

  function resizeConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);
  resizeConfettiCanvas();

  const confettiColors = ['#FF7324', '#D8C3FE', '#26C6DA', '#FFD54F', '#FF4081', '#00E676'];

  function createParticle(x, y) {
    return {
      x,
      y,
      size: Math.random() * 8 + 6,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.38,
      drag: 0.98,
      opacity: 1
    };
  }

  function triggerConfetti() {
    if (!confettiCanvas || !ctx) return;
    resizeConfettiCanvas();

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight * 0.65;

    for (let i = 0; i < 90; i++) {
      confettiParticles.push(createParticle(startX, startY));
    }

    if (!confettiAnimId) {
      animateConfetti();
    }
  }

  function animateConfetti() {
    if (!ctx) return;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.009;

      if (p.opacity <= 0 || p.y > confettiCanvas.height + 20) {
        confettiParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }

    if (confettiParticles.length > 0) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      confettiAnimId = null;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  if (confettiBtn) {
    confettiBtn.addEventListener('click', triggerConfetti);
  }

  // ==========================================
  // 10. SUBTLE 3D TILT EFFECT ON HOVER
  // ==========================================
  const floatingGraphics = document.querySelectorAll('.floating-graphic');
  floatingGraphics.forEach((graphic) => {
    graphic.addEventListener('mousemove', (e) => {
      const rect = graphic.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (-y / rect.height) * 12;
      const rotateY = (x / rect.width) * 12;
      graphic.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    });

    graphic.addEventListener('mouseleave', () => {
      graphic.style.transform = '';
    });
  });
});
