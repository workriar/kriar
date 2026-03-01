// ===================================
// Kriar - Automações Inteligentes
// Main JavaScript File
// ===================================

'use strict';

// ===================================
// Global Variables
// ===================================
let lastScrollTop = 0;
const header = document.getElementById('header');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// ===================================
// Mobile Navigation Toggle
// ===================================
function initMobileNav() {
    const menuOverlay = document.getElementById('menuOverlay');

    if (navToggle && navMenu) {
        // Toggle menu
        navToggle.addEventListener('click', () => {
            const isActive = navMenu.classList.contains('active');
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            if (menuOverlay) menuOverlay.classList.toggle('active');
            document.body.style.overflow = !isActive ? 'hidden' : '';
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                if (menuOverlay) menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking overlay
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                if (menuOverlay) menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// ===================================
// Header Scroll Effect
// ===================================
function initHeaderScroll() {
    const scrollProgress = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        // Add scrolled class on scroll
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Update scroll progress bar
        if (scrollProgress) {
            scrollProgress.style.transform = `scaleX(${scrollPercent / 100})`;
        }

        // Hide header on scroll down, show on scroll up
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
    });
}

// ===================================
// Smooth Scroll for Anchor Links
// ===================================
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update active nav link
                updateActiveNavLink(href);
            }
        });
    });
}

// ===================================
// Update Active Navigation Link
// ===================================
function updateActiveNavLink(activeHref) {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === activeHref) {
            link.classList.add('active');
        }
    });
}

// ===================================
// Scroll Spy for Navigation
// ===================================
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                updateActiveNavLink(`#${sectionId}`);
            }
        });
    });
}

// ===================================
// Animate Elements on Scroll
// ===================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Elements to animate
    const animatedElements = document.querySelectorAll(
        '.solution-card, .feature-card, .use-case-card, .pricing-card'
    );

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

// ===================================
// Counter Animation for Stats
// ===================================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }

        // Format the number
        let displayValue = Math.floor(current);
        if (target >= 1000) {
            displayValue = (displayValue / 1000).toFixed(1) + 'k';
        }
        if (target < 100 && target > 10) {
            displayValue = displayValue + '%';
        }
        if (target > 100 && target < 1000) {
            displayValue = displayValue + '+';
        }

        element.textContent = displayValue;
    }, 16);
}

function initCounterAnimation() {
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                const targetValue = parseFloat(entry.target.textContent.replace(/[^0-9.]/g, ''));
                const isPercentage = entry.target.textContent.includes('%');
                const isThousands = entry.target.textContent.includes('k');

                let numericTarget = targetValue;
                if (isThousands) {
                    numericTarget = targetValue * 1000;
                } else if (isPercentage) {
                    numericTarget = targetValue;
                }

                animateCounter(entry.target, numericTarget);
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

// ===================================
// Form Validation and Submission
// ===================================
function initFormHandling() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            // Basic validation
            let isValid = true;
            const requiredFields = this.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    showError(field, 'Este campo é obrigatório');
                } else {
                    field.classList.remove('error');
                    removeError(field);
                }
            });

            // Email validation
            const emailFields = this.querySelectorAll('input[type="email"]');
            emailFields.forEach(field => {
                if (field.value && !isValidEmail(field.value)) {
                    isValid = false;
                    field.classList.add('error');
                    showError(field, 'Email inválido');
                }
            });

            if (isValid) {
                // Disable button and show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

                // Prepare WhatsApp Message
                const phone = "5511997666735";
                const text = `*Nova Mensagem do Site*\n\n*Nome:* ${data.name}\n*Email:* ${data.email}\n*Telefone:* ${data.phone}\n*Empresa:* ${data.company || 'N/A'}\n*Assunto:* ${data.subject}\n\n*Mensagem:* ${data.message}`;
                const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

                // Send to Formsubmit.co
                fetch('https://formsubmit.co/ajax/contato@kriar.digital', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        ...data,
                        _subject: `Novo Contato: ${data.subject}`,
                        _template: 'table',
                        _captcha: 'false'
                    })
                })
                    .then(response => response.json())
                    .then(responseData => {
                        // Show success message
                        showSuccessMessage(this);

                        // Open WhatsApp in new tab
                        setTimeout(() => {
                            window.open(whatsappUrl, '_blank');
                        }, 1500);

                        // Reset form
                        this.reset();
                    })
                    .catch(error => {
                        console.error('Erro:', error);
                        const errorDiv = document.createElement('div');
                        errorDiv.style.color = '#ef4444';
                        errorDiv.style.marginTop = '1rem';
                        errorDiv.textContent = 'Erro ao enviar. Por favor, tente novamente ou chame no WhatsApp.';
                        this.appendChild(errorDiv);
                        setTimeout(() => errorDiv.remove(), 5000);
                    })
                    .finally(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    });
            }
        });

        // Remove error on input
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', function () {
                this.classList.remove('error');
                removeError(this);
            });
        });
    });
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function showError(field, message) {
    removeError(field);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    field.parentNode.appendChild(errorDiv);
}

