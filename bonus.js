const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bgImage = new Image();
bgImage.src = 'bbbb.jpg';  // Background image

const characterImage = new Image();
characterImage.src = 'https://raw.githubusercontent.com/brengy/omar/main/imgonline-com-ua-twotoone-UOsKbvTFIowFMn-removebg-preview.png';  // Character image

const coinImage = new Image();
coinImage.src = 'golden_coin.png';  // Replace with your coin image path

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
    window.location.href = 'level3.html';
  }

  
});
//================================================

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

let cameraX = 0;  // Camera starting position

let startTime = Date.now();
let cameraStoppedTime = 0;

// Generate initial coins
for (let i = 0; i < coinCount; i++) {
    coins.push({
        x: Math.random() * canvas.width + canvas.width,  // Random position ahead of the screen
        y: Math.random() * (canvas.height - 30),
        width: 30,
        height: 30
    });
}

let keys = {};

// Event listeners for key presses
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// Update game objects
function update() {
    let elapsedTime = (Date.now() - startTime) / 1000; // Elapsed time in seconds

    if (elapsedTime < 47) {
        // Move character and camera if less than 55 seconds have passed
        character.x += character.speed;
        cameraX += character.speed;
    } else if (elapsedTime >= 47 && elapsedTime < 53) {
        // Stop camera movement and move character right automatically between 55 and 60 seconds
        character.x += character.speed;
    }

    // Character movement with arrow keys
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

    // Check for coin collisions
    coins = coins.filter(coin => {
        if (character.x < coin.x + coin.width &&
            character.x + character.width > coin.x &&
            character.y < coin.y + coin.height &&
            character.y + character.height > coin.y) {
            score++;
            return false;  // Remove coin
        }
        return true;
    });

    // Add new coins randomly to the screen to keep it filled
    while (coins.length < coinCount) {
        coins.push({
            x: Math.random() * canvas.width + cameraX + canvas.width,  // Add to the right of the camera view
            y: Math.random() * (canvas.height - 30),
            width: 30,
            height: 30
        });
    }

    // Check if target score is reached or 50 seconds have passed
    if (score >= targetScore || elapsedTime >= 51) {
        window.location.href = 'level3.html';  // Move to the next level
    }
}

// Draw game objects
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

bgImage.onload = () => {
    gameLoop();  // Start the game loop when background is loaded
};
