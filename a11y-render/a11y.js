/*!
 * MasterCode Accessibility Tool v3.0 PRO
 * תקן ת"י 5568 + WCAG 2.1 AA + ADA + Section 508
 * 
 * כלי נגישות מלא להטמעה באתרים
 * פותח על ידי מאסטר קוד - https://yairmaster.info
 * 
 * השימוש המסחרי מותר בכפוף לרישיון
 * 
 * @license Commercial
 * @version 3.0.0
 */

(function() {
    'use strict';
    
    // ===== מניעת טעינה כפולה =====
    if (window.MC_A11Y_LOADED) {
        console.warn('[MC A11Y] כבר טעון - מדלג על טעינה נוספת');
        return;
    }
    window.MC_A11Y_LOADED = true;
    
    // ===== קבועים ===== 
    const CONFIG = {
        PREFIX: 'mc-a11y',
        VERSION: '3.0.0',
        MIN_FONT: 80,
        MAX_FONT: 200,
        FONT_STEP: 10,
        STORAGE_KEY: 'mcAccessibilitySettings',
        BRAND_NAME: 'מאסטר קוד',
        BRAND_URL: 'https://yairmaster.info/'
    };
    
    // קבלת פרמטרים מה-script tag
    const scriptTag = document.currentScript || document.querySelector('script[src*="a11y.js"]');
    const SITE_ID = scriptTag ? scriptTag.getAttribute('data-site') : null;
    const ALLOWED_DOMAIN = scriptTag ? scriptTag.getAttribute('data-domain') : null;
    
    // בדיקת הגבלת דומיין (אופציונלי)
    if (ALLOWED_DOMAIN && location.hostname !== ALLOWED_DOMAIN) {
        console.warn('[MC A11Y] דומיין לא מורשה:', location.hostname);
        return;
    }
    
    // ===== משתנים גלובליים =====
    let state = {
        fontSize: 100,
        speechEnabled: false,
        currentUtterance: null,
        menuOpen: false
    };
    
    // ===== הזרקת CSS =====
    function injectCSS() {
        const styleId = CONFIG.PREFIX + '-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
/* ===== MasterCode Accessibility Tool - נגישות מלאה PRO ===== */

/* תפריט נגישות פרימיום */
.${CONFIG.PREFIX}-toolbar {
    position: fixed;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif;
}

.${CONFIG.PREFIX}-toggle {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 20px 14px;
    border-radius: 0 20px 20px 0;
    cursor: pointer;
    font-size: 1.4rem;
    font-weight: 800;
    box-shadow: 5px 0 25px rgba(102, 126, 234, 0.5), 0 0 40px rgba(118, 75, 162, 0.3);
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    min-height: 200px;
    border-left: 5px solid rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(15px);
    position: relative;
    overflow: hidden;
}

.${CONFIG.PREFIX}-toggle::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: rotate(45deg);
    animation: ${CONFIG.PREFIX}-shimmer 3s infinite;
}

@keyframes ${CONFIG.PREFIX}-shimmer {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.${CONFIG.PREFIX}-toggle:hover {
    background: linear-gradient(135deg, #764ba2 0%, #f093fb 100%);
    transform: translateX(10px) translateY(-50%);
    box-shadow: 8px 0 35px rgba(118, 75, 162, 0.6), 0 0 50px rgba(240, 147, 251, 0.4);
    padding-left: 24px;
}

.${CONFIG.PREFIX}-toggle:focus {
    outline: 5px solid #ffd700 !important;
    outline-offset: 5px !important;
}

.${CONFIG.PREFIX}-toggle-icon {
    font-size: 2.4rem;
    animation: ${CONFIG.PREFIX}-pulse 2s ease-in-out infinite;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}

@keyframes ${CONFIG.PREFIX}-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
}

.${CONFIG.PREFIX}-menu {
    position: fixed;
    top: 50%;
    left: -450px;
    transform: translateY(-50%);
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 0 28px 28px 0;
    box-shadow: 10px 0 70px rgba(0, 0, 0, 0.25), 0 0 100px rgba(102, 126, 234, 0.2);
    padding: 30px;
    min-width: 380px;
    max-height: 90vh;
    overflow-y: auto;
    border: 4px solid #667eea;
    border-left: none;
    transition: left 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    backdrop-filter: blur(20px);
}

.${CONFIG.PREFIX}-menu.active {
    left: 0;
    animation: ${CONFIG.PREFIX}-menuSlideIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes ${CONFIG.PREFIX}-menuSlideIn {
    0% {
        left: -450px;
        opacity: 0;
    }
    100% {
        left: 0;
        opacity: 1;
    }
}

.${CONFIG.PREFIX}-menu::-webkit-scrollbar {
    width: 12px;
}

.${CONFIG.PREFIX}-menu::-webkit-scrollbar-track {
    background: linear-gradient(180deg, #f1f1f1 0%, #e0e0e0 100%);
    border-radius: 10px;
}

.${CONFIG.PREFIX}-menu::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    border: 2px solid #f1f1f1;
}

.${CONFIG.PREFIX}-menu::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #764ba2 0%, #f093fb 100%);
}

.${CONFIG.PREFIX}-menu-header {
    text-align: center;
    margin: -30px -30px 30px -30px;
    padding: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 0 28px 0 0;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    position: relative;
    overflow: hidden;
}

.${CONFIG.PREFIX}-menu-header::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: ${CONFIG.PREFIX}-headerGlow 4s infinite;
}

@keyframes ${CONFIG.PREFIX}-headerGlow {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(20px, 20px); }
}

.${CONFIG.PREFIX}-menu h3 {
    color: white;
    font-size: 1.8rem;
    margin: 0;
    font-weight: 900;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
    position: relative;
    z-index: 1;
}

.${CONFIG.PREFIX}-menu-subtitle {
    color: rgba(255, 255, 255, 0.95);
    font-size: 0.95rem;
    margin-top: 10px;
    font-weight: 600;
    position: relative;
    z-index: 1;
}

.${CONFIG.PREFIX}-menu-credit {
    margin-top: 12px;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.9);
    position: relative;
    z-index: 1;
}

.${CONFIG.PREFIX}-menu-credit a {
    color: #00ff88;
    text-decoration: none;
    font-weight: bold;
    border-bottom: 2px solid #00ff88;
    padding-bottom: 2px;
    transition: all 0.3s;
}

.${CONFIG.PREFIX}-menu-credit a:hover {
    color: #00ffaa;
    border-bottom-color: #00ffaa;
}

.${CONFIG.PREFIX}-section {
    margin-bottom: 25px;
}

