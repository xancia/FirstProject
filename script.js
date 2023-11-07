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
  return boundaries.some(boundary => rectangularCollision({
    rectangle1: nextPos,
    rectangle2: boundary,
  }));
}

// ----- Global Variables -----
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1280;
canvas.height = 720;

const COLLISION_PADDING = { top: 5, bottom: 0, left: 10, right: 10 };
const keys = { w: { pressed: false }, a: { pressed: false }, s: { pressed: false }, d: { pressed: false } };
let lastKey = "";
let characterMoving, zombieEnemy, background;

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
  constructor({ position, image, spriteCuts }) {
    this.position = position;
    this.image = image;
    this.spriteCuts = { ...spriteCuts, val: 0, valy: 0, elapsed: 0 };
    this.moving = false;
  }

  drawBackground() {
    ctx.drawImage(this.image, 0, 0);
  }

  drawCharacter() {
    ctx.drawImage(
      this.image,
      this.spriteCuts.val * 32,
      this.spriteCuts.valy * 32,
      this.spriteCuts.sw,
      this.spriteCuts.sh,
      this.position.x,
      this.position.y,
      this.spriteCuts.dw,
      this.spriteCuts.dh
    );

    if (this.moving) {
      this.spriteCuts.elapsed++;
      if (this.spriteCuts.elapsed % 25 === 0) {
        this.spriteCuts.val = (this.spriteCuts.val + 1) % 4; // Looping through 4-directional movement
      }
    }
  }
}

// ----- Collision Map Setup -----
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 80) {
  collisionsMap.push(collisions.slice(i, i + 80));
}

const boundaries = collisionsMap.flatMap((row, i) =>
  row.map((cell, j) => cell === 257 ? new Boundary({ position: { x: j * Boundary.width, y: i * Boundary.height } }) : null)
).filter(Boolean);

// ----- Game Functions -----
function movePlayer(dx, dy) {
  // Set moving to true if there is an attempt to move
  characterMoving.moving = dx !== 0 || dy !== 0;

  const nextPos = {
    position: {
      x: characterMoving.position.x + dx + COLLISION_PADDING.left,
      y: characterMoving.position.y + dy + COLLISION_PADDING.top,
    },
    width: characterMoving.spriteCuts.dw - COLLISION_PADDING.left - COLLISION_PADDING.right,
    height: characterMoving.spriteCuts.dh - COLLISION_PADDING.top - COLLISION_PADDING.bottom,
  };

  // Check for collision at the next position
  if (!checkCollision(nextPos)) {
    characterMoving.position.x += dx;
    characterMoving.position.y += dy;
    return true; // Movement was successful
  }
  
  
  return false; // Movement was blocked by a collision
}

function attackPlayer() {
  if (!zombieEnemy) return;

  const dx = characterMoving.position.x - zombieEnemy.position.x;
  const dy = characterMoving.position.y - zombieEnemy.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // adjust the speed here
  const speed = 0.2;

  if (distance > Boundary.width / 2) { // Stop if too close to the player
    const nextZombiePosition = {
      position: {
        x: zombieEnemy.position.x + speed * (dx / distance),
        y: zombieEnemy.position.y + speed * (dy / distance),
      },
      width: zombieEnemy.spriteCuts.dw - COLLISION_PADDING.left - COLLISION_PADDING.right,
      height: zombieEnemy.spriteCuts.dh - COLLISION_PADDING.top - COLLISION_PADDING.bottom,
    };

    // Check for collision at the next position
    if (!checkCollision(nextZombiePosition)) {
      zombieEnemy.position.x = nextZombiePosition.position.x;
      zombieEnemy.position.y = nextZombiePosition.position.y;
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  background.drawBackground();

  if (characterMoving) {
    characterMoving.drawCharacter();
  }

  if (zombieEnemy) {
    attackPlayer();
    zombieEnemy.drawCharacter();
  }

  boundaries.forEach(boundary => boundary.draw());

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
  }
  // If none of the movement keys are pressed, set moving to false
  if (!keys.w.pressed && !keys.a.pressed && !keys.s.pressed && !keys.d.pressed) {
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
      spriteCuts: { sw: canvas.width, sh: canvas.height, dw: canvas.width, dh: canvas.height }
    });

    characterMoving = new Sprite({
      position: { x: canvas.width / 2, y: canvas.height / 2 },
      image: playerWalk,
      spriteCuts: { sw: playerWalk.width / 5, sh: playerWalk.height / 4, dw: playerWalk.width / 5, dh: playerWalk.height / 4 }
    });

    zombieEnemy = new Sprite({
      position: { x: 500, y: 300 },
      image: zombieWalk,
      spriteCuts: { sw: zombieWalk.width / 11, sh: zombieWalk.height / 4, dw: zombieWalk.width / 11, dh: zombieWalk.height / 4 }
    });

    animate(); // Start the animation loop
  } catch (error) {
    console.error("Error loading assets:", error);
  }
}

loadAssetsAndStartGame(); // Call the function to load assets and start the game