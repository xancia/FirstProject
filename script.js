// ----- Utility Functions -----
// A function to load an image and return a promise
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// A function to check for rectangular collisions
function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  );
}

function checkCollision(nextPos) {
  return boundaries.some((boundary) =>
    rectangularCollision({
      rectangle1: nextPos,
      rectangle2: boundary,
    })
  );
}

// ----- Global Variables -----
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1280;
canvas.height = 720;

const COLLISION_PADDING = { top: 15, bottom: 5, left: 15, right: 15 };
const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false },
  Escape: { pressed: false },
};
let lastKey = "";
let characterMoving, zombieEnemy, background;
let playerHealth = 100;
const maxPlayerHealth = 100;
let lastHealthDropTime = Date.now();

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
  }

  drawBackground() {
    ctx.drawImage(this.image, 0, 0);
  }

  drawCharacter() {
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
    }
  }
}

// ----- Collision Map Setup -----
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 80) {
  collisionsMap.push(collisions.slice(i, i + 80));
}

const boundaries = collisionsMap
  .flatMap((row, i) =>
    row.map((cell, j) =>
      cell === 257
        ? new Boundary({
            position: { x: j * Boundary.width, y: i * Boundary.height },
          })
        : null
    )
  )
  .filter(Boolean);

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

function attackPlayer() {
  if (!zombieEnemy || !characterMoving) return;

  const dx = characterMoving.position.x - zombieEnemy.position.x;
  const dy = characterMoving.position.y - zombieEnemy.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = 0.2; // Adjust speed as necessary

  // Only move the zombie if it's not too close to the player
  if (distance > Boundary.width / 2) {
    zombieEnemy.moving = true; // Set moving to true since the zombie is about to move
    zombieEnemy.position.x += (dx / distance) * speed;
    zombieEnemy.position.y += (dy / distance) * speed;
  } else {
    zombieEnemy.moving = false; // Set moving to false if the zombie is too close to the player
  }
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  background.drawBackground();

  if (characterMoving) {
    characterMoving.drawCharacter();
  }

  if (zombieEnemy) {
    attackPlayer();
    zombieEnemy.drawCharacter();
  }

  updateHealth();
  drawHealthBar();

  boundaries.forEach((boundary) => boundary.draw());

  // Handle player movement based on key presses
  if (keys.a.pressed && lastKey === "a") {
    movePlayer(-1, 0);
  }
  if (keys.d.pressed && lastKey === "d") {
    movePlayer(1, 0);
  }
  if (keys.w.pressed && lastKey === "w") {
    movePlayer(0, -1);
  }
  if (keys.s.pressed && lastKey === "s") {
    movePlayer(0, 1);
  }
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

function updateHealth() {
  // Get the current time
  const now = Date.now();

  // Check if a zombie is touching the player
  if (
    zombieEnemy &&
    characterMoving &&
    rectangularCollision({
      rectangle1: {
        position: characterMoving.position,
        width: characterMoving.spriteCuts.dw - 20,
        height: characterMoving.spriteCuts.dh - 10,
      },
      rectangle2: {
        position: zombieEnemy.position,
        width: zombieEnemy.spriteCuts.dw - 20,
        height: zombieEnemy.spriteCuts.dh - 10,
      },
    })
  ) {
    // Check if it's been at least 1 second since the last health drop
    if (now - lastHealthDropTime >= 1000) {
      playerHealth -= 10; // Decrease health by 10
      lastHealthDropTime = now; // Update the last health drop time
    }
  }

  // Clamp the health between 0 and the maximum player health
  playerHealth = Math.max(0, Math.min(playerHealth, maxPlayerHealth));

  // If health is 0, handle the player's death (game over, etc.)
  if (playerHealth <= 0) {
    console.log("Player is dead!");
    stopAnimation();
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
    animationFrameId = null; // Reset the identifier
  }
}

// ----- Event Listeners -----
window.addEventListener("keydown", (event) => {
  // Handle key down logic
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
      keys.Escape.pressed = true;
      if (animationFrameId) {
        stopAnimation();
      } else {
        startAnimation();
      }
      break;
  }
});

window.addEventListener("keyup", (event) => {
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
      keys.esc.pressed = false;
      break;
  }
  // If none of the movement keys are pressed, set moving to false
  if (
    !keys.w.pressed &&
    !keys.a.pressed &&
    !keys.s.pressed &&
    !keys.d.pressed
  ) {
    characterMoving.moving = false;
    characterMoving.spriteCuts.elapsed = 0;
    characterMoving.spriteCuts.val = 1;
  }
});

// ----- Asset Loading and Game Initialization -----
async function loadAssetsAndStartGame() {
  try {
    const [newMap, playerWalk, zombieWalk] = await Promise.all([
      loadImage("./assets/Tile Set/newMap.png"),
      loadImage("./assets/Apocalypse Character Pack/Player/Walk.png"),
      loadImage("./assets/Apocalypse Character Pack/Zombie/Walk.png"),
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

    zombieEnemy = new Sprite({
      position: { x: 500, y: 300 },
      image: zombieWalk,
      spriteCuts: {
        sw: zombieWalk.width / 11,
        sh: zombieWalk.height / 4,
        dw: zombieWalk.width / 11,
        dh: zombieWalk.height / 4,
      },
      totalFrames: { x: 11, y: 4 },
      animationSpeed: 25,
    });

    animate(); // Start the animation loop
  } catch (error) {
    console.error("Error loading assets:", error);
  }
}

loadAssetsAndStartGame(); // Call the function to load assets and start the game
