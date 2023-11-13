// ----- Utility Functions -----
// A function to load an image and return a promise fullfilled or error if it didn't load
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Function to spawn a zombie at set intervals, decreasing with each time until 1s per zombie spawn
function zombieSpawnInterval() {
  if (isGamePaused) {
    return;
  }

  clearTimeout(zombieTimeOut); // Clear any existing timeout
  setTimeout(createZombie, 1000);

  zombieTimeOut = setTimeout(zombieSpawnInterval, zombieGenerationSpeed);
  if (zombieGenerationSpeed > 1000) {
    zombieGenerationSpeed -= 50;
  }
}

function startAnimation() {
  if (!animationFrameId) {
    // Prevent multiple loops from starting
    animate(); // Start the animation loop
  }
}

function stopAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId); // Stop the animation loop
    animationFrameId = null; // Reset the loop check
  }

  clearTimeout(zombieTimeOut);
  isGamePaused = true;
}

// Function to unpause the game
function unpauseGame() {
  isGamePaused = false;
  startAnimation();
  zombieSpawnInterval();
}

// A function to check for rectangular collisions between 2 objects
function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  );
}

// boundaries.some() method is used to check every single boundary in the game and compare it to the nextpos used for the character collision check, if every rectangularcollision check returns false, then .some will return false
function checkCollision(nextPos) {
  return boundaries.some((boundary) =>
    rectangularCollision({
      rectangle1: nextPos,
      rectangle2: boundary,
    })
  );
}

// Utility to get random number
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Function to create a zombie and push it into the zombies[] array
function createZombie() {
  let zombieSpawnGenerator = getRandomNumber(1, 4); // Generate a number to use for spawnspots

  // These only generate a number that would be at the edge of the screen still
  let zombieSpawnLeftSide = { x: 0, y: getRandomNumber(0, 720) };
  let zombieSpawnRightSide = { x: 1280, y: getRandomNumber(0, 720) };
  let zombieSpawnTopSide = { x: getRandomNumber(0, 1280), y: 0 };
  let zombieSpawnBottomSide = { x: getRandomNumber(0, 1280), y: 720 };
  let zombieSpawnSpots = {};
  if (zombieSpawnGenerator == 1) {
    zombieSpawnSpots = zombieSpawnLeftSide;
  } else if (zombieSpawnGenerator == 2) {
    zombieSpawnSpots = zombieSpawnRightSide;
  } else if (zombieSpawnGenerator == 3) {
    zombieSpawnSpots = zombieSpawnTopSide;
  } else if (zombieSpawnGenerator == 4) {
    zombieSpawnSpots = zombieSpawnBottomSide;
  }
  let zombieEnemy = new Sprite({
    position: zombieSpawnSpots,
    image: zombieImage,
    spriteCuts: {
      sw: zombieImage.width / 11,
      sh: zombieImage.height / 4,
      dw: zombieImage.width / 11,
      dh: zombieImage.height / 4,
    },
    totalFrames: { x: 11, y: 4 },
    animationSpeed: 25,
  });
  zombieEnemy.health = 100;
  zombies.push(zombieEnemy);
}

// Function to draw a game over screen, used when player dies
function drawGameOverScreen() {
  // Dim background
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // semi-transparent black
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw game over box
  const boxWidth = 400;
  const boxHeight = 200;
  const boxX = canvas.width / 2 - boxWidth / 2;
  const boxY = canvas.height / 2 - boxHeight / 2;
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; // semi-transparent white
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  // Draw game over text
  ctx.fillStyle = "#000";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 50);

  // Draw try again button
  ctx.fillStyle = "#000";
  ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

  // Draw try again button text
  ctx.fillStyle = "#FFF";
  ctx.font = "20px Arial";
  ctx.fillText("Try Again", canvas.width / 2, canvas.height / 2 + 50);

  // Adds event listener
  canvas.addEventListener("click", tryAgain);
}

