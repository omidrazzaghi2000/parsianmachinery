/* ============================================================
   PARSIAN — page renderers
   Each HTML page sets <body data-page="..."> and contains
   mount points. This file fills them from PARSIAN.data.
   ============================================================ */

window.renderPage = function () {
  const P = PARSIAN;
  if (!P.data) return;
  const page = document.body.getAttribute('data-page');
  const fa = P.lang === 'fa';
  const A = P.icons.arrow;

  const tt = (o, k) => P.t(o, k);

  /* ---------------- HOME ---------------- */
  if (page === 'home') {
    const h = P.data.home;

    // hero — giant blur-in wordmark with a rotating line-up of machines
    // floating between the two lines; optional video backdrop still supported.
    const hero = document.getElementById('hero-mount');
    if (hero) {
      const H = h.hero;
      const vid = H.video && H.video.trim();
      const w1 = (fa ? H.wordmark1Fa : H.wordmark1En) || (fa ? 'پارسیان' : 'PARSIAN');
      const w2 = (fa ? H.wordmark2Fa : H.wordmark2En) || (fa ? 'ماشین‌سازی' : 'MACHINERY');
      const tag = (fa ? H.taglineFa : H.taglineEn) || stripTags(fa ? H.titleFa : H.titleEn);
      const listed = (Array.isArray(H.machines) ? H.machines : []).filter(m => m && m.image);
      const machines = listed.length ? listed : defaultHeroMachines();
      const holdMs = Math.max(2, Number(H.machineSeconds) || 4) * 1000;
      hero.innerHTML = `
        ${vid ? `<video class="hero-video" autoplay muted loop playsinline preload="auto"><source src="${vid}" type="video/mp4"></video>` : ''}
        <canvas class="hero-grid" aria-hidden="true"></canvas>
        <div class="hero-stage">
          <div class="container hero-content">
            <span class="hero-eyebrow"><span class="live-dot"></span>${fa?H.eyebrowFa:H.eyebrowEn}</span>
            <h1 class="hero-wordmark">
              <span class="hero-line hero-line-1 bt" dir="${dirOf(w1)}" style="--bt-step:90ms">${blurText(w1,'letters')}</span>
              <a class="hero-machine" href="${escAttr(machines[0].url || 'products.html')}" aria-label="${escAttr(machineAlt(machines[0], fa))}">
                ${machines.map((m, i) => {
                  // WebP first; the PNG is only fetched if a (very old) browser can't show it.
                  // No <picture>/<source>: Firefox re-picks the PNG for detached copies after a re-render.
                  const fb = m.imageWebp && m.image ? ` data-fb="${escAttr(m.image)}" onerror="if(this.dataset.fb){this.onerror=null;this.src=this.dataset.fb}"` : '';
                  return `
                <picture class="hero-slide${i === 0 ? ' is-active' : ''}">
                  <img ${i ? 'data-' : ''}src="${escAttr(m.imageWebp || m.image)}"${fb} alt="" decoding="async"${i ? '' : ' fetchpriority="high"'}>
                </picture>`;
                }).join('')}
              </a>
              <span class="hero-line hero-line-2 bt" dir="${dirOf(w2)}" style="--bt-step:90ms">${blurText(w2,'letters')}</span>
            </h1>
          </div>
        </div>
        <div class="container hero-foot">
          <p class="hero-tagline bt" dir="${dirOf(tag)}" style="--bt-step:110ms">${blurText(tag,'words')}</p>
          <p class="hero-lead">${fa?H.leadFa:H.leadEn}</p>
          <div class="hero-cta">
            <a class="btn-hero-primary" href="${H.primaryCtaUrl}">${fa?H.primaryCtaFa:H.primaryCtaEn} ${A}</a>
            <a class="btn-hero-secondary" href="${H.secondaryCtaUrl}">${fa?H.secondaryCtaFa:H.secondaryCtaEn}</a>
          </div>
        </div>
        <button type="button" class="hero-scroll" aria-label="${fa?'اسکرول به پایین':'Scroll down'}">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="hero-categories"><div class="container">
          ${(P.data.products||[]).slice(0,5).map(p=>`
            <a class="hero-cat" href="product.html?id=${p.id}">
              <span class="abbr">${p.tagline.replace('PA · ','').toUpperCase()}</span>
              <span class="name">${fa?p.nameFa:p.nameEn}</span>
            </a>`).join('')}
        </div></div>`;
      startHeroRotator(hero.querySelector('.hero-machine'), machines, fa, holdMs);
      if (window.KineticGrid) KineticGrid.mount(hero.querySelector('.hero-grid'), hero);
      const cue = hero.querySelector('.hero-scroll');
      if (cue) cue.addEventListener('click', () => {
        const next = hero.nextElementSibling;
        if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // highlight banner
    const hl = document.getElementById('highlight-mount');
    if (hl) {
      hl.innerHTML = `
        <div class="container"><div class="highlight-banner">
          <div class="copy">
            <span class="kicker">${fa?h.highlight.kickerFa:h.highlight.kickerEn}</span>
            <h3>${fa?h.highlight.titleFa:h.highlight.titleEn}</h3>
            <p>${fa?h.highlight.descFa:h.highlight.descEn}</p>
            <div><a class="btn-link" href="${h.highlight.ctaUrl}">${fa?h.highlight.ctaFa:h.highlight.ctaEn} ${A}</a></div>
          </div>
          <div class="visual">${h.highlight.image ? `<img src="${h.highlight.image}" alt="" loading="lazy" decoding="async" style="width:90%;height:auto;border-radius:14px">` : twoPlatenSVG()}</div>
        </div></div>`;
    }

    // industries
    const ind = document.getElementById('industries-mount');
    if (ind) {
      ind.innerHTML = `
        <div class="container">
          <div class="section-head">
            <span class="kicker">${fa?'صنایع':'Industries we serve'}</span>
            <h2>${fa?'راه‌حل‌های ما برای صنعت شما':'Solutions for your industry'}</h2>
            <p>${fa?'از بسته‌بندی تا خودرو، از لوازم خانگی تا اتصالات UPVC — دستگاه پارسیان متناسب با چالش شما.':'From packaging to automotive, appliances to UPVC fittings — Parsian machines tailored to your application.'}</p>
          </div>
          <div class="industries">
            ${(h.industries||[]).map(it=>`
              <a class="industry" href="products.html">
                ${it.image ? `<div class="industry-bg" style="background-image:url('${it.image}')"></div>` : ''}
                <div class="industry-arrow">→</div>
                <div class="industry-content">
                  <div class="icon">${P.icons[it.iconKey]||P.icons.box}</div>
                  <h4>${fa?it.labelFa:it.labelEn}</h4>
                  <p>${fa?it.descFa:it.descEn}</p>
                </div>
              </a>`).join('')}
          </div>
        </div>`;
    }

    // portfolio
    const pf = document.getElementById('portfolio-mount');
    if (pf) {
      const tiles = (P.data.products||[]).map((p,i)=>{
        const cls = p.featured ? 'featured' : ['','amber','dark','green',''][i%5];
        const bg = p.image
          ? `<div class="bg-img" style="background-image:url('${p.image}')"></div>`
          : `<div class="bg-svg">${machineSVG(p.id)}</div>`;
        return `
        <a class="portfolio-tile ${cls}" href="product.html?id=${p.id}">
          ${bg}
          <div class="meta">
            <span class="tag">${p.tagline}</span>
            <h3>${fa?p.nameFa:p.nameEn}</h3>
            <p>${fa?p.shortFa:p.shortEn}</p>
            <div class="specs"><span>${fa?p.tonnageFa:p.tonnageEn}</span><span>${p.specs[0]?(fa?p.specs[0].valueFa:p.specs[0].valueEn):''}</span></div>
          </div>
        </a>`;
      }).join('');
      pf.innerHTML = `
        <div class="container">
          <div class="section-head">
            <span class="kicker">${fa?'پورتفولیو':'Our portfolio'}</span>
            <h2>${fa?'همه چیز از یک منبع — ۵ سری دستگاه':'Everything from one source — 5 machine series'}</h2>
            <p>${fa?'از استاندارد تا UPVC، PET و تکنولوژی منحصربه‌فرد دو صفحه‌ای — همگی با ضمانت پارسیان.':'Standard, high-speed, UPVC, PET and the exclusive two-platen series — all under one Parsian warranty.'}</p>
          </div>
          <div class="portfolio-grid">${tiles}</div>
        </div>`;
    }

    // stats
    const st = document.getElementById('stats-mount');
    if (st) {
      st.innerHTML = `<div class="container"><div class="stats-row">
        ${(P.data.site.stats||[]).map(s=>`<div class="st"><b>${s.value}</b><span>${fa?s.labelFa:s.labelEn}</span></div>`).join('')}
      </div></div>`;
    }

    // Customers marquee
    const cust = document.getElementById('customers-mount');
    if (cust) {
      const list = P.data.customers || [];
      // double the list so the loop is seamless
      const dbl = list.concat(list);
      cust.innerHTML = `
        <div class="container">
          <div class="section-head center" style="margin-bottom:32px">
            <span class="kicker">${fa?'مشتریان ما':'Our Customers'}</span>
            <h2>${fa?'افتخار همراهی بزرگ‌ترین برندهای صنعت':'Trusted by industry leaders'}</h2>
            <p>${fa?'دستگاه‌های پارسیان روزانه میلیون‌ها قطعه پلاستیکی برای این شرکت‌ها تولید می‌کنند.':'Parsian machines produce millions of plastic parts every day for these companies.'}</p>
          </div>
        </div>
        <div class="cust-marquee">
          <div class="cust-track">
            ${dbl.map(c=>`<div class="cust-logo" title="${c.name}">
              <img src="${c.logo}" alt="${c.name}" loading="lazy" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'cust-logo-text',textContent:'${c.name.replace(/'/g,"\\'")}'}))">
            </div>`).join('')}
          </div>
        </div>`;
    }

    // CTA
    const cta = document.getElementById('cta-mount');
    if (cta) cta.innerHTML = ctaStrip(P, fa, A);
  }

  /* ---------------- ABOUT ---------------- */
  if (page === 'about') {
    const a = P.data.about;
    const m = document.getElementById('about-mount');
    if (m) {
      m.innerHTML = `
        <section class="section"><div class="container">
          <div style="max-width:820px">
            <span class="kicker">${fa?'از ۱۳۸۱':'Since 2002'}</span>
            <div style="font-size:18px;line-height:1.8;color:var(--text)">${fa?a.storyFa:a.storyEn}</div>
          </div>
        </div></section>

        <section class="section" style="background:var(--bg-2)"><div class="container">
          <div class="section-head center"><span class="kicker">${fa?'مسیر ما':'Our journey'}</span><h2>${fa?'سه دهه نوآوری':'Three decades of innovation'}</h2></div>
          <div class="timeline" style="max-width:820px;margin:0 auto">
            ${(a.timeline||[]).map(r=>`
              <div class="row"><div class="yr">${r.year}</div>
                <div class="ev"><b>${fa?r.titleFa:r.titleEn}</b><span>${fa?r.descFa:r.descEn}</span></div></div>`).join('')}
          </div>
        </div></section>

        <section class="section"><div class="container">
          <div class="section-head"><span class="kicker">${fa?'رهبری':'Leadership'}</span><h2>${fa?'تیم مدیریت پارسیان':'The Parsian leadership'}</h2></div>
          <div class="team-grid">
            ${(a.team||[]).map(t=>`
              <div class="team-card">
                <div class="avatar">${(fa?t.nameFa:t.nameEn).trim().charAt(0)}</div>
                <div><h4>${fa?t.nameFa:t.nameEn}</h4><div class="role">${fa?t.roleFa:t.roleEn}</div><p class="bio">${fa?t.bioFa:t.bioEn}</p></div>
              </div>`).join('')}
          </div>
        </div></section>

        <section class="section" style="background:var(--bg-2)"><div class="container">
          <div class="section-head center"><span class="kicker">${fa?'اعتبار':'Credentials'}</span><h2>${fa?'گواهینامه‌ها و افتخارات':'Certifications & recognition'}</h2></div>
          <div class="svc-grid">
            ${(a.certifications||[]).map(c=>`
              <div class="svc-card" style="text-align:center">
                <div style="font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;color:var(--ink);margin-bottom:8px">${c.name}</div>
                <p>${fa?c.descFa:c.descEn}</p>
              </div>`).join('')}
          </div>
        </div></section>

        <section class="section"><div class="container">${ctaStrip(P,fa,A)}</div></section>`;
    }
  }

  /* ---------------- PRODUCTS OVERVIEW (2 big tiles) ---------------- */
  if (page === 'products') {
    const m = document.getElementById('products-mount');
    if (m) {
      m.innerHTML = `
        <section class="section"><div class="container">
          <div class="overview-grid">
            <a class="overview-tile" href="machines.html">
              <div class="overview-tile-img" style="background-image:url('130012300.jpg')"></div>
              <div class="overview-tile-body">
                <span class="kicker">${fa?'دستگاه‌های اصلی':'Main machines'}</span>
                <h2>${fa?'ماشین تزریق پلاستیک':'Injection Molding Machines'}</h2>
                <p>${fa?'۵ سری دستگاه از ۱۰۰ تا ۱۳۰۰ تن — استاندارد، High-Speed، UPVC، PET و تنها سری دو صفحه‌ای ایران.':'5 series from 100 to 1300 ton — Standard, High-Speed, UPVC, PET and Iran\'s only Two-Platen line.'}</p>
                <span class="overview-cta">${fa?'مشاهده دستگاه‌ها':'Browse machines'} ${A}</span>
              </div>
            </a>
            <a class="overview-tile" href="auxiliary.html">
              <div class="overview-tile-img" style="background-image:url('kian-electrostatic-charger.jpg');background-color:#000"></div>
              <div class="overview-tile-body">
                <span class="kicker">${fa?'محصولات تکمیلی':'Complementary'}</span>
                <h2>${fa?'محصولات جانبی':'Auxiliary Products'}</h2>
                <p>${fa?'شارژر الکترواستاتیک KIAN، سنسور خطی KIAN، سرو موتور، درایور سرو و شیر هیدرولیک.':'KIAN electrostatic chargers, KIAN linear sensors, servo motors, servo drivers, hydraulic valves.'}</p>
                <span class="overview-cta">${fa?'مشاهده تجهیزات':'Browse components'} ${A}</span>
              </div>
            </a>
          </div>
        </div></section>

        <section class="section" style="padding-top:0"><div class="container">${ctaStrip(P,fa,A)}</div></section>`;
    }
  }

  /* ---------------- MACHINES LIST (was old "products") ---------------- */
  if (page === 'machines') {
    const m = document.getElementById('machines-mount');
    if (m) {
      m.innerHTML = `
        <section class="section"><div class="container">
          <div class="portfolio-grid">
            ${(P.data.products||[]).map((p,i)=>{
              const cls = p.featured ? 'featured' : ['','amber','dark','green',''][i%5];
              const bg = p.image
                ? `<div class="bg-img" style="background-image:url('${p.image}')"></div>`
                : `<div class="bg-svg">${machineSVG(p.id)}</div>`;
              return `<a class="portfolio-tile ${cls}" href="product.html?id=${p.id}">
                ${bg}
                <div class="meta">
                  <span class="tag">${p.tagline}</span>
                  <h3>${fa?p.nameFa:p.nameEn}</h3>
                  <p>${fa?p.shortFa:p.shortEn}</p>
                  <div class="specs"><span>${fa?p.tonnageFa:p.tonnageEn}</span></div>
                </div></a>`;
            }).join('')}
          </div>
        </div></section>
        <section class="section" style="padding-top:0"><div class="container">${ctaStrip(P,fa,A)}</div></section>`;
    }
  }

  /* ---------------- PRODUCT DETAIL ---------------- */
  if (page === 'product') {
    const id = new URLSearchParams(location.search).get('id');
    const p = (P.data.products||[]).find(x=>x.id===id) || (P.data.products||[])[0];
    const crumb = document.getElementById('crumb-name');
    if (crumb && p) crumb.textContent = fa?p.nameFa:p.nameEn;
    const ph1 = document.getElementById('prod-title');
    if (ph1 && p) ph1.textContent = fa?p.nameFa:p.nameEn;
    const psub = document.getElementById('prod-sub');
    if (psub && p) psub.textContent = fa?p.shortFa:p.shortEn;

    const m = document.getElementById('product-mount');
    if (m && p) {
      m.innerHTML = `
        <section class="section"><div class="container">
          <div class="prod-head">
            <div class="prod-visual">${p.image ? `<img src="${p.image}" alt="${fa?p.nameFa:p.nameEn}" style="max-width:100%;height:auto;border-radius:18px">` : machineSVG(p.id)}</div>
            <div>
              <span class="kicker">${p.tagline}</span>
              <div style="font-size:17px;line-height:1.8;color:var(--text);margin-bottom:18px">${fa?p.descriptionFa:p.descriptionEn}</div>
              <table class="spec-table">
                ${(p.specs||[]).map(s=>`<tr><td>${fa?s.labelFa:s.labelEn}</td><td>${fa?s.valueFa:s.valueEn}</td></tr>`).join('')}
              </table>
              <div style="margin-top:24px;display:flex;gap:10px;flex-wrap:wrap">
                <a class="btn btn-accent" href="contact.html">${fa?'درخواست قیمت این مدل':'Request a quote'} ${A}</a>
                <a class="btn btn-ghost" href="#">${fa?'دانلود کاتالوگ':'Download catalog'}</a>
              </div>
            </div>
          </div>
        </div></section>

        <section class="section" style="background:var(--bg-2)"><div class="container">
          <div class="section-head"><span class="kicker">${fa?'مدل‌ها':'Models'}</span><h2>${fa?'مدل‌های موجود این سری':'Available models in this series'}</h2></div>
          <table class="models-table">
            <thead><tr>
              <th></th><th>${fa?'مدل':'Model'}</th><th>${fa?'تناژ':'Tonnage'}</th><th>${fa?'وزن تزریق':'Shot weight'}</th><th></th>
            </tr></thead>
            <tbody>
              ${(p.models||[]).map(md=>`<tr>
                <td>${md.image?`<img src="${md.image}" alt="${md.code}" loading="lazy" decoding="async" style="width:90px;height:auto;border-radius:6px">`:''}</td>
                <td class="code">${md.code}</td>
                <td>${fa?md.tonFa:md.tonEn}</td>
                <td>${fa?md.shotFa:md.shotEn}</td>
                <td style="text-align:end"><a class="btn-link" href="contact.html">${fa?'استعلام':'Inquire'} ${A}</a></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div></section>

        <section class="section"><div class="container">${ctaStrip(P,fa,A)}</div></section>`;
    }
  }

  /* ---------------- AUXILIARY LIST ---------------- */
  if (page === 'auxiliary') {
    const m = document.getElementById('auxiliary-mount');
    const items = P.data.auxiliary || [];
    if (m) {
      m.innerHTML = `
        <section class="section"><div class="container">
          <div class="aux-list">
            ${items.map(a => `
              <a class="aux-tile" href="aux-product.html?id=${a.id}">
                <div class="aux-tile-img" style="background:${a.imageBg||'#0a1f3a'}">
                  ${a.image ? `<img src="${a.image}" alt="${fa?a.nameFa:a.nameEn}" loading="lazy" decoding="async">` : '<span class="aux-tile-ph">📦</span>'}
                  ${a.brand ? `<span class="aux-tile-brand">${a.brand}</span>` : ''}
                </div>
                <div class="aux-tile-body">
                  <span class="aux-tile-tag">${fa?a.tagFa:a.tagEn}</span>
                  <h3>${fa?a.nameFa:a.nameEn}</h3>
                  <p>${fa?a.shortFa:a.shortEn}</p>
                  <span class="aux-tile-more">${fa?'مشاهده جزئیات':'View details'} <span class="arrow-ico">→</span></span>
                </div>
              </a>`).join('')}
          </div>
        </div></section>

        <section class="section" style="padding-top:0"><div class="container">
          <div style="padding:32px 36px;background:var(--bg-2);border-radius:var(--r-l);text-align:center">
            <h3 style="margin:0 0 8px;color:var(--ink)">${fa?'به دنبال قطعه‌ی خاصی هستید؟':'Looking for a specific component?'}</h3>
            <p style="margin:0 0 16px;color:var(--text-2)">${fa?'کارشناسان ما در کمتر از ۲۴ ساعت با شما تماس می‌گیرند.':'Our specialists will respond within 24 hours.'}</p>
            <a class="btn btn-primary" href="contact.html">${fa?'تماس با کارشناسان':'Contact our specialists'} ${A}</a>
          </div>
        </div></section>`;
    }
  }

  /* ---------------- AUXILIARY DETAIL ---------------- */
  if (page === 'aux-product') {
    const id = new URLSearchParams(location.search).get('id');
    const a = (P.data.auxiliary||[]).find(x=>x.id===id) || (P.data.auxiliary||[])[0];
    if (a) {
      const crumb = document.getElementById('crumb-name');
      const t = document.getElementById('aux-title');
      const sub = document.getElementById('aux-sub');
      if (crumb) crumb.textContent = fa?a.nameFa:a.nameEn;
      if (t) t.textContent = fa?a.nameFa:a.nameEn;
      if (sub) sub.textContent = a.modelLine || (fa?a.tagFa:a.tagEn) || '';
    }
    const m = document.getElementById('aux-product-mount');
    if (m && a) {
      const specRow = s => {
        const v = s.value || (fa ? (s.valueFa||s.value) : (s.valueEn||s.value));
        return `<tr><td>${fa?s.labelFa:s.labelEn}</td><td>${v}</td></tr>`;
      };
      m.innerHTML = `
        <section class="section"><div class="container">
          <div class="aux-detail">
            <div class="aux-detail-img" style="background:${a.imageBg||'#0a1f3a'}">
              ${a.image ? `<img src="${a.image}" alt="${fa?a.nameFa:a.nameEn}">` : '<span class="aux-tile-ph" style="font-size:80px">📦</span>'}
              ${a.warrantyFa ? `<span class="aux-warranty-badge">${fa?a.warrantyFa:a.warrantyEn}</span>` : ''}
            </div>
            <div class="aux-detail-body">
              ${a.brand ? `<span class="aux-tile-tag">${a.brand} · ${fa?a.tagFa:a.tagEn}</span>` : `<span class="aux-tile-tag">${fa?a.tagFa:a.tagEn}</span>`}
              <h2 style="font-size:32px;margin:8px 0 4px;letter-spacing:-.5px">${fa?a.nameFa:a.nameEn}</h2>
              ${a.modelLine ? `<div style="font-family:'Space Grotesk',sans-serif;color:var(--text-3);font-size:14px;margin-bottom:14px">${a.modelLine}</div>` : ''}
              <div style="font-size:17px;line-height:1.8;color:var(--text);margin-bottom:18px">${fa?a.summaryFa:a.summaryEn}</div>

              ${a.stats && a.stats.length ? `
              <div class="spec-stats-row">
                ${a.stats.map(s=>`<div class="st"><b>${s.value}</b><span>${fa?s.labelFa:s.labelEn}</span></div>`).join('')}
              </div>` : ''}

              ${a.features && a.features.length ? `
              <div class="aux-features">
                ${a.features.map(f=>`<span>${fa?f.fa:f.en}</span>`).join('')}
              </div>` : ''}

              <div style="margin-top:22px;display:flex;gap:10px;flex-wrap:wrap">
                ${a.pdfUrl ? `<a class="btn btn-primary" href="${a.pdfUrl}" target="_blank">⬇ ${fa?'دانلود دیتاشیت':'Download datasheet'}</a>` : ''}
                <a class="btn btn-accent" href="contact.html" style="background:var(--accent)">${fa?'درخواست قیمت':'Request a quote'} ${A}</a>
              </div>
            </div>
          </div>
        </div></section>

        ${a.specs && a.specs.length ? `
        <section class="section" style="padding-top:0;background:var(--bg-2)"><div class="container">
          <div style="padding:40px 0">
            <span class="kicker">${fa?'مشخصات فنی':'Technical specifications'}</span>
            <h2 style="font-size:28px;margin:8px 0 24px;color:var(--ink)">${fa?'جزئیات کامل':'Full details'}</h2>
            <table class="spec-table" style="max-width:780px">
              ${a.specs.map(specRow).join('')}
            </table>
          </div>
        </div></section>` : ''}

        <section class="section"><div class="container">
          <div style="padding:30px;background:#fff;border:1px solid var(--line);border-radius:var(--r-l);text-align:center">
            <a class="btn btn-ghost" href="auxiliary.html">${A} ${fa?'بازگشت به همه محصولات جانبی':'Back to all auxiliary products'}</a>
          </div>
        </div></section>`;
    }
  }

  /* ---------------- SERVICES LIST ---------------- */
  if (page === 'services') {
    const m = document.getElementById('services-mount');
    if (m) {
      m.innerHTML = `
        <section class="section"><div class="container">
          <div class="svc-grid">
            ${(P.data.services||[]).map(s=>`
              <a class="svc-card svc-card-link" href="service.html?id=${s.id}">
                <div class="icon">${P.icons[s.iconKey]||P.icons.settings}</div>
                <h4>${fa?s.titleFa:s.titleEn}</h4>
                <p>${fa?s.descFa:s.descEn}</p>
                <span class="svc-more">${fa?'مشاهده جزئیات':'View details'} ${A}</span>
              </a>`).join('')}
          </div>
        </div></section>
        <section class="section" style="padding-top:0"><div class="container">${ctaStrip(P,fa,A)}</div></section>`;
    }
  }

  /* ---------------- SERVICE DETAIL ---------------- */
  if (page === 'service') {
    const id = new URLSearchParams(location.search).get('id');
    const s = (P.data.services||[]).find(x=>x.id===id) || (P.data.services||[])[0];
    if (s) {
      const crumb = document.getElementById('crumb-name');
      const t = document.getElementById('service-title');
      const sub = document.getElementById('service-sub');
      if (crumb) crumb.textContent = fa?s.titleFa:s.titleEn;
      if (t) t.textContent = fa?s.titleFa:s.titleEn;
      if (sub) sub.textContent = fa?s.descFa:s.descEn;
    }
    const m = document.getElementById('service-mount');
    if (m && s) {
      // build a long-form description from the short one + a generic structure
      const longFa = (s.longFa) || `<p>${s.descFa}</p><p>تیم پارسیان با بیش از ۳۰ سال تجربه آماده پاسخگویی به نیاز شما در این بخش است. برای اطلاعات بیشتر، دریافت پیشنهاد قیمت یا برنامه‌ریزی یک بازدید فنی با ما تماس بگیرید.</p>`;
      const longEn = (s.longEn) || `<p>${s.descEn}</p><p>The Parsian team — with over 30 years of experience — is ready to serve you in this area. For more information, a quote, or to schedule a technical visit, please contact us.</p>`;
      m.innerHTML = `
        <section class="section"><div class="container">
          <div class="service-detail">
            <div class="service-detail-icon">${P.icons[s.iconKey]||P.icons.settings}</div>
            <div class="service-detail-body">
              <div style="font-size:18px;line-height:1.85;color:var(--text)">${fa?longFa:longEn}</div>
              <div style="margin-top:24px;display:flex;gap:10px;flex-wrap:wrap">
                <a class="btn btn-accent" href="contact.html" style="background:var(--accent)">${fa?'درخواست این خدمت':'Request this service'} ${A}</a>
                <a class="btn btn-ghost" href="services.html">${A} ${fa?'بازگشت به همه خدمات':'Back to all services'}</a>
              </div>
            </div>
          </div>
        </div></section>

        <section class="section" style="padding-top:0;background:var(--bg-2)"><div class="container">
          <div style="padding:30px 0">
            <span class="kicker">${fa?'سایر خدمات':'Other services'}</span>
            <h2 style="font-size:24px;margin:8px 0 22px;color:var(--ink)">${fa?'شاید این‌ها هم به کارتان بیاید':'You may also be interested in'}</h2>
            <div class="svc-grid">
              ${(P.data.services||[]).filter(x=>x.id!==(s&&s.id)).slice(0,3).map(o=>`
                <a class="svc-card svc-card-link" href="service.html?id=${o.id}">
                  <div class="icon">${P.icons[o.iconKey]||P.icons.settings}</div>
                  <h4>${fa?o.titleFa:o.titleEn}</h4>
                  <p>${fa?o.descFa:o.descEn}</p>
                  <span class="svc-more">${fa?'مشاهده جزئیات':'View details'} ${A}</span>
                </a>`).join('')}
            </div>
          </div>
        </div></section>`;
    }
  }

  /* ---------------- NEWS LIST ---------------- */
  if (page === 'news') {
    const m = document.getElementById('news-mount');
    if (m) {
      const items = (P.data.news||[]).slice().sort((a,b)=> (b.date||'').localeCompare(a.date||''));
      m.innerHTML = `
        <section class="section"><div class="container">
          <div class="news-grid">
            ${items.map(n=>`
              <a class="news-card" href="news-article.html?id=${n.id}">
                <div class="thumb">${n.image ? `<img src="${n.image}" alt="" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover">` : newsThumbSVG(n.category)}</div>
                <div class="body">
                  <div class="nmeta">
                    <span>${fa?n.dateFa:formatDate(n.date)}</span>
                    <span class="pill">${fa?n.categoryFa:n.categoryEn}</span>
                  </div>
                  <h4>${fa?n.titleFa:n.titleEn}</h4>
                  <p>${fa?n.excerptFa:n.excerptEn}</p>
                  <span class="read">${fa?'ادامه مطلب':'Read more'} ${A}</span>
                </div>
              </a>`).join('')}
          </div>
        </div></section>`;
    }
  }

  /* ---------------- NEWS ARTICLE ---------------- */
  if (page === 'news-article') {
    const id = new URLSearchParams(location.search).get('id');
    const n = (P.data.news||[]).find(x=>x.id===id) || (P.data.news||[])[0];
    const crumb = document.getElementById('crumb-name');
    if (crumb && n) crumb.textContent = fa?n.titleFa:n.titleEn;
    const t = document.getElementById('article-title');
    if (t && n) t.textContent = fa?n.titleFa:n.titleEn;
    const meta = document.getElementById('article-meta');
    if (meta && n) meta.innerHTML = `${fa?n.dateFa:formatDate(n.date)} · <span style="color:var(--accent)">${fa?n.categoryFa:n.categoryEn}</span>`;
    const m = document.getElementById('article-mount');
    if (m && n) {
      m.innerHTML = `
        <section class="section"><div class="container" style="max-width:820px">
          <div class="thumb" style="border-radius:var(--r-l);overflow:hidden;aspect-ratio:16/8;margin-bottom:36px">${n.image ? `<img src="${n.image}" alt="" style="width:100%;height:100%;object-fit:cover">` : newsThumbSVG(n.category)}</div>
          <div style="font-size:18px;line-height:1.9;color:var(--text)">${fa?n.contentFa:n.contentEn}</div>
          <div style="margin-top:36px"><a class="btn btn-ghost" href="news.html">${A} ${fa?'بازگشت به اخبار':'Back to news'}</a></div>
        </div></section>`;
    }
  }

  /* ---------------- GALLERY ---------------- */
  if (page === 'gallery') {
    const m = document.getElementById('gallery-mount');
    if (m) {
      m.innerHTML = `
        <section class="section"><div class="container">
          <div class="gal-grid">
            ${(P.data.gallery||[]).map(g=>`
              <div class="gal-item">
                <div class="ph">${gallerySVG(g.category)}</div>
                <div class="cap"><div class="catlabel">${g.category}</div>${fa?g.captionFa:g.captionEn}</div>
              </div>`).join('')}
          </div>
        </div></section>`;
    }
  }

  /* ---------------- CONTACT ---------------- */
  if (page === 'contact') {
    const s = P.data.site;
    const m = document.getElementById('contact-mount');
    if (m) {
      m.innerHTML = `
        <section class="section"><div class="container">
          <div class="contact-grid">
            <div class="contact-info">
              <div class="item"><div class="icon">${P.icons.phone}</div><div><b>${fa?'تلفن':'Phone'}</b><span><a href="tel:${s.contact.phone}">${tt(s.contact.phoneDisplay)}</a></span></div></div>
              <div class="item"><div class="icon">${P.icons.mail}</div><div><b>${fa?'ایمیل':'Email'}</b><span><a href="mailto:${s.contact.email}">${s.contact.email}</a></span></div></div>
              <div class="item"><div class="icon">${P.icons.pin}</div><div><b>${fa?'آدرس':'Address'}</b><span>${tt(s.contact.address)}</span></div></div>
              <div class="item"><div class="icon">${P.icons.clock}</div><div><b>${fa?'ساعات کاری':'Hours'}</b><span>${tt(s.contact.hours)}</span></div></div>
            </div>
            <form class="contact-form" onsubmit="event.preventDefault(); this.reset(); document.getElementById('form-ok').style.display='block';">
              <div class="field"><label>${fa?'نام و نام خانوادگی':'Full name'} *</label><input required></div>
              <div class="field"><label>${fa?'شرکت':'Company'}</label><input></div>
              <div class="field"><label>${fa?'ایمیل':'Email'} *</label><input type="email" required></div>
              <div class="field"><label>${fa?'تلفن / واتس‌اپ':'Phone / WhatsApp'}</label><input></div>
              <div class="field"><label>${fa?'محصول مورد نظر':'Product of interest'}</label>
                <select>${(P.data.products||[]).map(p=>`<option>${fa?p.nameFa:p.nameEn}</option>`).join('')}<option>${fa?'سایر / مشاوره':'Other / consultation'}</option></select>
              </div>
              <div class="field"><label>${fa?'پیام شما':'Your message'}</label><textarea></textarea></div>
              <button class="btn btn-accent" type="submit" style="width:100%;justify-content:center">${fa?'ارسال درخواست':'Send request'} ${A}</button>
              <div id="form-ok" style="display:none;margin-top:14px;padding:12px;background:#e7f9ef;color:#0b6b3a;border-radius:8px;font-size:14px;text-align:center">${fa?'پیام شما ثبت شد. به‌زودی با شما تماس می‌گیریم.':'Your message was received. We\'ll be in touch shortly.'}</div>
              <p style="font-size:12px;color:var(--text-3);margin:12px 0 0;text-align:center">${fa?'توجه: این فرم نمونه است. برای ارسال واقعی، توسعه‌دهنده باید آن را به ایمیل یا واتس‌اپ متصل کند.':'Note: demo form. A developer must connect it to email/WhatsApp for live submissions.'}</p>
            </form>
          </div>
        </div></section>`;
    }
  }
};

/* ---------------- shared snippets ---------------- */
function ctaStrip(P, fa, A){
  return `<div class="cta-strip">
    <div class="col col-left">
      <span class="kicker">${fa?'تماس فروش':'Sales contact'}</span>
      <h3>${fa?'آماده ارتقا خط تولید خود هستید؟':'Ready to upgrade your production line?'}</h3>
      <p>${fa?'کارشناسان ما در کمتر از ۲۴ ساعت با شما تماس می‌گیرند.':'Our specialists will get back to you in under 24 hours.'}</p>
      <div class="acts"><a class="btn btn-primary" href="contact.html">${fa?'درخواست قیمت':'Request a quote'} ${A}</a></div>
    </div>
    <div class="col col-right">
      <span class="kicker" style="color:var(--accent)">${fa?'کاتالوگ':'Catalog'}</span>
      <h3>${fa?'کاتالوگ کامل محصولات ۲۰۲۶':'Full 2026 product catalog'}</h3>
      <p>${fa?'تمام مشخصات فنی دستگاه‌ها در یک فایل.':'Every machine spec in a single file.'}</p>
      <div class="acts"><a class="btn btn-accent" href="#" style="background:var(--accent)">${fa?'دانلود کاتالوگ':'Download catalog'}</a>
      <a class="btn btn-ghost" style="border-color:rgba(255,255,255,.25);color:#fff;background:transparent" href="contact.html">${fa?'واتس‌اپ':'WhatsApp'}</a></div>
    </div>
  </div>`;
}

function formatDate(d){ if(!d) return ''; try{ return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }catch(e){ return d; } }

/* ---------------- SVG illustration helpers ---------------- */
/* ---- hero helpers: blur-in text ----------------------------------
   Splits a string into segments the CSS (.bt-seg) fades/blurs in one
   after another. Latin text animates letter by letter; Persian text is
   split only after letters that never join forwards, so the cursive
   shapes stay intact. -------------------------------------------- */
function escAttr(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
  });
}
function stripTags(s){ return String(s == null ? '' : s).replace(/<[^>]*>/g, ''); }
function hasArabicScript(s){ return /[\u0600-\u06FF\u0750-\u077F]/.test(s); }
function dirOf(s){ return hasArabicScript(s) ? 'rtl' : 'ltr'; }

/* letters that do not connect to the letter after them (+ ZWNJ) */
var NON_JOINERS = 'اآأإٱدذرزژوؤةء\u200c';
function scriptSafeChunks(text){
  var out = [], cur = '';
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (/\s/.test(ch)) { if (cur) { out.push(cur); cur = ''; } out.push(ch); continue; }
    cur += ch;
    if (NON_JOINERS.indexOf(ch) > -1) { out.push(cur); cur = ''; }
  }
  if (cur) out.push(cur);
  return out;
}
/* ---- hero machine rotator ------------------------------------------
   Every few seconds the current machine fades out while shrinking and the
   next one settles in from slightly larger. Pauses while hovered/focused
   and in background tabs; visitors who prefer reduced motion keep the
   first machine. ------------------------------------------------------ */
