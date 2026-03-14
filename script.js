// --- STATE MANAGEMENT ---
let currentImgIdx = 0;
let currentVidIdx = 0;
const allGalleryImgs = document.querySelectorAll('.art-card img');
const allGalleryVids = document.querySelectorAll('.video-slide video');

// Touch tracking for magnet effect
let startY = 0;
let currentY = 0;
let startX = 0;
let isDragging = false;
const mobileThreshold = 100; // Pixels to trigger navigation

// --- INITIALIZATION ---
const isMobile = () => window.innerWidth <= 1000;

// --- MAGNET EFFECT LOGIC (Full Screen) ---
function initMagnetEffect(elementId, type) {
    const wrapper = document.getElementById(elementId);
    
    wrapper.addEventListener('touchstart', (e) => {
        if (!isMobile()) return;
        isDragging = true;
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        wrapper.style.transition = 'none';
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
        if (!isDragging || !isMobile()) return;
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        // Follow the finger
        wrapper.style.transform = `translateY(${deltaY}px)`;
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
        if (!isDragging || !isMobile()) return;
        isDragging = false;
        const endY = e.changedTouches[0].clientY;
        const endX = e.changedTouches[0].clientX;
        const deltaY = endY - startY;
        const deltaX = endX - startX;

        wrapper.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';

        // Horizontal Swipe: Close
        if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY)) {
            type === 'img' ? closeLightbox() : closeVideoLightbox();
            wrapper.style.transform = `translateY(0)`;
            return;
        }

        // Vertical Swipe: Navigate
        if (deltaY < -mobileThreshold) {
            // Swiped Up -> Next
            wrapper.style.transform = `translateY(-100vh)`;
            setTimeout(() => {
                type === 'img' ? navigateImages(1) : navigateVideos(1);
                wrapper.style.transform = `translateY(0)`;
            }, 300);
        } else if (deltaY > mobileThreshold) {
            // Swiped Down -> Prev
            wrapper.style.transform = `translateY(100vh)`;
            setTimeout(() => {
                type === 'img' ? navigateImages(-1) : navigateVideos(-1);
                wrapper.style.transform = `translateY(0)`;
            }, 300);
        } else {
            // Snap back
            wrapper.style.transform = `translateY(0)`;
        }
    });
}

// Apply effects
initMagnetEffect('lb-content-wrapper', 'img');
initMagnetEffect('vid-content-wrapper', 'vid');

// --- MOBILE CAROUSEL SWIPE ---
const videoViewport = document.getElementById('videoViewport');
videoViewport.addEventListener('touchstart', e => startX = e.touches[0].clientX, {passive:true});
videoViewport.addEventListener('touchend', e => {
    if (!isMobile()) return;
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) moveVideoSlider(1);
    if (startX - endX < -50) moveVideoSlider(-1);
}, {passive:true});

// --- CORE NAVIGATION ---
function navigateImages(step) {
    currentImgIdx = (currentImgIdx + step + allGalleryImgs.length) % allGalleryImgs.length;
    document.getElementById('lightbox-img').src = allGalleryImgs[currentImgIdx].src;
}

function navigateVideos(step) {
    currentVidIdx = (currentVidIdx + step + allGalleryVids.length) % allGalleryVids.length;
    const lbVideo = document.getElementById('lightboxVideo');
    lbVideo.src = allGalleryVids[currentVidIdx].querySelector('source').src;
    lbVideo.load();
    lbVideo.play();
}

// --- LIGHTBOX OPEN/CLOSE ---
function openLightbox(element) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    currentImgIdx = Array.from(allGalleryImgs).indexOf(element.querySelector('img'));
    lbImg.src = allGalleryImgs[currentImgIdx].src;
    lb.style.display = "flex";
    document.body.style.overflow = 'hidden';
    setTimeout(() => lb.classList.add('active'), 10);
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    lb.classList.remove('active');
    document.body.style.overflow = 'auto';
    setTimeout(() => lb.style.display = "none", 400);
}

function toggleFullScreen(videoElement) {
    const lb = document.getElementById('videoLightbox');
    const lbVideo = document.getElementById('lightboxVideo');
    currentVidIdx = Array.from(allGalleryVids).indexOf(videoElement);
    lbVideo.src = videoElement.querySelector('source').src;
    lbVideo.load();
    lb.style.display = "flex";
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        lb.classList.add('active');
        lbVideo.play();
    }, 10);
}

function closeVideoLightbox() {
    const lb = document.getElementById('videoLightbox');
    document.getElementById('lightboxVideo').pause();
    lb.classList.remove('active');
    document.body.style.overflow = 'auto';
    setTimeout(() => lb.style.display = "none", 400);
}

// --- DESKTOP CAROUSEL LOGIC ---
let isSliderAnimating = false;
function moveVideoSlider(direction) {
    if (isSliderAnimating) return;
    isSliderAnimating = true;
    const slider = document.getElementById('videoSlider');
    const shift = 100 / (window.innerWidth > 1000 ? 3 : 1);
    
    if (direction === 1) {
        slider.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        slider.style.transform = `translateX(-${shift}%)`;
        setTimeout(() => {
            slider.appendChild(slider.firstElementChild);
            slider.style.transition = 'none';
            slider.style.transform = 'translateX(0)';
            isSliderAnimating = false;
        }, 600);
    } else {
        slider.prepend(slider.lastElementChild);
        slider.style.transition = 'none';
        slider.style.transform = `translateX(-${shift}%)`;
        void slider.offsetWidth;
        slider.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        slider.style.transform = 'translateX(0)';
        setTimeout(() => isSliderAnimating = false, 600);
    }
}

// --- FAIRY DUST ---
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

document.addEventListener('mousemove', (e) => {
    if (isMobile()) return; // Disable dust on mobile to save battery
    for(let i = 0; i < 3; i++) {
        particles.push({
            x: e.clientX, y: e.clientY,
            vx: (Math.random() - 0.5) * 1.5, 
            vy: (Math.random() - 0.5) * 1.5 + 0.5, 
            size: Math.random() * 2.5 + 0.5, life: 1, 
            color: Math.random() > 0.4 ? '212, 163, 115' : '255, 255, 255' 
        });
    }
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.life})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy; p.life -= 0.02; 
    });
    particles = particles.filter(p => p.life > 0);
    requestAnimationFrame(draw);
}
draw();

// Initial Video Setups
document.querySelectorAll('.video-slide video').forEach(video => {
    video.onclick = function() { toggleFullScreen(this); };
    video.addEventListener("mouseenter", () => { if(!isMobile()) video.play(); });
    video.addEventListener("mouseleave", () => { if(!isMobile()) { video.pause(); video.currentTime = 0; } });
});

// Scroll Reveal
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));