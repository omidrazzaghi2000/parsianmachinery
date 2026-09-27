/* ============================================================
   PARSIAN — Admin panel (Option A, no backend)
   - Two roles: admin (full) and writer (news + gallery only)
   - Rich text editor for content fields
   - Saves to localStorage; Publish downloads data.json
   ============================================================ */

/* Recommended dimensions shown next to each upload field.
   Used by uploadField() and validateImage() below. */
const SIZE_GUIDES = {
  news:    { wFa: 1600, hFa: 1000, ratio: '16:10', sizeKB: 500, fmt: 'JPG / WebP', hintFa: 'تصویر خبر در کارت‌ها و صفحه خبر — افقی.' },
  gallery: { wFa: 1600, hFa: 1200, ratio: '4:3',   sizeKB: 500, fmt: 'JPG / WebP', hintFa: 'تصویر گالری — افقی.' },
  product: { wFa: 2000, hFa: 1200, ratio: '5:3',   sizeKB: 800, fmt: 'JPG / PNG',   hintFa: 'پس‌زمینه‌ی سفید یا شفاف بهتر است.' },
  logo:    { wFa: 300,  hFa: 100,  ratio: '3:1',   sizeKB: 50,  fmt: 'PNG شفاف',    hintFa: 'پس‌زمینه‌ی شفاف ضروری است (PNG).' },
  hero:    { wFa: 1920, hFa: 1080, ratio: '16:9',  sizeKB: 5120, fmt: 'MP4 (H.264) بدون صدا، ۵ تا ۱۵ ثانیه', hintFa: 'ویدیوی پس‌زمینه‌ی صفحه اصلی. کوتاه و سبک باشد.' },
  heroImg: { wFa: 1600, hFa: 600,  ratio: 'افقی', sizeKB: 300,  fmt: 'PNG یا WebP با پس‌زمینه‌ی شفاف', hintFa: 'دستگاه باید بدون پس‌زمینه (شفاف) باشد تا روی زمینه‌ی سرمه‌ای شناور دیده شود. دستگاه‌ها به همین ترتیب، یکی‌یکی با محو و کوچک شدن جای خود را به بعدی می‌دهند.' }
};

const USERS = {
  // CHANGE THESE PASSWORDS in production.
  admin:  { password: 'parsian1381',   role: 'admin',  nameFa: 'مدیر کل',           nameEn: 'Administrator' },
  writer: { password: 'parsianwriter', role: 'writer', nameFa: 'تولیدکننده محتوا',  nameEn: 'Content Writer' }
};

let DB = null;          // working copy of the data
let CURRENT = 'news';   // current section
let CURRENT_USER = null;

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

/* ---------- boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // restore session?
  const saved = sessionStorage.getItem('parsian_admin_user');
  if (saved && USERS[saved]) {
    CURRENT_USER = { username: saved, ...USERS[saved] };
    showPanel();
  } else {
    showLogin();
  }
  $('#login-form').addEventListener('submit', e => {
    e.preventDefault();
    const u = $('#uname').value.trim().toLowerCase();
    const p = $('#pw').value;
    const found = USERS[u];
    if (found && found.password === p) {
      sessionStorage.setItem('parsian_admin_user', u);
      CURRENT_USER = { username: u, ...found };
      showPanel();
    } else {
      $('#login-err').style.display = 'block';
    }
  });
});

function showLogin(){ $('#login-screen').style.display='flex'; $('#panel').style.display='none'; }

async function showPanel(){
  $('#login-screen').style.display='none';
  $('#panel').style.display='block';
  // show username + role in the top bar
  const tag = $('#user-tag');
  if (tag) tag.textContent = `${CURRENT_USER.nameFa} (${CURRENT_USER.username})`;
  await loadDB();
  renderNav();
  // writer starts on news (only section they can use); admin starts on news too by default
  selectSection('news');
}

async function loadDB(){
  try {
    const ls = localStorage.getItem('parsian_cms_data');
    if (ls) { DB = JSON.parse(ls); return; }
  } catch(e){}
  try {
    const res = await fetch('data.json', {cache:'no-store'});
    DB = await res.json();
  } catch(e){
    alert('data.json بارگذاری نشد. سایت را با سرور محلی باز کنید.');
    DB = {};
  }
}

function persist(){
  DB._meta = DB._meta || {};
  DB._meta.lastUpdated = new Date().toISOString().slice(0,10);
  localStorage.setItem('parsian_cms_data', JSON.stringify(DB));
  flash('ذخیره شد ✔ (در این مرورگر). برای انتشار روی سایت، «دانلود data.json» را بزنید.');
}

function flash(msg){
  let el = $('#flash');
  el.textContent = msg;
  el.style.display='block';
  clearTimeout(el._t);
  el._t = setTimeout(()=> el.style.display='none', 4000);
}

/* ---------- navigation ---------- */
const ALL_SECTIONS = [
  { id:'news',     label:'اخبار و رویدادها',  icon:'📰', roles:['admin','writer'] },
  { id:'gallery',  label:'گالری',             icon:'🖼️', roles:['admin','writer'] },
  { id:'products', label:'محصولات',           icon:'⚙️', roles:['admin'] },
  { id:'services', label:'خدمات',             icon:'🛠️', roles:['admin'] },
  { id:'about',    label:'درباره ما',          icon:'🏢', roles:['admin'] },
  { id:'contact',  label:'تماس و تنظیمات',     icon:'📞', roles:['admin'] }
];