.${CONFIG.PREFIX}-section-title {
    font-size: 0.9rem;
    font-weight: 800;
    color: #667eea;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.${CONFIG.PREFIX}-section-title::before {
    content: '';
    width: 5px;
    height: 20px;
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    border-radius: 3px;
    box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.${CONFIG.PREFIX}-menu button {
    display: flex;
    align-items: center;
    gap: 15px;
    width: 100%;
    text-align: right;
    padding: 18px 22px;
    margin: 12px 0;
    background: white;
    border: 3px solid transparent;
    border-radius: 16px;
    cursor: pointer;
    font-size: 1.05rem;
    font-weight: 700;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    color: #2c3e50;
    position: relative;
    overflow: hidden;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}

.${CONFIG.PREFIX}-menu button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
    transition: left 0.7s;
}

.${CONFIG.PREFIX}-menu button:hover::before {
    left: 100%;
}

.${CONFIG.PREFIX}-menu button:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateX(-10px) scale(1.03);
    border-color: transparent;
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4), 0 0 20px rgba(118, 75, 162, 0.3);
}

.${CONFIG.PREFIX}-menu button:focus {
    outline: 5px solid #ffd700 !important;
    outline-offset: 4px !important;
    border-color: #ff6b35;
    z-index: 10;
}

.${CONFIG.PREFIX}-menu button:active {
    transform: translateX(-10px) scale(0.97);
}

.${CONFIG.PREFIX}-menu button.active {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border-color: #10b981;
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4), 0 0 30px rgba(5, 150, 105, 0.3);
}

.${CONFIG.PREFIX}-menu button.active::after {
    content: '✓';
    position: absolute;
    left: 18px;
    font-size: 1.4rem;
    font-weight: 900;
    animation: ${CONFIG.PREFIX}-checkPop 0.3s ease-out;
}

@keyframes ${CONFIG.PREFIX}-checkPop {
    0% { transform: scale(0); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
}

.${CONFIG.PREFIX}-btn-icon {
    font-size: 1.6rem;
    flex-shrink: 0;
    transition: transform 0.4s;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.${CONFIG.PREFIX}-menu button:hover .${CONFIG.PREFIX}-btn-icon {
    transform: scale(1.3) rotate(10deg);
}

.${CONFIG.PREFIX}-close-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(255, 255, 255, 0.4);
    border: 3px solid rgba(255, 255, 255, 0.6);
    color: white;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s;
    backdrop-filter: blur(10px);
    z-index: 10;
    font-weight: 900;
}

.${CONFIG.PREFIX}-close-btn:hover {
    background: rgba(255, 255, 255, 0.7);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.${CONFIG.PREFIX}-close-btn:focus {
    outline: 5px solid #ffd700 !important;
    outline-offset: 3px !important;
}

/* כפתור דילוג לתוכן */
.${CONFIG.PREFIX}-skip-link {
    position: fixed;
    top: -300px;
    right: 50%;
    transform: translateX(50%);
    background: linear-gradient(135deg, #ff6b35 0%, #f093fb 100%);
    color: white;
    padding: 20px 40px;
    text-decoration: none;
    border-radius: 60px;
    font-weight: 800;
    font-size: 1.2rem;
    z-index: 1000000;
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0 10px 30px rgba(255, 107, 53, 0.5);
    border: 4px solid white;
}

.${CONFIG.PREFIX}-skip-link:focus {
    top: 40px;
    outline: 6px solid #ffd700 !important;
    outline-offset: 5px !important;
    transform: translateX(50%) scale(1.1);
    box-shadow: 0 15px 40px rgba(255, 107, 53, 0.6);
}

/* מצבי נגישות */
body.${CONFIG.PREFIX}-high-contrast {
    filter: contrast(2.5) !important;
}

body.${CONFIG.PREFIX}-high-contrast * {
    text-shadow: none !important;
    box-shadow: 0 0 0 3px #000 !important;
}

body.${CONFIG.PREFIX}-grayscale {
    filter: grayscale(100%) !important;
}

body.${CONFIG.PREFIX}-underline-links a {
    text-decoration: underline !important;
    text-decoration-thickness: 4px !important;
    text-underline-offset: 5px !important;
    text-decoration-color: currentColor !important;
}

body.${CONFIG.PREFIX}-readable-font,
body.${CONFIG.PREFIX}-readable-font * {
    font-family: Arial, Helvetica, sans-serif !important;
    letter-spacing: 0.1em !important;
    line-height: 2 !important;
}

body.${CONFIG.PREFIX}-no-animations,
body.${CONFIG.PREFIX}-no-animations * {
    animation: none !important;
    transition: none !important;
}

body.${CONFIG.PREFIX}-large-cursor,
body.${CONFIG.PREFIX}-large-cursor * {
    cursor: pointer !important;
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><circle cx="24" cy="24" r="18" fill="black" stroke="white" stroke-width="4"/></svg>') 24 24, pointer !important;
}

/* מיקוד מקלדת משופר */
*:focus {
    outline: 5px solid #ffd700 !important;
    outline-offset: 5px !important;
    scroll-margin: 80px !important;
}

button:focus,
a:focus,
input:focus,
select:focus,
textarea:focus {
    outline: 6px solid #ffd700 !important;
    outline-offset: 6px !important;
    box-shadow: 0 0 0 10px rgba(255, 215, 0, 0.4) !important;
}

/* הסתרה ויזואלית */
.${CONFIG.PREFIX}-sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border-width: 0 !important;
}

/* ניגודיות גבוהה */
body.${CONFIG.PREFIX}-high-contrast a {
    color: #0000EE !important;
    font-weight: 800 !important;
}

body.${CONFIG.PREFIX}-high-contrast a:visited {
    color: #551A8B !important;
}

/* גודל מינימלי */
button, a, input[type="button"], input[type="submit"] {
    min-height: 48px;
    min-width: 48px;
    touch-action: manipulation;
}

/* גלילה חלקה */
html {
    scroll-behavior: smooth;
}

body.${CONFIG.PREFIX}-no-animations html {
    scroll-behavior: auto;
}

/* אינדיקטור הקראה */
.${CONFIG.PREFIX}-reading-highlight {
    background: rgba(255, 215, 0, 0.4) !important;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6) !important;
    transition: all 0.3s !important;
}

/* מודל הצהרת נגישות */
.${CONFIG.PREFIX}-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.${CONFIG.PREFIX}-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
}

