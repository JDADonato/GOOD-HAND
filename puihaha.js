// =========================================================================
// puihaha.js - CONSOLIDATED APPLICATION LOGIC WITH TOAST NOTIFICATIONS
// Enhanced with professional toast notification system
// =========================================================================
// sefsef
// --- TOAST NOTIFICATION SYSTEM ---
class ToastManager {
    constructor() {
        this.container = null;
        this.toastQueue = [];
        this.maxToasts = 5;
        this.init();
    }
    init() {
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    show(message, type = 'info', title = '', duration = 5000) {
        // Prevent duplicate toasts with same message+type appearing at the same time.
        const existing = Array.from(this.container.children).find(t => {
            const msg = t.querySelector('.toast-message')?.textContent?.trim();
            return msg === message && t.classList.contains(`toast-${type}`);
        });

        if (existing) {
            // Reset its timer
            if (existing.dataset.timer) clearTimeout(parseInt(existing.dataset.timer));
            const newTimer = setTimeout(() => this.removeToast(existing), duration);
            existing.dataset.timer = newTimer;
            // briefly pulse it to give the user feedback
            existing.classList.remove('removing');
            existing.classList.add('pulse-dup');
            setTimeout(() => existing.classList.remove('pulse-dup'), 600);
            return existing;
        }

        const toast = this.createToast(message, type, title);

        if (this.container.children.length >= this.maxToasts) {
            const oldestToast = this.container.firstChild;
            if (oldestToast) this.removeToast(oldestToast);
        }

        this.container.appendChild(toast);

        const timer = setTimeout(() => this.removeToast(toast), duration);
        toast.dataset.timer = timer;
        return toast;
    }

    createToast(message, type, title) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const titles = {
            success: title || 'Success',
            error: title || 'Error',
            warning: title || 'Warning',
            info: title || 'Info'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">×</button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        return toast;
    }

    removeToast(toast) {
        if (toast.dataset.timer) {
            clearTimeout(parseInt(toast.dataset.timer));
        }

        toast.classList.add('removing');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    success(message, title = '') {
        return this.show(message, 'success', title);
    }

    error(message, title = '') {
        return this.show(message, 'error', title);
    }

    warning(message, title = '') {
        return this.show(message, 'warning', title);
    }

    info(message, title = '') {
        return this.show(message, 'info', title);
    }
}

// Initialize global toast manager
const Toast = new ToastManager();

// --- 1. SHARED UTILITY FUNCTIONS ---

/**
 * Fetches an HTML file and inserts it into a specified element ID.
 * Accepts an optional callback to run after successful insertion.
 */
function loadSharedContent(url, targetId, callback) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const pageTitle = document.title.split(' - ')[1] || 'Page'; 
                const finalHtml = html.replace('[PAGE_TITLE]', pageTitle);
                
                targetElement.innerHTML = finalHtml;
                
                if (targetId === 'header-placeholder') {
                    activateNavLink();
                }

                if (callback) {
                    callback();
                }
            }
        })
        .catch(error => console.error(`Error loading shared content from ${url}:`, error));
}

/**
 * Highlights the correct navigation link based on the window.currentPageId.
 */
function activateNavLink() {
    const currentPageId = window.currentPageId; 
    
    if (!currentPageId) return;

    const navLinks = document.querySelectorAll('.nav-link');
    const activeClasses = 'active-nav font-bold text-cta-red'.split(' '); 
    const inactiveClasses = 'text-primary font-medium hover:text-cta-red'.split(' ');

    navLinks.forEach(link => {
        const linkTarget = link.getAttribute('data-nav');
        
        if (linkTarget === currentPageId) {
            link.classList.remove(...inactiveClasses);
            link.classList.add(...activeClasses);
        } else {
            link.classList.remove(...activeClasses);
            link.classList.remove('active-nav'); 
            link.classList.add(...inactiveClasses);
        }
    });
}


// =========================================================================
// --- 2. LOGIC-DRIVEN APPLICATION CLASS (LogicDrivenApp) ---
// =========================================================================

class LogicDrivenApp {
    
