// ===== 個人網站互動腳本 =====

// 等待 DOM 載入完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 網站已載入完成！');
    
    // 初始化所有功能
    initNavigation();
    initAnimations();
    initScrollEffects();
    initThemeToggle();
    initContactForm();
    initProjectFilters();
    initTypingEffect();
});

// ===== 導航欄功能 =====
function initNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
        
        // 平滑滾動效果（針對錨點連結）
        if (href.startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    });
}

// ===== 動畫效果 =====
function initAnimations() {
    // 為頁面元素添加進場動畫
    const animateElements = document.querySelectorAll('.animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// ===== 滾動效果 =====
function initScrollEffects() {
    let lastScroll = 0;
    const nav = document.querySelector('nav');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // 向下滾動時添加陰影效果
        if (currentScroll > 50) {
            nav?.classList.add('scrolled');
        } else {
            nav?.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // 返回頂部按鈕
    createBackToTopButton();
}

// ===== 返回頂部按鈕 =====
function createBackToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'back-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #3498db;
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 10px rgba(52,152,219,0.3);
    `;
    
    document.body.appendChild(button);
    
    // 滾動時顯示/隱藏按鈕
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });
    
    // 點擊返回頂部
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // 懸停效果
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
        button.style.background = '#2980b9';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.background = '#3498db';
    });
}

// ===== 主題切換功能（深色/淺色模式）=====
function initThemeToggle() {
    // 檢查是否已有保存的主題偏好
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // 創建主題切換按鈕（可選）
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // 更新按鈕圖示
            themeToggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
        });
        
        // 設定初始圖示
        themeToggle.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

// ===== 聯絡表單處理 =====
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name')?.value,
                email: document.getElementById('email')?.value,
                subject: document.getElementById('subject')?.value,
                message: document.getElementById('message')?.value
            };
            
            // 顯示載入狀態
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading"></span> 發送中...';
            submitBtn.disabled = true;
            
            // 模擬發送（實際使用時需要連接後端 API）
            setTimeout(() => {
                showNotification('訊息已發送成功！我會盡快回覆您。', 'success');
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
            
            console.log('表單數據：', formData);
        });
        
        // 即時表單驗證
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(this.value)) {
                    showFieldError(this, '請輸入有效的電子郵件地址');
                } else {
                    clearFieldError(this);
                }
            });
        }
    }
}

// ===== 表單驗證輔助函數 =====
function showFieldError(field, message) {
    clearFieldError(field);
    field.style.borderColor = '#f44336';
    const error = document.createElement('span');
    error.className = 'field-error';
    error.style.cssText = 'color: #f44336; font-size: 0.85em; margin-top: 5px; display: block;';
    error.textContent = message;
    field.parentNode.appendChild(error);
}

function clearFieldError(field) {
    field.style.borderColor = '#e1e8ed';
    const error = field.parentNode.querySelector('.field-error');
    if (error) error.remove();
}

// ===== 通知訊息 =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // 3 秒後自動移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== 專案篩選功能 =====
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // 更新按鈕狀態
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 篩選專案
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ===== 打字機效果 =====
function initTypingEffect() {
    const typingElements = document.querySelectorAll('.typing-effect');
    
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid #3498db';
        element.style.paddingRight = '5px';
        
        let index = 0;
        const interval = setInterval(() => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(interval);
                // 閃爍游標效果
                setInterval(() => {
                    element.style.borderRightColor = 
                        element.style.borderRightColor === 'transparent' ? '#3498db' : 'transparent';
                }, 500);
            }
        }, 100);
    });
}

// ===== 技能進度條動畫 =====
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.getAttribute('data-width');
                bar.style.width = width + '%';
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => {
        bar.style.width = '0%';
        bar.style.transition = 'width 1.5s ease';
        observer.observe(bar);
    });
}

// ===== 圖片懶載入 =====
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ===== 複製到剪貼簿功能 =====
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('已複製到剪貼簿！', 'success');
    }).catch(err => {
        console.error('複製失敗：', err);
        showNotification('複製失敗，請手動複製', 'error');
    });
}

// ===== 添加複製按鈕到程式碼區塊 =====
function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        const button = document.createElement('button');
        button.textContent = '複製';
        button.className = 'copy-btn';
        button.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            padding: 5px 10px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.8em;
        `;
        
        const pre = block.parentElement;
        pre.style.position = 'relative';
        pre.appendChild(button);
        
        button.addEventListener('click', () => {
            copyToClipboard(block.textContent);
            button.textContent = '已複製！';
            setTimeout(() => button.textContent = '複製', 2000);
        });
    });
}

// ===== 深色模式 CSS =====
const darkModeStyles = `
    [data-theme="dark"] {
        --primary-color: #1a252f;
        --secondary-color: #2c3e50;
        --accent-color: #3498db;
        --bg-color: #0f1419;
        --text-color: #e1e8ed;
        --light-text: #8899a6;
        --border-color: #38444d;
    }
    
    [data-theme="dark"] body {
        background-color: var(--bg-color);
        color: var(--text-color);
    }
    
    [data-theme="dark"] .card,
    [data-theme="dark"] .project-card,
    [data-theme="dark"] .friend-card {
        background: #192734;
        color: var(--text-color);
    }
    
    [data-theme="dark"] nav {
        background: var(--primary-color);
    }
    
    [data-theme="dark"] footer {
        background: #192734;
        color: var(--light-text);
    }
`;

// 添加深色模式樣式到頁面
const styleSheet = document.createElement('style');
styleSheet.textContent = darkModeStyles;
document.head.appendChild(styleSheet);

// ===== 動畫 CSS（添加到頁面）=====
const animationStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;

const animationSheet = document.createElement('style');
animationSheet.textContent = animationStyles;
document.head.appendChild(animationSheet);

// ===== 工具函數：格式化日期 =====
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('zh-TW', options);
}

// ===== 工具函數：節流 =====
function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return function(...args) {
        const currentTime = Date.now();
        const timeSinceLastExec = currentTime - lastExecTime;
        
        if (timeSinceLastExec >= delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - timeSinceLastExec);
        }
    };
}

// ===== 工具函數：防抖 =====
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// ===== 導出函數供全域使用 =====
window.showNotification = showNotification;
window.copyToClipboard = copyToClipboard;
window.formatDate = formatDate;

console.log('✨ 所有互動功能已初始化完成！');