.${CONFIG.PREFIX}-modal-content {
    position: relative;
    background: white;
    border-radius: 24px;
    padding: 40px;
    max-width: 900px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: ${CONFIG.PREFIX}-modalSlideIn 0.4s ease-out;
    z-index: 2;
}

@keyframes ${CONFIG.PREFIX}-modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-50px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.${CONFIG.PREFIX}-modal-close {
    position: absolute;
    top: 20px;
    left: 20px;
    background: #ef4444;
    color: white;
    border: none;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    font-size: 1.8rem;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

.${CONFIG.PREFIX}-modal-close:hover {
    background: #dc2626;
    transform: rotate(90deg) scale(1.1);
}

.${CONFIG.PREFIX}-modal-close:focus {
    outline: 4px solid #ffd700 !important;
    outline-offset: 3px !important;
}

.${CONFIG.PREFIX}-declaration-content {
    color: #2c3e50;
    font-size: 1.05rem;
    line-height: 1.8;
}

.${CONFIG.PREFIX}-declaration-content h3 {
    margin-top: 0;
    color: #764ba2;
    font-size: 1.4rem;
    margin-bottom: 15px;
}

.${CONFIG.PREFIX}-declaration-content ul {
    list-style-type: disc;
    margin-right: 20px;
    margin-top: 10px;
}

.${CONFIG.PREFIX}-declaration-content li {
    margin-bottom: 10px;
}

.${CONFIG.PREFIX}-declaration-content section {
    margin-bottom: 30px;
}

.${CONFIG.PREFIX}-declaration-content p {
    margin-bottom: 10px;
}

.${CONFIG.PREFIX}-modal-content::-webkit-scrollbar {
    width: 12px;
}

.${CONFIG.PREFIX}-modal-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.${CONFIG.PREFIX}-modal-content::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
}

/* רספונסיבי */
@media (max-width: 768px) {
    .${CONFIG.PREFIX}-menu {
        max-width: 95vw;
        max-height: 85vh;
        min-width: 320px;
    }
    
    .${CONFIG.PREFIX}-toolbar {
        top: auto;
        bottom: 20px;
        left: 0;
        transform: none;
    }

    .${CONFIG.PREFIX}-toggle {
        writing-mode: horizontal-tb;
        flex-direction: row;
        min-height: auto;
        border-radius: 0 20px 20px 0;
        padding: 18px 25px;
    }

    .${CONFIG.PREFIX}-menu {
        position: fixed;
        top: auto;
        bottom: 0;
        left: -100%;
        transform: none;
        border-radius: 28px 28px 0 0;
        border: 4px solid #667eea;
        border-bottom: none;
    }

    .${CONFIG.PREFIX}-menu.active {
        left: 0;
    }

    .${CONFIG.PREFIX}-menu-header {
        border-radius: 28px 28px 0 0;
    }
    
    .${CONFIG.PREFIX}-modal-content {
        width: 95%;
        padding: 30px 20px;
        max-height: 90vh;
    }
    
    .${CONFIG.PREFIX}-declaration-content {
        font-size: 1rem;
    }
}

/* הגדלת אזור קליק לכפתורים */
button::after,
a::after {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    pointer-events: auto;
}
`;
        
        document.head.appendChild(style);
    }
    
    // ===== יצירת HTML =====
    function createHTML() {
        const containerId = CONFIG.PREFIX + '-container';
        if (document.getElementById(containerId)) return;
        
        const container = document.createElement('div');
        container.id = containerId;
        
        const today = new Date().toLocaleDateString('he-IL');
        
        container.innerHTML = `