    // --- 1. PRODUCT CATALOG AND SIMULATED PURCHASE LIKELIHOOD SCORES (PLS) ---
    PRODUCTS = [
        { id: 'P001', name: 'DAHUA 4MP IR Dome (DH-IPC-HDBW1431E-S4)', type: 'CCTV', img: 'https://goodhand88.com/wp-content/uploads/2023/01/DH-IPC-HDBW2431E-S-S2.jpg', useCase: 'Commercial', location: 'Outdoors (Requires Weatherproofing)', connection: 'Wired (PoE)', storage: 'Long Term', priceTier: 'Mid-Range', resolution: '4MP', PLS: 0.88, description: '4MP Entry IR Fixed-focal Dome Network Camera. Integrated IR LEDs (max 30m). H.265 codec. IP67 and IK10 vandal protection.', price: '₱7,990', features: 'ROI SMART H.264+/H.265+, Intelligent detection (Intrusion, wire-trap), Anomaly detection, Max 256GB Micro SD Card.' },
        { id: 'P002', name: 'HIKVISION 2MP ColorVu Mini Bullet', type: 'CCTV', img: 'https://goodhand88.com/wp-content/uploads/2023/01/2CE10DF3T-300x300.jpg', useCase: 'Residential', location: 'Outdoors (Requires Weatherproofing)', connection: 'Wired (PoE)', storage: 'Short Term', priceTier: 'Economy', resolution: '2MP', PLS: 0.72, description: 'High quality imaging with 2 MP resolution. 24/7 color imaging with F1.0 aperture. Water and dust resistant (IP67). Built-in mic.' },
        { id: 'P003', name: 'IMOU Ranger 2K Wi-Fi Kit', type: 'CCTV', img: 'https://goodhand88.com/wp-content/uploads/2023/01/2CE10DF3T-300x300.jpg', useCase: 'Residential', location: 'Indoors Only', connection: 'Wireless (WiFi)', storage: 'Short Term', priceTier: 'Economy', resolution: '2K', PLS: 0.60, description: 'Affordable 2MP ColorVu Fixed Mini Bullet Camera with 24/7 color imaging, built-in mic, and dual antenna for stable network connection.' },
        { id: 'P004', name: 'HIKVISION 4MP ColorVu PoE Dome', type: 'CCTV', img: 'https://goodhand88.com/wp-content/uploads/2023/01/DS-2CD1147G0-UF-3-300x300.jpg', useCase: 'Small Business', location: 'Outdoors (Requires Weatherproofing)', connection: 'Wired (PoE)', storage: 'Medium Term', priceTier: 'Mid-Range', resolution: '4MP', PLS: 0.85, description: '4MP ColorVu Fixed Dome Network Camera. Excellent low-light performance. Vandal resistant (IK10) and IP67 protected.' },
        { id: 'P005', name: 'IMOU Bullet 2E 4MP Wi-Fi', type: 'CCTV', img: 'https://goodhand88.com/wp-content/uploads/2023/01/bullet-2-gallery-2-300x300.jpg', useCase: 'Residential', location: 'Outdoors (Requires Weatherproofing)', connection: 'Wireless (WiFi)', storage: 'Short Term', priceTier: 'Economy', resolution: '4MP', PLS: 0.70, description: '4MP Smart WiFi Camera with 30m night vision and dual antenna for stable network connection. Perfect for DIY home installation.' },
        { id: 'P006', name: 'Transcend DrivePro 30 Body Cam', type: 'CCTV', img: 'https://goodhand88.com/wp-content/uploads/2022/09/9-300x300.jpg', useCase: 'Commercial', location: 'Outdoors (Requires Weatherproofing)', connection: 'Wireless (WiFi)', storage: 'Long Term', priceTier: 'Premium', PLS: 0.90, description: 'Full HD 1440P Body Camera with 12 hour battery life. Ideal for security personnel. IP67 rated.' },
        { id: 'A001', name: 'Patrol Hawk Basic Burglar Kit', type: 'Alarm', img: 'https://goodhand88.com/wp-content/uploads/2022/10/2-300x300.jpg', useCase: 'Residential', features: 'WIFI & GSM Dual-Network, 99 Wireless Zones, Motion Sensors', priceTier: 'Economy', PLS: 0.75, description: 'WIFI & GSM Dual-Network security system. Includes low battery alert and sensor status self-detection.', price: '₱5,999' },
        { id: 'A002', name: 'Goodhand STEWARD-WF Energizer', type: 'Alarm', img: 'https://goodhand88.com/wp-content/uploads/2022/09/Untitled-1-01-300x300.jpg', useCase: 'Commercial', features: 'High Voltage Pulse (5-14kV), Perimeter Security', priceTier: 'Premium', PLS: 0.90, description: 'Electric fence energizer generating high voltage pulse for physical and psychological barrier against intrusions.', price: '₱10,800' },
        { id: 'A003', name: 'Patrol Hawk WIFI/GSM Gas Detector', type: 'Alarm', img: 'https://goodhand88.com/wp-content/uploads/2022/10/home-alarm-50-300x300.jpg', useCase: 'Residential', priceTier: 'Mid-Range', PLS: 0.80, description: 'WIFI & GSM Dual-Network alarm system integrated with a gas leak detector and optional IP camera viewing.', price: '₱4,500' },
        { id: 'C001', name: 'EPIC ES-F730G Smart Door Lock', type: 'Access', img: 'https://goodhand88.com/wp-content/uploads/2022/09/Untitled-2-03-300x300.jpg', useCase: 'Residential', features: 'Fingerprint, PIN, Card, Bluetooth, Mechanical Key', priceTier: 'Premium', PLS: 0.92, description: 'Advanced smart lock with multiple authentication methods and built-in fire sensor. Supports 40mm-50mm door thickness.', price: '₱12,500' },
        { id: 'C002', name: 'ZKTeco F18 Biometric Terminal', type: 'Access', img: 'https://goodhand88.com/wp-content/uploads/2022/09/revised-product-section-image-29-300x300.jpg', useCase: 'Small Business', priceTier: 'Mid-Range', PLS: 0.65, description: 'Biometric time attendance and access control terminal. 3,000 Fingerprint templates, 30,000 logs.', price: '₱4,800' },
        { id: 'C003', name: 'Philips 7300-5HB Lever Lock', type: 'Access', img: 'https://goodhand88.com/wp-content/uploads/2022/09/Untitled-2-02-300x300.jpg', useCase: 'Residential', features: 'Fingerprint, Pincode, Keytag, Lever handle', priceTier: 'Premium', PLS: 0.90, description: 'Premium Lever handle Smart Door Lock with multiple verification methods and semiconductor fingerprint sensor.', price: '₱14,000' },
        { id: 'W001', name: 'Cignus UV-8 Dual-Band Radio', type: 'Comm', img: 'https://goodhand88.com/wp-content/uploads/2022/09/revised-product-section-image-30-300x300.jpg', useCase: 'Small Business', features: '2W, UHF 400MHz-470MHz, 16 Channels', priceTier: 'Economy', PLS: 0.70, description: 'Professional Handheld Two-Way Radio for clear team communication.', price: '₱3,500' },
        { id: 'W002', name: 'Motorola CP1660 Professional Radio', type: 'Comm', img: 'https://goodhand88.com/wp-content/uploads/2022/09/Untitled-1-01-1-300x300.jpg', useCase: 'Commercial', features: 'Full Keypad, 199 Channels, Built-in Scrambler, 5W', priceTier: 'Premium', PLS: 0.95, description: 'High-power professional two-way radio for complex commercial operations.', price: '₱15,000' }
        ,
        // --- Imported/approximated from Goodhand Products - Sheet1.tsv ---
        { id: 'D101', name: 'DAHUA HAC-EBW3802 8MP HDCVI Fisheye', type: 'CCTV', img: 'https://goodhand88.com/wp-content/uploads/2023/01/HAC-EBW38021-v2-300x300.jpg', useCase: 'Commercial', location: 'Indoors Only', connection: 'Wired (HDCVI)', resolution: '8MP', priceTier: 'Premium', price: '₱18,500', description: '8MP HDCVI IR Fisheye, 15fps@4K, 120dB WDR, 15m IR, IP67/IK10.' },
        { id: 'D102', name: 'DAHUA HAC-HDBW1400R-Z 4MP HDCVI Dome', type: 'CCTV', img: 'https://goodhand88.com/wp-content/uploads/2022/12/DH-HAC-HDBW1400R-Z-300x300.jpg', useCase: 'Small Business', location: 'Outdoors (Requires Weatherproofing)', connection: 'Wired (HDCVI)', resolution: '4MP', priceTier: 'Mid-Range', price: '₱7,450', description: '4MP HDCVI IR Dome, motorized 2.7–12mm lens, 30m IR, IP67/IK10.' },
        { id: 'D103', name: 'DAHUA HAC-HDW1400EM-A-POC 4MP Eyeball', type: 'CCTV', img: 'https://goodhand88.com/wp-content/uploads/2022/12/DH-HAC-HDW1400EM-A-POC-300x300.jpg', useCase: 'Residential', location: 'Outdoors (Requires Weatherproofing)', connection: 'Wired (PoC)', resolution: '4MP', priceTier: 'Economy', price: '₱4,990', description: '4MP POC IR Eyeball, built-in mic, 50m Smart IR, IP67.' },
        { id: 'H201', name: 'HIKVISION DS-2CE10DF3T-F 2MP ColorVu', type: 'CCTV', img: 'https://goodhand88.com/wp-content/uploads/2023/01/2CE10DF3T-300x300.jpg', useCase: 'Residential', location: 'Outdoors (Requires Weatherproofing)', connection: 'Wired (Coax)', resolution: '2MP', priceTier: 'Economy', price: '₱3,990', description: '2MP ColorVu mini bullet, F1.0 aperture, 20m white light, IP67.' },
        { id: 'H202', name: 'HIKVISION DS-2CD1123G0E-I 2MP Dome', type: 'CCTV', img: 'https://goodhand88.com/wp-content/uploads/2023/01/DS-2CD2123G2-IS-3-300x300.jpg', useCase: 'Small Business', location: 'Outdoors (Requires Weatherproofing)', connection: 'Wired (PoE)', resolution: '2MP', priceTier: 'Mid-Range', price: '₱5,950', description: '2MP dome, H.265+, DWDR, IP67, IK10 vandal resistant, EXIR 2.0.' },
        { id: 'I301', name: 'IMOU Bullet 2E 4MP Wi‑Fi', type: 'CCTV', img: 'https://goodhand88.com/wp-content/uploads/2023/01/bullet-2-gallery-2-300x300.jpg', useCase: 'Residential', location: 'Outdoors (Requires Weatherproofing)', connection: 'Wireless (WiFi)', resolution: '4MP', priceTier: 'Economy', price: '₱3,990', description: '4MP Wi‑Fi camera, 30m night vision, dual antenna, IP67.' },
        { id: 'I302', name: 'IMOU Cruiser SE 2MP 360° Wi‑Fi', type: 'CCTV', img: 'https://goodhand88.com/wp-content/uploads/2023/01/4-300x300.jpg', useCase: 'Residential', location: 'Outdoors (Requires Weatherproofing)', connection: 'Wireless (WiFi)', resolution: '2MP', priceTier: 'Economy', price: '₱3,690', description: '2MP pan/tilt 355°/90°, 30m night vision, ONVIF, dual antenna.' },
        { id: 'E401', name: 'Goodhand STEWARD‑WF Electric Fence Energizer', type: 'Alarm', img: 'https://goodhand88.com/wp-content/uploads/2022/09/Untitled-1-01-300x300.jpg', useCase: 'Commercial', features: 'Electric Fence, 5–14kV pulse', priceTier: 'Premium', price: '₱10,800', description: 'Single‑zone energizer creating strong psychological and physical barrier.' },
        { id: 'E402', name: 'Goodhand SAFER‑5 Electric Fence Energizer', type: 'Alarm', img: 'https://goodhand88.com/wp-content/uploads/2022/09/Untitled-2-01-300x300.jpg', useCase: 'Small Business', features: '12kV pulse', priceTier: 'Mid-Range', price: '₱9,990', description: 'Reliable perimeter energizer with strong intrusion deterrent.' },
        { id: 'R501', name: 'Cignus UV‑8 Dual‑Band Radio', type: 'Comm', img: 'https://goodhand88.com/wp-content/uploads/2022/09/revised-product-section-image-39-300x300.jpg', useCase: 'Small Business', features: 'VHF/UHF, 5W, 128 channels', priceTier: 'Mid-Range', price: '₱3,800', description: 'Dual‑band handheld with robust battery and keypad.' },
        { id: 'R502', name: 'Kenwood TK3000 UHF Radio', type: 'Comm', img: 'https://goodhand88.com/wp-content/uploads/2022/09/revised-product-section-image-45-300x300.jpg', useCase: 'Commercial', features: '16 channels, compact, durable', priceTier: 'Premium', price: '₱12,900', description: 'Ultra‑compact two‑way radio with 10h battery life.' },
        { id: 'L601', name: 'EPIC ES‑F730G Smart Door Lock', type: 'Access', img: 'https://goodhand88.com/wp-content/uploads/2022/09/Untitled-2-03-300x300.jpg', useCase: 'Residential', features: 'Fingerprint, PIN, RFID, Bluetooth', priceTier: 'Premium', price: '₱14,900', description: 'Lever handle smart lock with multiple authentication methods.' },
        { id: 'L602', name: 'Philips 7300‑5HB Lever Smart Lock', type: 'Access', img: 'https://goodhand88.com/wp-content/uploads/2022/09/sp-23-300x300.jpg', useCase: 'Residential', features: 'Fingerprint, PIN, Keytag', priceTier: 'Premium', price: '₱18,500', description: 'Premium smart lock with semiconductor fingerprint sensor.' }
    ];

