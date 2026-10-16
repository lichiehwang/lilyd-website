'use strict';

// Core content and image links work without JavaScript.
document.documentElement.classList.add('js');
const header = document.getElementById('site-header');
const toggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const desktop = window.matchMedia('(min-width: 761px)');
mobileNav.hidden = true;
toggle.hidden = false;

function setMenu(open, returnFocus = false) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
  mobileNav.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  if (returnFocus) toggle.focus();
}
toggle.addEventListener('click', () => {
  setMenu(toggle.getAttribute('aria-expanded') !== 'true');
});
mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenu(false));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false, true);
  }
});
document.addEventListener('pointerdown', event => {
  if (!event.composedPath().includes(header)) setMenu(false);
});
document.addEventListener('focusin', event => {
  if (!header.contains(event.target)) setMenu(false);
});
desktop.addEventListener('change', () => setMenu(false));

// Keep a stable header and reflect the section at the reading position.
const sections = [...document.querySelectorAll('main > section[id]')];
const navLinks = document.querySelectorAll('[data-nav]');
let scrollScheduled = false;
function updateNavigation() {
  const readingLine = header.offsetHeight + 140;
  let activeId = 'home';
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= readingLine) activeId = section.id;
  }
  header.classList.toggle('scrolled', window.scrollY > 12);
  navLinks.forEach(link => {
    if (link.dataset.nav === activeId) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    requestAnimationFrame(updateNavigation);
  }
}, { passive: true });
window.addEventListener('resize', updateNavigation);
window.addEventListener('load', updateNavigation);
updateNavigation();

// Enhance real links with a native modal; their original image URLs remain usable.
const dialog = document.getElementById('project-dialog');
const dialogImage = document.getElementById('project-dialog-image');
const dialogTitle = document.getElementById('project-dialog-title');
const dialogCaption = document.getElementById('project-dialog-caption');
const originalLink = document.getElementById('project-original-link');
if (typeof dialog.showModal === 'function') {
  document.querySelectorAll('[data-preview]').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', 'project-dialog');
    link.addEventListener('click', event => {
      // Preserve modifier-click and the browser's open-in-new-tab actions.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      const card = link.closest('.project-card');
      dialogTitle.textContent = card.querySelector('.project-title').textContent;
      dialogCaption.textContent = card.querySelector('.project-description').textContent;
      dialogImage.src = link.href;
      dialogImage.alt = card.querySelector('img').alt;
      originalLink.href = link.href;
      dialog.showModal();
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}
