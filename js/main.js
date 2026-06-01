(function () {
  'use strict';

  const pages = document.querySelectorAll('.page-section');
  const navLinks = document.querySelectorAll('.nav-links a[data-page]');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-links');

  function showPage(id) {
    pages.forEach(function (section) {
      section.classList.remove('active');
    });

    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
    }

    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.dataset.page === id);
    });

    closeMobileNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeMobileNav() {
    if (navMenu) navMenu.classList.remove('open');
    if (navToggle) navToggle.classList.remove('open');
  }

  window.showPage = showPage;

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });

  document.querySelectorAll('[data-page]').forEach(function (el) {
    if (el.closest('.nav-links')) return;
    el.addEventListener('click', function (e) {
      e.preventDefault();
      showPage(el.dataset.page);
    });
  });

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });
  }

  document.addEventListener('click', function (e) {
    if (!navMenu || !navToggle) return;
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      closeMobileNav();
    }
  });

  document.querySelectorAll('.donate-card').forEach(function (card) {
    card.addEventListener('click', function () {
      document.querySelectorAll('.donate-card').forEach(function (c) {
        c.classList.remove('selected');
      });
      card.classList.add('selected');

      const amount = card.querySelector('.donate-amount');
      const customInput = document.getElementById('custom-amount');
      if (amount && customInput) {
        customInput.value = amount.textContent.replace('$', '');
      }
    });
  });

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      let valid = true;
      const requiredFields = contactForm.querySelectorAll('[required]');

      requiredFields.forEach(function (field) {
        const errorEl = field.parentElement.querySelector('.form-error');
        if (errorEl) errorEl.remove();
        field.classList.remove('error');

        if (!field.value.trim()) {
          valid = false;
          field.classList.add('error');
          const error = document.createElement('span');
          error.className = 'form-error';
          error.textContent = 'This field is required';
          field.parentElement.appendChild(error);
        }

        if (field.type === 'email' && field.value.trim()) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(field.value.trim())) {
            valid = false;
            field.classList.add('error');
            const error = document.createElement('span');
            error.className = 'form-error';
            error.textContent = 'Please enter a valid email';
            field.parentElement.appendChild(error);
          }
        }
      });

      if (valid) {
        const success = contactForm.querySelector('.form-success');
        if (success) success.classList.add('show');
        contactForm.reset();
        setTimeout(function () {
          if (success) success.classList.remove('show');
        }, 5000);
      }
    });
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach(function (el) {
    observer.observe(el);
  });

  const statNums = document.querySelectorAll('.stat-num[data-target]');
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    statNums.forEach(function (el) {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1500;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target + suffix;
        }
      }

      requestAnimationFrame(update);
    });
  }

  const statsStrip = document.querySelector('.stats-strip');
  if (statsStrip) {
    const statsObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          animateStats();
          statsObserver.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    statsObserver.observe(statsStrip);
  }
})();