    // Backfill missing price/img using known TSV-derived mappings or reasonable defaults
    normalizeProducts() {
        const TSV_PRODUCT_INDEX = [
            { match: 'HAC-EBW3802', img: 'https://goodhand88.com/wp-content/uploads/2023/01/HAC-EBW38021-v2-300x300.jpg', price: '₱18,500' },
            { match: 'HAC-HDBW1400R-Z', img: 'https://goodhand88.com/wp-content/uploads/2022/12/DH-HAC-HDBW1400R-Z-300x300.jpg', price: '₱7,450' },
            { match: 'HAC-HDW1400EM-A-POC', img: 'https://goodhand88.com/wp-content/uploads/2022/12/DH-HAC-HDW1400EM-A-POC-300x300.jpg', price: '₱4,990' },
            { match: 'DS-2CE10DF3T', img: 'https://goodhand88.com/wp-content/uploads/2023/01/2CE10DF3T-300x300.jpg', price: '₱3,990' },
            { match: 'DS-2CD1123G0E-I', img: 'https://goodhand88.com/wp-content/uploads/2023/01/DS-2CD2123G2-IS-3-300x300.jpg', price: '₱5,950' },
            { match: 'IMOU Bullet 2E', img: 'https://goodhand88.com/wp-content/uploads/2023/01/bullet-2-gallery-2-300x300.jpg', price: '₱3,990' },
            { match: 'Cruiser SE 2MP', img: 'https://goodhand88.com/wp-content/uploads/2023/01/4-300x300.jpg', price: '₱3,690' },
            { match: 'STEWARD-WF', img: 'https://goodhand88.com/wp-content/uploads/2022/09/Untitled-1-01-300x300.jpg', price: '₱10,800' },
            { match: 'SAFER-5', img: 'https://goodhand88.com/wp-content/uploads/2022/09/Untitled-2-01-300x300.jpg', price: '₱9,990' },
            { match: 'ZKTeco F18', img: 'https://goodhand88.com/wp-content/uploads/2022/09/revised-product-section-image-20-300x300.jpg', price: '₱4,800' },
            { match: 'ES-F730G', img: 'https://goodhand88.com/wp-content/uploads/2022/09/Untitled-2-03-300x300.jpg', price: '₱14,900' },
            { match: '7300-5HB', img: 'https://goodhand88.com/wp-content/uploads/2022/09/sp-23-300x300.jpg', price: '₱18,500' },
            { match: 'Cignus UV-8', img: 'https://goodhand88.com/wp-content/uploads/2022/09/revised-product-section-image-30-300x300.jpg', price: '₱3,500' },
            { match: 'Kenwood TK3000', img: 'https://goodhand88.com/wp-content/uploads/2022/09/revised-product-section-image-45-300x300.jpg', price: '₱12,900' },
        ];
        const guessPrice = (p)=>{
            if (p.price) return p.price;
            const tier = (p.priceTier||'').toLowerCase();
            if (tier.includes('premium')) return '₱18,500';
            if (tier.includes('mid')) return '₱7,500';
            return '₱3,990';
        };
        this.PRODUCTS = this.PRODUCTS.map(p => {
            let updated = { ...p };
            const name = (p.name||'') + ' ' + (p.id||'');
            const hit = TSV_PRODUCT_INDEX.find(entry => name.includes(entry.match));
            if (hit) {
                if (!updated.img || updated.img.trim() === '' || /placehold\.co/.test(updated.img)) {
                    updated.img = hit.img;
                }
                if (!updated.price || updated.price.trim() === '') {
                    updated.price = hit.price;
                }
            } else {
                if (!updated.price || updated.price.trim() === '') {
                    updated.price = guessPrice(updated);
                }
            }
            return updated;
        });
    }

