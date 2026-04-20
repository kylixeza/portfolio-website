/* ============================================
   FUTURISTIC PORTFOLIO — JavaScript
   Particles, Typewriter, Scroll Animations,
   Navigation, and Interactivity
   ============================================ */

(function () {
    'use strict';

    // ────────────────────────────────────────────
    // 1. PARTICLE SYSTEM
    // ────────────────────────────────────────────
    const ParticleSystem = {
        canvas: null,
        ctx: null,
        particles: [],
        connections: [],
        mouse: { x: -1000, y: -1000 },
        animationId: null,
        config: {
            particleCount: 80,
            maxDistance: 150,
            particleSize: { min: 1, max: 2.5 },
            speed: { min: 0.15, max: 0.5 },
            colors: [
                'rgba(108, 92, 231, ',   // purple
                'rgba(0, 206, 201, ',    // teal
                'rgba(253, 121, 168, ',  // pink
            ],
            mouseRadius: 200,
        },

        init() {
            this.canvas = document.getElementById('particle-canvas');
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.resize();
            this.createParticles();
            this.bindEvents();
            this.animate();
        },

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },

        createParticles() {
            this.particles = [];
            // Scale particle count based on screen size for performance
            const area = window.innerWidth * window.innerHeight;
            const count = Math.min(this.config.particleCount, Math.floor(area / 15000));

            for (let i = 0; i < count; i++) {
                const colorBase = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * (this.config.speed.max - this.config.speed.min) + this.config.speed.min,
                    vy: (Math.random() - 0.5) * (this.config.speed.max - this.config.speed.min) + this.config.speed.min,
                    size: Math.random() * (this.config.particleSize.max - this.config.particleSize.min) + this.config.particleSize.min,
                    color: colorBase,
                    opacity: Math.random() * 0.5 + 0.2,
                    pulseSpeed: Math.random() * 0.02 + 0.005,
                    pulseOffset: Math.random() * Math.PI * 2,
                });
            }
        },

        bindEvents() {
            window.addEventListener('resize', () => {
                this.resize();
                this.createParticles();
            });

            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            window.addEventListener('mouseleave', () => {
                this.mouse.x = -1000;
                this.mouse.y = -1000;
            });
        },

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const time = Date.now() * 0.001;

            // Update & draw particles
            this.particles.forEach((p, i) => {
                // Update position with slight drift
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < -20) p.x = this.canvas.width + 20;
                if (p.x > this.canvas.width + 20) p.x = -20;
                if (p.y < -20) p.y = this.canvas.height + 20;
                if (p.y > this.canvas.height + 20) p.y = -20;

                // Mouse repulsion
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.config.mouseRadius) {
                    const force = (this.config.mouseRadius - dist) / this.config.mouseRadius;
                    p.x += dx * force * 0.02;
                    p.y += dy * force * 0.02;
                }

                // Pulse opacity
                const pulseAlpha = p.opacity + Math.sin(time * p.pulseSpeed * 10 + p.pulseOffset) * 0.15;
                const alpha = Math.max(0.05, Math.min(0.6, pulseAlpha));

                // Draw particle
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color + alpha + ')';
                this.ctx.fill();

                // Draw connections
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const cdx = p.x - p2.x;
                    const cdy = p.y - p2.y;
                    const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

                    if (cdist < this.config.maxDistance) {
                        const lineAlpha = (1 - cdist / this.config.maxDistance) * 0.15;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = p.color + lineAlpha + ')';
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }
            });

            this.animationId = requestAnimationFrame(() => this.animate());
        },

        destroy() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    };


    // ────────────────────────────────────────────
    // 2. TYPEWRITER EFFECT
    // ────────────────────────────────────────────
    const Typewriter = {
        element: null,
        words: ['Mobile Developer', 'Kotlin Developer', 'Tech Enthusiast', 'Android Engineer'],
        wordIndex: 0,
        charIndex: 0,
        isDeleting: false,
        typeSpeed: 100,
        deleteSpeed: 50,
        pauseDuration: 2000,
        timeoutId: null,

        init() {
            this.element = document.getElementById('typewriter');
            if (!this.element) return;
            this.type();
        },

        type() {
            const currentWord = this.words[this.wordIndex];

            if (this.isDeleting) {
                this.charIndex--;
            } else {
                this.charIndex++;
            }

            this.element.textContent = currentWord.substring(0, this.charIndex);

            let delay = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

            // Add variation
            delay += (Math.random() - 0.5) * 40;

            if (!this.isDeleting && this.charIndex === currentWord.length) {
                delay = this.pauseDuration;
                this.isDeleting = true;
            } else if (this.isDeleting && this.charIndex === 0) {
                this.isDeleting = false;
                this.wordIndex = (this.wordIndex + 1) % this.words.length;
                delay = 400;
            }

            this.timeoutId = setTimeout(() => this.type(), delay);
        },

        destroy() {
            if (this.timeoutId) clearTimeout(this.timeoutId);
        }
    };


    // ────────────────────────────────────────────
    // 3. NAVIGATION
    // ────────────────────────────────────────────
    const Navigation = {
        nav: null,
        toggle: null,
        links: null,
        navLinks: [],
        sections: [],

        init() {
            this.nav = document.getElementById('main-nav');
            this.toggle = document.getElementById('nav-toggle');
            this.links = document.getElementById('nav-links');
            this.navLinks = document.querySelectorAll('.nav-link');
            this.sections = document.querySelectorAll('.section, .hero');

            if (!this.nav) return;

            this.bindEvents();
            this.onScroll();
        },

        bindEvents() {
            // Mobile toggle
            if (this.toggle) {
                this.toggle.addEventListener('click', () => {
                    this.toggle.classList.toggle('active');
                    this.links.classList.toggle('open');
                });
            }

            // Smooth scroll for links
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const target = document.querySelector(targetId);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                        // Close mobile menu
                        if (this.toggle) this.toggle.classList.remove('active');
                        if (this.links) this.links.classList.remove('open');
                    }
                });
            });

            // Scroll handler
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.onScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        },

        onScroll() {
            const scrollY = window.scrollY;

            // Navbar background on scroll
            if (scrollY > 50) {
                this.nav.classList.add('scrolled');
            } else {
                this.nav.classList.remove('scrolled');
            }

            // Active section highlight
            let currentSection = '';
            this.sections.forEach(section => {
                const sectionTop = section.offsetTop - 150;
                const sectionBottom = sectionTop + section.offsetHeight;
                if (scrollY >= sectionTop && scrollY < sectionBottom) {
                    currentSection = '#' + section.id;
                }
            });

            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === currentSection) {
                    link.classList.add('active');
                }
            });
        }
    };


    // ────────────────────────────────────────────
    // 4. SCROLL REVEAL ANIMATIONS
    // ────────────────────────────────────────────
    const ScrollReveal = {
        elements: [],
        observer: null,

        init() {
            this.elements = document.querySelectorAll('[data-animate]');
            if (!this.elements.length) return;

            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry, index) => {
                        if (entry.isIntersecting) {
                            // Stagger delay based on order among siblings
                            const siblings = entry.target.parentElement.querySelectorAll('[data-animate]');
                            let siblingIndex = 0;
                            siblings.forEach((s, i) => {
                                if (s === entry.target) siblingIndex = i;
                            });

                            setTimeout(() => {
                                entry.target.classList.add('visible');
                            }, siblingIndex * 80);

                            this.observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -40px 0px'
                }
            );

            this.elements.forEach(el => this.observer.observe(el));
        },

        destroy() {
            if (this.observer) this.observer.disconnect();
        }
    };


    // ────────────────────────────────────────────
    // 5. SMOOTH SCROLL FOR ANCHOR LINKS
    // ────────────────────────────────────────────
    const SmoothScroll = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');
                    if (href === '#') return;

                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
        }
    };


    // ────────────────────────────────────────────
    // 6. FOOTER YEAR
    // ────────────────────────────────────────────
    const FooterYear = {
        init() {
            const el = document.getElementById('footer-year');
            if (el) el.textContent = new Date().getFullYear();
        }
    };


    // ────────────────────────────────────────────
    // 7. TILT EFFECT ON GLASS CARDS (Desktop)
    // ────────────────────────────────────────────
    const TiltEffect = {
        init() {
            if (window.matchMedia('(hover: none)').matches) return;

            const cards = document.querySelectorAll('.project-card, .skill-card');
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rX = (y - centerY) / centerY * -4;
                    const rY = (x - centerX) / centerX * 4;

                    card.style.transform = `perspective(600px) rotateX(${rX}deg) rotateY(${rY}deg) translateY(-2px)`;
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';
                });
            });
        }
    };


    // ────────────────────────────────────────────
    // 8. MAGNETIC CURSOR ON BUTTONS (Desktop)
    // ────────────────────────────────────────────
    const MagneticButtons = {
        init() {
            if (window.matchMedia('(hover: none)').matches) return;

            const buttons = document.querySelectorAll('.btn-primary-glow, .btn-outline-glow, .social-link');
            buttons.forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                });
            });
        }
    };


    // ────────────────────────────────────────────
    // 9. GRADIENT TEXT SHIMMER ON HERO
    // ────────────────────────────────────────────
    const HeroShimmer = {
        init() {
            const heroName = document.querySelector('.hero-name');
            if (!heroName) return;

            let hue = 0;
            const shimmer = () => {
                hue = (hue + 0.3) % 360;
                const color1 = `hsl(${260 + Math.sin(hue * 0.01) * 10}, 75%, 65%)`;
                const color2 = `hsl(${175 + Math.sin(hue * 0.015) * 10}, 75%, 60%)`;
                heroName.style.backgroundImage = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
                requestAnimationFrame(shimmer);
            };
            shimmer();
        }
    };


    // ────────────────────────────────────────────
    // INITIALIZE EVERYTHING
    // ────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        ParticleSystem.init();
        Typewriter.init();
        Navigation.init();
        ScrollReveal.init();
        SmoothScroll.init();
        FooterYear.init();
        TiltEffect.init();
        MagneticButtons.init();
        HeroShimmer.init();
    });

})();
