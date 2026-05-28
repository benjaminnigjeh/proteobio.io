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

/* ─── Demo simulation ────────────────────────────────────────── */
(function initDemo() {

  /* ── Scripted demo scenarios ── */
  const DEMOS = {
    pipeline: {
      task: 'Process my RAW file through the full proteomics pipeline.',
      routing: [
        { agent: 'Signal Processing',  action: 'Parse & centroid RAW spectra',                   delay: 400  },
        { agent: 'Identification',      action: 'Trained spectral search against UniProt/SwissProt', delay: 900  },
        { agent: 'Characterization',    action: 'Transformer PTM localization & classification',  delay: 1500 },
        { agent: 'BioInformatics',      action: 'Pathway enrichment & PPI network analysis',      delay: 2200 },
        { agent: 'Feature Discovery',   action: 'XAI attribution — top discriminating features', delay: 2900 },
        { agent: 'Reporting',           action: 'Compile publication-ready report',               delay: 3500 },
      ],
      log: [
        { text: '[supervisor] → routing plan generated (6 agents)',            delay: 500,  cls: 'log-line--system'    },
        { text: '[signal-processing] → loaded 12,847 MS2 spectra',            delay: 1000, cls: ''                    },
        { text: '[signal-processing] → centroiding complete (3.1s)',           delay: 1300, cls: ''                    },
        { text: '[identification] ⚡ spectral search: 4,231 peptides matched', delay: 1800, cls: 'log-line--highlight' },
        { text: '[identification] → FDR < 1% · 892 unique proteins',          delay: 2100, cls: ''                    },
        { text: '[characterization] → transformer scan: 312 phosphosites',    delay: 2600, cls: 'log-line--highlight' },
        { text: '[characterization] → 47 ubiquitination events mapped',       delay: 2900, cls: ''                    },
        { text: '[bioinformatics] → PI3K-Akt pathway (p=2.1e-8)',             delay: 3400, cls: ''                    },
        { text: '[bioinformatics] → mTOR signaling (p=4.3e-6)',               delay: 3700, cls: ''                    },
        { text: '[feature-discovery] 💡 XAI: top features flagged (n=18)',    delay: 4100, cls: 'log-line--highlight' },
        { text: '[quality-control] → all checks passed ✓',                    delay: 4400, cls: 'log-line--success'   },
        { text: '[reporting] → report generated with full provenance ✓',      delay: 4800, cls: 'log-line--success'   },
      ],
    },
    ptm: {
      task: 'Identify and characterize PTMs in my phosphoproteomics dataset.',
      routing: [
        { agent: 'Signal Processing',  action: 'Extract phosphopeptide-enriched spectra',        delay: 400  },
        { agent: 'Characterization',   action: 'Transformer-based PTM site localization',        delay: 1000 },
        { agent: 'Feature Discovery',  action: 'XAI analysis of PTM-driving features',           delay: 1700 },
        { agent: 'BioInformatics',     action: 'Kinase-substrate network mapping',               delay: 2400 },
        { agent: 'Reporting',          action: 'PTM landscape report with confidence scores',    delay: 3000 },
      ],
      log: [
        { text: '[supervisor] → routing plan: 5 agents (PTM-specialized)',     delay: 500,  cls: 'log-line--system'    },
        { text: '[signal-processing] → 8,423 phosphopeptide spectra loaded',   delay: 1000, cls: ''                    },
        { text: '[characterization] ⚡ transformer model: 1,847 phosphosites', delay: 1600, cls: 'log-line--highlight' },
        { text: '[characterization] → class I localization: 94.2%',           delay: 1900, cls: ''                    },
        { text: '[foundation-model] 🆕 23 novel modification sites detected',  delay: 2300, cls: 'log-line--highlight' },
        { text: '[feature-discovery] 💡 Ser-Pro motif (attribution: 0.87)',    delay: 2800, cls: 'log-line--highlight' },
        { text: '[bioinformatics] → 14 kinases implicated, CDK2 top hub',     delay: 3300, cls: ''                    },
        { text: '[quality-control] → guard-rail checks passed ✓',             delay: 3700, cls: 'log-line--success'   },
        { text: '[reporting] → PTM landscape report ready ✓',                 delay: 4100, cls: 'log-line--success'   },
      ],
    },
    novel: {
      task: 'Explore novel protein properties using fine-tuned foundation models.',
      routing: [
        { agent: 'Feature Discovery',  action: 'Foundation model embedding of peptide sequences', delay: 400  },
        { agent: 'BioInformatics',     action: 'Cluster novel property candidates',               delay: 1100 },
        { agent: 'Characterization',   action: 'Validate against known databases',                delay: 1800 },
        { agent: 'Reporting',          action: 'Summarize novel findings with confidence scores', delay: 2500 },
      ],
      log: [
        { text: '[supervisor] → routing plan: 4 agents (discovery mode)',      delay: 500,  cls: 'log-line--system'    },
        { text: '[foundation-model] 🧠 fine-tuned model loaded (proteo-v2)',   delay: 900,  cls: 'log-line--highlight' },
        { text: '[feature-discovery] → embedded 5,234 unique peptide seqs',    delay: 1400, cls: ''                    },
        { text: '[feature-discovery] 🆕 67 peptides with novel signatures',    delay: 1900, cls: 'log-line--highlight' },
        { text: '[feature-discovery] 💡 XAI: 31 high-confidence candidates',   delay: 2300, cls: 'log-line--highlight' },
        { text: '[bioinformatics] → 3 clusters: PTM crosstalk, splice variants, neo-epitopes', delay: 2800, cls: '' },
        { text: '[characterization] → validated against UniProt + PDB',        delay: 3200, cls: ''                    },
        { text: '[quality-control] → compliance checks passed ✓',             delay: 3600, cls: 'log-line--success'   },
        { text: '[reporting] → novel property report with CIs ready ✓',       delay: 4000, cls: 'log-line--success'   },
      ],
    },
  };

  const taskEl    = document.getElementById('demo-task');
  const runBtn    = document.getElementById('demo-run');
  const abortBtn  = document.getElementById('demo-abort');
  const statusEl  = document.getElementById('demo-status');
  const routingEl = document.getElementById('demo-routing');
  const logEl     = document.getElementById('demo-log');

  if (!taskEl) return;

  let timers = [];
  let running = false;

  /* ── Example pill buttons ── */
  document.querySelectorAll('.demo-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const key = pill.dataset.demo;
      if (!DEMOS[key]) return;
      taskEl.value = DEMOS[key].task;
      document.querySelectorAll('.demo-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  /* ── Reset UI ── */
  function resetOutput() {
    timers.forEach(clearTimeout);
    timers = [];
    running = false;
    routingEl.innerHTML = '<p class="demo-placeholder">Submit a request to see the supervisor routing plan.</p>';
    logEl.innerHTML     = '<p class="demo-placeholder">Agent outputs will appear here.</p>';
    statusEl.textContent = 'idle';
    statusEl.className   = 'demo-status';
    runBtn.disabled  = false;
    abortBtn.disabled = true;
  }

  /* ── Helpers ── */
  function setStatus(s) {
    statusEl.textContent = s;
    statusEl.className   = 'demo-status ' + s;
  }

  function appendRoutingStep(step, state) {
    if (routingEl.querySelector('.demo-placeholder')) routingEl.innerHTML = '';
    const icons = { pending:'⏳', running:'⚡', done:'✅' };
    const div = document.createElement('div');
    div.className = 'routing-step';
    div.style.animationDelay = '0s';
    div.innerHTML = `
      <span class="routing-icon">${icons[state]}</span>
      <div class="routing-body">
        <div class="routing-agent">${step.agent}</div>
        <div class="routing-action">${step.action}</div>
      </div>
      <span class="routing-badge routing-badge--${state}">${state}</span>`;
    routingEl.appendChild(div);
    routingEl.scrollTop = routingEl.scrollHeight;
    return div;
  }

  function appendLog(line) {
    if (logEl.querySelector('.demo-placeholder')) logEl.innerHTML = '';
    const span = document.createElement('span');
    span.className = 'log-line ' + (line.cls || '');
    span.textContent = line.text;
    logEl.appendChild(span);
    logEl.appendChild(document.createElement('br'));
    logEl.scrollTop = logEl.scrollHeight;
  }

  /* ── Run simulation ── */
  function runDemo(scenario) {
    resetOutput();
    running = true;
    runBtn.disabled  = true;
    abortBtn.disabled = false;
    setStatus('running');

    const routingNodes = [];

    /* Show all routing steps as 'pending' first */
    scenario.routing.forEach(step => {
      routingNodes.push(appendRoutingStep(step, 'pending'));
    });
    routingEl.scrollTop = 0;

    /* Animate routing steps to 'running' then 'done' */
    scenario.routing.forEach((step, i) => {
      const node = routingNodes[i];
      const icons = { pending:'⏳', running:'⚡', done:'✅' };
      timers.push(setTimeout(() => {
        if (!running) return;
        node.querySelector('.routing-icon').textContent = icons.running;
        node.querySelector('.routing-badge').textContent = 'running';
        node.querySelector('.routing-badge').className = 'routing-badge routing-badge--running';
      }, step.delay));
      timers.push(setTimeout(() => {
        if (!running) return;
        node.querySelector('.routing-icon').textContent = icons.done;
        node.querySelector('.routing-badge').textContent = 'done';
        node.querySelector('.routing-badge').className = 'routing-badge routing-badge--done';
      }, step.delay + 600));
    });

    /* Animate log lines */
    scenario.log.forEach(line => {
      timers.push(setTimeout(() => {
        if (!running) return;
        appendLog(line);
      }, line.delay));
    });

    /* Finish */
    const totalTime = Math.max(...scenario.log.map(l => l.delay)) + 800;
    timers.push(setTimeout(() => {
      if (!running) return;
      setStatus('done');
      runBtn.disabled   = false;
      abortBtn.disabled = true;
      running = false;
    }, totalTime));
  }

  /* ── Event listeners ── */
  runBtn.addEventListener('click', () => {
    const task = taskEl.value.trim();
    if (!task) { taskEl.focus(); return; }

    /* Match typed text to a demo scenario, or pick 'pipeline' as default */
    let key = 'pipeline';
    if (task.toLowerCase().includes('ptm') || task.toLowerCase().includes('phospho') || task.toLowerCase().includes('modification')) key = 'ptm';
    if (task.toLowerCase().includes('novel') || task.toLowerCase().includes('foundation') || task.toLowerCase().includes('discover')) key = 'novel';

    runDemo(DEMOS[key]);
  });

  abortBtn.addEventListener('click', () => {
    timers.forEach(clearTimeout);
    timers = [];
    running = false;
    setStatus('idle');
    runBtn.disabled   = false;
    abortBtn.disabled = true;
    appendLog({ text: '[supervisor] → aborted by user', cls: 'log-line--system' });
  });

})();

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