<!-- תפריט נגישות מלא PRO -->
<div id="${CONFIG.PREFIX}-toolbar" class="${CONFIG.PREFIX}-toolbar" role="toolbar" aria-label="תפריט נגישות מלא" lang="he">
    <button id="${CONFIG.PREFIX}-toggle" class="${CONFIG.PREFIX}-toggle" aria-label="פתיחת תפריט נגישות - לחץ Enter או Space" aria-expanded="false" aria-haspopup="true" tabindex="0">
        <span class="${CONFIG.PREFIX}-toggle-icon" aria-hidden="true">♿</span>
        <span>נגישות</span>
    </button>
    <nav id="${CONFIG.PREFIX}-menu" class="${CONFIG.PREFIX}-menu" role="menu" aria-hidden="true" aria-labelledby="${CONFIG.PREFIX}-menu-title">
        <button class="${CONFIG.PREFIX}-close-btn" id="${CONFIG.PREFIX}-close-btn" aria-label="סגור תפריט נגישות" tabindex="0">
            ✕
        </button>
        
        <div class="${CONFIG.PREFIX}-menu-header">
            <h3 id="${CONFIG.PREFIX}-menu-title">תפריט נגישות PRO</h3>
            <div class="${CONFIG.PREFIX}-menu-subtitle">התאם את האתר לצרכים שלך</div>
            <div class="${CONFIG.PREFIX}-menu-credit">
                נגישות ע"י <a href="${CONFIG.BRAND_URL}" target="_blank" rel="noopener noreferrer" tabindex="0" aria-label="${CONFIG.BRAND_NAME} - נפתח בחלון חדש">${CONFIG.BRAND_NAME}</a>
            </div>
        </div>
        
        <div class="${CONFIG.PREFIX}-section" role="group" aria-labelledby="${CONFIG.PREFIX}-tts-section">
            <div class="${CONFIG.PREFIX}-section-title" id="${CONFIG.PREFIX}-tts-section">
                <span>הקראת טקסט</span>
            </div>
            
            <button id="${CONFIG.PREFIX}-tts-btn" role="menuitem" aria-label="הפעלה או כיבוי של הקראת טקסט" aria-pressed="false" tabindex="0">
                <span class="${CONFIG.PREFIX}-btn-icon" aria-hidden="true">🔊</span>
                <span>הקראת טקסט</span>
            </button>
            
            <button id="${CONFIG.PREFIX}-stop-tts-btn" role="menuitem" aria-label="עצור הקראה מיידית" tabindex="0">
                <span class="${CONFIG.PREFIX}-btn-icon" aria-hidden="true">⏹️</span>
                <span>עצור הקראה</span>
            </button>
        </div>
        
        <div class="${CONFIG.PREFIX}-section" role="group" aria-labelledby="${CONFIG.PREFIX}-font-section">
            <div class="${CONFIG.PREFIX}-section-title" id="${CONFIG.PREFIX}-font-section">
                <span>גודל טקסט</span>
            </div>
            
            <button id="${CONFIG.PREFIX}-increase-font" role="menuitem" aria-label="הגדלת גופן - לחץ Enter או Space" tabindex="0">
                <span class="${CONFIG.PREFIX}-btn-icon" aria-hidden="true">🔍</span>
                <span>הגדל גופן</span>
            </button>
            
            <button id="${CONFIG.PREFIX}-decrease-font" role="menuitem" aria-label="הקטנת גופן - לחץ Enter או Space" tabindex="0">
                <span class="${CONFIG.PREFIX}-btn-icon" aria-hidden="true">🔍</span>
                <span>הקטן גופן</span>
            </button>
            
            <button id="${CONFIG.PREFIX}-reset-font" role="menuitem" aria-label="איפוס גודל גופן למצב ברירת מחדל" tabindex="0">
                <span class="${CONFIG.PREFIX}-btn-icon" aria-hidden="true">↺</span>
                <span>אפס גופן</span>
            </button>
        </div>
        
        <div class="${CONFIG.PREFIX}-section" role="group" aria-labelledby="${CONFIG.PREFIX}-color-section">
            <div class="${CONFIG.PREFIX}-section-title" id="${CONFIG.PREFIX}-color-section">
                <span>צבעים ותצוגה</span>
            </div>
            
            <button id="${CONFIG.PREFIX}-contrast-btn" role="menuitem" aria-label="ניגודיות גבוהה - הפעלה או כיבוי" aria-pressed="false" tabindex="0">
                <span class="${CONFIG.PREFIX}-btn-icon" aria-hidden="true">◐</span>
                <span>ניגודיות גבוהה</span>
            </button>
            
            <button id="${CONFIG.PREFIX}-grayscale-btn" role="menuitem" aria-label="מצב שחור-לבן - הפעלה או כיבוי" aria-pressed="false" tabindex="0">
                <span class="${CONFIG.PREFIX}-btn-icon" aria-hidden="true">⬛</span>
                <span>שחור-לבן</span>
            </button>
        </div>
        
        <div class="${CONFIG.PREFIX}-section" role="group" aria-labelledby="${CONFIG.PREFIX}-readability-section">
            <div class="${CONFIG.PREFIX}-section-title" id="${CONFIG.PREFIX}-readability-section">
                <span>קריאות</span>
            </div>
            
            <button id="${CONFIG.PREFIX}-underline-btn" role="menuitem" aria-label="הדגשת קישורים - הפעלה או כיבוי" aria-pressed="false" tabindex="0">
                <span class="${CONFIG.PREFIX}-btn-icon" aria-hidden="true">🔗</span>
                <span>הדגש קישורים</span>
            </button>
            
            <button id="${CONFIG.PREFIX}-font-btn" role="menuitem" aria-label="גופן קריא - החלפה לפונט נגיש יותר" aria-pressed="false" tabindex="0">
                <span class="${CONFIG.PREFIX}-btn-icon" aria-hidden="true">🔤</span>
                <span>גופן קריא</span>
            </button>
        </div>
        
        <div class="${CONFIG.PREFIX}-section" role="group" aria-labelledby="${CONFIG.PREFIX}-motion-section">
            <div class="${CONFIG.PREFIX}-section-title" id="${CONFIG.PREFIX}-motion-section">
                <span>תנועה</span>
            </div>
            
            <button id="${CONFIG.PREFIX}-animations-btn" role="menuitem" aria-label="עצירת אנימציות - הפעלה או כיבוי" aria-pressed="false" tabindex="0">
                <span class="${CONFIG.PREFIX}-btn-icon" aria-hidden="true">⏸️</span>
                <span>עצור אנימציות</span>
            </button>
            
            <button id="${CONFIG.PREFIX}-cursor-btn" role="menuitem" aria-label="סמן עכבר גדול - הפעלה או כיבוי" aria-pressed="false" tabindex="0">
                <span class="${CONFIG.PREFIX}-btn-icon" aria-hidden="true">👆</span>
                <span>סמן גדול</span>
            </button>
        </div>
        
        <div class="${CONFIG.PREFIX}-section" role="group" aria-labelledby="${CONFIG.PREFIX}-legal-section">
            <div class="${CONFIG.PREFIX}-section-title" id="${CONFIG.PREFIX}-legal-section">
                <span>משפטי</span>
            </div>
            
            <button id="${CONFIG.PREFIX}-declaration-btn" role="menuitem" aria-label="הצהרת נגישות ופרטיות - לחץ לפתיחת חלון הצהרה מלא" tabindex="0">
                <span class="${CONFIG.PREFIX}-btn-icon" aria-hidden="true">⚖️</span>
                <span>הצהרת נגישות ופרטיות</span>
        </div>

        <div class="${CONFIG.PREFIX}-section" role="group">
            <button id="${CONFIG.PREFIX}-reset-btn" role="menuitem" aria-label="אפס את כל הגדרות הנגישות למצב ברירת מחדל" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white;" tabindex="0">
                <span class="${CONFIG.PREFIX}-btn-icon" aria-hidden="true">↺</span>
                <span>אפס הכל</span>
            </button>
        </div>
    </nav>
</div>

<!-- כפתור דילוג לתוכן -->
<a href="#main-content" class="${CONFIG.PREFIX}-skip-link" id="${CONFIG.PREFIX}-skip-link" tabindex="0">⬅️ דלג לתוכן הראשי</a>

