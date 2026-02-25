/* ═══════════════════════════════════════════════
   swarmandbee.com — HQ Site JS
   ═══════════════════════════════════════════════ */

const API = 'https://router.swarmandbee.com';

// ── Smooth scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Scroll-triggered fade-in ──
(function initReveal() {
  const sections = document.querySelectorAll('section');
  sections.forEach(s => { s.style.opacity = '0'; s.style.transform = 'translateY(20px)'; s.style.transition = 'opacity 0.6s ease, transform 0.6s ease'; });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(s => observer.observe(s));
})();

// ── Feedback widget ──
(function initFeedback() {
  const toggle = document.getElementById('fb-toggle');
  const panel = document.getElementById('fb-panel');
  const submit = document.getElementById('fb-submit');
  const thanks = document.getElementById('fb-thanks');
  const comment = document.getElementById('fb-comment');
  let selectedRating = null;

  if (!toggle) return;

  toggle.addEventListener('click', () => panel.classList.toggle('hidden'));

  document.querySelectorAll('.fb-rate').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fb-rate').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedRating = btn.dataset.rate;
    });
  });

  submit.addEventListener('click', async () => {
    const text = comment.value.trim();
    if (!text && !selectedRating) return;
    submit.disabled = true;
    submit.textContent = 'Sending...';
    try {
      await fetch(`${API}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'hq_site', rating: selectedRating, comment: text, page: location.pathname }),
      });
      submit.style.display = 'none';
      thanks.classList.remove('hidden');
      setTimeout(() => { panel.classList.add('hidden'); }, 2000);
    } catch {
      submit.textContent = 'Error — try again';
      submit.disabled = false;
    }
  });
})();

// ── Contact Form ────────────────────────────────────────

(function initContactForm() {
  const form = document.getElementById('contact-form-el');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    const status = document.getElementById('cf-status');
    const btn = document.getElementById('cf-submit');

    if (!name || !email || !message) return;

    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.className = 'cf-status hidden';

    try {
      const res = await fetch('https://swarmandbee.com/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();

      if (data.ok) {
        status.textContent = 'Message sent! We\'ll get back to you within 24 hours.';
        status.className = 'cf-status success';
        form.reset();
      } else {
        status.textContent = data.error || 'Something went wrong. Try again.';
        status.className = 'cf-status error';
      }
    } catch {
      status.textContent = 'Network error. Please try again.';
      status.className = 'cf-status error';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });
})();
