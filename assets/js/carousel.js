/* EF2: JS для бесконечных каруселей в секциях #rec971234641 и #rec971240401
   - Читает данные из data/diffusers.json и data/care.json
   - Прячет тильдовские гриды (.t-card__container)
   - Создаёт карусели с бесконечным пролистыванием и кнопками
*/
(function(){
  const MAP = [
    {section:'#rec971234641', json:'data/diffusers.json', carouselId:'ef2-diffusers', title:'Откройте мир ароматов'},
    {section:'#rec971240401', json:'data/care.json',      carouselId:'ef2-care',      title:'Косметика для ухода и свежести'}
  ];

  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  function hideTildaGrid(sectionEl){
    qsa('.t-card__container', sectionEl).forEach(el => el.style.display='none');
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

  function buildCard(it){
    const art = document.createElement('article');
    art.className = 'ef2-item';
    art.innerHTML = `
      <div class="ef2-item__img" role="img" aria-label="">
        <img loading="lazy" src="${it.img}" alt="${it.alt || it.title}">
      </div>
      <div class="ef2-item__body">
        <h3 class="ef2-item__title">${it.title}</h3>
        ${it.descr ? `<p class="ef2-item__descr">${it.descr}</p>` : ''}
        <div class="ef2-item__meta">
          ${it.price ? `<span class="ef2-item__price">${it.price}</span>` : '<span></span>'}
          <a class="ef2-item__btn" href="${it.link || '#rec971219826'}">${it.btn || 'Заказать'}</a>
        </div>
      </div>
    `;
    return art;
  }

  function measureStep(track){
    const first = track.querySelector('.ef2-item');
    if(!first) return {step:0,gap:0};
    const cs = getComputedStyle(track);
    const gap = parseFloat(cs.columnGap || cs.gap || '0') || 0;
    const w = first.getBoundingClientRect().width;
    return {step:w+gap, gap};
  }

  function originals(track){
    return qsa('.ef2-item:not([data-clone="1"])', track);
  }

  function makeClones(track){
    qsa('.ef2-item[data-clone="1"]', track).forEach(n => n.remove());
    const src = originals(track);
    const tail = src.map(n => { const c=n.cloneNode(true); c.setAttribute('data-clone','1'); return c; });
    const head = src.map(n => { const c=n.cloneNode(true); c.setAttribute('data-clone','1'); return c; });
    tail.forEach(c => track.insertBefore(c, track.firstChild));
    head.forEach(c => track.appendChild(c));
  }

  function roundToStep(x, total, step){
    if(!step) return x;
    const off = x - total;
    const snap = Math.round(off/step)*step;
    return total + snap;
  }

  function setupInfinite(carousel){
    const track = qs('.ef2-track', carousel);
    const prevBtn = qs('.ef2-btn--prev', carousel);
    const nextBtn = qs('.ef2-btn--next', carousel);
    if(!track) return;

    let stepPx = 0;
    let totalWidth = 0;
    let pending = null;
    let ro;

    function measure(){
      const m = measureStep(track);
      stepPx = m.step;
      totalWidth = originals(track).length * stepPx;
    }
    function center(){
      track.scrollLeft = totalWidth;
    }
    function normalize(){
      const x = track.scrollLeft;
      const leftEdge = totalWidth;
      const rightEdge = totalWidth*2;
      if(x < leftEdge)       track.scrollLeft = x + totalWidth;
      else if(x >= rightEdge)track.scrollLeft = x - totalWidth;
    }
    function scrollBySteps(n){
      const target = roundToStep(track.scrollLeft + n*stepPx, totalWidth, stepPx);
      pending = target;
      track.scrollTo({left: target, behavior: 'smooth'});
    }

    prevBtn && prevBtn.addEventListener('click', ()=>scrollBySteps(-1));
    nextBtn && nextBtn.addEventListener('click', ()=>scrollBySteps(1));

    track.addEventListener('scroll', ()=>{
      if(pending !== null){
        if(Math.abs(track.scrollLeft - pending) < 2){
          pending = null;
          normalize();
        }
      }else{
        normalize();
      }
    });

    function init(){
      makeClones(track);
      measure();
      center();
      if(window.ResizeObserver){
        ro = new ResizeObserver(()=>{
          const idxBefore = Math.round((track.scrollLeft - totalWidth)/stepPx);
          measure();
          track.scrollLeft = roundToStep(totalWidth + idxBefore*stepPx, totalWidth, stepPx);
        });
        ro.observe(track);
      }
    }
    init();
  }

  function buildCarousel(sectionEl, items, carouselId){
    const wrap = document.createElement('div');
    wrap.className = 'ef2-carousel';
    wrap.id = carouselId;
    wrap.setAttribute('aria-label', 'Карусель товаров');

    const prev = createButton('prev');
    const next = createButton('next');
    const track = document.createElement('div');
    track.className = 'ef2-track';
    track.setAttribute('role','region');

    items.forEach(it => track.appendChild(buildCard(it)));
    wrap.appendChild(prev);
    wrap.appendChild(track);
    wrap.appendChild(next);

    // Вставляем карусель после заголовка блока (перед сеткой)
    const insertPoint = qs('.t-section__descr', sectionEl) || qs('.t-section__title', sectionEl) || sectionEl.firstChild;
    if(insertPoint && insertPoint.parentNode){
      insertPoint.parentNode.insertBefore(wrap, insertPoint.nextSibling);
    }else{
      sectionEl.appendChild(wrap);
    }
    setupInfinite(wrap);
  }

  async function loadJSON(url){
    const r = await fetch(url, {cache:'no-store'});
    if(!r.ok) throw new Error('Failed to load '+url);
    return await r.json();
  }

  async function boot(){
    for(const cfg of MAP){
      const sectionEl = qs(cfg.section);
      if(!sectionEl) continue;
      hideTildaGrid(sectionEl);
      try{
        const items = await loadJSON(cfg.json);
        buildCarousel(sectionEl, items, cfg.carouselId);
      }catch(e){
        // если не удалось — вернём тильдовский грид
        qsa('.t-card__container', sectionEl).forEach(el => el.style.display='');
        console.error(e);
      }
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  }else{
    boot();
  }
})();