<!-- חלון הצהרת נגישות ופרטיות -->
<div id="${CONFIG.PREFIX}-declaration-modal" class="${CONFIG.PREFIX}-modal" role="dialog" aria-labelledby="${CONFIG.PREFIX}-declaration-title" aria-modal="true" aria-hidden="true" style="display: none;">
    <div class="${CONFIG.PREFIX}-modal-overlay" role="presentation"></div>
    <div class="${CONFIG.PREFIX}-modal-content" tabindex="0">
        <button class="${CONFIG.PREFIX}-modal-close" id="${CONFIG.PREFIX}-declaration-close" aria-label="סגור הצהרה וחזור לדף" tabindex="0">✕</button>
        
        <h2 id="${CONFIG.PREFIX}-declaration-title" style="color: #667eea; font-size: 2rem; margin-bottom: 20px; text-align: center;">
            📋 הצהרת נגישות ופרטיות
        </h2>
        
        <div class="${CONFIG.PREFIX}-declaration-content" style="padding: 20px;">

            <!-- ===== הצהרת נגישות ===== -->
            <section style="margin-bottom: 30px;">
                <h3 style="color: #764ba2; font-size: 1.4rem; margin-bottom: 15px;">♿ הצהרת נגישות</h3>
                <p>
                    אתר זה שואף לספק חוויית גלישה נגישה לכלל המשתמשים, לרבות אנשים עם מוגבלויות.
                    באתר הוטמע כלי נגישות המסייע בשיפור חוויית השימוש והנגישות.
                </p>
            </section>

            <section style="margin-bottom: 30px;">
                <h3 style="color: #764ba2; font-size: 1.4rem; margin-bottom: 15px;">🛠️ התאמות נגישות שבוצעו באתר</h3>
                <ul style="margin-right: 20px; margin-top: 10px;">
                    <li>תפריט נגישות מתקדם</li>
                    <li>אפשרות לניווט באמצעות מקלדת</li>
                    <li>שינוי גודל טקסט והתאמת קריאות</li>
                    <li>מצבי ניגודיות גבוהה ושחור־לבן</li>
                    <li>הקראת טקסט (קורא מסך)</li>
                    <li>התאמות בסיסיות לשיפור חוויית המשתמש</li>
                </ul>
            </section>

            <section style="margin-bottom: 30px;">
                <h3 style="color: #764ba2; font-size: 1.4rem; margin-bottom: 15px;">⚠️ חשוב לדעת</h3>
                <p style="padding: 15px; background: #fff3cd; border-right: 4px solid #ffc107; border-radius: 8px;">
                    כלי הנגישות באתר נועד לסייע בשיפור הנגישות, ואינו מהווה תחליף לבדיקה מקצועית על ידי מומחה נגישות מוסמך.
                    אין בהטמעת הכלי התחייבות לעמידה מלאה בדרישות החוק, או בתקן WCAG 2.1 / ת״י 5568.
                </p>
                <p style="margin-top: 12px; padding: 15px; background: #fee; border-right: 4px solid #f44; border-radius: 8px; color: #c00;">
                    <strong>הלאחריות לעמידה בדרישות החוק חלה על בעל האתר.</strong>
                </p>
            </section>

            <section style="margin-bottom: 30px;">
                <h3 style="color: #764ba2; font-size: 1.4rem; margin-bottom: 15px;">📞 פניות בנושא נגישות</h3>
                <p>
                    במידה ונתקלתם בבעיה בנושא נגישות, ניתן לפנות דרך טופס יצירת הקשר באתר.
                </p>
            </section>

            <section style="margin-bottom: 30px;">
                <h3 style="color: #764ba2; font-size: 1.4rem; margin-bottom: 15px;">🔄 תאריך עדכון</h3>
                <p>
                    הצהרה זו עודכנה לאחרונה בתאריך: <strong>${today}</strong>
                </p>
            </section>

            <!-- ===== הצהרת פרטיות ===== -->
            <hr style="border: none; border-top: 2px solid #e0e0e0; margin: 35px 0;">

            <section style="margin-bottom: 30px;">
                <h3 style="color: #764ba2; font-size: 1.4rem; margin-bottom: 15px;">🔐 הצהרת פרטיות</h3>
                <p>
                    האתר מכבד את פרטיות המשתמשים בו. המידע הנמסר באתר באמצעות טפסים
                    (כגון שם, טלפון או כתובת דוא״ל) נמסר מרצון חופשי של המשתמש ומשמש אך ורק לצורך יצירת קשר ומתן מענה לפנייה.
                </p>
                <p style="margin-top: 10px;">
                    האתר אינו עושה שימוש במידע שנמסר לצרכים מסחריים אחרים ואינו מעביר מידע אישי לצד ג׳, למעט אם נדרש על פי חוק.
                </p>
                <p style="margin-top: 10px;">
                    גלישה באתר והשארת פרטים מהווה הסכמה לאמור בהצהרה זו.
                </p>
            </section>

            <!-- ===== פותח על ידי ===== -->
            <section style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 12px; border-right: 5px solid #667eea;">
                <h3 style="color: #667eea; font-size: 1.2rem; margin-bottom: 10px;">💡 פותח על ידי</h3>
                <p style="font-size: 1.1rem;">
                    מערכת נגישות זו פותחה ב <a href="${CONFIG.BRAND_URL}" target="_blank" rel="noopener noreferrer" style="color: #667eea; font-weight: bold; text-decoration: none; border-bottom: 2px solid #667eea;" tabindex="0" aria-label="${CONFIG.BRAND_NAME} - נפתח בחלון חדש">${CONFIG.BRAND_NAME}</a>
                </p>
                <p style="margin-top: 10px; font-size: 0.95rem; color: #666;">
                    פתרונות נגישות מתקדמים לאתרים ומערכות דיגיטליות
                </p>
            </section>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <button id="${CONFIG.PREFIX}-declaration-close2" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 40px; border-radius: 12px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: all 0.3s;" tabindex="0" aria-label="סגור הצהרה וחזור לדף">
                סגור הצהרה
            </button>
        </div>
    </div>
</div>

