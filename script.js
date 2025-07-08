// Variabel Game
let snake = [{x: 10, y: 10}];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameSpeed = 100;
let gameInterval;
let score = 0;
let level = 1;
let isPaused = false;
let gridSize = 20;
let soundEnabled = true;

// Elemen DOM
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const gameOverDisplay = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const soundToggle = document.getElementById('sound-toggle');
const difficultySelect = document.getElementById('difficulty');

// Elemen Audio dengan pengaturan volume
const bgMusic = document.getElementById('bg-music');
const eatSound = document.getElementById('eat-sound');
const mulaigame = document.getElementById('mulaigame'); 
const crashSound = document.getElementById('crash-sound'); 
const gameoverSound = document.getElementById('gameover-sound');
const levelupSound = document.getElementById('levelup-sound'); 

// Atur volume awal
bgMusic.volume = 0.1; // Musik latar 10%
eatSound.volume = 0.4; // Suara makan 40%
mulaigame.volume = 0.5; 
gameoverSound.volume = 0.5;
crashSound.volume = 0.5; 
levelupSound.volume = 0.5; 

// Inisialisasi Game
function initGame() {
    // Bersihkan papan
    const elements = document.querySelectorAll('.snake, .snake-head, .food');
    elements.forEach(el => el.remove());
    
    // Reset variabel
    snake = [{x: 10, y: 10}];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    level = 1;
    isPaused = false;
    gameSpeed = parseInt(difficultySelect.value);
    
    // Perbarui tampilan
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    
    // Hasilkan makanan pertama
    generateFood();
    
    // Gambar ular awal
    drawSnake();
    
    // Sembunyikan tampilan game over
    gameOverDisplay.style.display = 'none';
    
    // Mulai interval game
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
    
    // Mulai musik latar jika suara diaktifkan
    if (soundEnabled) {
        bgMusic.play();
        mulaigame.play(); 
    }
}

// Hasilkan makanan di posisi acak
function generateFood() {
    // Hasilkan posisi acak sampai kita menemukan yang tidak ditempati oleh ular
    let newFoodPosition;
    let isValidPosition = false;
    
    while (!isValidPosition) {
        newFoodPosition = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
        
        isValidPosition = !snake.some(segment => 
            segment.x === newFoodPosition.x && segment.y === newFoodPosition.y
        );
    }
    
    food = newFoodPosition;
    drawFood();
}

// Gambar makanan di papan
function drawFood() {
    // Hapus makanan yang ada jika ada
    const existingFood = document.querySelector('.food');
    if (existingFood) existingFood.remove();
    
    // Buat elemen makanan baru
    const foodElement = document.createElement('div');
    foodElement.classList.add('food');
    foodElement.style.gridRowStart = food.y + 1;
    foodElement.style.gridColumnStart = food.x + 1;
    
    gameBoard.appendChild(foodElement);
}

// Gambar ular di papan
function drawSnake() {
    // Hapus segmen ular yang ada
    const existingSnake = document.querySelectorAll('.snake, .snake-head');
    existingSnake.forEach(segment => segment.remove());
    
    // Gambar segmen ular baru
    snake.forEach((segment, index) => {
        const segmentElement = document.createElement('div');
        
        if (index === snake.length - 1) {
            segmentElement.classList.add('snake-head');
            
            segmentElement.innerHTML = `
                <div style="position: absolute; width: 100%; height: 100%; display: flex; justify-content: space-around; align-items: flex-start; padding-top: 2px;">
                    <div style="width: 20%; height: 20%; background-color: white; border-radius: 50%;"></div>
                    <div style="width: 20%; height: 20%; background-color: white; border-radius: 50%;"></div>
                </div>
            `;
            
            switch(direction) {
                case 'up':
                    segmentElement.style.transform = 'rotate(0deg)';
                    break;
                case 'right':
                    segmentElement.style.transform = 'rotate(90deg)';
                    break;
                case 'down':
                    segmentElement.style.transform = 'rotate(180deg)';
                    break;
                case 'left':
                    segmentElement.style.transform = 'rotate(270deg)';
                    break;
            }
        } else {
            segmentElement.classList.add('snake');
            
            if (index < snake.length - 3) {
                segmentElement.style.filter = 'brightness(0.8)';
            }
        }
        
        segmentElement.style.gridRowStart = segment.y + 1;
        segmentElement.style.gridColumnStart = segment.x + 1;
        
        gameBoard.appendChild(segmentElement);
    });
}

