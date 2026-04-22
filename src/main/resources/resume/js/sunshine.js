/* ============================================
   SUNSHINE PORTFOLIO — JavaScript
   Typewriter, Pill Nav, Scroll Reveal,
   Marquee Pause, Confetti, Interactions
   ============================================ */
(function () {
    'use strict';

    /* ── 1. TYPEWRITER (with emoji) ── */
    const Typewriter = {
        el: null,
        words: ['Mobile Developer 📱', 'Kotlin Enthusiast 🚀', 'Tech Explorer 🔭', 'App Builder 🛠️'],
        wi: 0, ci: 0, deleting: false,
        speed: 85, delSpeed: 40, pause: 2200,

        init() {
            this.el = document.getElementById('typewriter');
            if (this.el) this.tick();
        },
        tick() {
            const w = this.words[this.wi];
            this.ci += this.deleting ? -1 : 1;
            this.el.textContent = w.substring(0, this.ci);

            let d = this.deleting ? this.delSpeed : this.speed;
            d += (Math.random() - 0.5) * 30;

            if (!this.deleting && this.ci === w.length) { d = this.pause; this.deleting = true; }
            else if (this.deleting && this.ci === 0) { this.deleting = false; this.wi = (this.wi + 1) % this.words.length; d = 300; }

            setTimeout(() => this.tick(), d);
        }
    };

    /* ── 2. PILL NAVIGATION ── */
    const Nav = {
        nav: null, toggle: null, links: null, navLinks: [], sections: [],

        init() {
            this.nav = document.getElementById('main-nav');
            this.toggle = document.getElementById('nav-toggle');
            this.links = document.getElementById('nav-links');
            this.navLinks = document.querySelectorAll('.nav-link');
            this.sections = document.querySelectorAll('section[id]');
            if (!this.nav) return;

            // Mobile toggle
            this.toggle?.addEventListener('click', () => {
                this.toggle.classList.toggle('active');
                this.links.classList.toggle('open');
            });

            // Smooth scroll links
            this.navLinks.forEach(link => {
                link.addEventListener('click', e => {
                    e.preventDefault();
                    const t = document.querySelector(link.getAttribute('href'));
                    if (t) t.scrollIntoView({ behavior: 'smooth' });
                    this.toggle?.classList.remove('active');
                    this.links?.classList.remove('open');
                });
            });

            // Scroll: shrink nav + active section
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => { this.onScroll(); ticking = false; });
                    ticking = true;
                }
            }, { passive: true });
            this.onScroll();
        },

        onScroll() {
            const y = window.scrollY;
            this.nav.classList.toggle('scrolled', y > 60);

            let cur = '';
            this.sections.forEach(s => {
                const top = s.offsetTop - 180;
                if (y >= top && y < top + s.offsetHeight) cur = '#' + s.id;
            });
            this.navLinks.forEach(l => {
                l.classList.toggle('active', l.getAttribute('href') === cur);
            });
        }
    };

    /* ── 3. SCROLL REVEAL ── */
    const Reveal = {
        init() {
            const els = document.querySelectorAll('[data-reveal]');
            if (!els.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    // Stagger siblings
                    const siblings = entry.target.parentElement.querySelectorAll('[data-reveal]');
                    let idx = 0;
                    siblings.forEach((s, i) => { if (s === entry.target) idx = i; });
                    setTimeout(() => entry.target.classList.add('visible'), idx * 80);
                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

            els.forEach(el => observer.observe(el));
        }
    };

    /* ── 4. MARQUEE PAUSE ON HOVER ── */
    const Marquee = {
        init() {
            document.querySelectorAll('.marquee-row').forEach(row => {
                row.addEventListener('mouseenter', () => {
                    row.querySelector('.marquee-track')?.style.setProperty('animation-play-state', 'paused');
                });
                row.addEventListener('mouseleave', () => {
                    row.querySelector('.marquee-track')?.style.setProperty('animation-play-state', 'running');
                });
            });
        }
    };

    /* ── 5. CONFETTI on Awards ── */
    const Confetti = {
        canvas: null, ctx: null, particles: [], fired: false,

        init() {
            const section = document.getElementById('awards');
            if (!section) return;

            this.canvas = document.getElementById('confetti-canvas');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');

            const obs = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    if (e.isIntersecting && !this.fired) {
                        this.fired = true; this.fire(); obs.disconnect();
                    }
                });
            }, { threshold: 0.3 });
            obs.observe(section);
        },

        fire() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.canvas.style.display = 'block';

            const colors = ['#FF6B6B','#00BFA6','#FFD93D','#845EF7','#339AF0','#FF922B'];
            this.particles = Array.from({ length: 70 }, () => ({
                x: innerWidth / 2 + (Math.random() - 0.5) * 260,
                y: innerHeight * 0.4,
                vx: (Math.random() - 0.5) * 14,
                vy: Math.random() * -15 - 3,
                size: Math.random() * 7 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                rot: Math.random() * 360,
                rs: (Math.random() - 0.5) * 12,
                g: 0.28, o: 1,
                shape: Math.random() > 0.5 ? 'r' : 'c'
            }));
            this.animate();
        },

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            let alive = false;

            this.particles.forEach(p => {
                if (p.o <= 0) return;
                alive = true;
                p.vy += p.g; p.x += p.vx; p.y += p.vy;
                p.rot += p.rs; p.vx *= 0.99;
                if (p.y > this.canvas.height * 0.8) p.o -= 0.03;

                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rot * Math.PI / 180);
                this.ctx.globalAlpha = Math.max(0, p.o);
                this.ctx.fillStyle = p.color;
                if (p.shape === 'r') this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
                else { this.ctx.beginPath(); this.ctx.arc(0, 0, p.size/2, 0, Math.PI*2); this.ctx.fill(); }
                this.ctx.restore();
            });

            if (alive) requestAnimationFrame(() => this.animate());
            else { this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); this.canvas.style.display = 'none'; }
        }
    };

    /* ── 6. SMOOTH ANCHOR LINKS ── */
    const Anchors = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(a => {
                a.addEventListener('click', e => {
                    const href = a.getAttribute('href');
                    if (href === '#') return;
                    const t = document.querySelector(href);
                    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
                });
            });
        }
    };

    /* ── 7. FOOTER YEAR ── */
    const Year = {
        init() {
            const el = document.getElementById('footer-year');
            if (el) el.textContent = new Date().getFullYear();
        }
    };

    /* ── 8. AWARDS SCROLL DRAG ── */
    const DragScroll = {
        init() {
            document.querySelectorAll('.awards-scroll').forEach(el => {
                let isDown = false, startX, scrollLeft;
                el.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; el.style.cursor = 'grabbing'; });
                el.addEventListener('mouseleave', () => { isDown = false; el.style.cursor = ''; });
                el.addEventListener('mouseup', () => { isDown = false; el.style.cursor = ''; });
                el.addEventListener('mousemove', e => {
                    if (!isDown) return; e.preventDefault();
                    el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.5;
                });
            });
        }
    };

    /* ── 9. CONTACT FORM ── */
    const ContactForm = {
        init() {
            const form = document.getElementById('contact-form');
            if (!form) return;
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = document.getElementById('submit-btn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<span>Sending...</span> <i class="fa-solid fa-circle-notch fa-spin" style="margin-left: 8px;"></i>';
                btn.disabled = true;

                const data = {
                    name: form.name.value,
                    email: form.email.value,
                    message: form.message.value
                };

                try {
                    const res = await fetch('/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    if (res.ok) {
                        alert('Message sent successfully! Thanks for reaching out.');
                        form.reset();
                    } else {
                        const result = await res.json().catch(() => ({}));
                        alert('Failed to send message: ' + (result.message || 'Unknown error'));
                    }
                } catch (err) {
                    alert('An error occurred while sending the message. Please try again or check your internet connection.');
                } finally {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });
        }
    };

    /* ── INIT ── */
    document.addEventListener('DOMContentLoaded', () => {
        Typewriter.init();
        Nav.init();
        Reveal.init();
        Marquee.init();
        Confetti.init();
        Anchors.init();
        Year.init();
        DragScroll.init();
        ContactForm.init();
    });
})();
