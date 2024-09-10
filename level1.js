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
  y: 0, // ”Ì „  ⁄ÌÌ‰ Â–Â «·ﬁÌ„… ·«Õﬁ« · ﬂÊ‰ ›Êﬁ «··ÊÕ «·√Ê·
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

// «· Õﬁﬁ ≈–« ﬂ«‰ «·ÃÂ«“ „Õ„Ê·«
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

//  ⁄œÌ· ”—⁄… «·Õ—ﬂ… «· ·ﬁ«∆Ì… ··‘Œ’Ì… »‰«¡ ⁄·Ï ‰Ê⁄ «·ÃÂ«“
if (isMobile) {
  player.speed = 4; // Ì„ﬂ‰ﬂ ÷»ÿ «·”—⁄… Õ”» «·Õ«Ã…
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
    const minGap = 180; //  ﬁ·Ì· «·›ÃÊ… «·œ‰Ì« · ”ÂÌ· «·ﬁ›“
    const maxGap = 220; //  ﬁ·Ì· «·›ÃÊ… «·ﬁ’ÊÏ · ”ÂÌ· «·ﬁ›“
    const randomGap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
    const xPos = platforms.length === 0 ? 100 : platforms[platforms.length - 1].x + platformWidth + randomGap;
    const minHeight = canvas.height / 2;
    const maxHeight = canvas.height - 150;
    let yPos = platforms.length === 0 ? minHeight : platforms[platforms.length - 1].y + Math.random() * (maxHeight - minHeight) - 50;

    yPos = Math.max(minHeight, Math.min(yPos, maxHeight)); // ÷„«‰ √‰  ﬂÊ‰ «·√·Ê«Õ ÷„‰ «·ÕœÊœ «·„ﬁ»Ê·…

    const platform = new Platform(xPos, yPos, platformWidth, platformHeight, getRandomColor());
    platforms.push(platform);

    // ≈⁄œ«œ «··«⁄» ·Ì»œ√ ›Êﬁ «··ÊÕ «·√Ê·
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
      const numberOfCoins = Math.floor(Math.random() * 3) + 1; //  ﬁ·Ì· ⁄œœ «·⁄„·« 
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

//===============================================
let keySequence = [];


window.addEventListener('keydown', (event) => {
 
 keys[event.code] = true;

  // Add the current key to the sequence
 
 keySequence.push(event.key);

  
  if (keySequence.length > 3) {
    keySequence.shift();
  }

  
 if (keySequence.join('') === 'sss') {
    window.location.href = 'level2.html';
  }

  
});
//================================================

function handlePlayerMovement() {
  if (isMobile) {
    // «·Õ—ﬂ… «· ·ﬁ«∆Ì… „‰ «·Ì”«— ≈·Ï «·Ì„Ì‰
    player.x += player.speed;
  } else {
    // «·Õ—ﬂ… »«” Œœ«„ «·√“—«— ⁄·Ï «·√ÃÂ“… €Ì— «·„Õ„Ê·…
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
      player.isJumping = false; // «·”„«Õ »«·ﬁ›“ „—… √Œ—Ï ⁄‰œ ·„” «·„‰’…
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
      window.location.href = 'level2.html'; // «·«‰ ﬁ«· ≈·Ï «·„” ÊÏ 2
      return; // ≈Ìﬁ«› «· ÕœÌÀ ·„‰⁄ «·„“Ìœ „‰ «·⁄„·Ì« 
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
  // ⁄—÷ «·„” ÿÌ·
  const boxWidth = 150;
  // „Êﬁ⁄ «·„” ÿÌ· «·√›ﬁÌ („‰ ’› «·ﬂ«‰›”)
  const boxX = (canvas.width - boxWidth) / 2;

  // «·„Êﬁ⁄ «·—√”Ì ··„” ÿÌ· «·√Ê· »ÕÌÀ ÌﬂÊ‰  Õ  »„ﬁœ«— 20 »ﬂ”· „‰ «·ﬂ«‰›”
  const boxY = canvas.height - 20 - 70; // 70 ÂÊ «·«— ›«⁄ «·ﬂ·Ì ··„” ÿÌ·Ì‰ Ê«·„”«›… »Ì‰Â„«

  // —”„ «·„” ÿÌ· «·√Ê· (Score)
  drawRoundedRect(boxX, boxY, boxWidth, 35, 5, 'white', 'black', 3);
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${player.score}`, boxX + (boxWidth - ctx.measureText(`Score: ${player.score}`).width) / 2, boxY + 25);

  // —”„ «·„” ÿÌ· «·À«‰Ì (High Score) √”›· «·„” ÿÌ· «·√Ê·
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
//  ctx.fillText('Restart', canvas.width / 2 - 35, canvas.height / 2 + 50);
//  canvas.addEventListener('click', restartGame);
window.location.href = 'index.html';

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
  generatePlatforms();
  canvas.removeEventListener('click', restartGame);
  update();
}

window.addEventListener('keydown', (event) => {
  keys[event.code] = true;
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

// ≈⁄œ«œ «· Õﬂ„ »«··„” ··„Ê»«Ì·
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

    // „‰⁄ «· „—Ì— «·«› —«÷Ì
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

        if (touchDeltaY < -50 && !player.isJumping) { 
            player.velocityY = -player.jumpHeight;
            player.isJumping = true;
        }

        // „‰⁄ «· „—Ì— «·«› —«÷Ì
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

    // „‰⁄ «· „—Ì— «·«› —«÷Ì
    event.preventDefault();
});

loadAssets(() => {
  generatePlatforms();
  update();
});
