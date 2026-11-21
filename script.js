const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');

function closeMenu() {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
}

menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', closeMenu);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    closeMenu();
    menu.focus();
  }
});

const slides = Array.from(document.querySelectorAll('.slide'));
if (slides.length) {
  const hero = document.querySelector('.hero');
  const dots = document.querySelector('#dots');
  const pause = document.querySelector('#pause');
  let current = 0;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer;

  const indicators = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Show slide ' + (index + 1));
    button.addEventListener('click', () => {
      show(index);
      restart();
    });
    dots.append(button);
    return button;
  });

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      slide.hidden = position !== current;
      if (slide.hidden) indicators[position].removeAttribute('aria-current');
      else indicators[position].setAttribute('aria-current', 'true');
    });
  }

  function restart() {
    clearInterval(timer);
    if (!paused && !document.hidden && !hero.matches(':hover, :focus-within')) {
      timer = setInterval(() => show(current + 1), 6800);
    }
    pause.textContent = paused ? '▶' : 'Ⅱ';
    pause.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
  }

  document.querySelector('#prev').addEventListener('click', () => show(current - 1));
  document.querySelector('#next').addEventListener('click', () => show(current + 1));
  pause.addEventListener('click', () => {
    paused = !paused;
    restart();
  });
  ['mouseenter', 'mouseleave', 'focusin'].forEach(event => hero.addEventListener(event, restart));
  hero.addEventListener('focusout', () => setTimeout(restart, 0));
  document.addEventListener('visibilitychange', restart);
  show(0);
  restart();
}

const lightbox = document.querySelector('#lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  document.querySelectorAll('[data-image]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const picture = lightbox.querySelector('img');
      picture.src = link.href;
      picture.alt = link.querySelector('img').alt;
      lightbox.querySelector('p').textContent = picture.alt;
      lightbox.showModal();
    });
  });
  lightbox.querySelector('button').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) lightbox.close();
  });
}

const config = window.urbora;
const phone = config.phone.replace(/[^+\d]/g, '');
const whatsapp = config.whatsapp.replace(/\D/g, '');
const phoneUrl = /^\+?[1-9]\d{6,14}$/.test(phone) ? 'tel:' + phone : '';
const whatsappUrl = /^[1-9]\d{6,14}$/.test(whatsapp) ? 'https://wa.me/' + whatsapp : '';
const emailUrl = config.email ? 'mailto:' + config.email : '';

function activate(selector, url, label) {
  const link = document.querySelector(selector);
  if (!link || !url) return;
  link.href = url;
  if (label) link.textContent = label;
  link.hidden = false;
}

activate('[data-action="phone"]', phoneUrl);
activate('[data-action="whatsapp"]', whatsappUrl);
activate('[data-contact="phone"]', phoneUrl, config.phone);
activate('[data-contact="email"]', emailUrl, config.email);

const form = document.querySelector('#enquiry');
if (form) {
  const service = form.elements.service;
  const requestedService = new URLSearchParams(location.search).get('service');
  if (Array.from(service.options).some(option => option.value === requestedService)) {
    service.value = requestedService;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = new FormData(form);
    const message = [
      'Hello Urbora, I would like a quote.',
      'Name: ' + fields.get('name'),
      'Phone: ' + fields.get('phone'),
      'Service: ' + service.selectedOptions[0].textContent,
      'Location: ' + fields.get('location'),
      'Project details: ' + fields.get('details')
    ].join('\n');
    const draft = document.querySelector('#draft');
    const status = document.querySelector('#form-status');
    draft.value = message;
    draft.hidden = false;
    status.textContent = 'Your enquiry is ready. You can copy the text below.';
    if (whatsappUrl) activate('#send-draft', whatsappUrl + '?text=' + encodeURIComponent(message), 'Open WhatsApp ↗');
    else if (emailUrl) activate('#send-draft', emailUrl + '?subject=Urbora%20quote%20enquiry&body=' + encodeURIComponent(message), 'Open email ↗');
  });
}