// Loop utama game
function gameLoop() {
    if (isPaused) return;
    
    direction = nextDirection;
    
    const head = {...snake[snake.length - 1]};
    
    switch(direction) {
        case 'up':
            head.y--;
            break;
        case 'right':
            head.x++;
            break;
        case 'down':
            head.y++;
            break;
            break;
        case 'left':
            head.x--;
            break;
    }
    
    if (
        head.x < 0 || head.x >= gridSize || 
        head.y < 0 || head.y >= gridSize ||
        snake.some((segment, index) => index !== snake.length -1 && segment.x === head.x && segment.y === head.y) 
    ) {
        gameOver();
        return;
    }
    
    snake.push(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10 * level;
        scoreDisplay.textContent = score;
        
        if (soundEnabled) {
            eatSound.currentTime = 0;
            eatSound.play();
        }
        
        const newLevel = Math.floor(score / 100) + 1;
        if (newLevel > level) {
            level = newLevel;
            levelDisplay.textContent = level;
            
            gameSpeed = Math.max(40, gameSpeed - 5);
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
            
            if (soundEnabled) {
                levelupSound.currentTime = 0;
                levelupSound.play();
            }
        }
        
        generateFood();
    } else {
        snake.shift();
    }
    
    drawSnake();
}

// Fungsi game over
function gameOver() {
    clearInterval(gameInterval);
    isPaused = true;
    
    if (soundEnabled) {
        crashSound.currentTime = 0;
        crashSound.play();
        setTimeout(() => {
            gameoverSound.currentTime = 0;
            gameoverSound.play();
        }, 500);
    }
    
    finalScoreDisplay.textContent = score;
    gameOverDisplay.style.display = 'block';
    
    document.getElementById('bg-music').pause();
}

// Event Listener
document.addEventListener('keydown', e => {
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case ' ':
            isPaused = !isPaused;
            if (soundEnabled) {
                if (isPaused) {
                    bgMusic.pause();
                } else {
                    bgMusic.play();
                }
            }
            break;
    }
});

restartBtn.addEventListener('click', initGame);

darkModeToggle.addEventListener('change', function() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('darkMode', !this.checked);
    // Perbarui teks instruksi - sekarang selalu "SELAMAT BERMAIN"
    document.querySelector('.instructions p').innerHTML = "SELAMAT BERMAIN JANGAN LUPA FOLLOW @MS.ANGGARA46";
});

soundToggle.addEventListener('change', function() {
    soundEnabled = this.checked;
    localStorage.setItem('soundEnabled', this.checked);
    
    if (soundEnabled) {
        bgMusic.play();
    } else {
        bgMusic.pause();
    }
});

difficultySelect.addEventListener('change', function() {
    gameSpeed = parseInt(this.value);
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
});

// Muat preferensi yang tersimpan
function loadPreferences() {
    const darkModePref = localStorage.getItem('darkMode') === 'false'; 
    darkModeToggle.checked = !darkModePref; 
    document.body.classList.toggle('light-mode', darkModePref);
    
    const soundPref = localStorage.getItem('soundEnabled') !== 'false';
    soundToggle.checked = soundPref;
    soundEnabled = soundPref;
    
    // Atur teks instruksi awal ke "SELAMAT BERMAIN"
    document.querySelector('.instructions p').innerHTML = "SELAMAT BERMAIN JANGAN LUPA FOLLOW @MS.ANGGARA46";
}

// Inisialisasi semuanya saat DOM dimuat
window.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
    initGame();
});