// Function for the Try Again Event listener
function tryAgain(event) {
  // Calculate the mouse click coordinates relative to the canvas
  const clickX = event.clientX - canvas.getBoundingClientRect().left;
  const clickY = event.clientY - canvas.getBoundingClientRect().top;

  // Check if the click was within the button's bounding box
  if (
    clickX >= buttonX &&
    clickX <= buttonX + buttonWidth &&
    clickY >= buttonY &&
    clickY <= buttonY + buttonHeight
  ) {
    restartGame();
  }
}

// Function to reset values and set gameOver to false
function restartGame() {
  zombies = [];
  bullets = [];
  playerHealth = 100;
  zombiesKilled = 0;
  currentPlayerPosition = { x: 0, y: 0 };
  characterMoving.position.x = canvas.width / 2;
  characterMoving.position.y = canvas.height / 3;
  killCount.textContent = "Current Kill Count: 0";
  canvas.removeEventListener("click", tryAgain);
  gameOver = false;
  unpauseGame();
}

// ----- Global Variables -----
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1280;
canvas.height = 720;
const killCount = document.querySelector(".kill-count");
const highScore = document.querySelector(".high-score");

const COLLISION_PADDING = { top: 15, bottom: 5, left: 15, right: 15 };
const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false },
  escape: { pressed: false },
  enter: { pressed: false },
};
let lastKey = "";
let characterMoving,
  zombieEnemy,
  background,
  characterShooting,
  bulletDirection,
  bullet,
  bulletFacingDirection,
  zombieImage,
  zombieDeath,
  zombieTimeOut;
let playerHealth = 100;
let currentPlayerPosition = { x: 0, y: 0 };
let bullets = [];
let zombies = [];
let isPlayerShooting = false;
const maxPlayerHealth = 100;
let lastHealthDropTime = Date.now();
let zombiesKilled = 0;
let currentHighScore = 0;
let gameOver = false;
let zombieGenerationSpeed = 5000;
let zombieDeathPosition = {};
let zombieWasKilled = false;
let isGamePaused = false;

// These constants are for the try again button
const buttonWidth = 150;
const buttonHeight = 50;
const buttonX = canvas.width / 2 - buttonWidth / 2;
const buttonY = canvas.height / 2 + 20;

// ----- Classes -----
class Boundary {
  // Boundary dimensions based on the tileset
  static width = 16;
  static height = 16;
  constructor({ position }) {
    this.position = position;
    this.width = 16;
    this.height = 16;
  }

