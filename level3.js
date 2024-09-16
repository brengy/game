const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas dynamically based on window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

//window.addEventListener('resize', resizeCanvas);
//resizeCanvas(); // Initial resize

let gameOver = false;
let highScore = 0;
let backgroundImage = new Image();
let characterImage1 = new Image();
let characterImage2 = new Image();
let floorImage = new Image();
let explosionImage = new Image();
let bulletImage = new Image();
let enemyImage = new Image();

function loadAssets(callback) {
  backgroundImage.src = 'bbbh3.jpg';
  characterImage1.src = 'https://raw.githubusercontent.com/brengy/car/main/WhatsApp_Image_2024-02-29_at_10.14.55_PM-removebg-preview.png';
  characterImage2.src = characterImage1.src;
  floorImage.src = 'https://i.imgur.com/7ER7jta.png';
  explosionImage.src = 'https://i.imgur.com/VSSau8k.png';
  bulletImage.src = 'https://i.imgur.com/FAkXuvM.png';
  enemyImage.src = 'https://raw.githubusercontent.com/brengy/car/main/WhatsApp_Image_2024-02-29_at_10.14.55_PM-removebg-preview.png';
  callback();
}

const camera = {
  x: 0,
  width: canvas.width,
  height: canvas.height,
  update() {
    this.x = player.x - this.width / 2;
    if (this.x < 0) this.x = 0;
  },
};

const player = {
  x: 50,
  y: 0,
  width: 80,
  height: 100,
  velocityX: 0,
  velocityY: 0,
  isJumping: false,
  speed: 4,
  jumpHeight: 12,
  score: 0,
  currentImage: characterImage1,
  explosionCounter: 0,
  bullets: [],
  shoot() {
    this.bullets.push({
      x: this.x + this.width,
      y: this.y + this.height / 2 - 5,
      width: 10,
      height: 10,
      speed: 7
    });
  }
};

// Check if device is mobile
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// Adjust player speed for mobile devices
if (isMobile) {
  player.speed = 4; 
}

// Add shooting event on mobile
if (isMobile) {
  const shootButton = document.getElementById('shootButton');
  shootButton.addEventListener('click', () => {
    player.shoot(); 
    canvas.focus();
  });
}

