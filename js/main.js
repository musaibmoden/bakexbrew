/* ============================================
   BAKE + BREW — Main JavaScript
   ============================================
   Handles:
     1. Component loader (navbar, footer)
     2. Navbar scroll effect & active link
     3. Mobile hamburger menu
     4. Scroll-reveal animations
     5. Menu page category filter
     6. Contact form validation
     7. Smooth scroll for anchor links
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  loadComponents();
  initScrollReveal();
  initMenuFilter();
  initContactForm();
  initSmoothScroll();
});


/* ──────────────────────────────────────────
   1. COMPONENT LOADER
   Fetches navbar.html & footer.html and
   inserts them into #navbar / #footer divs.
   After load, initialises navbar behaviour.
   ────────────────────────────────────────── */
async function loadComponents() {
  const components = [
    { id: 'navbar', path: 'components/navbar.html' },
    { id: 'footer', path: 'components/footer.html' },
  ];

  await Promise.all(
    components.map(async ({ id, path }) => {
      const el = document.getElementById(id);
      if (!el) return;
      try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        el.innerHTML = await res.text();
      } catch (err) {
        console.warn(err.message);
      }
    })
  );

  // Components are now in the DOM — initialise navbar
  initNavbar();
  highlightActiveLink();
}


/* ──────────────────────────────────────────
   2. NAVBAR — scroll shadow & sticky effect
   ────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // set initial state

  initHamburger();
}


/* ──────────────────────────────────────────
   3. HAMBURGER / MOBILE MENU
   ────────────────────────────────────────── */
function initHamburger() {
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('open');
    menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  menu.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      btn.click();
    }
  });
}


/* ──────────────────────────────────────────
   HIGHLIGHT ACTIVE NAV LINK
   Matches current page filename against
   each nav link's href.
   ────────────────────────────────────────── */
function highlightActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.navbar__links a, .mobile-menu__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}


/* ──────────────────────────────────────────
   4. SCROLL REVEAL
   Uses IntersectionObserver to add .visible
   to elements with .reveal when they enter
   the viewport.
   ────────────────────────────────────────── */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  reveals.forEach(el => observer.observe(el));
}


/* ──────────────────────────────────────────
   5. MENU PAGE — CATEGORY FILTER TABS
   Shows / hides .menu-category blocks
   based on the data-category attribute.
   ────────────────────────────────────────── */
function initMenuFilter() {
  const tabs = document.querySelectorAll('.menu-tab');
  const categories = document.querySelectorAll('.menu-category');
  if (!tabs.length || !categories.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const selected = tab.dataset.category;

      categories.forEach(cat => {
        if (selected === 'all' || cat.dataset.menuCategory === selected) {
          cat.style.display = '';
          // Re-trigger reveal for newly-shown items
          cat.querySelectorAll('.reveal:not(.visible)').forEach(el => {
            el.classList.add('visible');
          });
        } else {
          cat.style.display = 'none';
        }
      });
    });
  });
}


/* ──────────────────────────────────────────
   6. CONTACT FORM — VALIDATION
   Client-side validation with inline errors.
   Shows success message on valid submit.
   ────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fields = {
    name: {
      el: document.getElementById('name'),
      error: document.getElementById('nameError'),
      validate: (v) => v.trim().length >= 2,
    },
    email: {
      el: document.getElementById('email'),
      error: document.getElementById('emailError'),
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    },
    message: {
      el: document.getElementById('message'),
      error: document.getElementById('messageError'),
      validate: (v) => v.trim().length >= 5,
    },
  };

  // Live validation — remove error on input
  Object.values(fields).forEach(({ el }) => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    Object.values(fields).forEach(({ el, error, validate }) => {
      if (!validate(el.value)) {
        el.classList.add('error');
        error.style.display = 'block';
        valid = false;
      } else {
        el.classList.remove('error');
        error.style.display = 'none';
      }
    });

    if (valid) {
      // Hide form, show success
      form.style.display = 'none';
      const success = document.getElementById('formSuccess');
      if (success) success.classList.add('show');
    }
  });
}


/* ──────────────────────────────────────────
   7. SMOOTH SCROLL — anchor links
   Adds offset for the fixed navbar.
   ────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height'), 10
      ) || 72;

      window.scrollTo({
        top: target.offsetTop - navHeight,
        behavior: 'smooth',
      });
    });
  });
}
