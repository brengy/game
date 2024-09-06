const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameOver = false;
let highScore = 0;
let backgroundImage = new Image();
let characterImage1 = new Image();
let characterImage2 = new Image();
let floorImage = new Image();
let explosionImage = new Image();

function loadAssets(callback) {
  backgroundImage.src = 'bbbh.jpg';
  characterImage1.src = 'https://raw.githubusercontent.com/brengy/car/main/WhatsApp_Image_2024-02-29_at_10.14.55_PM-removebg-preview.png';
  characterImage2.src = characterImage1.src;
  floorImage.src = 'https://i.imgur.com/7ER7jta.png';
  explosionImage.src = 'https://i.imgur.com/VSSau8k.png';
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
  width: 130,
  height: 160,
  velocityX: 0,
  velocityY: 0,
  isJumping: false,
  speed: 4,
  jumpHeight: 12,
  score: 0,
  currentImage: characterImage1,
  explosionCounter: 0,
};

// Check if the device is mobile
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// Adjust the player's speed for mobile devices
if (isMobile) {
  player.speed = 4;
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
const keys = {};

function generatePlatforms() {
  if (platforms.length === 0 || platforms[platforms.length - 1].x - camera.x < canvas.width - 200) {
    const platformWidth = 200;
    const platformHeight = 20;
    const minGap = 180;
    const maxGap = 220;
    const randomGap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
    const xPos = platforms.length === 0 ? 100 : platforms[platforms.length - 1].x + platformWidth + randomGap;
    const minHeight = canvas.height / 2;
    const maxHeight = canvas.height - 150;
    let yPos = platforms.length === 0 ? minHeight : platforms[platforms.length - 1].y + Math.random() * (maxHeight - minHeight) - 50;

    yPos = Math.max(minHeight, Math.min(yPos, maxHeight));

    const platform = new Platform(xPos, yPos, platformWidth, platformHeight, getRandomColor());
    platforms.push(platform);

    // Set the player to start above the first platform
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

function handlePlayerMovement() {
  if (isMobile) {
    // Automatic movement from left to right
    player.x += player.speed;
  } else {
    // Movement using arrow keys on non-mobile devices
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += player.speed;
  }
  player.velocityX = isMobile ? player.speed : (keys['ArrowLeft'] ? -player.speed : keys['ArrowRight'] ? player.speed : 0);
  if (player.x < 0) player.x = 0;
}

const jumpSound = new Audio('jump.mp3');

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
  if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && !player.isJumping) {
    player.velocityY = -player.jumpHeight;
    player.isJumping = true;
    jumpSound.play().catch(error => console.log(error));
  }
}

function update() {
  if (!gameOver) {
    handlePlayerVerticalMovement();
    handlePlayerMovement();
    camera.update();
    generatePlatforms();
    detectCollisions();
    render();
    if (player.score >= 50) {
      window.location.href = 'level2.html'; // Navigate to level 2
      return; // Stop updating to prevent further operations
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
  drawCharacter();
  drawUI();
}

function drawBackground() {
  const scale = canvas.height / backgroundImage.height;
  const scaledWidth = backgroundImage.width * scale;
  let offsetX = -camera.x % scaledWidth;
  ctx.drawImage(backgroundImage, offsetX, 0, scaledWidth, canvas.height);
  if (offsetX < scaledWidth - canvas.width) {
    ctx.drawImage(backgroundImage, offsetX + scaledWidth, 0, scaledWidth, canvas.height);
  }
}

function drawUI() {
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${player.score}`, 10, 30);
  ctx.fillText(`High Score: ${highScore}`, 10, 60);
}

function drawCharacter() {
  const currentImage = player.isJumping ? characterImage2 : characterImage1;
  ctx.drawImage(currentImage, player.x - camera.x, player.y, player.width, player.height);
}

function renderGameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'red';
  ctx.font = '50px Arial';
  ctx.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2);
  ctx.font = '24px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Final Score: ${player.score}`, canvas.width / 2 - 100, canvas.height / 2 + 50);
  ctx.fillText('Click to Restart', canvas.width / 2 - 100, canvas.height / 2 + 100);
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function resizeCanvas() {
  const aspectRatio = 16 / 9; // Adjust as necessary
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  if (windowWidth / windowHeight < aspectRatio) {
    canvas.width = windowWidth;
    canvas.height = windowWidth / aspectRatio;
  } else {
    canvas.width = windowHeight * aspectRatio;
    canvas.height = windowHeight;
  }
  render(); // Re-render on resize
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call to set the canvas size

canvas.addEventListener('click', () => {
  if (gameOver) {
    gameOver = false;
    player.score = 0;
    player.x = 50;
    player.y = 0;
    player.velocityY = 0;
    platforms.length = 0;
    coins.length = 0;
    update(); // Restart the game
  }
});

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

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

    if (touchDeltaX < -30) { // Left swipe
      keys['ArrowLeft'] = true;
      keys['ArrowRight'] = false;
    } else if (touchDeltaX > 30) { // Right swipe
      keys['ArrowRight'] = true;
      keys['ArrowLeft'] = false;
    } else { 
      keys['ArrowLeft'] = false;
      keys['ArrowRight'] = false;
    }

    if (touchDeltaY < -50 && !player.isJumping) { // Up swipe
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

// Load assets and start the game loop
loadAssets(update);
