import { demos } from './demos.js';

document.documentElement.classList.add('js');

/* EDIT ME: contact email used by the modal's call-to-action button */
const CONTACT_EMAIL = 'bernieb39@gmail.com';

const dialog = document.getElementById('demo-modal');
const iconEl = document.getElementById('demo-icon');
const titleEl = document.getElementById('demo-title');
const pkgEl = document.getElementById('demo-package');
const bodyEl = document.getElementById('demo-body');
const ctaEl = document.getElementById('demo-cta');

function openDemo(id) {
  const demo = demos[id];
  if (!demo) return;
  iconEl.textContent = demo.icon;
  titleEl.textContent = demo.title;
  pkgEl.textContent = demo.package;
  pkgEl.className = 'chip ' + (demo.package.startsWith('Ongoing') ? 'chip-ongoing' : 'chip-oneshot');
  ctaEl.href = 'mailto:' + CONTACT_EMAIL +
    '?subject=' + encodeURIComponent('I want something like "' + demo.title + '"');
  bodyEl.replaceChildren();
  demo.render(bodyEl);
  dialog.showModal();
  bodyEl.scrollTop = 0;
}

for (const card of document.querySelectorAll('.card[data-demo]')) {
  card.addEventListener('click', () => openDemo(card.dataset.demo));
}

document.getElementById('demo-close').addEventListener('click', () => dialog.close());

// click on the backdrop closes the dialog
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});

// scroll reveal
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.12 });

for (const el of document.querySelectorAll('.reveal')) observer.observe(el);

document.getElementById('year').textContent = String(new Date().getFullYear());