function visibleSections(){
  return ALL_SECTIONS.filter(s => s.roles.includes(CURRENT_USER.role));
}

function renderNav(){
  $('#nav').innerHTML = visibleSections().map(s=>
    `<button class="navbtn" data-s="${s.id}"><span>${s.icon}</span> ${s.label}</button>`
  ).join('');
  $$('#nav .navbtn').forEach(b=> b.addEventListener('click', ()=> selectSection(b.dataset.s)));
}

function selectSection(id){
  // gate by role
  const allowed = visibleSections().some(s=>s.id===id);
  if (!allowed) id = 'news';
  CURRENT = id;
  $$('#nav .navbtn').forEach(b=> b.classList.toggle('active', b.dataset.s===id));
  const r = {news:renderNews, products:renderProducts, services:renderServices, gallery:renderGallery, about:renderAbout, contact:renderContact}[id];
  r();
}

/* ============================================================
   RICH TEXT EDITOR (lightweight, no dependencies)
   ============================================================ */
function richEditor(id, value){
  const safe = (value||'').replace(/&/g,'&amp;'); // already-HTML is fine; we just keep ampersands stable for innerHTML
  return `
    <div class="rte-wrap">
      <div class="rte-toolbar">
        <button type="button" onclick="rteCmd('${id}','bold')" title="پررنگ"><b>B</b></button>
        <button type="button" onclick="rteCmd('${id}','italic')" title="کج"><i>I</i></button>
        <button type="button" onclick="rteCmd('${id}','underline')" title="زیرخط"><u>U</u></button>
        <span class="rte-sep"></span>
        <button type="button" onclick="rteHeading('${id}','h2')" title="عنوان بزرگ">H1</button>
        <button type="button" onclick="rteHeading('${id}','h3')" title="عنوان متوسط">H2</button>
        <button type="button" onclick="rteHeading('${id}','p')"  title="متن معمولی">¶</button>
        <span class="rte-sep"></span>
        <button type="button" onclick="rteCmd('${id}','insertUnorderedList')" title="فهرست نقطه‌ای">• ☰</button>
        <button type="button" onclick="rteCmd('${id}','insertOrderedList')" title="فهرست عددی">1. ☰</button>
        <span class="rte-sep"></span>
        <button type="button" onclick="rteAlign('${id}','right')" title="چپ‌چین (راست برای RTL)">⇤</button>
        <button type="button" onclick="rteAlign('${id}','center')" title="وسط‌چین">↔</button>
        <button type="button" onclick="rteAlign('${id}','left')" title="راست‌چین (چپ برای RTL)">⇥</button>
        <span class="rte-sep"></span>
        <button type="button" onclick="rteLink('${id}')" title="افزودن لینک">🔗</button>
        <button type="button" onclick="rteCmd('${id}','removeFormat')" title="حذف قالب">✕</button>
      </div>
      <div id="${id}" class="rte-area" contenteditable="true">${value||''}</div>
    </div>`;
}
function rteCmd(id, cmd){ const el=$('#'+id); el.focus(); document.execCommand(cmd, false, null); }
function rteHeading(id, tag){ const el=$('#'+id); el.focus(); document.execCommand('formatBlock', false, tag); }
function rteAlign(id, dir){
  const map={left:'justifyLeft', right:'justifyRight', center:'justifyCenter'};
  $('#'+id).focus(); document.execCommand(map[dir], false, null);
}
function rteLink(id){
  const url = prompt('آدرس لینک را وارد کنید (مثلاً https://example.com):');
  if (!url) return;
  $('#'+id).focus(); document.execCommand('createLink', false, url);
}
function rteValue(id){ const el=$('#'+id); return el ? el.innerHTML : ''; }