function defaultHeroMachines(){
  return [
    ['pa-1300', 'PA-1300/12300', 'two-platen'],
    ['pa-500',  'PA-500/2800',   'standard'],
    ['pa-800',  'PA-800/5600',   'two-platen'],
    ['pa-300',  'PA-300/1100',   'high-speed'],
    ['pa-200',  'PA-200/620',    'pet'],
    ['pa-100',  'PA-100/250',    'standard']
  ].map(function (m) {
    return { model: m[1], image: 'assets/img/hero/' + m[0] + '.png',
             imageWebp: 'assets/img/hero/' + m[0] + '.webp', url: 'product.html?id=' + m[2] };
  });
}
function machineAlt(m, fa){
  var model = (m && m.model) ? ' ' + m.model : '';
  return fa ? 'دستگاه تزریق پلاستیک پارسیان' + model : 'Parsian' + model + ' injection molding machine';
}

var heroRotatorStop = null;   // renderPage() runs again on language switch
function startHeroRotator(link, machines, fa, holdMs){
  if (heroRotatorStop) { heroRotatorStop(); heroRotatorStop = null; }
  var slides = link ? Array.prototype.slice.call(link.querySelectorAll('.hero-slide')) : [];
  if (slides.length < 2) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var current = 0, timer = null, preload = null, hovered = false, focused = false;
  // only the first machine is downloaded with the page; each next one is
  // fetched shortly before its turn, and the rotation waits if it's late
  function load(slide){
    var img = slide.querySelector('img[data-src]');
    if (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); }
  }
  function state(slide){
    var img = slide.querySelector('img');
    if (!img || img.hasAttribute('data-src') || !img.complete) return 'wait';
    return img.naturalWidth > 0 ? 'ok' : 'broken';
  }
  function show(next){
    var out = slides[current];
    out.classList.remove('is-active');
    out.classList.add('is-leaving');
    setTimeout(function () { out.classList.remove('is-leaving'); }, 900);
    slides[next].classList.add('is-active');
    current = next;
    link.href = machines[next].url || 'products.html';
    link.setAttribute('aria-label', machineAlt(machines[next], fa));
  }
  function advance(){
    if (hovered || focused || document.hidden) return;
    for (var step = 1; step < slides.length; step++) {
      var n = (current + step) % slides.length, st = state(slides[n]);
      if (st === 'ok') { show(n); schedule(); return; }
      if (st === 'wait') { load(slides[n]); timer = setTimeout(advance, 400); return; }
      // 'broken' (missing file): skip it
    }
    schedule();
  }
  function schedule(){
    clearTimeout(timer); clearTimeout(preload);
    if (hovered || focused || document.hidden) return;
    var upcoming = slides[(current + 1) % slides.length];
    preload = setTimeout(function () { load(upcoming); }, Math.max(0, holdMs - 1500));
    timer = setTimeout(advance, holdMs);
  }
  function onVisibility(){ schedule(); }
  link.addEventListener('mouseenter', function () { hovered = true;  schedule(); });
  link.addEventListener('mouseleave', function () { hovered = false; schedule(); });
  link.addEventListener('focusin',    function () { focused = true;  schedule(); });
  link.addEventListener('focusout',   function () { focused = false; schedule(); });
  document.addEventListener('visibilitychange', onVisibility);
  schedule();
  heroRotatorStop = function () {
    clearTimeout(timer); clearTimeout(preload);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

function blurText(text, animateBy){
  var t = String(text == null ? '' : text);
  var segs = animateBy === 'letters'
    ? (hasArabicScript(t) ? scriptSafeChunks(t) : Array.from(t))
    : t.split(/(\s+)/).filter(function (s) { return s !== ''; });
  return segs.map(function (s, i) {
    var body = /^\s+$/.test(s) ? '&nbsp;' : escAttr(s);
    return '<span class="bt-seg" style="--i:' + i + '">' + body + '</span>';
  }).join('');
}
function twoPlatenSVG(){return `<svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="hp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff6a13"/><stop offset="100%" stop-color="#a23a00"/></linearGradient></defs><rect x="60" y="80" width="120" height="240" fill="#1d3458" rx="8" stroke="#3a5278"/><rect x="320" y="80" width="120" height="240" fill="#1d3458" rx="8" stroke="#3a5278"/><rect x="200" y="150" width="100" height="100" fill="#cbd5e1" rx="4"/><line x1="80" y1="120" x2="420" y2="120" stroke="#2a3f5f" stroke-width="8"/><line x1="80" y1="280" x2="420" y2="280" stroke="#2a3f5f" stroke-width="8"/><circle cx="250" cy="200" r="80" fill="url(#hp1)" opacity=".18"/><circle cx="100" cy="120" r="4" fill="#22c55e"/><circle cx="120" cy="120" r="4" fill="#fbbf24"/></svg>`;}
function machineSVG(id){
  const base = (body,inj) => `<svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="180" width="320" height="40" fill="#1e293b" rx="4"/>${body}<rect x="220" y="100" width="40" height="80" fill="#cbd5e1" rx="2"/>${inj}</svg>`;
  switch(id){
    case 'two-platen': return `<svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="200" width="320" height="40" fill="#1e293b" rx="4"/><rect x="50" y="90" width="90" height="150" fill="#1d3458" rx="6"/><rect x="180" y="90" width="90" height="150" fill="#1d3458" rx="6"/><rect x="135" y="130" width="60" height="70" fill="#cbd5e1" rx="3"/><line x1="60" y1="115" x2="330" y2="115" stroke="#3a5278" stroke-width="7"/><line x1="60" y1="215" x2="330" y2="215" stroke="#3a5278" stroke-width="7"/><rect x="290" y="120" width="70" height="60" fill="#ff6a13" rx="4"/></svg>`;
    case 'high-speed': return base(`<rect x="60" y="80" width="160" height="100" fill="#0846a8" rx="6"/><path d="M80 110 L130 110 L110 130 L130 150 L80 150 Z" fill="#fbbf24"/>`,`<rect x="280" y="100" width="80" height="80" fill="#ff6a13" rx="4"/>`);
    case 'upvc': return base(`<rect x="60" y="80" width="160" height="100" fill="#0846a8" rx="6"/><rect x="80" y="100" width="120" height="6" fill="#fff" opacity=".4"/><rect x="80" y="115" width="80" height="6" fill="#fff" opacity=".25"/>`,`<rect x="280" y="100" width="80" height="80" fill="#dc2626" rx="4"/>`);
    case 'pet': return base(`<rect x="60" y="80" width="160" height="100" fill="#0846a8" rx="6"/><ellipse cx="150" cy="130" rx="9" ry="20" fill="#cbd5e1"/><ellipse cx="185" cy="130" rx="9" ry="20" fill="#cbd5e1"/>`,`<rect x="280" y="100" width="80" height="80" fill="#06b6d4" rx="4"/>`);
    default: return base(`<rect x="60" y="80" width="160" height="100" fill="#3a5278" rx="6"/><circle cx="90" cy="120" r="5" fill="#fbbf24"/><circle cx="110" cy="120" r="5" fill="#22c55e"/>`,`<rect x="280" y="100" width="80" height="80" fill="#ff6a13" rx="4"/>`);
  }
}
function newsThumbSVG(cat){
  const map = {
    technology: ['#1d3458','#0a1f3a','#ff6a13'],
    sustainability: ['#062a1f','#0d4030','#22c55e'],
    event: ['#3a1d05','#7c3000','#ff6a13'],
    press: ['#142a4a','#0a1f3a','#3b82f6']
  };
  const c = map[cat] || map.technology;
  return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g${cat}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c[0]}"/><stop offset="100%" stop-color="${c[1]}"/></linearGradient></defs><rect width="320" height="200" fill="url(#g${cat})"/><circle cx="240" cy="50" r="50" fill="${c[2]}" opacity=".25"/><rect x="50" y="90" width="150" height="60" fill="${c[2]}" opacity=".85" rx="6"/><rect x="65" y="105" width="50" height="30" fill="#fff" opacity=".25"/><rect x="125" y="105" width="60" height="30" fill="#fff" opacity=".15"/></svg>`;
}
function gallerySVG(){return `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="90" width="140" height="20" fill="#1e293b" rx="3"/><rect x="40" y="45" width="90" height="45" fill="#3a5278" rx="4"/><rect x="130" y="58" width="40" height="32" fill="#ff6a13" rx="3"/></svg>`;}
