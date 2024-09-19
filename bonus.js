const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load images
const bgImage = new Image();
bgImage.src = 'bbbb.jpg';  // Background image

const characterImage = new Image();
characterImage.src = 'https://raw.githubusercontent.com/brengy/omar/main/imgonline-com-ua-twotoone-UOsKbvTFIowFMn-removebg-preview.png';  // Character image

const coinImage = new Image();
coinImage.src = 'golden_coin.png';  // Coin image path

let keySequence = [];
let touchStartX, touchStartY;

// Key event handling
window.addEventListener('keydown', (event) => {
    keys[event.code] = true;

    // Key sequence logic
    keySequence.push(event.key);
    if (keySequence.length > 3) {
        keySequence.shift();
    }
    if (keySequence.join('') === 'sss') {
        window.location.href = 'level3.html';
    }
});

let character = {
    x: 50,
    y: canvas.height / 2 - 30,
    width: 130,
    height: 180,
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

let keys = {};

// Key event listeners for character movement
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// Touch controls for touch screens
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    // Move character based on touch direction
    if (Math.abs(dx) > Math.abs(dy)) {
        character.x += dx / 10;  
    } else {
        character.y -= dy / 10;  
    }

    touchStartX = touchEndX;
    touchStartY = touchEndY;
});

// Button controls for moving left, right, up, down
const directions = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

directions.forEach(direction => {
    const button = document.getElementById(`move${direction.replace('Arrow', '')}`);
    button.addEventListener("mousedown", () => {
        keys[direction] = true;
    });
    button.addEventListener("mouseup", () => {
        keys[direction] = false;
    });
    button.addEventListener("touchstart", (e) => {
        e.preventDefault();
        keys[direction] = true;
    });
    button.addEventListener("touchend", (e) => {
        e.preventDefault();
        keys[direction] = false;
    });
});

function update() {
    let elapsedTime = (Date.now() - startTime) / 1000;

    if (elapsedTime < 47) {
        character.x += character.speed;
        cameraX += character.speed;
    } else if (elapsedTime >= 47 && elapsedTime < 53) {
        character.x += character.speed;
    }

    // Character movement based on key input
    if (keys["ArrowUp"] && character.y > 0) {
        character.y -= character.speed;
    }
    if (keys["ArrowDown"] && character.y < canvas.height - character.height) {
        character.y += character.speed;
    }
    if (keys["ArrowLeft"] && character.x > cameraX) {
        character.x -= character.speed;
    }
    if (keys["ArrowRight"]) {
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

let backgroundMusic = new Audio('Riding High.mp3');
backgroundMusic.loop = true;

// Main game loop
function gameLoop() {
    backgroundMusic.play();
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game loop when background is loaded
bgImage.onload = () => {
    gameLoop();  
};