  draw() {
    ctx.fillStyle = "rgba(255, 255, 255, 0)";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class Sprite {
  constructor({
    position,
    image,
    spriteCuts,
    totalFrames,
    animationSpeed = 25,
    velocity,
    opacity = 1,
  }) {
    this.position = position;
    this.image = image;
    this.spriteCuts = {
      ...spriteCuts,
      val: 0,
      valy: 0,
      elapsed: 0,
      totalFrames,
      animationSpeed,
    };
    this.moving = false;
    this.velocity = velocity;
    this.opacity = opacity;
  }

  drawBackground() {
    ctx.drawImage(this.image, 0, 0);
  }

  drawCharacter() {
    ctx.save(); // Saves current state - Good practice for making sure the hiteffect opacity won't mess with anything else
    ctx.globalAlpha = this.opacity; // This is required to change the opacity of the drawn image
    ctx.drawImage(
      this.image,
      this.spriteCuts.val * 32, // X position for sprite sheet
      this.spriteCuts.valy * 32, // Y position for sprite sheet
      this.image.width / this.spriteCuts.totalFrames.x, // Single frame width
      this.image.height / this.spriteCuts.totalFrames.y, // Single frame height
      this.position.x, // Starting X position
      this.position.y, // Starting Y Position
      this.spriteCuts.dw, // Sprite size on X Scale
      this.spriteCuts.dh // Sprite size on Y Scale
    );

    if (this.moving) {
      this.spriteCuts.elapsed++;
      if (this.spriteCuts.elapsed % this.spriteCuts.animationSpeed === 0) {
        this.spriteCuts.val =
          (this.spriteCuts.val + 1) % (this.spriteCuts.totalFrames.x - 1); // Looping through the horizontal frames minus 1
      }
    } else {
      // If the character is not moving, you might want to reset to a specific frame
      this.spriteCuts.val = 1; // Reset to the first frame or an idle frame
      this.spriteCuts.elapsed = 0; // Reset counter
    }
    ctx.restore(); // Restores the save state
  }

  drawCharacterShooting() {
    ctx.drawImage(
      this.image,
      this.spriteCuts.val * 32, // X position for sprite sheet
      this.spriteCuts.valy * 32, // Y position for sprite sheet
      this.image.width / this.spriteCuts.totalFrames.x, // Single frame width
      this.image.height / this.spriteCuts.totalFrames.y, // Single frame height
      this.position.x,
      this.position.y,
      this.spriteCuts.dw,
      this.spriteCuts.dh
    );

    if (this.moving) {
      this.spriteCuts.elapsed++;
      if (this.spriteCuts.elapsed % this.spriteCuts.animationSpeed === 0) {
        this.spriteCuts.val =
          (this.spriteCuts.val + 1) % (this.spriteCuts.totalFrames.x - 1); // Looping through the horizontal frames minus 1
      }
    } else {
      // If the character is not moving, you might want to reset to a specific frame
      this.spriteCuts.val = 0; // Reset to the first frame or an idle frame
      this.spriteCuts.elapsed = 0; // Reset counter
    }
  }

  drawBullet() {
    ctx.drawImage(
      this.image,
      this.spriteCuts.val * 32, // X position for sprite sheet
      this.spriteCuts.valy * 32, // Y position for sprite sheet
      this.image.width / this.spriteCuts.totalFrames.x, // Single frame width
      this.image.height / this.spriteCuts.totalFrames.y, // Single frame height
      this.position.x,
      this.position.y,
      this.spriteCuts.dw,
      this.spriteCuts.dh
    );
  }

  updateBullet() {
    this.drawBullet();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.moving) {
      this.spriteCuts.elapsed++;
      if (this.spriteCuts.elapsed % this.spriteCuts.animationSpeed === 0) {
        this.spriteCuts.val =
          (this.spriteCuts.val + 1) % (this.spriteCuts.totalFrames.x - 1); // Looping through the horizontal frames minus 1
      }
    } else {
      this.spriteCuts.val = 0; // reset frame
      this.spriteCuts.elapsed = 0; // Reset counter
    }
  }
}

// ----- Collision Map Setup -----
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 80) {
  collisionsMap.push(collisions.slice(i, i + 80));
}

const boundaries = [];
collisionsMap.forEach((row, i) => {
  row.forEach((cell, j) => {
    if (cell === 257) {
      boundaries.push(
        new Boundary({
          position: { x: j * Boundary.width, y: i * Boundary.height },
        })
      );
    }
  });
});

// ----- Game Functions -----
function movePlayer(dx, dy) {
  // Set moving to true if there is an attempt to move
  characterMoving.moving = dx !== 0 || dy !== 0;

  const nextX = characterMoving.position.x + dx;
  const nextY = characterMoving.position.y + dy;

  // Calculate the player's next position including any collision padding
  const nextPos = {
    position: {
      x: nextX + COLLISION_PADDING.left,
      y: nextY + COLLISION_PADDING.top,
    },
    width:
      characterMoving.spriteCuts.dw -
      COLLISION_PADDING.left -
      COLLISION_PADDING.right,
    height:
      characterMoving.spriteCuts.dh -
      COLLISION_PADDING.top -
      COLLISION_PADDING.bottom,
  };

  // Check if the player's next position would be outside the canvas boundaries
  if (
    nextX < 0 ||
    nextX + nextPos.width > canvas.width ||
    nextY < 0 ||
    nextY + nextPos.height > canvas.height
  ) {
    characterMoving.moving = false; // Player is attempting to move out of bounds, stop the animation
    return false; // Movement was blocked because it would go off canvas
  }

  // Check for collision at the next position
  if (!checkCollision(nextPos)) {
    characterMoving.position.x = nextX;
    characterMoving.position.y = nextY;
    return true; // Movement was successful
  }

  return false; // Movement was blocked by a collision
}

