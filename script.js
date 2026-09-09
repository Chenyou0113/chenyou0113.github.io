/**
 * Portfolio Core JavaScript
 * Features: Dark/Light Mode, Floating Navbar, Scroll Reveal, Project Filters, Copy to Clipboard, Form Feedback
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileNav();
    initScrollReveal();
    initActiveNav();
    initProjectFilters();
    initCopyButtons();
    initContactForm();
});

/* --- 1. 主題切換 (Theme Toggle) --- */
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // 檢查 LocalStorage（若無儲存，一律預設為淺色模式）
    const savedTheme = localStorage.getItem('cy_theme');
    const initialTheme = savedTheme || 'light';
    
    document.documentElement.setAttribute('data-theme', initialTheme);
    updateToggleIcon(initialTheme);

    // 點擊切換
    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('cy_theme', newTheme);
        updateToggleIcon(newTheme);
    });
}

function updateToggleIcon(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    if (theme === 'dark') {
        // 太陽圖示 (切換回明亮)
        toggleBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        `;
        toggleBtn.setAttribute('title', '切換為明亮模式');
        toggleBtn.setAttribute('aria-label', '切換為明亮模式');
    } else {
        // 月亮圖示 (切換為深色)
        toggleBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;
        toggleBtn.setAttribute('title', '切換為深色模式');
        toggleBtn.setAttribute('aria-label', '切換為深色模式');
    }
}

/* --- 2. 手機版選單切換 (Mobile Nav Toggle) --- */
function initMobileNav() {
    const mobileBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (!mobileBtn || !navLinks) return;

    mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('open');
    });

    // 點擊空白處自動關閉
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !mobileBtn.contains(e.target)) {
            navLinks.classList.remove('open');
        }
    });
}

/* --- 3. 滾動進場動畫 (Scroll Reveal) --- */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // 一旦觸發便取消監聽，節省效能
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/* --- 4. 導覽列當前項目高亮 (Active Nav Highlight) --- */
function initActiveNav() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === page || (page === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/* --- 5. 專案篩選功能 (Project Filter Tabs) --- */
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.filterable-project');
    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 切換按鈕 active 狀態
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

/* --- 6. 一鍵複製功能 (Copy to Clipboard) --- */
function initCopyButtons() {
    const copyBtns = document.querySelectorAll('[data-copy]');
    if (!copyBtns.length) return;

    copyBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const textToCopy = btn.getAttribute('data-copy');
            try {
                await navigator.clipboard.writeText(textToCopy);
                showToast(`已複製：${textToCopy}`);
            } catch (err) {
                // Fallback
                const tempInput = document.createElement('input');
                tempInput.value = textToCopy;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                showToast(`已複製：${textToCopy}`);
            }
        });
    });
}

/* 輕量 Toast 提示框 */
function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: var(--color-surface-glass);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--color-border-glass);
            color: var(--color-text-main);
            padding: 12px 24px;
            border-radius: var(--radius-pill);
            box-shadow: var(--shadow-lg);
            font-size: 0.9rem;
            font-weight: 600;
            z-index: 1000;
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
            opacity: 0;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        toast.style.opacity = '0';
    }, 2800);
}

/* --- 7. 聯絡表單互動 (Contact Form) --- */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = '發送中...';

        setTimeout(() => {
            showToast('訊息已成功模擬送出！我會盡快回覆您 😊');
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 800);
    });
}