/* ============================================================
   NEWS
   ============================================================ */
function renderNews(){
  const list = (DB.news||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  $('#content').innerHTML = `
    <div class="sec-top">
      <div><h2>اخبار و رویدادها</h2><p>خبر جدید بسازید، ویرایش یا حذف کنید.</p></div>
      <button class="btn-add" onclick="editNews(null)">+ خبر جدید</button>
    </div>
    <div class="cards">
      ${list.length? list.map(n=>`
        <div class="row-card">
          <div class="thumb-mini cat-${n.category}">${(n.categoryFa||'').charAt(0)}</div>
          <div class="row-main">
            <b>${n.titleFa||'(بدون عنوان)'}</b>
            <span class="muted">${n.dateFa||n.date||''} · ${n.categoryFa||''}</span>
          </div>
          <div class="row-acts">
            <button onclick="editNews('${n.id}')">ویرایش</button>
            <button class="danger" onclick="deleteNews('${n.id}')">حذف</button>
          </div>
        </div>`).join('') : `<p class="empty">هنوز خبری ثبت نشده. «خبر جدید» را بزنید.</p>`}
    </div>`;
}

function editNews(id){
  const n = id ? (DB.news||[]).find(x=>x.id===id) : {
    id: 'n-' + Date.now(),
    date: new Date().toISOString().slice(0,10),
    dateFa:'', category:'technology', categoryFa:'فناوری', categoryEn:'Technology',
    titleFa:'', titleEn:'', excerptFa:'', excerptEn:'', contentFa:'', contentEn:'', image:''
  };
  const isNew = !id;
  $('#content').innerHTML = `
    <div class="sec-top"><div><h2>${isNew?'خبر جدید':'ویرایش خبر'}</h2></div>
      <button class="btn-ghost2" onclick="renderNews()">بازگشت</button></div>
    <div class="form2">
      <div class="grid2">
        <div class="f"><label>عنوان (فارسی) *</label><input id="f-titleFa" value="${esc(n.titleFa)}"></div>
        <div class="f"><label>Title (English)</label><input id="f-titleEn" value="${esc(n.titleEn)}"></div>
      </div>
      <div class="grid3">
        <div class="f"><label>تاریخ (میلادی، برای مرتب‌سازی)</label><input id="f-date" type="date" value="${esc(n.date)}"></div>
        <div class="f"><label>تاریخ نمایشی (فارسی)</label><input id="f-dateFa" value="${esc(n.dateFa)}" placeholder="مثلاً ۱ خرداد ۱۴۰۵"></div>
        <div class="f"><label>دسته‌بندی</label>
          <select id="f-cat">
            <option value="technology">فناوری</option>
            <option value="sustainability">پایداری</option>
            <option value="event">رویداد / نمایشگاه</option>
            <option value="press">رسانه / مصاحبه</option>
          </select>
        </div>
      </div>
      <div class="grid2">
        <div class="f"><label>خلاصه (فارسی)</label><textarea id="f-exFa" rows="2">${esc(n.excerptFa)}</textarea></div>
        <div class="f"><label>Excerpt (English)</label><textarea id="f-exEn" rows="2">${esc(n.excerptEn)}</textarea></div>
      </div>
      <div class="f"><label>متن کامل (فارسی)</label>${richEditor('rte-coFa', n.contentFa)}</div>
      <div class="f"><label>Full text (English)</label>${richEditor('rte-coEn', n.contentEn)}</div>
      <div class="f">
        <label>تصویر خبر</label>
        ${uploadField('f-img', n.image, 'news')}
      </div>
      <div class="form-acts">
        <button class="btn-save" onclick="saveNews('${n.id}', ${isNew})">ذخیره خبر</button>
        <button class="btn-ghost2" onclick="renderNews()">انصراف</button>
      </div>
    </div>`;
  $('#f-cat').value = n.category || 'technology';
}

function saveNews(id, isNew){
  const catMap = { technology:['فناوری','Technology'], sustainability:['پایداری','Sustainability'], event:['رویداد','Event'], press:['رسانه','Press'] };
  const cat = $('#f-cat').value;
  const obj = {
    id,
    date: $('#f-date').value,
    dateFa: $('#f-dateFa').value,
    category: cat,
    categoryFa: catMap[cat][0],
    categoryEn: catMap[cat][1],
    titleFa: $('#f-titleFa').value,
    titleEn: $('#f-titleEn').value,
    excerptFa: $('#f-exFa').value,
    excerptEn: $('#f-exEn').value,
    contentFa: rteValue('rte-coFa'),
    contentEn: rteValue('rte-coEn'),
    image: $('#f-img').value
  };
  if (!obj.titleFa.trim()){ alert('عنوان فارسی الزامی است.'); return; }
  DB.news = DB.news || [];
  if (isNew) DB.news.unshift(obj);
  else { const i = DB.news.findIndex(x=>x.id===id); if(i>-1) DB.news[i]=obj; }
  persist();
  renderNews();
}

function deleteNews(id){
  if(!confirm('این خبر حذف شود؟')) return;
  DB.news = (DB.news||[]).filter(x=>x.id!==id);
  persist();
  renderNews();
}

/* ============================================================
   PRODUCTS (admin only)
   ============================================================ */
function renderProducts(){
  $('#content').innerHTML = `
    <div class="sec-top"><div><h2>محصولات</h2><p>سری‌های دستگاه را ویرایش کنید.</p></div></div>
    <div class="cards">
      ${(DB.products||[]).map(p=>`
        <div class="row-card">
          <div class="thumb-mini" style="background:#0a1f3a">PA</div>
          <div class="row-main"><b>${p.nameFa}</b><span class="muted">${p.tagline} · ${p.tonnageFa}</span></div>
          <div class="row-acts"><button onclick="editProduct('${p.id}')">ویرایش</button></div>
        </div>`).join('')}
    </div>`;
}
function editProduct(id){
  const p = (DB.products||[]).find(x=>x.id===id); if(!p) return;
  $('#content').innerHTML = `
    <div class="sec-top"><div><h2>ویرایش: ${p.nameFa}</h2></div><button class="btn-ghost2" onclick="renderProducts()">بازگشت</button></div>
    <div class="form2">
      <div class="grid2">
        <div class="f"><label>نام (فارسی)</label><input id="p-nameFa" value="${esc(p.nameFa)}"></div>
        <div class="f"><label>Name (English)</label><input id="p-nameEn" value="${esc(p.nameEn)}"></div>
      </div>
      <div class="grid2">
        <div class="f"><label>توضیح کوتاه (فارسی)</label><textarea id="p-shortFa" rows="2">${esc(p.shortFa)}</textarea></div>
        <div class="f"><label>Short (English)</label><textarea id="p-shortEn" rows="2">${esc(p.shortEn)}</textarea></div>
      </div>
      <div class="grid2">
        <div class="f"><label>تناژ (فارسی)</label><input id="p-tonFa" value="${esc(p.tonnageFa)}"></div>
        <div class="f"><label>Tonnage (English)</label><input id="p-tonEn" value="${esc(p.tonnageEn)}"></div>
      </div>
      <div class="f"><label>توضیح کامل (فارسی)</label>${richEditor('rte-pDescFa', p.descriptionFa)}</div>
      <div class="f"><label>Description (English)</label>${richEditor('rte-pDescEn', p.descriptionEn)}</div>
      <div class="form-acts"><button class="btn-save" onclick="saveProduct('${p.id}')">ذخیره</button><button class="btn-ghost2" onclick="renderProducts()">انصراف</button></div>
    </div>`;
}
function saveProduct(id){
  const p = (DB.products||[]).find(x=>x.id===id); if(!p) return;
  p.nameFa=$('#p-nameFa').value; p.nameEn=$('#p-nameEn').value;
  p.shortFa=$('#p-shortFa').value; p.shortEn=$('#p-shortEn').value;
  p.tonnageFa=$('#p-tonFa').value; p.tonnageEn=$('#p-tonEn').value;
  p.descriptionFa=rteValue('rte-pDescFa'); p.descriptionEn=rteValue('rte-pDescEn');
  persist(); renderProducts();
}

/* ============================================================
   SERVICES (admin only)
   ============================================================ */
function renderServices(){
  $('#content').innerHTML = `
    <div class="sec-top"><div><h2>خدمات</h2><p>متن خدمات پس از فروش را ویرایش کنید.</p></div></div>
    <div class="cards">
      ${(DB.services||[]).map((s,i)=>`
        <div class="row-card">
          <div class="row-main">
            <input value="${esc(s.titleFa)}" onchange="DB.services[${i}].titleFa=this.value">
            <textarea rows="2" onchange="DB.services[${i}].descFa=this.value" style="margin-top:6px">${esc(s.descFa)}</textarea>
          </div>
        </div>`).join('')}
    </div>
    <div class="form-acts"><button class="btn-save" onclick="persist()">ذخیره تغییرات خدمات</button></div>`;
}

/* ============================================================
   GALLERY
   ============================================================ */
function renderGallery(){
  const g = SIZE_GUIDES.gallery;
  $('#content').innerHTML = `
    <div class="sec-top"><div><h2>گالری</h2><p>عکس‌های خط تولید، نمایشگاه‌ها و خدمات.</p></div>
      <button class="btn-add" onclick="addGallery()">+ تصویر جدید</button></div>
    <div class="up-guide" style="margin-bottom:18px">
      <span>📐 ابعاد پیشنهادی برای تصاویر گالری: <b>${g.wFa} × ${g.hFa}</b> پیکسل (نسبت ${g.ratio})</span>
      <span>📁 حداکثر حجم: <b>${g.sizeKB} KB</b></span>
      <span>🖼️ فرمت: <b>${g.fmt}</b></span>
    </div>
    <div class="gal-admin">
      ${(DB.gallery||[]).map(g=>`
        <div class="gal-admin-item">
          <div class="ph">${g.image?`<img src="${esc(g.image)}">`:'🖼️'}</div>
          <input value="${esc(g.captionFa)}" onchange="setGalCap('${g.id}',this.value)" placeholder="توضیح تصویر">
          <button class="danger small" onclick="delGallery('${g.id}')">حذف</button>
        </div>`).join('')}
    </div>`;
}
function addGallery(){
  const id='g-'+Date.now();
  const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*';
  inp.onchange=()=>{ const f=inp.files[0]; if(!f) return; const rd=new FileReader();
    rd.onload=()=>{ DB.gallery=DB.gallery||[]; DB.gallery.unshift({id,captionFa:'تصویر جدید',captionEn:'New image',category:'production',image:rd.result}); persist(); renderGallery(); };
    rd.readAsDataURL(f); };
  inp.click();
}
function setGalCap(id,v){ const g=(DB.gallery||[]).find(x=>x.id===id); if(g){g.captionFa=v; persist();} }
function delGallery(id){ if(!confirm('حذف شود؟'))return; DB.gallery=(DB.gallery||[]).filter(x=>x.id!==id); persist(); renderGallery(); }

/* ============================================================
   ABOUT (admin only) — with rich editor
   ============================================================ */
function renderAbout(){
  const a = DB.about||{};
  $('#content').innerHTML = `
    <div class="sec-top"><div><h2>درباره ما</h2><p>متن معرفی شرکت را ویرایش کنید.</p></div></div>
    <div class="form2">
      <div class="f"><label>داستان شرکت (فارسی)</label>${richEditor('rte-aFa', a.storyFa)}</div>
      <div class="f"><label>Company story (English)</label>${richEditor('rte-aEn', a.storyEn)}</div>
      <div class="form-acts"><button class="btn-save" onclick="saveAbout()">ذخیره</button></div>
    </div>`;
}
function saveAbout(){ DB.about=DB.about||{}; DB.about.storyFa=rteValue('rte-aFa'); DB.about.storyEn=rteValue('rte-aEn'); persist(); }

/* ============================================================
   CONTACT (admin only) — with hero video setting too
   ============================================================ */
function renderContact(){
  const c = (DB.site && DB.site.contact) || {};
  const s = c.social || {};
  const hero = (DB.home && DB.home.hero) || {};
  const heroVideo = hero.video || '';
  $('#content').innerHTML = `
    <div class="sec-top"><div><h2>اطلاعات تماس و تنظیمات سایت</h2></div></div>
    <div class="form2">
      <div class="grid2">
        <div class="f"><label>تلفن (برای لینک تماس)</label><input id="c-phone" value="${esc(c.phone)}"></div>
        <div class="f"><label>تلفن نمایشی (فارسی)</label><input id="c-phoneFa" value="${esc(c.phoneDisplay&&c.phoneDisplay.fa)}"></div>
      </div>
      <div class="grid2">
        <div class="f"><label>ایمیل</label><input id="c-email" value="${esc(c.email)}"></div>
        <div class="f"><label>واتس‌اپ (با کد کشور، مثلاً 98912...)</label><input id="c-wa" value="${esc(c.whatsapp)}"></div>
      </div>
      <div class="grid2">
        <div class="f"><label>آدرس (فارسی)</label><input id="c-addrFa" value="${esc(c.address&&c.address.fa)}"></div>
        <div class="f"><label>Address (English)</label><input id="c-addrEn" value="${esc(c.address&&c.address.en)}"></div>
      </div>
      <h3 style="margin:24px 0 6px;font-size:15px">شبکه‌های اجتماعی (لینک کامل)</h3>
      <div class="grid3">
        <div class="f"><label>اینستاگرام</label><input id="c-ig" value="${esc(s.instagram)}"></div>
        <div class="f"><label>لینکدین</label><input id="c-li" value="${esc(s.linkedin)}"></div>
        <div class="f"><label>تلگرام</label><input id="c-tg" value="${esc(s.telegram)}"></div>
      </div>
      <div class="grid2">
        <div class="f"><label>یوتیوب</label><input id="c-yt" value="${esc(s.youtube)}"></div>
        <div class="f"><label>واتس‌اپ (لینک)</label><input id="c-wal" value="${esc(s.whatsapp)}"></div>
      </div>

      <h3 style="margin:30px 0 6px;font-size:15px">نوشته‌ی بزرگ صفحه اصلی (Hero)</h3>
      <div class="up-guide">
        <span class="up-tip">دو خط بزرگ وسط صفحه‌ی اصلی. هر خط را کوتاه بنویسید (ترجیحاً یک کلمه) تا در موبایل هم کامل جا شود. خالی بگذارید تا مقدار پیش‌فرض استفاده شود.</span>
      </div>
      <div class="grid2">
        <div class="f"><label>خط اول (فارسی)</label><input id="c-hero-w1fa" value="${esc(hero.wordmark1Fa)}" placeholder="پارسیان"></div>
        <div class="f"><label>Line 1 (English)</label><input id="c-hero-w1en" value="${esc(hero.wordmark1En)}" placeholder="PARSIAN" dir="ltr"></div>
      </div>
      <div class="grid2">
        <div class="f"><label>خط دوم (فارسی)</label><input id="c-hero-w2fa" value="${esc(hero.wordmark2Fa)}" placeholder="ماشین‌سازی"></div>
        <div class="f"><label>Line 2 (English)</label><input id="c-hero-w2en" value="${esc(hero.wordmark2En)}" placeholder="MACHINERY" dir="ltr"></div>
      </div>

      <h3 style="margin:30px 0 6px;font-size:15px">دستگاه‌های صفحه اصلی (نمایش چرخشی)</h3>
      <div class="up-guide">
        <span>📐 عرض پیشنهادی: <b>${SIZE_GUIDES.heroImg.wFa}</b> پیکسل (${SIZE_GUIDES.heroImg.ratio})</span>
        <span>📁 حداکثر حجم: <b>${SIZE_GUIDES.heroImg.sizeKB} KB</b></span>
        <span>🖼️ فرمت: <b>${SIZE_GUIDES.heroImg.fmt}</b></span>
        <span class="up-tip">${SIZE_GUIDES.heroImg.hintFa}</span>
      </div>
      <div class="f" style="max-width:260px">
        <label>زمان نمایش هر دستگاه (ثانیه)</label>
        <input id="c-hero-secs" type="number" min="2" max="30" step="1" value="${esc(hero.machineSeconds || 4)}" dir="ltr">
      </div>
      <div class="cards" id="hero-machines">${heroMachinesFor(hero).map(heroMachineRow).join('')}</div>
      <button type="button" class="btn-ghost2" style="margin:12px 0 6px" onclick="addHeroMachine()">+ افزودن دستگاه</button>
      <p class="muted" style="margin:4px 0 0">ردیف‌هایی که مسیر تصویر PNG ندارند ذخیره نمی‌شوند. اگر همه‌ی ردیف‌ها حذف شوند، سایت فهرست پیش‌فرض را نشان می‌دهد.</p>

      <h3 style="margin:30px 0 6px;font-size:15px">ویدیوی صفحه اصلی (Hero)</h3>
      <div class="up-guide">
        <span>📐 ابعاد پیشنهادی: <b>${SIZE_GUIDES.hero.wFa} × ${SIZE_GUIDES.hero.hFa}</b> پیکسل (Full HD)</span>
        <span>⏱️ مدت زمان: <b>۵ تا ۱۵ ثانیه</b> (تکرار می‌شود)</span>
        <span>📁 حداکثر حجم: <b>۵ مگابایت</b></span>
        <span>🎬 فرمت: <b>${SIZE_GUIDES.hero.fmt}</b></span>
        <span class="up-tip">${SIZE_GUIDES.hero.hintFa}</span>
      </div>
      <div class="f">
        <label>نام فایل ویدیو (در پوشه website بگذارید — مثلاً hero.mp4)</label>
        <input id="c-hero-video" value="${esc(heroVideo)}" placeholder="hero.mp4">
        <p class="muted" style="margin-top:6px">برای حذف ویدیو، این فیلد را خالی کنید — پس‌زمینه به حالت پیش‌فرض (زمینه‌ی سرمه‌ای با تصویر دستگاه) برمی‌گردد.</p>
      </div>

      <div class="form-acts"><button class="btn-save" onclick="saveContact()">ذخیره تنظیمات</button></div>
    </div>`;
}
function saveContact(){
  DB.site=DB.site||{}; DB.site.contact=DB.site.contact||{};
  const c=DB.site.contact;
  c.phone=$('#c-phone').value;
  c.phoneDisplay=c.phoneDisplay||{}; c.phoneDisplay.fa=$('#c-phoneFa').value; c.phoneDisplay.en=$('#c-phone').value;
  c.email=$('#c-email').value; c.whatsapp=$('#c-wa').value;
  c.address=c.address||{}; c.address.fa=$('#c-addrFa').value; c.address.en=$('#c-addrEn').value;
  c.social=c.social||{};
  c.social.instagram=$('#c-ig').value; c.social.linkedin=$('#c-li').value; c.social.telegram=$('#c-tg').value;
  c.social.youtube=$('#c-yt').value; c.social.whatsapp=$('#c-wal').value;
  DB.home = DB.home || {}; DB.home.hero = DB.home.hero || {};
  const hero = DB.home.hero;
  hero.video = $('#c-hero-video').value.trim();
  // left blank, each of these falls back to the built-in default on the site
  hero.wordmark1Fa = $('#c-hero-w1fa').value.trim();
  hero.wordmark1En = $('#c-hero-w1en').value.trim();
  hero.wordmark2Fa = $('#c-hero-w2fa').value.trim();
  hero.wordmark2En = $('#c-hero-w2en').value.trim();
  hero.machines = $$('#hero-machines .hm-row').map(r => ({
    model:     r.querySelector('.hm-model').value.trim(),
    image:     r.querySelector('.hm-img').value.trim(),
    imageWebp: r.querySelector('.hm-webp').value.trim(),
    url:       r.querySelector('.hm-url').value.trim()
  })).filter(m => m.image);
  const secs = parseFloat($('#c-hero-secs').value);
  hero.machineSeconds = Number.isFinite(secs) ? Math.min(Math.max(secs, 2), 30) : 4;
  // single-machine fields from before the rotator — the list replaces them
  ['image','imageWebp','imageAltFa','imageAltEn','imageUrl'].forEach(k => delete hero[k]);
  persist();
}

/* ---- hero machine list (rotating line-up on the home page) ---- */
function heroMachinesFor(hero){
  if (Array.isArray(hero.machines) && hero.machines.length) return hero.machines;
  // same line-up as defaultHeroMachines() in site.js — keep the two in sync
  return [
    ['pa-1300', 'PA-1300/12300', 'two-platen'], ['pa-500', 'PA-500/2800', 'standard'],
    ['pa-800',  'PA-800/5600',   'two-platen'], ['pa-300', 'PA-300/1100', 'high-speed'],
    ['pa-200',  'PA-200/620',    'pet'],        ['pa-100', 'PA-100/250',  'standard']
  ].map(([f, model, id]) => ({ model, image: `assets/img/hero/${f}.png`,
    imageWebp: `assets/img/hero/${f}.webp`, url: `product.html?id=${id}` }));
}
function heroMachineRow(m){
  m = m || {};
  const src = m.imageWebp || m.image;
  return `
    <div class="row-card hm-row">
      <div class="hm-thumb">${src ? `<img src="${esc(src)}" alt="">` : ''}</div>
      <div class="row-main">
        <div class="grid2">
          <div class="f"><label>مدل</label><input class="hm-model" value="${esc(m.model)}" placeholder="PA-1300/12300" dir="ltr"></div>
          <div class="f"><label>لینک با کلیک روی دستگاه</label><input class="hm-url" value="${esc(m.url)}" placeholder="product.html?id=two-platen" dir="ltr"></div>
        </div>
        <div class="grid2">
          <div class="f"><label>مسیر تصویر PNG</label><input class="hm-img" value="${esc(m.image)}" placeholder="assets/img/hero/pa-1300.png" dir="ltr" oninput="refreshHeroThumb(this)"></div>
          <div class="f"><label>مسیر WebP (اختیاری، سبک‌تر)</label><input class="hm-webp" value="${esc(m.imageWebp)}" placeholder="assets/img/hero/pa-1300.webp" dir="ltr" oninput="refreshHeroThumb(this)"></div>
        </div>
      </div>
      <div class="row-acts hm-acts">
        <button type="button" class="small" title="بالا" onclick="moveHeroMachine(this,-1)">▲</button>
        <button type="button" class="small" title="پایین" onclick="moveHeroMachine(this,1)">▼</button>
        <button type="button" class="small danger" onclick="this.closest('.hm-row').remove()">حذف</button>
      </div>
    </div>`;
}
function addHeroMachine(){
  $('#hero-machines').insertAdjacentHTML('beforeend', heroMachineRow({}));
  const rows = $$('#hero-machines .hm-row');
  rows[rows.length - 1].querySelector('.hm-model').focus();
}
function moveHeroMachine(btn, dir){
  const row = btn.closest('.hm-row');
  const sib = dir < 0 ? row.previousElementSibling : row.nextElementSibling;
  if (sib) row.parentNode.insertBefore(row, dir < 0 ? sib : sib.nextSibling);
}
function refreshHeroThumb(input){
  const row = input.closest('.hm-row');
  const src = row.querySelector('.hm-webp').value.trim() || row.querySelector('.hm-img').value.trim();
  row.querySelector('.hm-thumb').innerHTML = src ? `<img src="${esc(src)}" alt="">` : '';
}

/* ============================================================
   helpers + publish
   ============================================================ */
function esc(v){ return (v==null?'':String(v)).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function onImg(input, previewId, hiddenId, guideKey){
  const f = input.files[0]; if(!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    $('#'+hiddenId).value = rd.result;
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      const kb = Math.round(f.size/1024);
      const g = SIZE_GUIDES[guideKey] || null;
      let badge = '';
      if (g) {
        const okW = w >= g.wFa * 0.85;
        const okH = h >= g.hFa * 0.85;
        const okSize = kb <= g.sizeKB * 1.5;
        const all = okW && okH && okSize;
        const cls = all ? 'ok' : 'warn';
        const tip = all
          ? '✓ ابعاد و حجم مناسب است.'
          : `⚠ توصیه: حداقل ${g.wFa}×${g.hFa} و حداکثر ${g.sizeKB} کیلوبایت.`;
        badge = `<div class="up-feedback ${cls}">ابعاد فعلی: <b>${w}×${h}</b> پیکسل · حجم: <b>${kb} KB</b><br><span>${tip}</span></div>`;
      } else {
        badge = `<div class="up-feedback">ابعاد فعلی: <b>${w}×${h}</b> پیکسل · حجم: <b>${kb} KB</b></div>`;
      }
      $('#'+previewId).innerHTML = `<img src="${rd.result}">${badge}`;
    };
    img.src = rd.result;
  };
  rd.readAsDataURL(f);
}

/* Render a labeled image upload block with a "recommended size" hint */
function uploadField(id, currentValue, guideKey){
  const g = SIZE_GUIDES[guideKey];
  const guide = g ? `
    <div class="up-guide">
      <span>📐 ابعاد پیشنهادی: <b>${g.wFa} × ${g.hFa}</b> پیکسل (نسبت ${g.ratio})</span>
      <span>📁 حداکثر حجم: <b>${g.sizeKB < 1024 ? g.sizeKB + ' KB' : Math.round(g.sizeKB/1024) + ' MB'}</b></span>
      <span>🖼️ فرمت: <b>${g.fmt}</b></span>
      <span class="up-tip">${g.hintFa}</span>
    </div>` : '';
  const preview = currentValue
    ? `<img src="${esc(currentValue)}"><div class="up-feedback">تصویر موجود — برای جایگزینی، فایل جدید انتخاب کنید.</div>`
    : `<span class="muted">تصویری انتخاب نشده — می‌توانید بدون عکس هم ذخیره کنید</span>`;
  return `
    ${guide}
    <input type="file" accept="image/*" onchange="onImg(this,'${id}-preview','${id}','${guideKey||''}')">
    <input id="${id}" type="hidden" value="${esc(currentValue)}">
    <div class="imgprev" id="${id}-preview">${preview}</div>`;
}

function publishDownload(){
  const blob = new Blob([JSON.stringify(DB, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(a.href);
  flash('فایل data.json دانلود شد. آن را جایگزین فایل قبلی روی هاست کنید.');
}

function resetLocal(){
  if(!confirm('تغییرات ذخیره‌شده در این مرورگر پاک شود و از data.json اصلی بارگذاری شود؟')) return;
  localStorage.removeItem('parsian_cms_data');
  location.reload();
}

function logout(){ sessionStorage.removeItem('parsian_admin_user'); location.reload(); }
