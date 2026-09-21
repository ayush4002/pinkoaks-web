// editorial-lux.js — Interactive filtering, smooth reveals, and motion effects

document.addEventListener('DOMContentLoaded', () => {
  // 1. Interactive Apartment Filter System
  const filterBtns = document.querySelectorAll('.apartments-filter-btn');
  const resetBtn = document.querySelector('.apartments-reset-btn');
  const countBadge = document.getElementById('apartment-count');
  const cards = document.querySelectorAll('.apart-card-item');

  let currentTypology = 'all';
  let currentBedrooms = 'all';

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentTypology = 'all';
      currentBedrooms = 'all';
      cards.forEach(card => card.style.display = 'flex');
      if (countBadge) countBadge.textContent = cards.length;
    });
  }

  // 2. Subtle Reveal Animation on Scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.apart-card-item, .apart-photo-card-item, .contact-info-block').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1) ${index % 3 * 0.1}s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) ${index % 3 * 0.1}s`;
    revealObserver.observe(el);
  });
});