function removeError(field) {
    const errorDiv = field.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function showSuccessMessage(form) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div style="
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        ">
            <i class="fas fa-check-circle"></i>
            <span>Mensagem enviada com sucesso! Entraremos em contato em breve.</span>
        </div>
    `;

    form.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// ===================================
// Chat Widget Simulation
// ===================================
function initChatWidget() {
    const chatMessages = document.querySelector('.chat-messages');

    if (chatMessages) {
        const messages = [
            { type: 'bot', text: 'Olá! 👋 Como posso ajudar você hoje?', delay: 0 },
            { type: 'user', text: 'Quero conhecer os planos', delay: 2000 },
            { type: 'bot', text: 'Perfeito! Temos planos a partir de R$ 97/mês. Posso te mostrar?', delay: 3500 }
        ];

        // Clear existing messages
        chatMessages.innerHTML = '';

        // Animate messages appearing
        messages.forEach((msg, index) => {
            setTimeout(() => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.type}`;
                messageDiv.innerHTML = `
                    <div class="message-bubble">${msg.text}</div>
                `;
                chatMessages.appendChild(messageDiv);

                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, msg.delay);
        });
    }
}

// ===================================
// Typing Effect for Hero Title
// ===================================
function initTypingEffect() {
    const typingElement = document.querySelector('.gradient-text');

    if (typingElement) {
        const text = typingElement.textContent;
        typingElement.textContent = '';
        let index = 0;

        function type() {
            if (index < text.length) {
                typingElement.textContent += text.charAt(index);
                index++;
                setTimeout(type, 100);
            }
        }

        // Start typing after a small delay
        setTimeout(type, 500);
    }
}

// ===================================
// Pricing Toggle (Monthly/Yearly)
// ===================================
function initPricingToggle() {
    const toggleBtn = document.getElementById('pricingToggle');

    if (toggleBtn) {
        toggleBtn.addEventListener('change', function () {
            const prices = document.querySelectorAll('.pricing-price .amount');
            const isYearly = this.checked;

            prices.forEach(priceElement => {
                const monthlyPrice = parseInt(priceElement.dataset.monthly);
                const yearlyPrice = Math.floor(monthlyPrice * 12 * 0.8); // 20% discount

                if (isYearly) {
                    priceElement.textContent = yearlyPrice;
                    priceElement.parentElement.querySelector('.period').textContent = '/ano';
                } else {
                    priceElement.textContent = monthlyPrice;
                    priceElement.parentElement.querySelector('.period').textContent = '/mês';
                }
            });
        });
    }
}

// ===================================
// FAQ Accordion
// ===================================
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const accordionItem = this.parentElement;
            const accordionBody = accordionItem.querySelector('.accordion-body');
            const isOpen = accordionItem.classList.contains('active');

            // Close all accordions
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.accordion-body').style.maxHeight = null;
            });

            // Open clicked accordion if it was closed
            if (!isOpen) {
                accordionItem.classList.add('active');
                accordionBody.style.maxHeight = accordionBody.scrollHeight + 'px';
            }
        });
    });
}