    // --- 2. LOGIC-DRIVEN QUESTION FLOW AND DYNAMIC SKIP LOGIC ---
    QUESTIONS = [
        { title: "Step 1: What is the main product category you are looking for?", facet: 'type', options: [ { text: "Video Monitoring (CCTV/IP Cameras)", value: "CCTV" }, { text: "Alerts & Detection (Alarms/Sensums,or", value: "Alarm" }, { text: "Entry Control (Biometrics/Locks)", value: "Access" }, { text: "Two-Way Communication (Radios)", value: "Comm" }, ] },
        { title: "Step 2: Where will the primary security equipment be used?", facet: 'useCase', options: [ { text: "Home/Apartment (Residential)", value: "Residential" }, { text: "Small Office/Shop (Small Business)", value: "Small Business" }, { text: "Large Building/Warehouse (Commercial/Industrial)", value: "Commercial" }, ], dynamicSkip: { 'Commercial': { skipUntil: 5, setDefaults: { location: 'Outdoors (Requires Weatherproofing)', connection: 'Wired (PoE)', storage: 'Long Term' } } } },
        { title: "Step 3: Will the cameras be exposed to rain or dust?", facet: 'location', options: [ { text: "Indoors Only (No weather resistance needed)", value: "Indoors Only" }, { text: "Outdoors (Requires weatherproofing)", value: "Outdoors (Requires Weatherproofing)" } ], condition: { facet: 'type', value: 'CCTV' } },
        { title: "Step 4: What is your connection preference?", facet: 'connection', options: [ { text: "Wireless (Easiest Install, Uses Wi-Fi)", value: "Wireless (WiFi)" }, { text: "Wired (Most Reliable, Uses Ethernet/PoE)", value: "Wired (PoE)" } ], condition: { facet: 'type', value: 'CCTV' } },
        { title: "Step 5: How long do you need to store your footage?", facet: 'storage', options: [ { text: "Short Term (SD Card/Cloud - 3-7 Days)", value: "Short Term" }, { text: "Medium Term (NVR - 2 Weeks)", value: "Medium Term" }, { text: "Long Term (NVR - 30+ Days)", value: "Long Term" } ], condition: { facet: 'type', value: 'CCTV' } },
        { title: "Final Step: What is your preferred budget tier?", facet: 'priceTier', options: [ { text: "Economy (Best Value)", value: "Economy" }, { text: "Mid-Range (Standard Features)", value: "Mid-Range" }, { text: "Premium (Highest Performance)", value: "Premium" } ] }
    ];


    constructor(page) {
        this.currentPage = page; 
        this.currentStep = 0;
        this.userPath = {};
        this.filters = {};
        try {
            this.sessionId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        } catch(e) {
            this.sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        }
        this.history = []; 
        this.inquiredProducts = this.loadInquiries(); 
        // Catalog pagination state
        this.catalogPage = 1;
        this.catalogPageSize = 6;
        this.lastFilteredProducts = null;

        // Normalize existing product entries using known TSV data (images/prices)
        this.normalizeProducts();
        
        // --- Modal Safety Check (Ensuring modals are hidden early) ---
        const advisorModalEl = document.getElementById('advisor-modal');
        const modalOverlay = document.getElementById('product-detail-modal');
        const inquiryFormModalEl = document.getElementById('inquiry-form-modal');

        const allModalOverlays = [
            advisorModalEl,
            modalOverlay,
            inquiryFormModalEl
        ].filter(el => el);
        
        allModalOverlays.forEach(modal => {
            modal.classList.add('hidden');
        });
        
        // --- Floating Advisor Button Handler is now attached in the global callback ---
        
        // *** FIX 1: Single Delegated Listener attached to the document for ALL clicks ***
        document.addEventListener('click', this.handleDelegatedClick.bind(this));
        
        // *** FIX 3: Single Delegated Listener for form submissions ***
        document.addEventListener('submit', this.handleDelegatedFormSubmit.bind(this));
        
       // Floating advisor element removed from markup; header CTAs are used instead.

        // --- Page-Specific Setup ---
        if (this.currentPage === 'products') {
            this.setupProductsPage();
        } else if (this.currentPage === 'home') {
            this.setupHomePage();
        }
    }
    
