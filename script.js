// --- REVEAL ON SCROLL LOGIC ---
const observerOptions = { threshold: 0.15 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, observerOptions);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


// --- ALTERNATIVE VIDEO SLIDER LOGIC (Bounded, 3 items visible) ---
const videoSlider = document.getElementById('videoSlider');
const videoSlides = document.querySelectorAll('.video-slide');
const totalVideos = videoSlides.length;
let currentVideoIndex = 0;

function updateVideoSlider() {
    // Calculates how many items are visible based on screen width
    const visibleVideos = window.innerWidth > 1000 ? 3 : 1; 
    
    // Shift the track by the width of one slide per index
    const shiftPercentage = currentVideoIndex * (100 / visibleVideos);
    videoSlider.style.transform = `translateX(-${shiftPercentage}%)`;
}

function stopAllVideos() {
    document.querySelectorAll('.video-slide video').forEach(v => {
        v.pause();
        // Removed v.play() so there is NO autoplay
    });
}

let isSliderAnimating = false;

function moveVideoSlider(direction) {
    if (isSliderAnimating) return; // Prevents clicking too fast and breaking the animation
    stopAllVideos(); 
    isSliderAnimating = true;
    
    const visibleVideos = window.innerWidth > 1000 ? 3 : 1;
    const shiftPercentage = 100 / visibleVideos;
    
    if (direction === 1) {
        // Sliding Next (Right to Left)
        videoSlider.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        videoSlider.style.transform = `translateX(-${shiftPercentage}%)`;
        
        // Wait for the slide to finish, then move the first item to the back
        setTimeout(() => {
            videoSlider.appendChild(videoSlider.firstElementChild);
            videoSlider.style.transition = 'none'; // Turn off transition for an instant reset
            videoSlider.style.transform = 'translateX(0)';
            isSliderAnimating = false;
        }, 600); // This 600ms matches your CSS transition time
        
    } else {
        // Sliding Prev (Left to Right)
        // Instantly move the last item to the front and offset the container
        videoSlider.prepend(videoSlider.lastElementChild);
        videoSlider.style.transition = 'none';
        videoSlider.style.transform = `translateX(-${shiftPercentage}%)`;
        
        // Force the browser to register the instant move before animating
        void videoSlider.offsetWidth; 
        
        // Animate it back to the natural 0 position
        videoSlider.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        videoSlider.style.transform = 'translateX(0)';
        
        setTimeout(() => {
            isSliderAnimating = false;
        }, 600);
    }
}

// --- FULLSCREEN VIDEO ON CLICK ---
function toggleFullScreen(videoElement) {
    // Target the container instead of the video tag
    const wrapper = videoElement.parentElement; 
    const canvas = document.getElementById('paintCanvas');

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // Enter Fullscreen
        if (wrapper.requestFullscreen) {
            wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) {
            wrapper.webkitRequestFullscreen();
        }
        // Move the canvas inside the fullscreen wrapper so it appears on top
        wrapper.appendChild(canvas);
    } else {
        // Exit Fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

// Ensure the canvas goes back to the body when the user presses 'Esc'
document.addEventListener('fullscreenchange', exitHandler);
document.addEventListener('webkitfullscreenchange', exitHandler);

function exitHandler() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        document.body.appendChild(document.getElementById('paintCanvas'));
    }
}

function openLightbox(element) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    
    lbImg.src = element.querySelector('img').src;
    
    lb.style.display = "flex";
    // Small timeout to allow 'display: flex' to register before adding opacity
    setTimeout(() => {
        lb.classList.add('active');
    }, 10);
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    lb.classList.remove('active');
    
    // Wait for the fade-out animation to finish before hiding display
    setTimeout(() => {
        lb.style.display = "none";
    }, 400); 
}

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