function attackPlayer(zombie) {
  if (!zombie || !characterMoving) return;

  const dx = characterMoving.position.x - zombie.position.x;
  const dy = characterMoving.position.y - zombie.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = Math.random() * (0.4 - 0.15) + 0.15; // Adjust speed of zombie

  // Only move the zombie if it's not too close to the player
  if (distance > 10) {
    zombie.moving = true; // Set moving to true since the zombie is about to move
    zombie.position.x += (dx / distance) * speed;
    zombie.position.y += (dy / distance) * speed;
  } else {
    zombie.moving = false; // Set moving to false if the zombie is too close to the player
  }
}

// Main Core game function that handles all of the logic and calls every other function when needed
function animate() {
  animationFrameId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  background.drawBackground();

  if (characterMoving && !isPlayerShooting) {
    characterMoving.drawCharacter();
  }

  for (let zombie of zombies) {
    if (zombie) {
      attackPlayer(zombie);
      zombie.drawCharacter();
      updateHealth(zombie);
    }
  }

  if (zombieDeath && zombieWasKilled) {
    zombieDeathAnimation();
  }

  drawHealthBar();

  boundaries.forEach((boundary) => boundary.draw());

  // Handle player movement based on key presses
  if (keys.a.pressed && lastKey === "a" && characterMoving.moving) {
    movePlayer(-1, 0);
  }
  if (keys.d.pressed && lastKey === "d" && characterMoving.moving) {
    movePlayer(1, 0);
  }
  if (keys.w.pressed && lastKey === "w" && characterMoving.moving) {
    movePlayer(0, -1);
  }
  if (keys.s.pressed && lastKey === "s" && characterMoving.moving) {
    movePlayer(0, 1);
  }

  // Shoot projectile in the faced direction when enter is pressed
  if (keys.enter.pressed) {
    shootGun();
    fireBullet();
  }

  if (gameOver) {
    drawGameOverScreen();
  }
}

// Draws shooting animation at player position and removes event listeners and set moving to false so player stays in place until finished
function shootGun() {
  if (characterShooting && isPlayerShooting) {
    characterShooting.position.x = currentPlayerPosition.x; // Set's the shooting animation to be on top of the player to be drawn
    characterShooting.position.y = currentPlayerPosition.y;
    characterShooting.drawCharacterShooting();
    characterShooting.moving = true;
  }
  if (characterShooting.spriteCuts.elapsed < 75) {
    // Wait for animation to play before letting the player move
    window.removeEventListener("keydown", keyDownFunction);
    window.removeEventListener("keyup", keyUpFunction);
    characterMoving.moving = false;
  } else {
    window.addEventListener("keydown", keyDownFunction);
    window.addEventListener("keyup", keyUpFunction);
    isPlayerShooting = false;
    characterShooting.moving = false;
  }
}

