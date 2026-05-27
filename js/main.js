/* ═══════════════════════════════════════════════════════════════
   ProteoBio — main.js
   ═══════════════════════════════════════════════════════════════ */

/* ─── Navbar scroll effect ───────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── Hamburger menu ─────────────────────────────────────────── */
const hamburger = document.querySelector('.hamburger');
hamburger.addEventListener('click', () => {
  const isOpen = navbar.classList.toggle('nav-open');
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close nav when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navbar.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

/* ─── Animated hero canvas (particle network) ────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;

  const CONFIG = {
    count:        90,
    maxDist:      160,
    speed:        0.35,
    radius:       1.8,
    colorNode:    '0, 212, 255',
    colorEdge:    '124, 58, 237',
  };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * CONFIG.speed;
    this.vy = (Math.random() - 0.5) * CONFIG.speed;
    this.r  = CONFIG.radius + Math.random() * 0.8;
  }

  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw edges
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.maxDist) {
          const alpha = (1 - dist / CONFIG.maxDist) * 0.35;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${CONFIG.colorEdge}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.colorNode}, 0.7)`;
      ctx.fill();
      p.update();
    });

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    init();
    draw();
  });

  init();
  draw();
})();

/* ─── Intersection Observer — fade-in on scroll ──────────────── */
const observerConfig = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, observerConfig);

// Add fade-up class to elements we want animated
const animTargets = [
  '.feature-card',
  '.pipeline-step',
  '.contact-card',
  '.about-text',
  '.about-visual',
  '.newsletter-box',
  '.section-title',
  '.section-label',
];

animTargets.forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.55s ease ${i * 0.08}s, transform 0.55s ease ${i * 0.08}s`;
    el.classList.add('fade-target');
    fadeObserver.observe(el);
  });
});

// Add the .visible style rule dynamically
const fadeStyle = document.createElement('style');
fadeStyle.textContent = '.fade-target.visible { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(fadeStyle);

/* ─── Contact form (Formspree) ───────────────────────────────── */
const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('form-status');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        formStatus.textContent = '✅ Message sent! We\'ll be in touch shortly.';
        formStatus.className = 'form-status success';
        contactForm.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      formStatus.textContent = '❌ Something went wrong. Please email us directly at admin@proteobio.io';
      formStatus.className = 'form-status error';
    }

    submitBtn.textContent = 'Send Message →';
    submitBtn.disabled = false;
  });
}

/* ─── Newsletter form (Mailchimp) ────────────────────────────── */
// After creating your Mailchimp audience, go to:
//   Audience → Signup Forms → Embedded Forms
// Copy the form action URL (looks like:
//   https://proteobio.us21.list-manage.com/subscribe/post?u=XXXX&amp;id=YYYY
// and paste it below, replacing PASTE_MAILCHIMP_ACTION_URL_HERE
const MAILCHIMP_URL = 'PASTE_MAILCHIMP_ACTION_URL_HERE';

const nlForm = document.getElementById('newsletter-form');

if (nlForm) {
  nlForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = nlForm.querySelector('input[type="email"]').value;
    const btn   = nlForm.querySelector('button');

    // If Mailchimp URL not yet configured, show friendly message
    if (MAILCHIMP_URL.startsWith('PASTE_')) {
      nlForm.innerHTML = '<p style="color:var(--green);font-weight:600;">🎉 Thanks! We\'ll reach out soon at ' + email + '</p>';
      return;
    }

    btn.textContent = 'Subscribing…';
    btn.disabled = true;

    // Mailchimp requires JSONP (no CORS on their endpoint)
    // We use a hidden iframe trick — works without a server
    const url = MAILCHIMP_URL.replace('/post?', '/post-json?') + '&EMAIL=' + encodeURIComponent(email) + '&c=mailchimpCallback';

    window.mailchimpCallback = (data) => {
      if (data.result === 'success') {
        nlForm.innerHTML = '<p style="color:var(--green);font-weight:600;">🎉 You\'re on the list! Watch your inbox.</p>';
      } else {
        nlForm.innerHTML = '<p style="color:#f87171;">❌ ' + (data.msg || 'Something went wrong. Try again.') + '</p>';
      }
      document.getElementById('mc-jsonp')?.remove();
    };

    const script = document.createElement('script');
    script.id  = 'mc-jsonp';
    script.src = url;
    document.body.appendChild(script);
  });
}

/* ─── Active nav link highlight ──────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// Active link style
const activeStyle = document.createElement('style');
activeStyle.textContent = '.nav-links a.active { color: var(--cyan) !important; }';
document.head.appendChild(activeStyle);
