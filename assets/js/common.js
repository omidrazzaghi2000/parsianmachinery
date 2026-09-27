/* ============================================================
   PARSIAN — common engine
   Loads data.json (+ localStorage overlay from admin), builds
   shared header/footer, handles language toggle.
   ============================================================ */

const PARSIAN = {
  data: null,
  lang: 'fa',

  // SVG icon set used across the site (industries, services, etc.)
  icons: {
    arrow: '<svg class="arrow-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    car: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 16l-3-8H7L4 16"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M18 16h2v-4l-3-2h-3l-2-3H7"/></svg>',
    box: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
    medical: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M11 11l-2 2 4 4 4-4-2-2"/><path d="M3 13l2-9 6 1L8 13l-5 0z"/><path d="M16 7l5-2v8l-5-2"/></svg>',
    bolt: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    building: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1"/></svg>',
    clock: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    chart: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>',
    eye: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    settings: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    wrench: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    book: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    trending: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    package: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    phone: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mail: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>',
    pin: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    whatsapp: '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.595 5.39l-.999 3.648 3.893-1.737z"/></svg>'
  },

  socialSvg: {
    linkedin: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>',
    instagram: '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    telegram: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.24 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>',
    youtube: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4l6.4 3.6z"/></svg>',
    whatsapp: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.595 5.39l-.999 3.648 3.893-1.737z"/></svg>'
  },

  // pick fa/en value from an object like {fa,en} or fields like xFa/xEn
  t(obj, key) {
    if (obj == null) return '';
    if (key) {
      const v = obj[key + (this.lang === 'fa' ? 'Fa' : 'En')];
      return v != null ? v : (obj[key + 'Fa'] || '');
    }
    return obj[this.lang] != null ? obj[this.lang] : (obj.fa || '');
  },

  async load() {
    // 1) localStorage overlay (set by admin panel) takes priority
    try {
      const ls = localStorage.getItem('parsian_cms_data');
      if (ls) { this.data = JSON.parse(ls); }
    } catch (e) { /* ignore */ }

    // 2) otherwise fetch data.json
    if (!this.data) {
      try {
        const res = await fetch('data.json', { cache: 'no-store' });
        this.data = await res.json();
      } catch (e) {
        console.error('Could not load data.json. If you opened the file directly (file://), run a local server. See README.', e);
        document.body.insertAdjacentHTML('afterbegin',
          '<div style="background:#fff1e6;color:#7c2d00;padding:14px;text-align:center;font-size:14px">' +
          'فایل data.json بارگذاری نشد. لطفاً سایت را با یک سرور محلی باز کنید (راهنما در فایل README موجود است).' +
          '</div>');
        this.data = { navigation: [], site: { name:{}, tagline:{}, contact:{ social:{} }, stats:[] } };
      }
    }

    // 3) language preference
    const saved = (function(){ try { return localStorage.getItem('parsian_lang'); } catch(e){ return null; } })();
    this.lang = saved || (this.data._meta && this.data._meta.defaultLang) || 'fa';
    this.applyLang(this.lang, false);
    return this.data;
  },

  applyLang(lang, persist = true) {
    this.lang = lang;
    const html = document.documentElement;
    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang === 'fa' ? 'fa' : 'en');
    html.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
    if (persist) { try { localStorage.setItem('parsian_lang', lang); } catch(e){} }
    document.querySelectorAll('[data-langbtn]').forEach(b => {
      b.classList.toggle('is-on', b.getAttribute('data-langbtn') === lang);
    });
    // re-render dynamic regions if a page hook exists
    if (typeof window.renderPage === 'function') window.renderPage();
    this.buildHeader();
    this.buildFooter();
  },

  buildHeader() {
    const mount = document.getElementById('header-mount');
    if (!mount || !this.data) return;
    const s = this.data.site;
    const active = document.body.getAttribute('data-page') || 'home';
    const isFa = this.lang === 'fa';
    const lbl = (o) => isFa ? (o.labelFa || o.labelEn) : (o.labelEn || o.labelFa);
    const dsc = (o) => isFa ? (o.descFa || o.descEn || '') : (o.descEn || o.descFa || '');
    const head = (o) => isFa ? (o.headingFa || o.headingEn || '') : (o.headingEn || o.headingFa || '');
    const caretSvg = '<svg class="nav-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';

    const nav = (this.data.navigation || []).map(n => {
      const cls = n.id === active ? 'active' : '';
      if (!n.children || !n.children.length) {
        return `<div class="nav-item"><a href="${n.url}" class="${cls}">${lbl(n)}</a></div>`;
      }
      // mega-menu groups
      const cols = n.children.length;
      const groups = n.children.map(g => `
        <div class="mm-col">
          ${head(g) ? (g.headingUrl
              ? `<a class="mm-heading mm-heading-link" href="${g.headingUrl}">${head(g)} <span class="mm-heading-arrow">›</span></a>`
              : `<div class="mm-heading">${head(g)}</div>`
            ) : ''}
          <div class="mm-items">
            ${(g.items||[]).map(it => `
              <a class="mm-item ${it.isAll?'is-all':''}" href="${it.url}">
                <div class="mm-item-main">
                  <span class="mm-label">${lbl(it)} ${it.isAll?'<span class="mm-all-arrow">›</span>':''}</span>
                  ${dsc(it) ? `<span class="mm-desc">${dsc(it)}</span>` : ''}
                </div>
              </a>`).join('')}
          </div>
        </div>`).join('');
      return `
        <div class="nav-item has-mm">
          <a href="${n.url}" class="${cls}">${lbl(n)} ${caretSvg}</a>
          <div class="mm-panel" data-cols="${cols}">
            <div class="container">
              <div class="mm-grid" style="grid-template-columns:repeat(${cols},1fr)">${groups}</div>
            </div>
          </div>
        </div>`;
    }).join('');

    mount.innerHTML = `
      <div class="utilbar">
        <div class="container">
          <div class="links">
            <a href="news.html">${this.lang==='fa'?'اخبار':'News'}</a>
            <a href="services.html">${this.lang==='fa'?'خدمات':'Service'}</a>
            <a href="admin.html">${this.lang==='fa'?'ورود مدیر':'Admin'}</a>
          </div>
          <div class="meta">
            <span class="live-dot"></span>
            <span>${this.lang==='fa'?'پشتیبانی ۲۴/۷':'24/7 Support'}</span>
            <span style="opacity:.4">|</span>
            <a href="tel:${s.contact.phone}">${this.t(s.contact.phoneDisplay)}</a>
          </div>
        </div>
      </div>
      <header class="site">
        <div class="container nav">
          <a class="brand" href="index.html">
            ${s.logo
              ? `<img src="${s.logo}" alt="${this.t(s.name)}" class="brand-logo-img">`
              : `<span class="brand-mark">PA</span><span class="brand-text"><b>${this.t(s.name)}</b><small>Plastic Process Machinery</small></span>`}
          </a>
          <nav class="menu" id="main-menu">${nav}</nav>
          <div class="nav-actions">
            <div class="lang-switch">
              <button data-langbtn="fa" class="${this.lang==='fa'?'is-on':''}">FA</button>
              <button data-langbtn="en" class="${this.lang==='en'?'is-on':''}">EN</button>
            </div>
            <a class="btn btn-primary" href="contact.html">${this.lang==='fa'?'تماس':'Contact'} ${this.icons.arrow}</a>
            <button class="menu-toggle" id="menu-toggle" aria-label="Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </header>`;

    mount.querySelectorAll('[data-langbtn]').forEach(b => {
      b.addEventListener('click', () => this.applyLang(b.getAttribute('data-langbtn')));
    });
    const tog = document.getElementById('menu-toggle');
    if (tog) tog.addEventListener('click', () => document.getElementById('main-menu').classList.toggle('open'));

    // mega-menu: tap-to-toggle on mobile, click-outside to close
    mount.querySelectorAll('.nav-item.has-mm > a').forEach(link => {
      link.addEventListener('click', (e) => {
        if (window.matchMedia('(max-width: 1100px)').matches) {
          e.preventDefault();
          const item = link.parentElement;
          const wasOpen = item.classList.contains('is-open');
          mount.querySelectorAll('.nav-item.has-mm.is-open').forEach(x => x.classList.remove('is-open'));
          if (!wasOpen) item.classList.add('is-open');
        }
      });
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-item.has-mm')) {
        mount.querySelectorAll('.nav-item.has-mm.is-open').forEach(x => x.classList.remove('is-open'));
      }
    });
  },

  buildFooter() {
    const mount = document.getElementById('footer-mount');
    if (!mount || !this.data) return;
    const s = this.data.site;
    const soc = s.contact.social || {};
    const socialLinks = ['linkedin','instagram','telegram','youtube','whatsapp']
      .filter(k => soc[k])
      .map(k => `<a href="${soc[k]}" aria-label="${k}" target="_blank" rel="noopener">${this.socialSvg[k]}</a>`).join('');

    const prodLinks = (this.data.products||[]).map(p =>
      `<a href="product.html?id=${p.id}">${this.lang==='fa'?p.nameFa:p.nameEn}</a>`).join('');

    mount.innerHTML = `
      <footer class="site">
        <div class="container">
          <div class="foot-grid">
            <div class="foot-brand">
              <div style="display:flex;align-items:center;gap:12px">
                ${s.logo
                  ? `<img src="${s.logo}" alt="${this.t(s.name)}" class="brand-logo-img-footer">`
                  : `<span class="brand-mark">PA</span><span style="display:flex;flex-direction:column;line-height:1.1"><b style="margin:0">${this.t(s.name)}</b><small style="color:#7a8aa8;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;font-family:'Space Grotesk',sans-serif;font-weight:600">Plastic Process Machinery</small></span>`}
              </div>
              <p>${this.lang==='fa'
                ? 'پارسیان ماشین‌سازی، پیشگام در صنعت تزریق پلاستیک ایران از ۱۳۸۱. مهندسی‌شده برای دوام، کارایی و رضایت شما.'
                : 'Parsian — Iran\'s leading manufacturer of plastic injection molding machinery since 2002. Engineered for durability, efficiency, and your success.'}</p>
              <div class="socials">${socialLinks}</div>
            </div>
            <div class="foot-col">
              <h6>${this.lang==='fa'?'محصولات':'Products'}</h6>
              ${prodLinks}
            </div>
            <div class="foot-col">
              <h6>${this.lang==='fa'?'شرکت':'Company'}</h6>
              <a href="about.html">${this.lang==='fa'?'درباره ما':'About'}</a>
              <a href="services.html">${this.lang==='fa'?'خدمات':'Services'}</a>
              <a href="news.html">${this.lang==='fa'?'اخبار':'News'}</a>
              <a href="gallery.html">${this.lang==='fa'?'گالری':'Gallery'}</a>
            </div>
            <div class="foot-col">
              <h6>${this.lang==='fa'?'پشتیبانی':'Support'}</h6>
              <a href="services.html">${this.lang==='fa'?'خدمات پس از فروش':'After-sales'}</a>
              <a href="contact.html">${this.lang==='fa'?'درخواست قیمت':'Request a quote'}</a>
              <a href="admin.html">${this.lang==='fa'?'ورود مدیر سایت':'Site admin'}</a>
            </div>
            <div class="foot-col">
              <h6>${this.lang==='fa'?'تماس':'Contact'}</h6>
              <a href="mailto:${s.contact.email}">${s.contact.email}</a>
              <a href="tel:${s.contact.phone}">${this.t(s.contact.phoneDisplay)}</a>
              <a href="#">${this.t(s.contact.address)}</a>
            </div>
          </div>
          <div class="foot-bar">
            <div>${this.lang==='fa'?'© ۲۰۲۶ شرکت پارسیان ماشین‌سازی · تمامی حقوق محفوظ است.':'© 2026 Parsian Plastic Process Machinery. All rights reserved.'}</div>
            <div>${this.lang==='fa'?'طراحی‌شده برای به‌روزرسانی آسان':'Built for easy updates'}</div>
          </div>
        </div>
      </footer>`;
  },

  // floating whatsapp button
  buildFloat() {
    if (!this.data) return;
    const wa = (this.data.site.contact.whatsapp||'').replace(/[^0-9]/g,'');
    if (!wa) return;
    if (document.querySelector('.wa-float')) return;
    const a = document.createElement('a');
    a.className = 'wa-float';
    a.href = 'https://wa.me/' + wa;
    a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('aria-label','WhatsApp');
    a.innerHTML = this.icons.whatsapp;
    document.body.appendChild(a);
  }
};

// boot
document.addEventListener('DOMContentLoaded', async () => {
  await PARSIAN.load();
  PARSIAN.buildHeader();
  PARSIAN.buildFooter();
  PARSIAN.buildFloat();
  if (typeof window.renderPage === 'function') window.renderPage();
});
