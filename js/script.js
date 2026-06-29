// === CONFIGURACIÓN DE LOS MEMES ===
const listaDeMemes = [
    'kbom.gif',
    'mamadota.webp',
    'menchong.webp',
    'UUUUUH.jpg',
    'wesa.gif'
];

// === CONFIGURACIÓN DEL EFECTO DE IMÁGENES CAYENDO ===
const SNOW_IMAGE_SRC = 'img/q-wea.webp'; 
const PARTICLE_COUNT = 15; 
const MIN_SCALE = 0.05; 
const MAX_SCALE = 0.15; 

const canvas = document.getElementById('gacha-snow-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let snowImage = new Image();

snowImage.src = SNOW_IMAGE_SRC;
snowImage.onload = () => { initSnow(); animateSnow(); };
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initSnow(); });

class GachaParticle {
    constructor() { this.init(); }
    init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.scale = Math.random() * (MAX_SCALE - MIN_SCALE) + MIN_SCALE;
        this.width = snowImage.width * this.scale;
        this.height = snowImage.height * this.scale;
        this.speedY = Math.random() * 2 + 1; 
        this.speedX = Math.random() * 1 - 0.5; 
        this.rotation = Math.random() * 360; 
        this.rotationSpeed = (Math.random() - 0.5) * 2; 
    }
    update() {
        this.y += this.speedY; this.x += this.speedX; this.rotation += this.rotationSpeed;
        if (this.y > canvas.height) this.init();
    }
    draw() {
        ctx.save(); 
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation * Math.PI / 180); 
        ctx.drawImage(snowImage, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore(); 
    }
}
function initSnow() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; particles = []; for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new GachaParticle()); }
function animateSnow() { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animateSnow); }

// === LÓGICA DE GUARDADO, REINICIOS Y MEME DIARIO ===
document.addEventListener("DOMContentLoaded", () => {
    const dailies = document.querySelectorAll('.daily-task');
    const weeklies = document.querySelectorAll('.weekly-task');
    
    loadProgress(dailies);
    loadProgress(weeklies);
    checkResetsAndMeme(dailies, weeklies);
    
    dailies.forEach(cb => cb.addEventListener('change', () => localStorage.setItem(cb.id, cb.checked)));
    weeklies.forEach(cb => cb.addEventListener('change', () => localStorage.setItem(cb.id, cb.checked)));
});

function loadProgress(checkboxes) {
    checkboxes.forEach(cb => { if (localStorage.getItem(cb.id) === 'true') cb.checked = true; });
}

function checkResetsAndMeme(dailies, weeklies) {
    const now = new Date();
    const todayStr = now.toDateString(); 
    const memeImg = document.getElementById('daily-meme');

    // 1. REVISIÓN DIARIA
    if (localStorage.getItem('lastDailyReset') !== todayStr) {
        dailies.forEach(cb => { cb.checked = false; localStorage.setItem(cb.id, false); });
        localStorage.setItem('lastDailyReset', todayStr);
        
        // Forzar que elija un meme nuevo al cambiar de día
        if (listaDeMemes.length > 0) {
            const randomIndex = Math.floor(Math.random() * listaDeMemes.length);
            localStorage.setItem('savedMemeIndex', randomIndex); 
        }
    }

    // 2. CARGAR EL MEME (¡VERSIÓN MEJORADA!)
    let savedIndex = localStorage.getItem('savedMemeIndex');
    
    // Si no hay meme guardado, o agregaste memes nuevos y el índice se rompió, forzamos uno:
    if (savedIndex === null || !listaDeMemes[savedIndex]) {
        savedIndex = Math.floor(Math.random() * listaDeMemes.length);
        localStorage.setItem('savedMemeIndex', savedIndex);
    }

    // Mostrar la imagen
    if (listaDeMemes.length > 0) {
        memeImg.src = 'memes/' + listaDeMemes[savedIndex];
        memeImg.style.display = 'block'; 
    }

    // 3. REVISIÓN SEMANAL (Martes)
    const lastWeeklyStr = localStorage.getItem('lastWeeklyReset');
    const lastTuesday = new Date(now);
    lastTuesday.setHours(0, 0, 0, 0);
    const diffToTuesday = (lastTuesday.getDay() >= 2) ? (lastTuesday.getDay() - 2) : (lastTuesday.getDay() + 5);
    lastTuesday.setDate(lastTuesday.getDate() - diffToTuesday);
    
    if (!lastWeeklyStr || new Date(lastWeeklyStr).getTime() < lastTuesday.getTime()) {
        weeklies.forEach(cb => { cb.checked = false; localStorage.setItem(cb.id, false); });
        localStorage.setItem('lastWeeklyReset', now.toISOString());
    }
}