    // *** FIX 3: Converted to standard method for hoisting fix ***
    renderStep() {
        const quizContainer = document.getElementById('quiz-container');
        const resultsContainer = document.getElementById('results-container');
        const backButton = document.getElementById('back-button');

        // Robust element check eliminates TypeErrors
        if (!quizContainer || !resultsContainer || !backButton) {
             return; 
        }

        resultsContainer.classList.add('hidden');
        quizContainer.classList.remove('hidden');

        const questionData = this.QUESTIONS[this.currentStep];

        if (!questionData) {
            this.renderResults();
            return;
        }
        
        // --- FIX: Go Back Button Visibility ---
        if (this.history.length === 0) {
            backButton.style.display = 'none';
        } else {
            backButton.style.display = 'inline-flex';
        }
        
        document.getElementById('current-step-title').textContent = questionData.title;
        
        // --- Conditional Logic Check ---
        if (questionData.condition) {
            const requiredValue = this.userPath[questionData.condition.facet];
            if (requiredValue !== questionData.condition.value) {
                this.currentStep++;
                if (this.currentStep < this.QUESTIONS.length) {
                    this.renderStep();
                    return;
                }
            }
        }
        
        // NOTE: Uses data-attributes for Event Delegation
        let optionsHtml = questionData.options.map(option => `
            <button 
                data-facet="${questionData.facet}"
                data-value="${option.value}"
                data-text="${option.text}"
                class="w-full text-left p-4 hover:bg-secondary text-primary hover:text-white transition duration-200 rounded-lg shadow-md border-b-4 border-secondary focus:outline-none focus:ring-4 focus:ring-secondary focus:ring-opacity-50"
            >
                ${option.text}
            </button>
        `).join('');
        
        quizContainer.innerHTML = optionsHtml;
        
        this.renderFilteredProducts(false, document.getElementById('live-product-list')); 
    }
    
    // --- NEW: Universal Delegated Click Handler (Event Delegation Hub) ---
    handleDelegatedClick(event) {
        const target = event.target;
        const advisorModalIsVisible = document.getElementById('advisor-modal')?.classList.contains('hidden') === false;
        
        // 1. MODAL ACTIONS (Close, Open Inquiry, Submit Form)
        const modalActionTarget = target.closest('[data-modal-action]');
        if (modalActionTarget) {
            this.handleModalActionsDelegated(event, modalActionTarget);
            return;
        }

        // 2. QUIZ OPTION SELECTION (Delegated from the button inside the modal)
        const quizOptionTarget = target.closest('#quiz-container button[data-facet]');
        if (quizOptionTarget && advisorModalIsVisible) {
            this.selectOption(quizOptionTarget.dataset.facet, quizOptionTarget.dataset.value, quizOptionTarget.dataset.text);
            return;
        }

        // 3. ADVISOR GRID ACTIONS (Reset, Back)
        const advisorActionTarget = target.closest('#advisor-grid-area [data-action]');
        if (advisorActionTarget) {
             if (advisorActionTarget.dataset.action === 'reset') {
                 this.resetQuiz();
             } else if (advisorActionTarget.dataset.action === 'back') { 
                 this.goBackStep();
             }
             return;
        }
        
        // 4. CATALOG PRODUCT CLICK (Product cards in catalog/inquiries)
        const catalogCardTarget = target.closest('.product-card[data-product-id]');
        if (catalogCardTarget) {
             this.showProductDetails(catalogCardTarget.dataset.productId);
             return;
        }
    }
    
    // --- Helper for delegated modal actions (Close, Inquiry, Submission) ---
    handleModalActionsDelegated(event, target) {
        const action = target.dataset.modalAction;
        const modalEl = target.closest('.modal-overlay');

        if (!modalEl) return;

        if (action === 'close') {
            modalEl.classList.add('hidden');
        } else if (action === 'open-inquiry') {
            const productId = target.dataset.productId;
            if(productId){
                modalEl.classList.add('hidden');
                this.showInquiryForm(productId);
            }
        } 
    }
    
    // Handle form submission for inquiry forms
    handleDelegatedFormSubmit(event) {
        const target = event.target;
        
        // Check if this is an inquiry form submission
        if (target.id === 'inquiry-form') {
            event.preventDefault();
            
            // Get the product ID from the form's data attribute
            const productId = target.dataset.productId;
            if (productId) {
                this.handleInquiryFormSubmission(productId);
            }
            return;
        }
        
        // Check if this is a contact form submission on inquire.html
        if (target.id === 'contact-form') {
            // This is handled separately in inquire.html
            return;
        }
    }
    
    setupHomePage() {
        // NOTE: renderInquiredProductsList removed as per user request to remove section.
        
        const homeAdvisorCta = document.getElementById('home-advisor-cta');
        if (homeAdvisorCta) homeAdvisorCta.addEventListener('click', this.showAdvisorModal.bind(this));
    }

