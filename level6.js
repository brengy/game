const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameOver = false;
let player = { x: 50, y: canvas.height - 100, width: 160, height: 200, speed: 5, bullets: [], isShooting: false };
let enemy = { x: canvas.width - 250, y: 0, width: 150, height: 180, speed: 3, bullets: [], direction: 1, hitCount: 0 };

// Load images
const backgroundImage = new Image();
backgroundImage.src = 'water.jpg';  // Use the path of the background image used in level 3

const playerImage = new Image();
playerImage.src = 'https://raw.githubusercontent.com/brengy/car/main/WhatsApp_Image_2024-02-29_at_10.14.55_PM-removebg-preview.png';  // Path to the player's image

const enemyImage = new Image();
enemyImage.src = 'nwehy.png';  // Use the path of the enemy image used in level 3

const playerBulletImage = new Image();
playerBulletImage.src = 'golden_coin.png';  // Path to player's bullet image

const enemyBulletImage = new Image();
enemyBulletImage.src = 'shoes.png';  // Path to enemy's bullet image

// Handling key events for player movement and shooting
const keys = {};
window.addEventListener('keydown', (event) => {
  keys[event.code] = true;
  if (event.code === 'Space' && !gameOver) {
    shootBullet(player, -1);  // Player shoots upwards
  }
});
window.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});

function shootBullet(shooter, direction) {
  shooter.bullets.push({
    x: shooter.x + shooter.width / 2 - 5,
    y: shooter.y + (direction === -1 ? 0 : shooter.height),
    width: 30,
    height: 30,
    speed: 6 * direction
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

  
 if (keySequence.join('') === 'xxx') {
    window.location.href = 'level7.html';
  }

  
});
//================================================

function handlePlayerMovement() {
  if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
}

function handleEnemyMovement() {
  // Randomly change direction or speed occasionally
  if (Math.random() < 0.01) {  // Adjust the probability as needed for frequency
    enemy.direction = Math.random() < 0.5 ? -1 : 1; // Randomly choose left (-1) or right (1)
    enemy.speed = 2 + Math.random() * 3; // Random speed between 2 and 5
  }

  enemy.x += enemy.speed * enemy.direction;

  // Ensure the enemy stays within the canvas bounds
  if (enemy.x <= 0) {
    enemy.x = 0;
    enemy.direction = 1; // Move right
  } else if (enemy.x + enemy.width >= canvas.width) {
    enemy.x = canvas.width - enemy.width;
    enemy.direction = -1; // Move left
  }

  // Enemy shoots bullets downward periodically
  if (Math.random() < 0.01) {
    shootBullet(enemy, 1);
  }
}


function updateBullets(bullets) {
  bullets.forEach((bullet, index) => {
    bullet.y += bullet.speed;
    // Remove bullets that are off the screen
    if (bullet.y < 0 || bullet.y > canvas.height) bullets.splice(index, 1);
  });
}

function detectCollisions() {
  // Check for collisions between player bullets and enemy
  player.bullets.forEach((bullet, index) => {
    if (
      bullet.x < enemy.x + enemy.width &&
      bullet.x + bullet.width > enemy.x &&
      bullet.y < enemy.y + enemy.height &&
      bullet.y + bullet.height > enemy.y
    ) {
      player.bullets.splice(index, 1);
      enemy.hitCount++;
      if (enemy.hitCount >= 70) {
        // Progress to level 7
        window.location.href = 'level7.html';
      }
    }
  });

  // Check for collisions between enemy bullets and player
  enemy.bullets.forEach((bullet, index) => {
    if (
      bullet.x < player.x + player.width &&
      bullet.x + bullet.width > player.x &&
      bullet.y < player.y + player.height &&
      bullet.y + bullet.height > player.y
    ) {
      enemy.bullets.splice(index, 1);
      // Reload the current level
      window.location.reload();
    }
  });
}

function update() {
  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);  // Draw background
  handlePlayerMovement();
  handleEnemyMovement();
  updateBullets(player.bullets);
  updateBullets(enemy.bullets);
  detectCollisions();
  render();
  requestAnimationFrame(update);
}

function render() {
  // Draw player
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

  // Draw enemy
  ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);

  // Draw player bullets
  player.bullets.forEach(bullet => ctx.drawImage(playerBulletImage, bullet.x, bullet.y, bullet.width, bullet.height));

  // Draw enemy bullets
  enemy.bullets.forEach(bullet => ctx.drawImage(enemyBulletImage, bullet.x, bullet.y, bullet.width, bullet.height));
}

// Initialize the game
update();