// Draws the bullet and make it fly in the direction of the last key pressed
function fireBullet() {
  bullets.forEach((bullet, index) => {
    bullet.updateBullet(); // Update position and draw for each bullet in the bullets[] array, we use for each so we can access the index value to remove it when it leaves the screen or hits a zombie

    //sets the right sprite animation - currently semi-broken
    if (lastKey === "a") {
      bullet.spriteCuts.valy = 3;
    } else if (lastKey === "w") {
      bullet.spriteCuts.valy = 0;
    } else if (lastKey === "s") {
      bullet.spriteCuts.valy = 1;
    } else if (lastKey === "d") {
      bullet.spriteCuts.valy = 2;
    }

    bullet.moving = true;

    // Check for collision and off screen and removes the bullet
    if (bulletIsOffscreen(bullet)) {
      bullets.splice(index, 1);
    }
    zombies.forEach((zombie, zIndex) => {
      if (bulletHitZombie(bullet, zombie)) {
        bullets.splice(index, 1);
        updateZombieHealth(zombie, bullet, zIndex);
      }
    });
  });
}

// Checks if bullet is going off the map
function bulletIsOffscreen(bullet) {
  return (
    bullet.position.x + bullet.spriteCuts.dw < 0 ||
    bullet.position.x > canvas.width ||
    bullet.position.y + bullet.spriteCuts.dh < 0 ||
    bullet.position.y > canvas.height
  );
}

// checks if bullet is colliding with the zombie
function bulletHitZombie(bullet, zombie) {
  return rectangularCollision({
    rectangle1: {
      position: bullet.position,
      width: bullet.spriteCuts.dw - 30,
      height: bullet.spriteCuts.dh - 25,
    },
    rectangle2: {
      position: zombie.position,
      width: zombie.spriteCuts.dw - 30,
      height: zombie.spriteCuts.dh - 15,
    },
  });
}

function drawHealthBar() {
  const healthBarWidth = 30; // Width of the health bar
  const healthBarHeight = 5; // Height of the health bar
  const xOffset = 0; // X offset from the center of the player
  const yOffset = 5; // Y offset from the bottom of the player

  // The X and Y position of the health bar should be centered below the player
  const x =
    characterMoving.position.x +
    characterMoving.spriteCuts.dw / 2 -
    healthBarWidth / 2 +
    xOffset;
  const y =
    characterMoving.position.y + characterMoving.spriteCuts.dh + yOffset;

  // Draw the background of the health bar
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(x, y, healthBarWidth, healthBarHeight);

  // Draw the foreground of the health bar
  const healthPercentage = playerHealth / maxPlayerHealth;
  ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
  ctx.fillRect(x, y, healthBarWidth * healthPercentage, healthBarHeight);

  // Draw the health bar border
  ctx.strokeStyle = "white";
  ctx.strokeRect(x, y, healthBarWidth, healthBarHeight);
}

// Function used for zombie to attack the player
function updateHealth(zombie) {
  // Get the current time
  const now = Date.now();

  // Check if a zombie is touching the player
  if (
    zombie &&
    characterMoving &&
    rectangularCollision({
      rectangle1: {
        position: characterMoving.position,
        width: characterMoving.spriteCuts.dw - 20,
        height: characterMoving.spriteCuts.dh - 10,
      },
      rectangle2: {
        position: zombie.position,
        width: zombie.spriteCuts.dw - 20,
        height: zombie.spriteCuts.dh - 10,
      },
    })
  ) {
    // Check if it's been at least 1 second since the last health drop
    if (now - lastHealthDropTime >= 1000) {
      playerHealth -= 10; // Decrease health by 10
      showHitEffect();
      lastHealthDropTime = now; // Update the last health drop time
    }
  }

  // Clamp the health between 0 and the maximum player health
  playerHealth = Math.max(0, Math.min(playerHealth, maxPlayerHealth));

  // If health is 0, handle the player's death (game over, etc.)
  if (playerHealth <= 0) {
    if (zombiesKilled > currentHighScore) {
      currentHighScore = zombiesKilled;
    }
    highScore.textContent = `HighScore: ${currentHighScore}`;
    gameOver = true;
    stopAnimation();
  }
}