class Platform {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x + 10, this.y);
    ctx.lineTo(this.x + this.width - 10, this.y);
    ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + 10);
    ctx.lineTo(this.x + this.width, this.y + this.height - 10);
    ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - 10, this.y + this.height);
    ctx.lineTo(this.x + 10, this.y + this.height);
    ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - 10);
    ctx.lineTo(this.x, this.y + 10);
    ctx.quadraticCurveTo(this.x, this.y, this.x + 10, this.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

class Enemy {
  constructor(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = 2;
  }

  draw() {
    ctx.drawImage(enemyImage, this.x - camera.x, this.y, this.width, this.height);
  }

  update() {
    this.x -= this.speed;
  }
}

class Coin {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.rotation = 0;
  }

  draw() {
    this.rotation += 0.1;
    const currentWidth = this.radius * (1 - 0.5 * Math.abs(Math.sin(this.rotation)));
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(this.x - camera.x, this.y, currentWidth, this.radius, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

const platforms = [];
const coins = [];
const enemies = [];
const keys = {};

function generatePlatforms() {
  if (platforms.length === 0 || platforms[platforms.length - 1].x - camera.x < canvas.width - 200) {
    const platformWidth = 200;
    const platformHeight = 20;
    const minGap = 50;
    const maxGap = 150;
    const randomGap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
    const xPos = platforms.length === 0 ? 100 : platforms[platforms.length - 1].x + platformWidth + randomGap;
    const minHeight = canvas.height / 2;
    const maxHeight = canvas.height - 150;
    let yPos = platforms.length === 0 ? minHeight : platforms[platforms.length - 1].y + Math.random() * (maxHeight - minHeight) - 50;

    yPos = Math.max(minHeight, Math.min(yPos, maxHeight));

    const platform = new Platform(xPos, yPos, platformWidth, platformHeight, getRandomColor());
    platforms.push(platform);

    if (platforms.length === 1) {
      player.x = platform.x + platform.width / 2 - player.width / 2;
      player.y = platform.y - player.height;
    }

    generateCoins();
  }
}

function generateCoins() {
  platforms.forEach(platform => {
    if (!platform.coinsGenerated) {
      const numberOfCoins = Math.floor(Math.random() * 3) + 1;
      const coinSpacing = platform.width / (numberOfCoins + 1);
      for (let i = 0; i < numberOfCoins; i++) {
        const coinX = platform.x + coinSpacing * (i + 1);
        const coinY = platform.y - 25;
        coins.push(new Coin(coinX, coinY, 10, 'gold'));
      }
      platform.coinsGenerated = true;
    }
  });
}

let lastEnemyTime = Date.now();
const enemySpawnInterval = 5000;  // Time in milliseconds (5 seconds)
function generateEnemies() {
  const now = Date.now();
  
  if (now - lastEnemyTime > enemySpawnInterval) {
    lastEnemyTime = now;
    
    const enemyY = Math.floor(Math.random() * (canvas.height / 2)) + canvas.height / 3; 
    const enemy = new Enemy(canvas.width + camera.x, enemyY, 50, 50, 2);
    enemies.push(enemy);
  }
}


function handlePlayerMovement() {
  if (isMobile) {
    player.x += player.speed;
  } else {
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += player.speed;
  }
  player.velocityX = isMobile ? player.speed : (keys['ArrowLeft'] ? -player.speed : keys['ArrowRight'] ? player.speed : 0);
  if (player.x < 0) player.x = 0;
}

function handlePlayerVerticalMovement() {
  player.velocityY += 0.5;
  player.y += player.velocityY;
  let onPlatform = false;
  platforms.forEach(platform => {
    if (player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y + player.height >= platform.y - 5 &&
        player.y + player.height <= platform.y + platform.height) {
      onPlatform = true;
      player.y = platform.y - player.height;
      player.velocityY = 0;
      player.isJumping = false;
    }
  });

  if ((keys['ArrowUp'] || keys['KeyW']) && !player.isJumping && !keys['Space']) {
    player.velocityY = -player.jumpHeight;
    player.isJumping = true;
  }
}

function update() {
  if (!gameOver) {
    handlePlayerVerticalMovement();
    handlePlayerMovement();
    camera.update();
    generatePlatforms();
    generateEnemies();
    detectCollisions();
    enemies.forEach(enemy => enemy.update());
    render();
  if (player.score >= 70) {
      window.location.href = 'level4.html'; 
      return; 
    }

    requestAnimationFrame(update);
  } else {
    renderGameOver();
  }
}

function detectCollisions() {
  coins.forEach((coin, index) => {
    const distance = Math.hypot(player.x + player.width / 2 - coin.x, player.y + player.height / 2 - coin.y);
    if (distance < player.width / 2 + coin.radius) {
      player.score++;
      coins.splice(index, 1);
    }
  });

  player.bullets.forEach((bullet, bulletIndex) => {
    enemies.forEach((enemy, enemyIndex) => {
      if (bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y) {
        player.bullets.splice(bulletIndex, 1);
        enemies.splice(enemyIndex, 1);
        player.score += 5;
      }
    });
  });

  enemies.forEach((enemy, index) => {
    if (player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y) {
      gameOver = true;
    }

    if (enemy.x + enemy.width < camera.x) {
      enemies.splice(index, 1);
    }
  });

  player.bullets.forEach((bullet, index) => {
    bullet.x += bullet.speed;
    if (bullet.x > camera.x + canvas.width) {
      player.bullets.splice(index, 1);
    }
  });

  if (player.y + player.height >= canvas.height - 50) {
    gameOver = true;
    if (player.score > highScore) highScore = player.score;
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  ctx.save();
  ctx.translate(-camera.x, 0);
  platforms.forEach(platform => platform.draw());
  ctx.restore();
  coins.forEach(coin => coin.draw());
  enemies.forEach(enemy => enemy.draw());
  drawCharacter();
  drawBullets();
  drawUI();
}

function drawBullets() {
  player.bullets.forEach(bullet => {
    ctx.drawImage(bulletImage, bullet.x - camera.x, bullet.y, bullet.width, bullet.height);
  });
}

function drawBackground() {
  const scale = canvas.height / backgroundImage.height;
  const scaledWidth = backgroundImage.width * scale;
  let offsetX = (camera.x * 0.5) % scaledWidth;
  for (let i = 0; i < Math.ceil(canvas.width / scaledWidth) + 1; i++) {
    ctx.drawImage(backgroundImage, i * scaledWidth - offsetX, 0, scaledWidth, canvas.height);
  }
}

function drawCharacter() {
  if (!gameOver) {
    ctx.save();
    ctx.translate(-camera.x, 0);
    ctx.drawImage(player.currentImage, player.x, player.y, player.width, player.height);
    ctx.restore();
  } else if (player.explosionCounter < 50) {
    ctx.save();
    ctx.translate(-camera.x, 0);
    ctx.drawImage(explosionImage, player.x - player.width, player.y - player.height, player.width * 2, player.height * 2);
    ctx.restore();
    player.explosionCounter++;
  }
}

function drawUI() {
  const boxWidth = 150;
  const boxX = (canvas.width - boxWidth) / 2;
  const boxY = canvas.height - 20 - 70;

  drawRoundedRect(boxX, boxY, boxWidth, 35, 5, 'white', 'black', 3);
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${player.score}`, boxX + (boxWidth - ctx.measureText(`Score: ${player.score}`).width) / 2, boxY + 25);

  drawRoundedRect(boxX, boxY + 40, boxWidth, 35, 5, 'white', 'black', 3);
  ctx.fillText(`High Score: ${highScore}`, boxX + (boxWidth - ctx.measureText(`High Score: ${highScore}`).width) / 2, boxY + 65);
}

function drawRoundedRect(x, y, width, height, radius, fillColor, borderColor, borderWidth) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  if (borderColor) {
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
  }
}

function renderGameOver() {
  ctx.fillStyle = 'white';
  ctx.font = '40px Arial';
  ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
  ctx.fillStyle = 'blue';
  ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 20, 120, 40);
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  window.location.href = 'level3.html';
}

function restartGame() {
  gameOver = false;
  player.x = 50;
  player.y = canvas.height - 200;
  player.velocityX = 0;
  player.velocityY = 0;
  player.score = 0;
  player.explosionCounter = 0;
  camera.x = 0;
  platforms.length = 0;
  coins.length = 0;
  enemies.length = 0;
  player.bullets.length = 0;
  generatePlatforms();
  canvas.removeEventListener('click', restartGame);
  update();
}

window.addEventListener('keydown', (event) => {
  keys[event.code] = true;
  if (event.code === 'Space' && !gameOver) {
    player.shoot();
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color;
}

// Touch controls for mobile
let isTouching = false;
let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0;
let touchCurrentY = 0;

canvas.addEventListener('touchstart', (event) => {
    isTouching = true;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchCurrentX = touchStartX;
    touchCurrentY = touchStartY;
    event.preventDefault();
});

canvas.addEventListener('touchmove', (event) => {
    if (isTouching) {
        touchCurrentX = event.touches[0].clientX;
        touchCurrentY = event.touches[0].clientY;
        const touchDeltaX = touchCurrentX - touchStartX;
        const touchDeltaY = touchCurrentY - touchStartY;

        if (touchDeltaX < -30) { 
            keys['ArrowLeft'] = true;
            keys['ArrowRight'] = false;
        } else if (touchDeltaX > 30) { 
            keys['ArrowRight'] = true;
            keys['ArrowLeft'] = false;
        } else { 
            keys['ArrowLeft'] = false;
            keys['ArrowRight'] = false;
        }

        if (touchDeltaY < -50 && !player.isJumping && !keys['Space']) { 
            player.velocityY = -player.jumpHeight;
            player.isJumping = true;
        }

        event.preventDefault();
    }
});

canvas.addEventListener('touchend', (event) => {
    isTouching = false;
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;

    setTimeout(() => { 
        if (player.velocityY === 0) { 
            player.isJumping = false; 
        }
    }, 50);

    event.preventDefault();
});

let backgroundMusic = new Audio('l3.mp3');
backgroundMusic.loop = true;

function startGame() {
  backgroundMusic.play();
  update();
}

loadAssets(() => {
startGame();
  generatePlatforms();
  update();
});