<!-- אזור הודעות לקוראי מסך -->
<div role="status" aria-live="polite" aria-atomic="true" class="${CONFIG.PREFIX}-sr-only" id="${CONFIG.PREFIX}-announcer"></div>
<div role="alert" aria-live="assertive" aria-atomic="true" class="${CONFIG.PREFIX}-sr-only" id="${CONFIG.PREFIX}-alert"></div>
`;
        
        document.body.appendChild(container);
    }
    
    // ===== פונקציות עזר =====
    function announce(message) {
        const announcer = document.getElementById(CONFIG.PREFIX + '-announcer');
        if (announcer) {
            announcer.textContent = '';
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
        }
    }
    
    function alertUser(message) {
        const alertBox = document.getElementById(CONFIG.PREFIX + '-alert');
        if (alertBox) {
            alertBox.textContent = '';
            setTimeout(() => {
                alertBox.textContent = message;
            }, 100);
        }
    }
    
    function saveSettings() {
        try {
            const settings = {
                fontSize: state.fontSize,
                textToSpeech: state.speechEnabled,
                highContrast: document.body.classList.contains(CONFIG.PREFIX + '-high-contrast'),
                grayscale: document.body.classList.contains(CONFIG.PREFIX + '-grayscale'),
                underlineLinks: document.body.classList.contains(CONFIG.PREFIX + '-underline-links'),
                readableFont: document.body.classList.contains(CONFIG.PREFIX + '-readable-font'),
                noAnimations: document.body.classList.contains(CONFIG.PREFIX + '-no-animations'),
                largeCursor: document.body.classList.contains(CONFIG.PREFIX + '-large-cursor')
            };
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.warn('[MC A11Y] לא ניתן לשמור הגדרות', e);
        }
    }
    
    function loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
            
            if (settings.fontSize) {
                state.fontSize = settings.fontSize;
                document.documentElement.style.fontSize = settings.fontSize + '%';
                updateFontButtons();
            }
            
            if (settings.textToSpeech) {
                state.speechEnabled = true;
                enableTextSelection();
                updateButtonState('tts-btn', true);
            }
            
            if (settings.highContrast) {
                document.body.classList.add(CONFIG.PREFIX + '-high-contrast');
                updateButtonState('contrast-btn', true);
            }
            if (settings.grayscale) {
                document.body.classList.add(CONFIG.PREFIX + '-grayscale');
                updateButtonState('grayscale-btn', true);
            }
            if (settings.underlineLinks) {
                document.body.classList.add(CONFIG.PREFIX + '-underline-links');
                updateButtonState('underline-btn', true);
            }
            if (settings.readableFont) {
                document.body.classList.add(CONFIG.PREFIX + '-readable-font');
                updateButtonState('font-btn', true);
            }
            if (settings.noAnimations) {
                document.body.classList.add(CONFIG.PREFIX + '-no-animations');
                updateButtonState('animations-btn', true);
            }
            if (settings.largeCursor) {
                document.body.classList.add(CONFIG.PREFIX + '-large-cursor');
                updateButtonState('cursor-btn', true);
            }
        } catch (e) {
            console.warn('[MC A11Y] לא ניתן לטעון הגדרות', e);
        }
    }
    
    function updateButtonState(buttonId, isActive) {
        const button = document.getElementById(CONFIG.PREFIX + '-' + buttonId);
        if (button) {
            if (isActive) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
            button.setAttribute('aria-pressed', isActive);
        }
    }
    
    function updateAllButtonStates() {
        updateButtonState('tts-btn', false);
        updateButtonState('contrast-btn', false);
        updateButtonState('grayscale-btn', false);
        updateButtonState('underline-btn', false);
        updateButtonState('font-btn', false);
        updateButtonState('animations-btn', false);
        updateButtonState('cursor-btn', false);
        updateFontButtons();
    }
    
    function updateFontButtons() {
        const increaseBtn = document.getElementById(CONFIG.PREFIX + '-increase-font');
        const decreaseBtn = document.getElementById(CONFIG.PREFIX + '-decrease-font');
        
        if (increaseBtn) {
            increaseBtn.setAttribute('aria-label', 
                state.fontSize >= CONFIG.MAX_FONT ? 'הגדלת גופן - הגעת למקסימום 200 אחוז' : 'הגדלת גופן - כרגע ' + state.fontSize + ' אחוז'
            );
            increaseBtn.disabled = state.fontSize >= CONFIG.MAX_FONT;
            increaseBtn.style.opacity = state.fontSize >= CONFIG.MAX_FONT ? '0.5' : '1';
            increaseBtn.style.cursor = state.fontSize >= CONFIG.MAX_FONT ? 'not-allowed' : 'pointer';
        }
        
        if (decreaseBtn) {
            decreaseBtn.setAttribute('aria-label',
                state.fontSize <= CONFIG.MIN_FONT ? 'הקטנת גופן - הגעת למינימום 80 אחוז' : 'הקטנת גופן - כרגע ' + state.fontSize + ' אחוז'
            );
            decreaseBtn.disabled = state.fontSize <= CONFIG.MIN_FONT;
            decreaseBtn.style.opacity = state.fontSize <= CONFIG.MIN_FONT ? '0.5' : '1';
            decreaseBtn.style.cursor = state.fontSize <= CONFIG.MIN_FONT ? 'not-allowed' : 'pointer';
        }
    }
    
    // ===== פונקציות הקראת טקסט =====
    function initTextToSpeech() {
        if (!('speechSynthesis' in window)) {
            console.warn('[MC A11Y] הדפדפן לא תומך בהקראת טקסט');
            const ttsBtn = document.getElementById(CONFIG.PREFIX + '-tts-btn');
            if (ttsBtn) {
                ttsBtn.disabled = true;
                ttsBtn.style.opacity = '0.5';
                ttsBtn.setAttribute('aria-label', 'הקראת טקסט - לא זמין בדפדפן זה');
            }
        }
    }
    
    function toggleTextToSpeech() {
        state.speechEnabled = !state.speechEnabled;
        updateButtonState('tts-btn', state.speechEnabled);
        saveSettings();
        
        if (state.speechEnabled) {
            announce('הקראת טקסט הופעלה - לחץ על טקסט כדי להקריא אותו');
            alert('הקראת טקסט: גע או לחץ על כל טקסט באתר כדי להקריא אותו');
            enableTextSelection();
        } else {
            announce('הקראת טקסט כובתה');
            stopSpeaking();
            disableTextSelection();
        }
    }
    
    function enableTextSelection() {
        document.addEventListener('click', handleTextClick);
    }
    
    function disableTextSelection() {
        document.removeEventListener('click', handleTextClick);
    }
    
    function handleTextClick(e) {
        if (!state.speechEnabled) return;
        
        // לא להקריא כפתורים ואלמנטים אינטראקטיביים
        const skipSelectors = `button, a, input, select, textarea, .${CONFIG.PREFIX}-toolbar, .${CONFIG.PREFIX}-toolbar *`;
        if (e.target.matches(skipSelectors)) {
            return;
        }
        
        let textToRead = '';
        
        if (e.target.innerText) {
            textToRead = e.target.innerText.trim();
        } else if (e.target.textContent) {
            textToRead = e.target.textContent.trim();
        }
        
        if (textToRead && textToRead.length > 0) {
            speakText(textToRead, e.target);
        }
    }
    
    function speakText(text, element) {
        // עצירת הקראה קודמת
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        // הסרת הדגשה קודמת
        document.querySelectorAll('.' + CONFIG.PREFIX + '-reading-highlight').forEach(el => {
            el.classList.remove(CONFIG.PREFIX + '-reading-highlight');
        });
        
        // הדגשת הטקסט הנקרא
        if (element) {
            element.classList.add(CONFIG.PREFIX + '-reading-highlight');
        }
        
        state.currentUtterance = new SpeechSynthesisUtterance(text);
        state.currentUtterance.lang = 'he-IL';
        state.currentUtterance.rate = 0.9;
        state.currentUtterance.pitch = 1;
        state.currentUtterance.volume = 1;
        
        state.currentUtterance.onend = function() {
            if (element) {
                element.classList.remove(CONFIG.PREFIX + '-reading-highlight');
            }
        };
        
        state.currentUtterance.onerror = function(e) {
            console.error('[MC A11Y] שגיאה בהקראה:', e);
            if (element) {
                element.classList.remove(CONFIG.PREFIX + '-reading-highlight');
            }
            alertUser('שגיאה בהקראת טקסט. נסה שנית.');
        };
        
        window.speechSynthesis.speak(state.currentUtterance);
        announce('מקריא טקסט');
    }
    
    function stopSpeaking() {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            document.querySelectorAll('.' + CONFIG.PREFIX + '-reading-highlight').forEach(el => {
                el.classList.remove(CONFIG.PREFIX + '-reading-highlight');
            });
            announce('הקראה הופסקה');
        } else {
            announce('אין הקראה פעילה');
        }
    }
    
    // ===== פונקציות גופן =====
    function increaseFontSize() {
        if (state.fontSize < CONFIG.MAX_FONT) {
            state.fontSize += CONFIG.FONT_STEP;
            applyFontSize();
            announce('גופן הוגדל ל-' + state.fontSize + ' אחוז');
        } else {
            announce('הגעת לגודל המקסימלי - 200 אחוז');
            alertUser('הגעת לגודל גופן מקסימלי');
        }
    }
    
    function decreaseFontSize() {
        if (state.fontSize > CONFIG.MIN_FONT) {
            state.fontSize -= CONFIG.FONT_STEP;
            applyFontSize();
            announce('גופן הוקטן ל-' + state.fontSize + ' אחוז');
        } else {
            announce('הגעת לגודל המינימלי - 80 אחוז');
            alertUser('הגעת לגודל גופן מינימלי');
        }
    }
    
    function resetFontSize() {
        state.fontSize = 100;
        applyFontSize();
        announce('גודל גופן אופסן ל-100 אחוז');
    }
    
    function applyFontSize() {
        document.documentElement.style.fontSize = state.fontSize + '%';
        saveSettings();
        updateFontButtons();
    }
    
    // ===== פונקציות מצבי נגישות =====
    function toggleHighContrast() {
        const isActive = document.body.classList.toggle(CONFIG.PREFIX + '-high-contrast');
        saveSettings();
        announce(isActive ? 'ניגודיות גבוהה הופעלה' : 'ניגודיות גבוהה כובתה');
        updateButtonState('contrast-btn', isActive);
    }
    
    function toggleGrayscale() {
        const isActive = document.body.classList.toggle(CONFIG.PREFIX + '-grayscale');
        saveSettings();
        announce(isActive ? 'מצב שחור-לבן הופעל' : 'מצב שחור-לבן כובה');
        updateButtonState('grayscale-btn', isActive);
    }
    
    function toggleUnderlineLinks() {
        const isActive = document.body.classList.toggle(CONFIG.PREFIX + '-underline-links');
        saveSettings();
        announce(isActive ? 'קישורים מודגשים' : 'ביטול הדגשת קישורים');
        updateButtonState('underline-btn', isActive);
    }
    
    function toggleReadableFont() {
        const isActive = document.body.classList.toggle(CONFIG.PREFIX + '-readable-font');
        saveSettings();
        announce(isActive ? 'גופן קריא הופעל' : 'גופן קריא כובה');
        updateButtonState('font-btn', isActive);
    }
    
    function toggleAnimations() {
        const isActive = document.body.classList.toggle(CONFIG.PREFIX + '-no-animations');
        saveSettings();
        announce(isActive ? 'אנימציות נעצרו' : 'אנימציות הופעלו');
        updateButtonState('animations-btn', isActive);
    }
    
    function toggleLargeCursor() {
        const isActive = document.body.classList.toggle(CONFIG.PREFIX + '-large-cursor');
        saveSettings();
        announce(isActive ? 'סמן עכבר גדול הופעל' : 'סמן עכבר רגיל');
        updateButtonState('cursor-btn', isActive);
    }
    
    function resetAccessibility() {
        if (confirm('האם אתה בטוח שברצונך לאפס את כל הגדרות הנגישות?')) {
            state.fontSize = 100;
            state.speechEnabled = false;
            document.documentElement.style.fontSize = '100%';
            document.body.classList.remove(
                CONFIG.PREFIX + '-high-contrast',
                CONFIG.PREFIX + '-grayscale',
                CONFIG.PREFIX + '-underline-links',
                CONFIG.PREFIX + '-readable-font',
                CONFIG.PREFIX + '-no-animations',
                CONFIG.PREFIX + '-large-cursor'
            );
            stopSpeaking();
            disableTextSelection();
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            announce('כל הגדרות הנגישות אופסו');
            updateAllButtonStates();
            alert('כל הגדרות הנגישות אופסו בהצלחה');
        }
    }
    
    // ===== פונקציות תפריט =====
    function toggleMenu() {
        const toggle = document.getElementById(CONFIG.PREFIX + '-toggle');
        const menu = document.getElementById(CONFIG.PREFIX + '-menu');
        
        if (!toggle || !menu) return;
        
        state.menuOpen = !state.menuOpen;
        const isOpen = state.menuOpen;
        
        if (isOpen) {
            menu.classList.add('active');
        } else {
            menu.classList.remove('active');
        }
        
        toggle.setAttribute('aria-expanded', isOpen);
        menu.setAttribute('aria-hidden', !isOpen);
        
        if (isOpen) {
            announce('תפריט נגישות נפתח');
            setTimeout(() => {
                const firstBtn = menu.querySelector('button:not(.' + CONFIG.PREFIX + '-close-btn)');
                if (firstBtn) firstBtn.focus();
            }, 100);
        } else {
            announce('תפריט נגישות נסגר');
        }
    }
    
    function closeMenu() {
        const toggle = document.getElementById(CONFIG.PREFIX + '-toggle');
        const menu = document.getElementById(CONFIG.PREFIX + '-menu');
        
        if (menu && toggle) {
            menu.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            menu.setAttribute('aria-hidden', 'true');
            toggle.focus();
            state.menuOpen = false;
        }
    }
    
    // ===== פונקציות מודל הצהרה =====
    function openDeclarationModal() {
        const modal = document.getElementById(CONFIG.PREFIX + '-declaration-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                const content = modal.querySelector('.' + CONFIG.PREFIX + '-modal-content');
                if (content) content.focus();
            }, 100);
            
            announce('הצהרת נגישות ופרטיות נפתחה');
        }
    }
    
    function closeDeclarationModal() {
        const modal = document.getElementById(CONFIG.PREFIX + '-declaration-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            const declarationBtn = document.getElementById(CONFIG.PREFIX + '-declaration-btn');
            if (declarationBtn) declarationBtn.focus();
            
            announce('הצהרת נגישות ופרטיות נסגרה');
        }
    }
    
    // ===== Event Listeners =====
    function attachEventListeners() {
        // כפתור פתיחה
        const toggle = document.getElementById(CONFIG.PREFIX + '-toggle');
        if (toggle) {
            toggle.addEventListener('click', toggleMenu);
            toggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleMenu();
                }
            });
        }
        
        // כפתור סגירה
        const closeBtn = document.getElementById(CONFIG.PREFIX + '-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
        }
        
        // סגירה בלחיצה מחוץ לתפריט
        document.addEventListener('click', function(e) {
            const toolbar = document.getElementById(CONFIG.PREFIX + '-toolbar');
            if (toolbar && !toolbar.contains(e.target) && state.menuOpen) {
                closeMenu();
            }
        });
        
        // TTS
        const ttsBtn = document.getElementById(CONFIG.PREFIX + '-tts-btn');
        if (ttsBtn) ttsBtn.addEventListener('click', toggleTextToSpeech);
        
        const stopTtsBtn = document.getElementById(CONFIG.PREFIX + '-stop-tts-btn');
        if (stopTtsBtn) stopTtsBtn.addEventListener('click', stopSpeaking);
        
        // גופן
        const increaseFont = document.getElementById(CONFIG.PREFIX + '-increase-font');
        if (increaseFont) increaseFont.addEventListener('click', increaseFontSize);
        
        const decreaseFont = document.getElementById(CONFIG.PREFIX + '-decrease-font');
        if (decreaseFont) decreaseFont.addEventListener('click', decreaseFontSize);
        
        const resetFont = document.getElementById(CONFIG.PREFIX + '-reset-font');
        if (resetFont) resetFont.addEventListener('click', resetFontSize);
        
        // מצבי נגישות
        const contrastBtn = document.getElementById(CONFIG.PREFIX + '-contrast-btn');
        if (contrastBtn) contrastBtn.addEventListener('click', toggleHighContrast);
        
        const grayscaleBtn = document.getElementById(CONFIG.PREFIX + '-grayscale-btn');
        if (grayscaleBtn) grayscaleBtn.addEventListener('click', toggleGrayscale);
        
        const underlineBtn = document.getElementById(CONFIG.PREFIX + '-underline-btn');
        if (underlineBtn) underlineBtn.addEventListener('click', toggleUnderlineLinks);
        
        const fontBtn = document.getElementById(CONFIG.PREFIX + '-font-btn');
        if (fontBtn) fontBtn.addEventListener('click', toggleReadableFont);
        
        const animationsBtn = document.getElementById(CONFIG.PREFIX + '-animations-btn');
        if (animationsBtn) animationsBtn.addEventListener('click', toggleAnimations);
        
        const cursorBtn = document.getElementById(CONFIG.PREFIX + '-cursor-btn');
        if (cursorBtn) cursorBtn.addEventListener('click', toggleLargeCursor);
        
        // הצהרה
        const declarationBtn = document.getElementById(CONFIG.PREFIX + '-declaration-btn');
        if (declarationBtn) declarationBtn.addEventListener('click', openDeclarationModal);
        
        const declarationClose = document.getElementById(CONFIG.PREFIX + '-declaration-close');
        if (declarationClose) declarationClose.addEventListener('click', closeDeclarationModal);
        
        const declarationClose2 = document.getElementById(CONFIG.PREFIX + '-declaration-close2');
        if (declarationClose2) declarationClose2.addEventListener('click', closeDeclarationModal);
        
        // סגירת מודל בלחיצה על overlay
        const modal = document.getElementById(CONFIG.PREFIX + '-declaration-modal');
        if (modal) {
            const overlay = modal.querySelector('.' + CONFIG.PREFIX + '-modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', closeDeclarationModal);
            }
        }
        
        // איפוס
        const resetBtn = document.getElementById(CONFIG.PREFIX + '-reset-btn');
        if (resetBtn) resetBtn.addEventListener('click', resetAccessibility);
        
        // קיצורי מקלדת
        document.addEventListener('keydown', function(e) {
            // Alt + A - פתיחת תפריט
            if (e.altKey && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                toggleMenu();
            }
            
            // Alt + Plus - הגדלת גופן
            if (e.altKey && (e.key === '+' || e.key === '=')) {
                e.preventDefault();
                increaseFontSize();
            }
            
            // Alt + Minus - הקטנת גופן
            if (e.altKey && e.key === '-') {
                e.preventDefault();
                decreaseFontSize();
            }
            
            // Alt + 0 - איפוס
            if (e.altKey && e.key === '0') {
                e.preventDefault();
                resetAccessibility();
            }
            
            // Alt + S - הקראת טקסט
            if (e.altKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                toggleTextToSpeech();
            }
            
            // Esc - סגירת תפריט/מודל
            if (e.key === 'Escape') {
                const modal = document.getElementById(CONFIG.PREFIX + '-declaration-modal');
                if (modal && modal.style.display === 'flex') {
                    closeDeclarationModal();
                } else if (state.menuOpen) {
                    closeMenu();
                }
            }
        });
        
        // אינדיקטור ניווט מקלדת
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });
        
        document.addEventListener('mousedown', function() {
            document.body.classList.remove('keyboard-nav');
        });
    }
    
    // ===== סימון main content =====
    function markMainContent() {
        let mainContent = document.getElementById('main-content');
        if (!mainContent) {
            mainContent = document.querySelector('main') || 
                         document.querySelector('[role="main"]') ||
                         document.querySelector('article') ||
                         document.querySelector('.content') ||
                         document.querySelector('#content');
            
            if (mainContent && !mainContent.id) {
                mainContent.id = 'main-content';
                mainContent.setAttribute('tabindex', '-1');
            }
        }
    }
    
    // ===== אינדיקטור טעינה =====
    function announcePageLoad() {
        setTimeout(() => {
            announce('הדף נטען. תפריט נגישות זמין בצד שמאל. האתר עומד בתקן תי 5568 ברמת AA');
        }, 1500);
    }
    
    // ===== אתחול =====
    function init() {
        console.log('[MC A11Y] גרסה ' + CONFIG.VERSION + ' - מאתחל...');
        
        injectCSS();
        createHTML();
        loadSettings();
        attachEventListeners();
        initTextToSpeech();
        markMainContent();
        announcePageLoad();
        
        console.log('[MC A11Y] אותחל בהצלחה!');
        if (SITE_ID) {
            console.log('[MC A11Y] Site ID:', SITE_ID);
        }
    }
    
    // טעינה כאשר ה-DOM מוכן
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
