/* EF2: единый JS для бесконечных каруселей в 3 секциях
   - #rec971219806  -> assets/data/perfumes.json
   - #rec971234641  -> assets/data/diffusers.json
   - #rec971240401  -> assets/data/care.json
   - Прячет тильдовские гриды (.t-card__container)
   - Удаляет старую кастомную карусель (.ef-carousel) в секции 1
   - Работает с JSON формата: [{...}] ИЛИ { items:[...] }
*/
(function(){
  const MAP = [
    { section:'#rec971219806', json:'data/perfumes.json',  carouselId:'ef2-perfumes'  }, // Ароматы для жизни
    { section:'#rec971234641', json:'data/diffusers.json', carouselId:'ef2-diffusers' }, // Ароматизаторы
    { section:'#rec971240401', json:'data/care.json',      carouselId:'ef2-care'      }, // Косметика/прочее
  ];

  const SEL_TILDA_GRID = '.t-card__container';

  const qs  = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function hideTildaGrid(sectionEl){
    qsa(SEL_TILDA_GRID, sectionEl).forEach(el => { el.__ef2PrevDisplay = el.style.display; el.style.display='none'; });
  }
  function showTildaGrid(sectionEl){
    qsa(SEL_TILDA_GRID, sectionEl).forEach(el => { el.style.display = (el.__ef2PrevDisplay ?? ''); });
  }

  // В секции 1 ранее могла остаться старая разметка (.ef-carousel). Удалим её, чтобы не дублировать.
  function removeLegacyCustom(sectionEl){
    qsa('.ef-carousel', sectionEl).forEach(el => el.remove());
  }

  function createButton(dir){
    const btn = document.createElement('button');
    btn.className = `ef2-btn ef2-btn--${dir}`;
    btn.type = 'button';
    btn.setAttribute('aria-label', dir === 'prev' ? 'Предыдущие товары' : 'Следующие товары');
    btn.innerHTML = dir === 'prev'
        ? '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 19L8.5 12l7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    return btn;
  }

  // Безопасно читаем свойства из разных схем JSON
  const get = (o, keys, fallback='') => {
    for (const k of keys) if (o && o[k] != null) return o[k];
    return fallback;
  };

  function buildCard(raw){
    const img   = get(raw, ['img','image'], '');
    const title = get(raw, ['title'], '');
    const descr = get(raw, ['descr','description'], '');
    const alt   = get(raw, ['alt'], title || 'Товар');
    const price = get(raw, ['price'], '');
    const btn   = get(raw, ['btn'], 'Заказать');
    const link  = get(raw, ['link'], '#rec971219826'); // по умолчанию ведём в форму контактов на странице

    const art = document.createElement('article');
    art.className = 'ef2-item';
    art.innerHTML = `
      <div class="ef2-item__img" role="img" aria-label="">
        <img loading="lazy" src="${img}" alt="${escapeHtml(alt)}">
      </div>
      <div class="ef2-item__body">
        <h3 class="ef2-item__title">${escapeHtml(title)}</h3>
        ${descr ? `<p class="ef2-item__descr">${escapeHtml(descr)}</p>` : ''}
        <div class="ef2-item__meta">
          ${price ? `<span class="ef2-item__price">${escapeHtml(price)}</span>` : '<span></span>'}
          <a class="ef2-item__btn" href="${link}">${escapeHtml(btn)}</a>
        </div>
      </div>
    `;
    return art;
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function originals(track){
    return qsa('.ef2-item:not([data-clone="1"])', track);
  }

  function makeClones(track){
    // очищаем старые клоны
    qsa('.ef2-item[data-clone="1"]', track).forEach(n => n.remove());
    const src = originals(track);
    if (!src.length) return;
    const tail = src.map(n => { const c=n.cloneNode(true); c.setAttribute('data-clone','1'); return c; });
    const head = src.map(n => { const c=n.cloneNode(true); c.setAttribute('data-clone','1'); return c; });
    tail.forEach(c => track.insertBefore(c, track.firstChild));
    head.forEach(c => track.appendChild(c));
  }

  function measureStep(track){
    const first = track.querySelector('.ef2-item');
    if(!first) return {step:0,gap:0};
    const cs  = getComputedStyle(track);
    const gap = parseFloat(cs.columnGap || cs.gap || '0') || 0;
    const w   = first.getBoundingClientRect().width;
    return {step:w+gap, gap};
  }

  function roundToStep(x, total, step){
    if(!step) return x;
    const off  = x - total;
    const snap = Math.round(off/step)*step;
    return total + snap;
  }

  function setupInfinite(carousel){
    const track  = qs('.ef2-track', carousel);
    const prevBtn= qs('.ef2-btn--prev', carousel);
    const nextBtn= qs('.ef2-btn--next', carousel);
    if(!track) return;

    let stepPx = 0;
    let totalWidth = 0;
    let pending = null;
    let ro;

    function recalc(){
      const m = measureStep(track);
      stepPx = m.step;
      totalWidth = originals(track).length * stepPx;
    }
    function center(){ track.scrollLeft = totalWidth; }
    function normalize(){
      const x = track.scrollLeft, L = totalWidth, R = totalWidth*2;
      if (x < L) track.scrollLeft = x + totalWidth;
      else if (x >= R) track.scrollLeft = x - totalWidth;
    }
    function scrollBySteps(n){
      if (stepPx === 0) return;
      const target = roundToStep(track.scrollLeft + n*stepPx, totalWidth, stepPx);
      pending = target;
      track.scrollTo({left: target, behavior: 'smooth'});
    }

    prevBtn && prevBtn.addEventListener('click', ()=>scrollBySteps(-1));
    nextBtn && nextBtn.addEventListener('click', ()=>scrollBySteps(1));

    track.addEventListener('scroll', ()=>{
      if(pending !== null){
        if(Math.abs(track.scrollLeft - pending) < 2){
          pending = null; normalize();
        }
      }else{
        normalize();
      }
    });

    // Если товаров 0 или 1 — отключаем кнопки и клоны
    const count = originals(track).length;
    if (count <= 1) {
      prevBtn && (prevBtn.disabled = true);
      nextBtn && (nextBtn.disabled = true);
      return;
    }

    makeClones(track);
    recalc();
    center();

    if (window.ResizeObserver) {
      ro = new ResizeObserver(()=>{
        const beforeIdx = Math.round((track.scrollLeft - totalWidth) / (stepPx || 1));
        recalc();
        track.scrollLeft = roundToStep(totalWidth + beforeIdx * (stepPx || 0), totalWidth, stepPx);
      });
      ro.observe(track);
    }
  }

  function buildCarousel(sectionEl, items, carouselId){
    const wrap = document.createElement('div');
    wrap.className = 'ef2-carousel';
    wrap.id = carouselId;
    wrap.setAttribute('aria-label', 'Карусель товаров');

    const prev  = createButton('prev');
    const next  = createButton('next');
    const track = document.createElement('div');
    track.className = 'ef2-track';
    track.setAttribute('role','region');

    items.forEach(it => track.appendChild(buildCard(it)));
    wrap.appendChild(prev);
    wrap.appendChild(track);
    wrap.appendChild(next);

    // Вставляем карусель сразу после описания секции (или после заголовка)
    const insertPoint =
        qs('.t-section__descr', sectionEl) ||
        qs('.t-section__title', sectionEl) ||
        sectionEl.firstChild;

    if (insertPoint && insertPoint.parentNode) {
      insertPoint.parentNode.insertBefore(wrap, insertPoint.nextSibling);
    } else {
      sectionEl.appendChild(wrap);
    }

    setupInfinite(wrap);
  }

  async function loadJSON(url){
    const r = await fetch(url, { cache:'no-store' });
    if(!r.ok) throw new Error(`Failed to load ${url} (${r.status})`);
    const data = await r.json();
    return Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
  }

  async function initFor(cfg){
    const sectionEl = qs(cfg.section);
    if(!sectionEl) return;

    // секция 1: убрать наследие (кастом .ef-carousel)
    if (cfg.section === '#rec971219806') removeLegacyCustom(sectionEl);

    hideTildaGrid(sectionEl);
    try{
      const items = await loadJSON(cfg.json);
      if (!items.length) throw new Error(`Empty items in ${cfg.json}`);
      buildCarousel(sectionEl, items, cfg.carouselId);
    }catch(e){
      // если не удалось — вернём тильдовский грид
      showTildaGrid(sectionEl);
      console.error('[EF2]', e);
    }
  }

  function boot(){
    MAP.forEach(initFor);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  }else{
    boot();
  }
})();