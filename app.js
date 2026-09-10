(function () {
  'use strict';
  const DEADLINE = Date.parse('2026-09-27T00:00:00-05:00');
  const BASE = 'https://jorgesport.github.io/move-500/';
  const COLORS = { salvia: { name: 'Verde salvia', sku: '8940714' }, negro: { name: 'Negro ahumado', sku: '8940713' } };
  function offerState(now) {
    const left = Math.max(0, Math.ceil((DEADLINE - now) / 1000));
    return { expired: now >= DEADLINE, days: Math.floor(left / 86400), hours: Math.floor(left / 3600) % 24, minutes: Math.floor(left / 60) % 60, seconds: left % 60 };
  }
  function whatsappUrl(color) {
    const v = COLORS[color] || COLORS.salvia;
    const key = COLORS[color] ? color : 'salvia';
    const message = `Hola, Te Equipamos. Me interesa el bolso Move 500 de 25 litros en ${v.name}, referencia ${v.sku}. Oferta S/130.00, antes S/189.00, hasta el 26/09/2026. ¿Me confirman disponibilidad y opciones de entrega?\n\nProducto: ${BASE}?color=${key}#comprar`;
    return 'https://wa.me/51920807184?text=' + encodeURIComponent(message);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { DEADLINE, offerState, whatsappUrl };
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const forcedExpired = root.dataset.offerExpired === 'true';
  const queryColor = new URLSearchParams(location.search).get('color');
  let color = COLORS[queryColor] ? queryColor : 'salvia';
  let view = 1;
  let expiredAlready = false;
  const buttons = [...document.querySelectorAll('[data-buy]')];
  function expired() { return forcedExpired || offerState(Date.now()).expired; }
  function links() {
    const isExpired = expired();
    buttons.forEach(a => {
      a.textContent = isExpired ? 'Agotado' : (a.classList.contains('floating') ? 'Consultar por WhatsApp ↗' : 'Consultar y comprar por WhatsApp ↗');
      a.setAttribute('aria-disabled', String(isExpired));
      if (isExpired) { a.removeAttribute('href'); a.setAttribute('role', 'link'); a.setAttribute('tabindex', '0'); }
      else { a.href = whatsappUrl(color); a.target = '_blank'; a.rel = 'noopener noreferrer'; a.removeAttribute('tabindex'); }
    });
  }
  function gallery() {
    const v = COLORS[color];
    const image = document.getElementById('product-image');
    image.src = `images/${color}-${view}.webp`;
    image.alt = `Bolso Move 500 ${v.name}, fotografía ${view} de 5`;
    document.querySelectorAll('[data-view]').forEach(button => {
      const n = Number(button.dataset.view);
      button.setAttribute('aria-pressed', String(n === view));
      button.querySelector('img').src = `images/${color}-${n}.webp`;
      button.setAttribute('aria-label', `Ver fotografía ${n} de ${v.name}`);
    });
    document.querySelectorAll('input[name=color]').forEach(input => { input.checked = input.value === color; });
    document.getElementById('selection-status').textContent = `${v.name} · Ref. ${v.sku}`;
    links();
  }
  function tick() {
    const state = offerState(Date.now());
    if (forcedExpired || state.expired) {
      if (!expiredAlready) {
        root.dataset.offerExpired = 'true';
        document.getElementById('offer-status').textContent = 'Agotado · Oferta finalizada';
        document.querySelector('[data-offer-label]').textContent = 'OFERTA FINALIZADA';
        document.querySelector('[data-offer-tag]').textContent = 'AGOTADO';
        document.querySelectorAll('.price-line strong,.buy-price strong').forEach(el => { el.textContent = 'Agotado'; });
        document.querySelector('.purchase-note').textContent = 'Esta oferta finalizó el 26/09/2026 a las 23:59, hora de Perú.';
        const el = document.getElementById('product-schema');
        const data = JSON.parse(el.textContent);
        data.hasVariant.forEach(v => { v.offers.availability = 'https://schema.org/OutOfStock'; });
        el.textContent = JSON.stringify(data);
        expiredAlready = true;
        links();
      }
      return;
    }
    document.querySelectorAll('[data-time]').forEach(el => { el.textContent = String(state[el.dataset.time]).padStart(2, '0'); });
  }
  document.querySelectorAll('input[name=color]').forEach(input => input.addEventListener('change', () => {
    color = input.value; view = 1; gallery();
    const next = new URL(location.href); next.searchParams.set('color', color); history.replaceState(null, '', next);
  }));
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { view = Number(button.dataset.view); gallery(); }));
  buttons.forEach(a => a.addEventListener('click', event => {
    if (expired()) { event.preventDefault(); tick(); }
  }));
  gallery(); tick(); setInterval(tick, 1000);
  document.addEventListener('visibilitychange', tick);
})();
