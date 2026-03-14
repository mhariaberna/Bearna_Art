// --- GLOBAL VARIABLES & SELECTIONS ---
let currentImgIdx = 0;
let currentVidIdx = 0;
let touchStartX = 0;
let touchEndX = 0;

const allGalleryImgs = document.querySelectorAll('.art-card img');
const allGalleryVids = document.querySelectorAll('.video-wrapper video');

// --- REVEAL ON SCROLL LOGIC ---
const observerOptions = { threshold: 0.15 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, observerOptions);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// --- CREATIVE PROCESS VIDEO SLIDER (Infinite Carousel) ---
const videoSlider = document.getElementById('videoSlider');
let isSliderAnimating = false;

function moveVideoSlider(direction) {
    if (isSliderAnimating) return;
    
    // Stop all slider videos before moving
    document.querySelectorAll('.video-slide video').forEach(v => {
        v.pause();
        v.currentTime = 0;
    });

    isSliderAnimating = true;
    const visibleVideos = window.innerWidth > 1000 ? 3 : 1;
    const shiftPercentage = 100 / visibleVideos;
    
    if (direction === 1) {
        // Slide Next
        videoSlider.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        videoSlider.style.transform = `translateX(-${shiftPercentage}%)`;
        
        setTimeout(() => {
            videoSlider.appendChild(videoSlider.firstElementChild);
            videoSlider.style.transition = 'none';
            videoSlider.style.transform = 'translateX(0)';
            isSliderAnimating = false;
        }, 600);
    } else {
        // Slide Prev
        videoSlider.prepend(videoSlider.lastElementChild);
        videoSlider.style.transition = 'none';
        videoSlider.style.transform = `translateX(-${shiftPercentage}%)`;
        
        void videoSlider.offsetWidth; // Force reflow
        
        videoSlider.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        videoSlider.style.transform = 'translateX(0)';
        
        setTimeout(() => {
            isSliderAnimating = false;
        }, 600);
    }
}

// --- IMAGE LIGHTBOX LOGIC ---
function openLightbox(element) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const clickedImg = element.querySelector('img');
    
    currentImgIdx = Array.from(allGalleryImgs).indexOf(clickedImg);
    lbImg.src = clickedImg.src;
    
    lb.style.display = "flex";
    document.body.classList.add('no-scroll');
    setTimeout(() => lb.classList.add('active'), 10);
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    lb.classList.remove('active');
    document.body.classList.remove('no-scroll');
    setTimeout(() => lb.style.display = "none", 400);
}

function navigateImages(step) {
    currentImgIdx = (currentImgIdx + step + allGalleryImgs.length) % allGalleryImgs.length;
    document.getElementById('lightbox-img').src = allGalleryImgs[currentImgIdx].src;
}

// --- VIDEO LIGHTBOX LOGIC ---
function toggleFullScreen(videoElement) {
    const lb = document.getElementById('videoLightbox');
    const lbVideo = document.getElementById('lightboxVideo');
    const canvas = document.getElementById('paintCanvas');

    currentVidIdx = Array.from(allGalleryVids).indexOf(videoElement);
    lbVideo.src = videoElement.querySelector('source').src;
    lbVideo.load();

    lb.style.display = "flex";
    lb.appendChild(canvas); // Move fairy dust canvas into lightbox for effect
    document.body.classList.add('no-scroll');

    setTimeout(() => {
        lb.classList.add('active');
        lbVideo.play();
    }, 10);
}

function closeVideoLightbox() {
    const lb = document.getElementById('videoLightbox');
    const lbVideo = document.getElementById('lightboxVideo');
    const canvas = document.getElementById('paintCanvas');

    lbVideo.pause();
    lb.classList.remove('active');
    document.body.classList.remove('no-scroll');

    setTimeout(() => {
        lb.style.display = "none";
        document.body.appendChild(canvas); // Return canvas to main body
    }, 400);
}