// ===================================
// Lazy Loading Images
// ===================================
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ===================================
// Testimonial Slider
// ===================================
function initTestimonialSlider() {
    const slider = document.querySelector('.testimonial-slider');

    if (slider) {
        let currentSlide = 0;
        const slides = slider.querySelectorAll('.testimonial-item');
        const totalSlides = slides.length;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.style.display = i === index ? 'block' : 'none';
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(currentSlide);
        }

        // Show first slide
        showSlide(0);

        // Auto advance
        setInterval(nextSlide, 5000);

        // Navigation buttons
        const prevBtn = slider.querySelector('.slider-prev');
        const nextBtn = slider.querySelector('.slider-next');

        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    }
}

// ===================================
// Copy to Clipboard
// ===================================
function initCopyButtons() {
    const copyButtons = document.querySelectorAll('[data-copy]');

    copyButtons.forEach(button => {
        button.addEventListener('click', function () {
            const textToCopy = this.dataset.copy;

            navigator.clipboard.writeText(textToCopy).then(() => {
                // Show success feedback
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                this.style.background = '#10b981';

                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.background = '';
                }, 2000);
            }).catch(err => {
                console.error('Erro ao copiar:', err);
            });
        });
    });
}

// ===================================
// Modal System
// ===================================
function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.modal');
    const modalCloses = document.querySelectorAll('.modal-close');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            const modalId = this.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    modalCloses.forEach(closeBtn => {
        closeBtn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close on overlay click
    modals.forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close on ESC key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    });
}

// ===================================
// Loading Screen
// ===================================
function initLoadingScreen() {
    window.addEventListener('load', () => {
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
    });
}

// ===================================
// Back to Top Button
// ===================================
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (window.pageYOffset > 300) {
                    btn.classList.add('visible');
                } else {
                    btn.classList.remove('visible');
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===================================
// Newsletter Form
// ===================================
function initNewsletterForm() {
    const newsletterForms = document.querySelectorAll('.newsletter-form');

    newsletterForms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;

            if (isValidEmail(email)) {
                // Here you would typically send to your email service
                console.log('Newsletter signup:', email);

                // Show success
                const successMsg = document.createElement('p');
                successMsg.textContent = 'Obrigado por se inscrever!';
                successMsg.style.color = '#10b981';
                successMsg.style.marginTop = '0.5rem';
                this.appendChild(successMsg);

                emailInput.value = '';

                setTimeout(() => {
                    successMsg.remove();
                }, 3000);
            }
        });
    });
}


// ===================================
// Console Welcome Message
// ===================================

// ===================================
// Console Welcome Message
// ===================================
console.log('%c🚀 Kriar - Automações Inteligentes', 'color: #6366f1; font-size: 20px; font-weight: bold;');
console.log('%cVisite: https://kriar.digital', 'color: #10b981; font-size: 14px;');

// ===================================
// PREMIUM — Universal Scroll-Reveal
// ===================================
function initScrollReveal() {
    const revealClasses = [
        '.animate-on-scroll',
        '.animate-scale',
        '.animate-left',
        '.animate-right'
    ];

    const elements = document.querySelectorAll(revealClasses.join(','));
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // animate once
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// ===================================
// PREMIUM — Canvas Particle Hero
// ===================================
function initParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Insert canvas as first child of hero
    const canvas = document.createElement('canvas');
    canvas.id = 'hero-particles';
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const PARTICLE_COUNT = window.innerWidth < 768 ? 35 : 65;
    const CONNECT_DIST = 130;
    const COLORS = ['59,130,246', '6,182,212', '14,165,233'];

    function resize() {
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 2 + 1,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: Math.random() * 0.5 + 0.2
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT_DIST) {
                    const opacity = (1 - dist / CONNECT_DIST) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(59,130,246,${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
            ctx.fill();

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });

        animId = requestAnimationFrame(draw);
    }

    // Pause when tab not visible (perf)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animId);
        } else {
            draw();
        }
    });

    window.addEventListener('resize', () => {
        resize();
        particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    });

    init();
    draw();
}

