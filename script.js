// --- GLOBAL VARIABLES & SELECTIONS ---
let currentImgIdx = 0;
let currentVidIdx = 0;

let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

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

    document.querySelectorAll('.video-slide video').forEach(v => {
        v.pause();
        v.currentTime = 0;
    });

    isSliderAnimating = true;

    const visibleVideos = window.innerWidth > 1000 ? 3 : 1;
    const shiftPercentage = 100 / visibleVideos;

    if (direction === 1) {

        videoSlider.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        videoSlider.style.transform = `translateX(-${shiftPercentage}%)`;

        setTimeout(() => {
            videoSlider.appendChild(videoSlider.firstElementChild);
            videoSlider.style.transition = 'none';
            videoSlider.style.transform = 'translateX(0)';
            isSliderAnimating = false;
        }, 600);

    } else {

        videoSlider.prepend(videoSlider.lastElementChild);

        videoSlider.style.transition = 'none';
        videoSlider.style.transform = `translateX(-${shiftPercentage}%)`;

        void videoSlider.offsetWidth;

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

    currentImgIdx =
        (currentImgIdx + step + allGalleryImgs.length) %
        allGalleryImgs.length;

    document.getElementById('lightbox-img').src =
        allGalleryImgs[currentImgIdx].src;

}


// --- VIDEO LIGHTBOX LOGIC ---
function toggleFullScreen(videoElement) {

    const lb = document.getElementById('videoLightbox');
    const lbVideo = document.getElementById('lightboxVideo');
    const canvas = document.getElementById('paintCanvas');

    currentVidIdx =
        Array.from(allGalleryVids).indexOf(videoElement);

    lbVideo.src =
        videoElement.querySelector('source').src;

    lbVideo.load();

    lbVideo.muted = false;
    lbVideo.play();

    lb.style.display = "flex";

    lb.appendChild(canvas);

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

        document.body.appendChild(canvas);

    }, 400);

}

function navigateVideos(step) {

    currentVidIdx =
        (currentVidIdx + step + allGalleryVids.length) %
        allGalleryVids.length;

    const lbVideo =
        document.getElementById('lightboxVideo');

    lbVideo.src =
        allGalleryVids[currentVidIdx]
        .querySelector('source').src;

    lbVideo.load();

    lbVideo.play();

}


// --- GLOBAL EVENT LISTENERS ---
document.getElementById("videoLightbox")
.addEventListener("click", function(e){

    if(e.target.id === "videoLightbox")
        closeVideoLightbox();

});

document.addEventListener('keydown', (e) => {

    if (e.key === "Escape") {

        closeLightbox();
        closeVideoLightbox();

    }

});


// --- VIDEO CLICK OPEN ---
document.querySelectorAll('.video-wrapper video')
.forEach(video => {

    video.onclick = function(){

        toggleFullScreen(this);

    };

});


// --- FAIRY DUST TRAIL ---
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

let particles = [];

function resize(){

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

window.addEventListener('resize', resize);

resize();

document.addEventListener('mousemove', (e) => {

    for(let i=0;i<3;i++){

        particles.push({

            x:e.clientX,
            y:e.clientY,

            vx:(Math.random()-0.5)*1.5,
            vy:(Math.random()-0.5)*1.5 +0.5,

            size:Math.random()*2.5+0.5,

            life:1,

            color:
                Math.random()>0.4
                ? '212, 163, 115'
                : '255, 255, 255'

        });

    }

});

function draw(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    particles.forEach(p=>{

        ctx.beginPath();

        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);

        ctx.fillStyle=`rgba(${p.color},${p.life})`;

        ctx.shadowBlur=8;

        ctx.shadowColor=`rgb(${p.color})`;

        ctx.fill();

        p.x+=p.vx;
        p.y+=p.vy;

        p.life-=0.02;

    });

    particles =
        particles.filter(p=>p.life>0);

    requestAnimationFrame(draw);

}

draw();


// --- MOBILE REELS STYLE SWIPE ENGINE ---
function handleGesture(type){

    const verticalThreshold = 60;
    const horizontalThreshold = 60;

    const diffY = touchEndY - touchStartY;
    const diffX = touchEndX - touchStartX;

    if (diffY < -verticalThreshold){

        type === 'img'
            ? navigateImages(1)
            : navigateVideos(1);

    }

    else if (diffY > verticalThreshold){

        type === 'img'
            ? navigateImages(-1)
            : navigateVideos(-1);

    }

    else if (diffX > horizontalThreshold){

        if(type === 'img'){

            closeLightbox();

        } else {

            closeVideoLightbox();

        }

    }

}


// --- IMAGE LIGHTBOX TOUCH ---
const imgLB = document.getElementById('lightbox');

imgLB.addEventListener('touchstart', e=>{

    touchStartX =
        e.changedTouches[0].screenX;

    touchStartY =
        e.changedTouches[0].screenY;

},{passive:true});

imgLB.addEventListener('touchend', e=>{

    touchEndX =
        e.changedTouches[0].screenX;

    touchEndY =
        e.changedTouches[0].screenY;

    handleGesture('img');

},{passive:true});


// --- VIDEO LIGHTBOX TOUCH ---
const vidLB = document.getElementById('videoLightbox');

vidLB.addEventListener('touchstart', e=>{

    touchStartX =
        e.changedTouches[0].screenX;

    touchStartY =
        e.changedTouches[0].screenY;

},{passive:true});

vidLB.addEventListener('touchend', e=>{

    touchEndX =
        e.changedTouches[0].screenX;

    touchEndY =
        e.changedTouches[0].screenY;

    handleGesture('vid');

},{passive:true});