    setupProductsPage() {
        // 1. Attach filtering listeners (Robust with null checks)
        const categoryFilter = document.getElementById('category-filter');
        const usecaseFilter = document.getElementById('usecase-filter');
        const priceFilter = document.getElementById('price-filter');
        const searchInput = document.getElementById('search-input');
        const pageSizeSelect = document.getElementById('page-size');
        const clearFiltersBtn = document.getElementById('clear-filters-btn');

        // FIX: The methods are now standard methods, solving the original bind error.
        if (categoryFilter) categoryFilter.addEventListener('change', this.handleStandardFilter.bind(this));
        if (usecaseFilter) usecaseFilter.addEventListener('change', this.handleStandardFilter.bind(this));
        if (priceFilter) priceFilter.addEventListener('change', this.handleStandardFilter.bind(this));
        if (searchInput) searchInput.addEventListener('input', this.handleStandardFilter.bind(this));
        if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', ()=>{
            if (categoryFilter) categoryFilter.value = '';
            if (usecaseFilter) usecaseFilter.value = '';
            if (priceFilter) priceFilter.value = '';
            if (searchInput) { searchInput.value = ''; }
            this.catalogPage = 1;
            this.lastFilteredProducts = null;
            this.renderCatalog();
        });
        if (pageSizeSelect) pageSizeSelect.addEventListener('change', (e)=>{
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) {
                this.catalogPageSize = v;
                this.catalogPage = 1;
                this.renderCatalog();
            }
        });
        // Pagination click (event delegation)
        const paginationEl = document.getElementById('catalog-pagination');
        if (paginationEl) {
            paginationEl.addEventListener('click', (e)=>{
                const btn = e.target.closest('[data-page]');
                if (!btn) return;
                const page = parseInt(btn.dataset.page, 10);
                if (!isNaN(page)) {
                    this.catalogPage = page;
                    this.renderCatalog();
                }
            });
        }
        
        // 2. Attach Advisor CTA inside filter block
        const launchAdvisorBtn = document.querySelector('[data-action="open-advisor"]'); 
        if (launchAdvisorBtn) launchAdvisorBtn.addEventListener('click', this.showAdvisorModal.bind(this));
        
        // 3. Initial render of the full catalog and quiz state
        this.lastFilteredProducts = Array.isArray(this.PRODUCTS) ? this.PRODUCTS : [];
        this.renderCatalog(); 
        this.renderStep(); 
    }

    // --- LOCAL STORAGE FUNCTIONS ---

    saveInquiryData(data) {
        localStorage.setItem('inquiryData', JSON.stringify(data));
    }

    loadInquiryData() {
        return JSON.parse(localStorage.getItem('inquiryData') || '{}');
    }
    
    saveInquiries() {
        localStorage.setItem('inquiredProducts', JSON.stringify(this.inquiredProducts));
        // NOTE: Removed renderInquiredProductsList call as per user request
    }

    loadInquiries() {
        return JSON.parse(localStorage.getItem('inquiredProducts') || '[]');
    }


    // --- STANDARD E-COMMERCE CATALOG METHODS ---

    handleStandardFilter() {
        const filters = {
            category: document.getElementById('category-filter')?.value,
            useCase: document.getElementById('usecase-filter')?.value,
            priceTier: document.getElementById('price-filter')?.value,
            searchTerm: document.getElementById('search-input')?.value.toLowerCase() || '',
        };
        this.catalogPage = 1;
        this.lastFilteredProducts = this.filterProducts(filters);
        this.renderCatalog();
    }


    renderCatalog() {
        const catalogListEl = document.getElementById('catalog-list');
        if (!catalogListEl) return;

        const filters = {
            category: document.getElementById('category-filter')?.value,
            useCase: document.getElementById('usecase-filter')?.value,
            priceTier: document.getElementById('price-filter')?.value,
            searchTerm: document.getElementById('search-input')?.value?.toLowerCase() || ''
        };

        const baseProducts = this.lastFilteredProducts || this.filterProducts(filters);
        const products = Array.isArray(baseProducts) ? baseProducts : [];
        this.lastFilteredProducts = products;

        const total = Array.isArray(products) ? products.length : 0;
        const pageSize = this.catalogPageSize;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const page = Math.min(this.catalogPage, totalPages);
        this.catalogPage = page;

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pageItems = Array.isArray(products) ? products.slice(start, end) : [];

        this.renderProductCards(pageItems, catalogListEl, false);

        const initialLoadMessage = document.getElementById('initial-load-message');
        if(initialLoadMessage) initialLoadMessage.classList.add('hidden');

        const catalogEmpty = document.getElementById('catalog-empty');
        if (catalogEmpty) catalogEmpty.classList.toggle('hidden', total > 0);

        const countEl = document.getElementById('catalog-count');
        if (countEl) {
            countEl.textContent = total > 0 ? `Showing ${start + 1}–${Math.min(end, total)} of ${total} products` : '';
        }

        const paginationEl = document.getElementById('catalog-pagination');
        if (paginationEl) {
            paginationEl.innerHTML = this.buildPagination(totalPages, page);
        }
    }

    filterProducts(filters) {
        return this.PRODUCTS.filter(product => {
            let match = true;
            if (filters.category && product.type !== filters.category) match = false;
            if (filters.useCase && product.useCase !== filters.useCase) match = false;
            if (filters.priceTier && product.priceTier !== filters.priceTier) match = false;
            if (filters.searchTerm && (!product.name.toLowerCase().includes(filters.searchTerm) && !product.id.toLowerCase().includes(filters.searchTerm))) match = false;
            return match;
        });
    }

    buildPagination(totalPages, current) {
        if (totalPages <= 1) return '';
        const btn = (p, label = p, active = false, disabled = false) => `
            <button class="page-btn ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}" data-page="${disabled ? '' : p}" ${disabled ? 'disabled' : ''}>${label}</button>
        `;
        const parts = [];
        parts.push(btn(Math.max(1, current - 1), 'Prev', false, current === 1));
        const range = this.paginationRange(current, totalPages);
        range.forEach(p => {
            parts.push(btn(p, p, p === current));
        });
        parts.push(btn(Math.min(totalPages, current + 1), 'Next', false, current === totalPages));
        return parts.join('');
    }

    paginationRange(current, total) {
        const delta = 2;
        const range = [];
        const start = Math.max(1, current - delta);
        const end = Math.min(total, current + delta);
        for (let i = start; i <= end; i++) range.push(i);
        if (start > 1) range.unshift(1);
        if (end < total) range.push(total);
        return Array.from(new Set(range));
    }

    renderProductCards(products, containerEl, isAdvisorModal = true) {
        if (!containerEl) return; 

        const cardClass = isAdvisorModal ? 
            "product-card bg-white p-3 rounded-lg shadow-md cursor-pointer transition duration-150 hover:shadow-lg border-l-4 border-secondary" : 
            "product-card catalog-card bg-white p-4 rounded-xl shadow-md cursor-pointer transition duration-150 hover:shadow-lg border-t-4 border-secondary";
        
        const imgClass = isAdvisorModal ? "w-16 h-16 object-cover rounded-md border border-gray-200" : "w-full h-40 object-contain mx-auto mb-3";
        const titleClass = isAdvisorModal ? "text-lg font-bold text-primary" : "text-xl font-bold text-primary";
        const priceClass = isAdvisorModal ? "text-sm text-green-600 mt-1" : "text-2xl font-extrabold text-cta-red";


        containerEl.innerHTML = products.map(product => `
            <div 
                data-product-id="${product.id}"
                class="${cardClass}"
            >
                <div class="flex items-center space-x-3 ${isAdvisorModal ? '' : 'flex-col space-x-0'}">
                    <img class="${imgClass}" src="${product.img}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/250x150/193893/ffffff?text=Product+Image';">
                    <div class="${isAdvisorModal ? '' : 'w-full text-center mt-3'}">
                        <p class="${titleClass}">${product.name}</p>
                        <p class="text-sm text-gray-500">${product.type} | Use: ${product.useCase}</p>
                        <p class="${priceClass}">${product.price}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // --- LOGIC-DRIVEN ADVISOR CORE METHODS ---

    showAdvisorModal() {
        const advisorModalEl = document.getElementById('advisor-modal');
        const quizContainer = document.getElementById('quiz-container');

        if (!advisorModalEl || !quizContainer) return;
        
        advisorModalEl.classList.remove('hidden');
        
        quizContainer.innerHTML = '<p class="text-center text-gray-500">Loading quiz...</p>'; 

        this.resetQuiz();
        Toast.info('Advisor started! Answer the questions to find your perfect security system.', 'Logic Advisor');
    }
    
    // --- Show Product Details Modal (Universal) ---
    showProductDetails(productId) {
        const product = this.PRODUCTS.find(p => p.id === productId); 
        if (!product) return;

        const modalContent = document.getElementById('product-detail-modal');
        if (!modalContent) return;
        
        const specs = [
            { label: 'Type', value: product.type },
            { label: 'Use Case', value: product.useCase },
            ...(product.resolution ? [{ label: 'Resolution', value: product.resolution }] : []),
            ...(product.priceTier ? [{ label: 'Tier', value: product.priceTier }] : []),
            ...(product.features ? [{ label: 'Key Features', value: product.features }] : []),
            ...(product.location ? [{ label: 'Rating', value: product.location }] : []),
            ...(product.connection ? [{ label: 'Connection', value: product.connection }] : []),
            { label: 'Price', value: product.price, color: 'text-green-600 font-extrabold' },
        ];
        
        const detailsHtml = `
            <div class="modal-content">
                <div class="flex justify-between items-center pb-3 border-b border-gray-300">
                    <h3 class="text-3xl font-bold text-secondary">${product.name}</h3>
                    <span data-modal-action="close" data-target="product-detail-modal" class="close-button text-gray-500 hover:text-cta-red">×</span>
                </div>
                <div class="py-6 space-y-4">
                    <div class="flex flex-col sm:flex-row gap-6">
                        <img class="w-full sm:w-1/3 h-auto max-h-56 object-cover rounded-lg shadow-lg border border-gray-300" src="${product.img}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/193893/ffffff?text=PRODUCT+IMAGE';">
                        <div class="sm:w-2/3">
                            <h4 class="text-2xl font-extrabold mb-1">${product.price}</h4>
                            <p class="text-gray-700 mt-2">${product.description || 'A top-of-the-line security product from GoodHand, designed for maximum reliability and ease of use in its specific application.'}</p>
                            
                            <div class="mt-4">
                                <button data-modal-action="open-inquiry" data-product-id="${productId}" class="bg-cta-red hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg uppercase">
                                    <i class="fas fa-file-alt mr-2"></i> INQUIRE ABOUT THIS PRODUCT
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="pt-2">
                        <p class="text-xl font-semibold text-primary mb-3">Detailed Specifications</p>
                        <dl class="specs-grid">
                            ${specs.map(s => `
                                <div class="spec-item">
                                    <dt class="spec-label">${s.label}</dt>
                                    <dd class="spec-value ${s.color || ''}">${s.value}</dd>
                                </div>
                            `).join('')}
                        </dl>
                    </div>
                </div>
                <div class="pt-4 border-t border-gray-300 flex justify-end">
                    <button data-modal-action="close" data-target="product-detail-modal" class="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        modalContent.innerHTML = detailsHtml;
        // Ensure product modal appears above advisor modal when opened from inside it
        try { modalContent.style.zIndex = '10002'; } catch(e){}
        modalContent.classList.remove('hidden');
    }
    
    // --- INQUIRY FORM MODAL ---

    showInquiryForm(productId) {
        const product = this.PRODUCTS.find(p => p.id === productId);
        const inquiryModal = document.getElementById('inquiry-form-modal');
        // Get saved data for auto-fill
        const savedData = this.loadInquiryData(); 

        if (!inquiryModal) return;
        
        // FIX: Use savedData directly in the form HTML injection
        const formHtml = `
            <div class="modal-content">
                <div class="flex justify-between items-center pb-3 border-b border-gray-300">
                    <h3 class="text-2xl font-bold text-cta-red">Inquiry: ${product.name}</h3>
                    <span data-modal-action="close" data-target="inquiry-form-modal" class="close-button hover:text-red-500">×</span>
                </div>
                
                <form id="inquiry-form" data-product-id="${productId}" class="py-4 space-y-4">
                    <p class="text-sm text-gray-600">Please provide your contact details. Product Model: <strong>${product.name}</strong> (${product.price})</p>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Full Name*</label>
                        <input type="text" id="inq-name" value="${savedData.name || ''}" class="w-full p-2 border rounded-lg" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email Address*</label>
                        <input type="email" id="inq-email" value="${savedData.email || ''}" class="w-full p-2 border rounded-lg" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" id="inq-phone" value="${savedData.phone || ''}" class="w-full p-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Message / Specific Questions</label>
                        <textarea id="inq-message" rows="3" class="w-full p-2 border rounded-lg" placeholder="e.g., Are there installation services available?"></textarea>
                    </div>

                    <div class="flex items-center">
                        <input type="checkbox" id="save-data" class="h-4 w-4 text-primary rounded" ${savedData.name ? 'checked' : ''}>
                        <label for="save-data" class="ml-2 block text-sm text-gray-700">Save my name/email locally for future inquiries.</label>
                    </div>

                    <button type="submit" id="submit-inquiry-form" data-product-id="${productId}" class="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-primary transition uppercase">
                        Submit Inquiry
                    </button>
                </form>
            </div>
        `;

        inquiryModal.innerHTML = formHtml;
        inquiryModal.classList.remove('hidden');
    }
    
    handleInquiryFormSubmission(productId) {
        const product = this.PRODUCTS.find(p => p.id === productId);
        const name = document.getElementById('inq-name').value;
        const email = document.getElementById('inq-email').value;
        const phone = document.getElementById('inq-phone').value;
        const saveDataCheck = document.getElementById('save-data').checked;
        
        if (!name || !email) {
            Toast.error('Name and Email are required fields.', 'Form Incomplete');
            return;
        }

        // 1. Save user data locally if checked
        if (saveDataCheck) {
            this.saveInquiryData({ name, email, phone });
            Toast.info('Your contact information has been saved for future inquiries.', 'Data Saved');
        } else {
            localStorage.removeItem('inquiryData');
        }

        // 2. Add product to the user's inquired list
        const inquiryTime = new Date().toLocaleDateString();
        this.inquiredProducts.unshift({ 
            id: productId, 
            name: product.name, 
            price: product.price, 
            date: inquiryTime 
        });
        this.inquiredProducts = this.inquiredProducts.slice(0, 5); 
        this.saveInquiries();
        
        const inquiryModal = document.getElementById('inquiry-form-modal');

        // 3. Close modal and show success message
        if(inquiryModal){
            inquiryModal.classList.add('hidden');
        }
        
        // 4. Show success toast notification
        Toast.success(`Your inquiry for ${product.name} has been submitted! We'll contact you soon at ${email}.`, 'Inquiry Submitted');
        Toast.info('We usually respond within 1–2 hours during business days.', 'What Happens Next');
        Toast.warning('Didn\'t receive an email? Check your Spam/Promotions folder.', 'Email Tip');
    }
    
    // --- UTILITIES ---

    renderInquiredProductsList() {
        const listEl = document.getElementById('inquired-products-list');
        if (!listEl) return;
        
        if (this.inquiredProducts.length === 0) {
            listEl.innerHTML = '<p id="no-inquiries" class="text-gray-500 italic">No products inquired about yet. Find a product to start!</p>';
            return;
        }

        listEl.innerHTML = this.inquiredProducts.map(item => `
            <div data-product-id="${item.id}" class="product-card bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition duration-150">
                <p class="font-bold text-primary">${item.name}</p>
                <p class="text-sm text-cta-red">${item.price}</p>
                <p class="text-xs text-gray-500">Inquired: ${item.date}</p>
            </div>
        `).join('');
    }


    // Filters and Ranks Products (Logic-Based Filtering Algorithm)
    filterProducts() {
        const { results: strictlyFiltered, relaxed: strictlyRelaxed } = this._strictFilter(this.userPath);
        let filteredProducts = strictlyFiltered;
        let relaxedFacets = strictlyRelaxed;

        // --- FALLBACK/RELAXATION LOGIC (If no strict matches found) ---
        if (filteredProducts.length === 0) {
            const relaxationPriority = ['priceTier', 'storage', 'connection'];

            for (const facetToRelax of relaxationPriority) {
                if (this.userPath[facetToRelax]) {
                    const relaxedPath = { ...this.userPath };
                    delete relaxedPath[facetToRelax]; 

                    const { results: newFiltered } = this._strictFilter(relaxedPath);
                    filteredProducts = newFiltered;

                    if (filteredProducts.length > 0) {
                        const relaxedFacetName = this.filters[facetToRelax].replace('[Assumed: ', '').replace(']', '') || facetToRelax;
                        relaxedFacets += (relaxedFacets ? ', ' : '') + relaxedFacetName;
                        break; 
                    }
                }
            }
        }
        
        // --- PURCHASE LIKELIHOOD SCORE (PLS) RANKING ---
        filteredProducts.sort((a, b) => b.PLS - a.PLS); 

        return { results: filteredProducts, relaxed: relaxedFacets };
    }

    // Internal strict filtering logic helper
    _strictFilter(path) {
        let matches = true;
        const strictlyFiltered = this.PRODUCTS.filter(product => {
            matches = true;
            if (path.type && product.type !== path.type) { 
                return false;
            }
            for (const facet in path) {
                if (facet === 'type') continue;
                const userValue = path[facet];
                if (product[facet] && product[facet] !== userValue) {
                    matches = false;
                    break;
                }
            }
            return matches;
        });
        return { results: strictlyFiltered, relaxed: '' };
    }

    // FIX: Converted to standard method
    renderFilteredProducts(isFinal = false, listContainer) {
        const { results: filteredProducts, relaxed: relaxedFacets } = this.filterProducts(isFinal);
        const matchCountElement = document.getElementById('match-count');

        const productsToShow = isFinal ? filteredProducts : filteredProducts.slice(0, 4);

        if (!isFinal) {
            if(matchCountElement) matchCountElement.textContent = filteredProducts.length;
        } 

        if (productsToShow.length === 0 && !isFinal) {
            listContainer.innerHTML = '<p class="text-red-600 font-semibold">Your filters are very strict! Try a different answer or finish the quiz to see alternatives.</p>';
            return;
        }

        this.renderProductCards(productsToShow, listContainer, true); 
    }

    // FIX: Converted to standard method
    selectOption(facet, value, text) {
        // Save current state for 'Go Back'
        this.history.push({ 
            step: this.currentStep, 
            userPath: { ...this.userPath },
            filters: { ...this.filters }
        });
        
        this.userPath[facet] = value;
        this.filters[facet] = text;
        
        // --- Dynamic Skip Logic Execution ---
        let nextStep = this.currentStep + 1;
        const currentQuestionData = this.QUESTIONS[this.currentStep];

        if (currentQuestionData.dynamicSkip && currentQuestionData.dynamicSkip[value]) {
            const skipLogic = currentQuestionData.dynamicSkip[value];
            nextStep = skipLogic.skipUntil;
            
            // Set mandatory defaults for the skipped steps
            for (const [skipFacet, skipValue] of Object.entries(skipLogic.setDefaults)) {
                this.userPath[skipFacet] = skipValue;
                this.filters[skipFacet] = `[Assumed: ${skipValue}]`;
            }
        }

        this.currentStep = nextStep;
        
        if (this.currentStep < this.QUESTIONS.length) {
            this.renderStep();
        } else {
            this.renderResults();
        }
    }
    
    // FIX: Converted to standard method
    renderResults() {
        const resultsContainer = document.getElementById('results-container');
        if(!resultsContainer) return;

        const quizContainer = document.getElementById('quiz-container');
        if(quizContainer) quizContainer.classList.add('hidden');

        resultsContainer.classList.remove('hidden'); 

        const { results: filteredProducts, relaxed: relaxedFacets } = this.filterProducts(true); 
        const resultsList = document.getElementById('results-list');
        const messageElement = document.getElementById('recommendation-message');

        if (filteredProducts.length === 0) {
            if(messageElement) messageElement.innerHTML = '<span class="text-cta-red font-bold">⚠️ Critical Alert:</span> Even after relaxing filters, no products were found. Please try a completely new search.';
            if(resultsList) resultsList.innerHTML = '';
            return;
        }

        if (relaxedFacets) {
            if(messageElement) messageElement.innerHTML = `<span class="text-cta-red font-bold">🔍 Near Match Found:</span> Your strict criteria yielded no results. We **relaxed the filters on ${relaxedFacets}** to show you the best alternatives below.`;
        } else {
            if(messageElement) messageElement.innerHTML = 'Based on your personalized filters, here are the top-ranked security products:';
        }

        if(resultsList) this.renderProductCards(filteredProducts, resultsList, true);
    }

    updateFilterBadges() {
        const filterBadges = document.getElementById('filter-badges');
        if (filterBadges) filterBadges.innerHTML = '';
    }

    // FIX: Converted to standard method
    goBackStep() {
        if (this.history.length > 0) {
            const previousState = this.history.pop();
            this.currentStep = previousState.step;
            this.userPath = previousState.userPath;
            this.filters = previousState.filters;
            this.renderStep();
        }
    }

    resetQuiz() {
        this.currentStep = 0;
        this.userPath = {};
        this.filters = {};
        this.history = []; 
        this.sessionId = crypto.randomUUID();
        this.updateFilterBadges();
        
        const resultsContainer = document.getElementById('results-container');
        if(resultsContainer) resultsContainer.classList.add('hidden');
        
        this.renderStep();
    }
}

// Make the class globally accessible 
window.LogicDrivenApp = LogicDrivenApp;


// =========================================================================
// --- 3. GLOBAL INITIALIZATION (FIXED EXECUTION ORDER) ---
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Header first. The callback runs once the header (containing modals) is in the DOM.
    loadSharedContent('header.html', 'header-placeholder', () => {
        
        // 2. After Header is injected, load the Footer
        loadSharedContent('footer.html', 'footer-placeholder');
        
        // 3. Initialize the application logic now that all elements exist (FIXED TIMING)
        const currentPageId = window.currentPageId || 'other';
        if (window.LogicDrivenApp && currentPageId) {
            window.appInstance = new LogicDrivenApp(currentPageId); 
        }
    });
});