// ===================================
// PREMIUM — Toast Notification System
// ===================================
function createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'success', duration = 4000) {
    const container = createToastContainer();
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
        <button class="toast-close" aria-label="Fechar"><i class="fas fa-times"></i></button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));
    container.appendChild(toast);

    const timer = setTimeout(() => dismissToast(toast), duration);
    toast._timer = timer;

    return toast;
}

function dismissToast(toast) {
    clearTimeout(toast._timer);
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 350);
}

// Make showToast globally available
window.showToast = showToast;

// ===================================
// PREMIUM — LGPD Cookie Consent
// ===================================
function initCookieConsent() {
    const COOKIE_KEY = 'kriar_cookie_consent';
    const consent = localStorage.getItem(COOKIE_KEY);
    if (consent) return; // Already decided

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Consentimento de cookies');
    banner.innerHTML = `
        <div class="cookie-icon" aria-hidden="true">🍪</div>
        <div class="cookie-text">
            <p>
                Usamos cookies para melhorar sua experiência e analisar o tráfego do site.
                Ao continuar navegando, você concorda com nossa
                <a href="privacidade.html">Política de Privacidade</a> e com a
                <a href="lgpd.html">LGPD</a>.
            </p>
        </div>
        <div class="cookie-actions">
            <button class="cookie-decline" id="cookieDecline">Recusar</button>
            <button class="cookie-accept" id="cookieAccept">Aceitar</button>
        </div>
    `;

    document.body.appendChild(banner);

    function closeBanner(accepted) {
        localStorage.setItem(COOKIE_KEY, accepted ? 'accepted' : 'declined');
        banner.classList.add('hide');
        setTimeout(() => banner.remove(), 450);
        if (accepted) {
            showToast('Preferências de cookie salvas!', 'success', 3000);
        }
    }

    document.getElementById('cookieAccept').addEventListener('click', () => closeBanner(true));
    document.getElementById('cookieDecline').addEventListener('click', () => closeBanner(false));
}

// ===================================
// Add animate-on-scroll to key elements
// ===================================
function applyScrollAnimationClasses() {
    // Hero stats
    document.querySelectorAll('.stat-item').forEach((el, i) => {
        el.classList.add('animate-on-scroll', `delay-${i + 1}`);
    });

    // Solution cards
    document.querySelectorAll('.solution-card').forEach((el, i) => {
        el.classList.add('animate-on-scroll', `delay-${(i % 3) + 1}`);
    });

    // Feature cards
    document.querySelectorAll('.feature-card').forEach((el, i) => {
        el.classList.add('animate-on-scroll', `delay-${(i % 3) + 1}`);
    });

    // Pricing cards
    document.querySelectorAll('.pricing-card').forEach((el, i) => {
        el.classList.add('animate-scale', `delay-${i + 1}`);
    });

    // Section headers
    document.querySelectorAll('.section-header').forEach(el => {
        el.classList.add('animate-on-scroll');
    });
}

// ===================================
// Initialize All Features
// ===================================

// FAQ Accordion + Tab Switcher (global — works on all pages)
function initFaq() {
    // Accordion
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });

    // Tab switcher (for FAQ sections with category tabs)
    document.querySelectorAll('.faq-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const group = tab.dataset.group;
            // Update active tab
            document.querySelectorAll('.faq-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Show matching group, hide others
            document.querySelectorAll('.faq-group').forEach(g => {
                g.style.display = g.dataset.group === group ? 'block' : 'none';
            });
            // Close any open item when switching tabs
            document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHeaderScroll();
    initSmoothScroll();
    initScrollSpy();
    initScrollAnimations();
    initCounterAnimation();
    initFormHandling();
    initChatWidget();
    initPricingToggle();
    initAccordion();
    initLazyLoading();
    initTestimonialSlider();
    initCopyButtons();
    initModals();
    initLoadingScreen();
    initBackToTop();
    initNewsletterForm();
    initFaq();

    // Premium
    applyScrollAnimationClasses();
    initScrollReveal();
    initParticles();
    initCookieConsent();
});
