const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load images
const bgImage = new Image();
bgImage.src = 'bbbb2.jpg';  // Background image

const characterImage = new Image();
characterImage.src = 'https://raw.githubusercontent.com/brengy/omar/main/imgonline-com-ua-twotoone-UOsKbvTFIowFMn-removebg-preview.png';  // Character image

const coinImage = new Image();
coinImage.src = 'golden_coin.png';  // Coin image path

let character = {
    x: 50,
    y: canvas.height / 2 - 30,
    width: 100,
    height: 160,
    speed: 4
};

let score = 0;
const targetScore = 1000;
let coins = [];
const coinCount = 20;  // Number of coins to generate
let cameraX = 0;
let startTime = Date.now();
let cameraStoppedTime = 0;

// Initialize coins
for (let i = 0; i < coinCount; i++) {
    coins.push({
        x: Math.random() * canvas.width + canvas.width,
        y: Math.random() * (canvas.height - 30),
        width: 30,
        height: 30
    });
}

// Listen for device orientation events
window.addEventListener('deviceorientation', handleOrientation);

// Handle orientation changes
function handleOrientation(event) {
    const tiltX = event.beta;  // Front-to-back tilt in degrees (range: -180 to 180)
    const tiltY = event.gamma; // Left-to-right tilt in degrees (range: -90 to 90)

    // Map tilt values to character movement
    if (tiltX > 10) {
        character.y += character.speed;  // Tilt forward (move down)
    } else if (tiltX < -10) {
        character.y -= character.speed;  // Tilt backward (move up)
    }

    if (tiltY > 10) {
        character.x += character.speed;  // Tilt right (move right)
    } else if (tiltY < -10) {
        character.x -= character.speed;  // Tilt left (move left)
    }
}

function update() {
    let elapsedTime = (Date.now() - startTime) / 1000;

    if (elapsedTime < 47) {
        character.x += character.speed;
        cameraX += character.speed;
    } else if (elapsedTime >= 47 && elapsedTime < 53) {
        character.x += character.speed;
    }

    // Check for coin collisions and update score
    coins = coins.filter(coin => {
        if (character.x < coin.x + coin.width &&
            character.x + character.width > coin.x &&
            character.y < coin.y + coin.height &&
            character.y + character.height > coin.y) {
            score++;
            return false;
        }
        return true;
    });

    // Add new coins as needed
    while (coins.length < coinCount) {
        coins.push({
            x: Math.random() * canvas.width + cameraX + canvas.width,
            y: Math.random() * (canvas.height - 30),
            width: 30,
            height: 30
        });
    }

    // Move to next level when score or time conditions are met
    if (score >= targetScore || elapsedTime >= 51) {
        window.location.href = 'level3.html';
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(bgImage, -cameraX % canvas.width, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, -cameraX % canvas.width + canvas.width, 0, canvas.width, canvas.height);

    // Draw character
    ctx.drawImage(characterImage, character.x - cameraX, character.y, character.width, character.height);

    // Draw coins
    coins.forEach(coin => {
        ctx.drawImage(coinImage, coin.x - cameraX, coin.y, coin.width, coin.height);
    });

    // Draw score
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game loop when background is loaded
bgImage.onload = () => {
    gameLoop();  
};