// Function to update zombie health when it gets hit by a bullet
function updateZombieHealth(zombie, bullet, index) {
  // Check if a zombie is touching a bullet
  if (
    zombie &&
    bullet &&
    rectangularCollision({
      rectangle1: {
        position: bullet.position,
        width: bullet.spriteCuts.dw - 20,
        height: bullet.spriteCuts.dh - 10,
      },
      rectangle2: {
        position: zombie.position,
        width: zombie.spriteCuts.dw - 20,
        height: zombie.spriteCuts.dh - 10,
      },
    })
  ) {
    zombie.health -= 20; // Determines how much damage the zombie takes
  }

  // If health is 0, handle the zombie death (killCount, despawn, etc.)
  if (zombie.health <= 0) {
    zombieDeathPosition = zombie.position;
    zombieWasKilled = true;
    zombies.splice(index, 1);
    zombiesKilled++;
    killCount.textContent = `Current Kill Count: ${zombiesKilled}`;
  }
}

function zombieDeathAnimation() {
  zombieDeath.position.x = zombieDeathPosition.x;
  zombieDeath.position.y = zombieDeathPosition.y;
  zombieDeath.drawCharacter();
  zombieDeath.moving = true;
  if (zombieDeath.spriteCuts.val == 6) {
    zombieWasKilled = false;
    zombieDeath.spriteCuts.val = 0;
  }
}

function keyDownFunction(event) {
  // Handle key down logic and choosing the right sprite animation based on direction
  switch (event.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      characterMoving.spriteCuts.valy = 1;
      characterMoving.moving = true;
      break;

    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      characterMoving.spriteCuts.valy = 3;
      characterMoving.moving = true;
      break;

    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      characterMoving.spriteCuts.valy = 0;
      characterMoving.moving = true;
      break;

    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      characterMoving.spriteCuts.valy = 2;
      characterMoving.moving = true;
      break;

    case "Escape":
      keys.escape.pressed = true;
      if (animationFrameId) {
        stopAnimation();
      } else {
        unpauseGame();
      }
      break;

    // Handles data for when enter is pressed for firing animation and creating new bullet sprites
    case "Enter":
      let speed = 2; // Bullet speed
      let velocity;

      // Set's velocity to be in the direction character is facing
      if (lastKey === "a") {
        characterShooting.spriteCuts.valy = 3;
        velocity = { x: -speed, y: 0 };
      } else if (lastKey === "w") {
        characterShooting.spriteCuts.valy = 1;
        velocity = { x: 0, y: -speed };
      } else if (lastKey === "s") {
        characterShooting.spriteCuts.valy = 0;
        velocity = { x: 0, y: speed };
      } else if (lastKey === "d") {
        characterShooting.spriteCuts.valy = 2;
        velocity = { x: speed, y: 0 };
      }

      // Checks if a velocity exists and creates a new bullet sprite to store in the bullets[]
      if (velocity) {
        const bulletSprite = new Sprite({
          position: {
            x: characterMoving.position.x - 10,
            y: characterMoving.position.y - 3,
          },
          image: bullet,
          spriteCuts: {
            sw: bullet.width / 5,
            sh: bullet.height / 4,
            dw: bullet.width / 3,
            dh: bullet.height / 3,
          },
          totalFrames: { x: 5, y: 4 },
          animationSpeed: 25,
          velocity: velocity,
        });
        bullets.push(bulletSprite);
        // keys.enter.pressed = false; // prevent continuous firing - I don't think this matters
      }

      currentPlayerPosition.x = characterMoving.position.x; // Saves character position for use such as drawing the shooting animation where the character is
      currentPlayerPosition.y = characterMoving.position.y;
      keys.enter.pressed = true;
      isPlayerShooting = true;
      break;
  }
}

