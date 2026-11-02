/**
 * C. Y. — Paper
 * 主題切換、行動選單、進場動態、標籤篩選、複製、表單
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initReveal();
  initActiveNav();
  initTagFilter();
  initCopyButtons();
  initContactForm();
  initTocIds();
});

/* ---------- 主題 ---------- */
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const root = document.documentElement;

  const saved = localStorage.getItem('cy_theme');
  const initial = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(initial);

  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('cy_theme', theme);

    if (!btn) return;

    if (theme === 'dark') {
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg>';
      btn.setAttribute('aria-label', '切換淺色模式');
      btn.setAttribute('title', '切換淺色模式');
    } else {
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>';
      btn.setAttribute('aria-label', '切換深色模式');
      btn.setAttribute('title', '切換深色模式');
    }
  }
}

/* ---------- 行動選單 ---------- */
function initMobileNav() {
  const btn = document.getElementById('mobile-menu-toggle');
  const nav = document.getElementById('nav-links');
  if (!btn || !nav) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- 進場動態 ---------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((el) => el.classList.add('active'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  items.forEach((el) => io.observe(el));
}

/* ---------- 導覽高亮 ---------- */
function initActiveNav() {
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = (link.getAttribute('href') || '').split('/').pop().toLowerCase();
    if (href === page) link.classList.add('active');
  });
}

/* ---------- 標籤篩選（部落格列表） ---------- */
function initTagFilter() {
  const bar = document.getElementById('filter-bar');
  const list = document.getElementById('post-list');
  const empty = document.getElementById('empty-state');
  if (!bar || !list) return;

  const items = Array.from(list.querySelectorAll('.post-item'));
  if (!items.length) return;

  // 從每篇文章的 data-tags 收集標籤，依出現次數排序
  const counts = new Map();
  items.forEach((item) => {
    (item.dataset.tags || '').split(/\s+/).filter(Boolean).forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  if (!counts.size) return;

  const tags = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant'))
    .map(([tag]) => tag);

  bar.innerHTML = '';
  bar.appendChild(makeBtn('全部', 'all', true));
  tags.forEach((tag) => bar.appendChild(makeBtn(tag, tag, false)));

  function makeBtn(label, value, active) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn' + (active ? ' active' : '');
    btn.dataset.filter = value;
    btn.textContent = label;
    btn.setAttribute('aria-pressed', String(active));
    btn.addEventListener('click', () => filter(value, btn));
    return btn;
  }

  function filter(value, btn) {
    bar.querySelectorAll('.filter-btn').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');

    let shown = 0;
    items.forEach((item) => {
      const tagsOfItem = (item.dataset.tags || '').split(/\s+/).filter(Boolean);
      const match = value === 'all' || tagsOfItem.includes(value);
      item.hidden = !match;
      if (match) shown++;
    });

    if (empty) empty.hidden = shown !== 0;
  }

  // 支援以網址參數預選標籤，例如 blog.html?tag=TDX
  const preset = new URLSearchParams(location.search).get('tag');
  if (preset) {
    const target = bar.querySelector(`[data-filter="${CSS.escape(preset)}"]`);
    if (target) target.click();
  }
}

/* ---------- 複製 ---------- */
function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(text);
        toast('已複製：' + text);
      } catch {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
        toast('已複製：' + text);
      }
    });
  });
}

function toast(message) {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:28px',
      'transform:translate(-50%,16px)',
      'background:var(--ink)',
      'color:var(--paper)',
      'font-family:var(--serif)',
      'font-size:13px',
      'padding:11px 18px',
      'border:1px solid var(--rule-strong)',
      'border-radius:2px',
      'z-index:1000',
      'opacity:0',
      'pointer-events:none',
      'transition:opacity .3s var(--ease),transform .3s var(--ease)'
    ].join(';');
    document.body.appendChild(el);
  }

  el.textContent = message;
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%,0)';
  });

  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translate(-50%,16px)';
  }, 2600);
}

/* ---------- 聯絡表單 ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const label = btn ? btn.textContent : '';

    if (btn) {
      btn.disabled = true;
      btn.textContent = '寄送中…';
    }

    setTimeout(() => {
      toast('訊息已送出（示範模式）');
      form.reset();
      if (btn) {
        btn.disabled = false;
        btn.textContent = label;
      }
    }, 700);
  });
}

/* ---------- 目錄錨點與平滑捲動 ---------- */
function initTocIds() {
  const toc = document.querySelector('.toc');
  if (!toc) return;

  toc.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
      history.replaceState(null, '', '#' + id);
    });
  });
}
