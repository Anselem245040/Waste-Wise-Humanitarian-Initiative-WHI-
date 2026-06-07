(function () {
  'use strict';

  const sections = document.querySelectorAll('.page-section');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-links');
  const navHeight = 74;

  function closeMobileNav() {
    if (navMenu) navMenu.classList.remove('open');
    if (navToggle) navToggle.classList.remove('open');
  }

  function updateActiveNav(id) {
    navLinks.forEach(function (link) {
      const linkId = link.getAttribute('href').slice(1);
      link.classList.toggle('active', linkId === id);
    });
  }

  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateActiveNav(id);
    closeMobileNav();
    history.pushState(null, '', '#' + id);
  }

  window.scrollToSection = scrollToSection;

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const id = href.slice(1);
    if (!document.getElementById(id)) return;

    link.addEventListener('click', function (e) {
      e.preventDefault();
      scrollToSection(id);
    });
  });

  function getCurrentSection() {
    let current = 'home';

    sections.forEach(function (section) {
      if (window.scrollY >= section.offsetTop - navHeight - 20) {
        current = section.id;
      }
    });

    return current;
  }

  let scrollTicking = false;

  window.addEventListener('scroll', function () {
    if (scrollTicking) return;
    scrollTicking = true;

    requestAnimationFrame(function () {
      updateActiveNav(getCurrentSection());
      scrollTicking = false;
    });
  }, { passive: true });

  window.addEventListener('load', function () {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      if (document.getElementById(id)) {
        setTimeout(function () {
          scrollToSection(id);
        }, 100);
      }
    } else {
      updateActiveNav('home');
    }
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
        const submitBtn = contactForm.querySelector('.btn-submit');
        const success = contactForm.querySelector('.form-success');

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending...';
        }

        fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        })
          .then(function (response) {
            if (response.ok) {
              if (success) success.classList.add('show');
              contactForm.reset();
              setTimeout(function () {
                if (success) success.classList.remove('show');
              }, 5000);
            } else {
              alert('Something went wrong. Please try again or email us at info@whi.org.');
            }
          })
          .catch(function () {
            alert('Could not send your message. Please email us at info@whi.org.');
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Send Message';
            }
          });
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