function keyUpFunction(event) {
  // Handle key up logic
  switch (event.key) {
    case "w":
      keys.w.pressed = false;
      break;

    case "a":
      keys.a.pressed = false;
      break;

    case "s":
      keys.s.pressed = false;
      break;

    case "d":
      keys.d.pressed = false;
      break;

    case "Escape":
      keys.escape.pressed = false;
      break;

    // case "Enter":
    //   bulletFired = false;
    //   break;
  }
  // If none of the movement keys are pressed, set moving to false
  if (
    !keys.w.pressed &&
    !keys.a.pressed &&
    !keys.s.pressed &&
    !keys.d.pressed
  ) {
    characterMoving.moving = false;
  }
}

// Function to flash the character when hit
function showHitEffect() {
  const originalOpacity = characterMoving.opacity; // Assuming there's an opacity property
  let hitEffectDuration = 500; // Duration of the hit effect
  let flashInterval = 100; // Interval for flashing
  let elapsed = 0;

  const flashEffect = setInterval(() => {
    characterMoving.opacity = characterMoving.opacity === 1 ? 0 : 1; // Toggle opacity with single line if else, === 1 checks if it's current 1, if true change to 0, if false change to 1
    elapsed += flashInterval;

    if (elapsed >= hitEffectDuration) {
      clearInterval(flashEffect);
      characterMoving.opacity = originalOpacity; // Reset to original opacity
    }
  }, flashInterval);
}

// ----- Event Listeners -----
window.addEventListener("keydown", keyDownFunction);

window.addEventListener("keyup", keyUpFunction);

// ----- Asset Loading and Game Initialization -----
async function loadAssetsAndStartGame() {
  try {
    const [
      newMap,
      playerWalk,
      zombieWalk,
      playerShoot,
      bulletImage,
      zombieDeathImage,
    ] = await Promise.all([
      loadImage("./assets/Tile Set/newMap.png"),
      loadImage("./assets/Apocalypse Character Pack/Player/Walk.png"),
      loadImage("./assets/Apocalypse Character Pack/Zombie/Walk.png"),
      loadImage("./assets/Apocalypse Character Pack/Player/Shoot.png"),
      loadImage("./assets/Apocalypse Character Pack/Player/Bullet.png"),
      loadImage("assets/Apocalypse Character Pack/Zombie/Death.png"),
    ]);

    background = new Sprite({
      position: { x: 0, y: 0 },
      image: newMap,
      spriteCuts: {
        sw: canvas.width,
        sh: canvas.height,
        dw: canvas.width,
        dh: canvas.height,
      },
    });

    characterMoving = new Sprite({
      position: { x: canvas.width / 2, y: canvas.height / 3 },
      image: playerWalk,
      spriteCuts: {
        sw: playerWalk.width / 5,
        sh: playerWalk.height / 4,
        dw: playerWalk.width / 5,
        dh: playerWalk.height / 4,
      },
      totalFrames: { x: 5, y: 4 },
      animationSpeed: 25,
    });

    characterShooting = new Sprite({
      position: { x: 0, y: 0 },
      image: playerShoot,
      spriteCuts: {
        sw: playerShoot.width / 5,
        sh: playerShoot.height / 4,
        dw: playerShoot.width / 5,
        dh: playerShoot.height / 4,
      },
      totalFrames: { x: 5, y: 4 },
      animationSpeed: 25,
    });

    zombieDeath = new Sprite({
      position: { x: 0, y: 0 },
      image: zombieDeathImage,
      spriteCuts: {
        sw: zombieDeathImage.width / 8,
        sh: zombieDeathImage.height / 4,
        dw: zombieDeathImage.width / 8,
        dh: zombieDeathImage.height / 4,
      },
      totalFrames: { x: 8, y: 4 },
      animationSpeed: 25,
    });

    zombieImage = zombieWalk;
    bullet = bulletImage; // saves bulletImage to the global scope bullet variable to be used in creating new bullets

    animate(); // Start the animation loop
  } catch (error) {
    console.error("Error loading assets:", error);
  }
}

loadAssetsAndStartGame(); // Call the function to load assets and start the game

zombieSpawnInterval(); // Randomized spawn times controlled by ZombieGenerationSpeed