function navigateVideos(step) {
    currentVidIdx = (currentVidIdx + step + allGalleryVids.length) % allGalleryVids.length;
    const lbVideo = document.getElementById('lightboxVideo');
    lbVideo.src = allGalleryVids[currentVidIdx].querySelector('source').src;
    lbVideo.load();
    lbVideo.play();
}

// --- GLOBAL EVENT LISTENERS (Background & Keys) ---
// Close lightbox when clicking the dark background
document.getElementById("videoLightbox").addEventListener("click", function(e){
    if(e.target.id === "videoLightbox") closeVideoLightbox();
});

// ESC key to close everything
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        closeLightbox();
        closeVideoLightbox();
    }
});

// Setup Initial Click Listeners for Videos
document.querySelectorAll('.video-wrapper video').forEach(video => {
    video.onclick = function() { toggleFullScreen(this); };
});

// --- FAIRY DUST MAGIC TRAIL ---
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

document.addEventListener('mousemove', (e) => {
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
        ctx.shadowBlur = 8; ctx.shadowColor = `rgb(${p.color})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy; p.life -= 0.02; 
    });
    particles = particles.filter(p => p.life > 0);
    requestAnimationFrame(draw);
}
draw();

// --- CONTACT FORM SUBMISSION ---
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const thankYou = document.getElementById('thankYouMessage');
    const formData = new FormData(form);

    submitBtn.textContent = "Sending...";
    submitBtn.style.opacity = "0.5";

    try {
        const response = await fetch("BERNS_CONTACT_FORM_ID_HERE", {
            method: "POST",
            body: formData,
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            form.style.display = 'none';
            thankYou.style.display = 'flex';
        } else {
            alert("Oops! There was a problem.");
            submitBtn.textContent = "Submit Inquiry";
            submitBtn.style.opacity = "1";
        }
    } catch (error) {
        alert("Connectivity error.");
        submitBtn.textContent = "Submit Inquiry";
        submitBtn.style.opacity = "1";
    }
});

function resetForm() {
    const form = document.getElementById('contactForm');
    const thankYou = document.getElementById('thankYouMessage');
    thankYou.style.display = 'none';
    form.style.display = 'flex';
    form.reset();
}

// --- VIDEO HOVER PREVIEWS ---
document.querySelectorAll('.video-wrapper video').forEach(video => {
    video.muted = true;
    video.addEventListener("mouseenter", () => { video.currentTime = 0; video.play(); });
    video.addEventListener("mouseleave", () => { video.pause(); video.currentTime = 0; });
});

// --- TOUCH & GESTURE ENGINE ---
function handleGesture(type) {
    const swipeThreshold = 50; 
    if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe Left -> Next
        type === 'img' ? navigateImages(1) : navigateVideos(1);
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe Right -> Prev
        type === 'img' ? navigateImages(-1) : navigateVideos(-1);
    }
}

// Image Lightbox Touch Support
const imgLB = document.getElementById('lightbox');
imgLB.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, {passive: true});
imgLB.addEventListener('touchend', e => { 
    touchEndX = e.changedTouches[0].screenX; 
    handleGesture('img'); 
}, {passive: true});

// Tap left/right zones for image navigation (mobile)
imgLB.addEventListener("click", function(e){

    // Ignore clicks on the image itself
    if(e.target.id === "lightbox-img") return;

    const screenX = e.clientX;
    const screenWidth = window.innerWidth;

    if(screenX < screenWidth / 2){
        navigateImages(-1); // left side
    } else {
        navigateImages(1); // right side
    }

});

// Video Lightbox Touch Support
const vidLB = document.getElementById('videoLightbox');
vidLB.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, {passive: true});
vidLB.addEventListener('touchend', e => { 
    touchEndX = e.changedTouches[0].screenX; 
    handleGesture('vid'); 
}, {passive: true});

// Tap zones for video navigation (mobile)
vidLB.addEventListener("click", function(e){

    if(e.target.id === "lightboxVideo") return;

    const screenX = e.clientX;
    const screenWidth = window.innerWidth;

    if(screenX < screenWidth / 2){
        navigateVideos(-1);
    } else {
        navigateVideos(1);
    }

});

/* MOBILE REELS SYSTEM */

let startY=0;
let startX=0;
let reelIndex=0;

const imgReels=document.getElementById("imgReels");
const vidReels=document.getElementById("vidReels");

function buildImageReels(){

imgReels.innerHTML="";

allGalleryImgs.forEach(img=>{

const div=document.createElement("div");
div.className="reel-item";

const im=document.createElement("img");
im.src=img.src;

div.appendChild(im);
imgReels.appendChild(div);

});

}

function buildVideoReels(){

vidReels.innerHTML="";

allGalleryVids.forEach(v=>{

const div=document.createElement("div");
div.className="reel-item";

const vid=document.createElement("video");
vid.src=v.querySelector("source").src;
vid.playsInline=true;
vid.muted=true;

vid.onclick=()=>{
if(vid.paused) vid.play();
else vid.pause();
};

div.appendChild(vid);
vidReels.appendChild(div);

});

}

function moveReel(track,dir){

reelIndex+=dir;

if(reelIndex<0) reelIndex=0;

const max=track.children.length-1;

if(reelIndex>max) reelIndex=max;

track.style.transform=`translateY(-${reelIndex*100}vh)`;

}

function enableSwipe(track,type){

track.addEventListener("touchstart",e=>{
startY=e.touches[0].clientY;
startX=e.touches[0].clientX;
},{passive:true});

track.addEventListener("touchend",e=>{

const endY=e.changedTouches[0].clientY;
const endX=e.changedTouches[0].clientX;

const diffY=endY-startY;
const diffX=endX-startX;

if(Math.abs(diffY)>80){

if(diffY<0) moveReel(track,1);
else moveReel(track,-1);

}

if(diffX>80){

if(type==="img") closeLightbox();
if(type==="vid") closeVideoLightbox();

}

},{passive:true});

}

buildImageReels();
buildVideoReels();

enableSwipe(imgReels,"img");
enableSwipe(vidReels,"vid");

/* MOBILE REELS GESTURES (DOES NOT AFFECT DESKTOP) */

if(window.innerWidth <= 1000){

let startY = 0;
let startX = 0;

const imgLB = document.getElementById("lightbox");
const vidLB = document.getElementById("videoLightbox");

/* IMAGE SWIPE */

imgLB.addEventListener("touchstart", e=>{
startY = e.touches[0].clientY;
startX = e.touches[0].clientX;
},{passive:true});

imgLB.addEventListener("touchend", e=>{

let endY = e.changedTouches[0].clientY;
let endX = e.changedTouches[0].clientX;

let diffY = endY - startY;
let diffX = endX - startX;

if(Math.abs(diffY) > 80){

if(diffY < 0){
navigateImages(1); // swipe up
}else{
navigateImages(-1); // swipe down
}

}

if(diffX > 80){
closeLightbox(); // swipe right to exit
}

},{passive:true});


/* VIDEO SWIPE */

vidLB.addEventListener("touchstart", e=>{
startY = e.touches[0].clientY;
startX = e.touches[0].clientX;
},{passive:true});

vidLB.addEventListener("touchend", e=>{

let endY = e.changedTouches[0].clientY;
let endX = e.changedTouches[0].clientX;

let diffY = endY - startY;
let diffX = endX - startX;

if(Math.abs(diffY) > 80){

if(diffY < 0){
navigateVideos(1);
}else{
navigateVideos(-1);
}

}

if(diffX > 80){
closeVideoLightbox();
}

},{passive:true});


/* TAP VIDEO TO PLAY */

document.getElementById("lightboxVideo").addEventListener("click",function(){

if(this.paused){
this.play();
}else{
this.pause();
}

});

}
