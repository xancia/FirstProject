const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 304;
canvas.height = 480;

// 19 because there are 19 tiles for the width in tiles, which represent 1 row. Each row is pushed into the collision map as a single array for organization
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 19) {
  collisionsMap.push(collisions.slice(i, i + 19));
}

// height and width is set to 16 because the map assets is 16x16 tileset
class Boundary {
  static width = 16;
  static height = 16;
  constructor({ position }) {
    this.position = position;
    this.width = 16;
    this.height = 16;
  }

  draw() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

// This is checking my collissionMap array stored in collisions.js, the data is used via tiled to get the accurate position for where to draw the collisions and store it in an object in this array. It will only draw where there is a 257 which is where the collision object is.
const boundaries = [];
collisionsMap.forEach((row, i) => {
  row.forEach((collumn, j) => {
    if (collumn == 257) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width,
            y: i * Boundary.height,
          },
        })
      );
    }
  });
});
console.log(boundaries);
const image = new Image();
image.src = "./assets/Tile Set/zombieGameMap.png";

const playerImageWalking = new Image();
playerImageWalking.src = "./assets/Apocalypse Character Pack/Player/Walk.png";

// this class is used to store the methods for drawing images
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
      this.spriteCuts.val * 32, // This picks the starting point for crop. 32 because character sprite is 32x32
      this.spriteCuts.valy * 32, // This picks the starting crop direction via Y axis
      this.spriteCuts.sw, // crop width - how far to crop on x axis
      this.spriteCuts.sh, // crop height - how far to crop on y axis
      this.position.x, // starting position x
      this.position.y, // starting position y
      this.spriteCuts.dw, // rendering width - actual width use same as sw
      this.spriteCuts.dh // rendering height - actual height same as sh
    );

    if (this.moving) {
    
      // this is to slow down the animation

      this.spriteCuts.elapsed++;

      if (this.spriteCuts.elapsed % 25 === 0) {
        if (this.spriteCuts.val < 3) {
          this.spriteCuts.val++;
        } else {
          this.spriteCuts.val = 0;
        }
      }
    }
  }
}

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: image,
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

let characterMoving;

// only run this function to create the character for drawing if the sprite is loaded
playerImageWalking.onload = () => {
  characterMoving = new Sprite({
    position: {
      x: 136,
      y: 400,
    },
    spriteCuts: {
      //   sx: 0,
      //   sy: 0,
      sw: playerImageWalking.width / 5, // 5 becuase there's 5 section on x
      sh: playerImageWalking.height / 4, // 4 because 4 on why
      dw: playerImageWalking.width / 5,
      dh: playerImageWalking.height / 4,
    },
    image: playerImageWalking,
  });

  animate();
};

// This checks if parameter 1 is colliding with parameter 2
const rectangularCollision = function ({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  );
};

// This is to add padding since the collision was happening too soon compared to character sprite
const COLLISION_PADDING = {
  top: 5,
  bottom: 0,
  left: 10,
  right: 10,
};

// This function is based the movement amount from animate function
const movePlayer = (dx, dy) => {
  characterMoving.moving = true;
  // This calculates the next position before the character actually moves
  // this object is used to check if the next position will be colliding or not, if it does
  const nextPos = {
    position: {
      x: characterMoving.position.x + dx + COLLISION_PADDING.left,
      y: characterMoving.position.y + dy + COLLISION_PADDING.top,
    },
    width:
      characterMoving.spriteCuts.sw -
      COLLISION_PADDING.left -
      COLLISION_PADDING.right,
    height:
      characterMoving.spriteCuts.sh -
      COLLISION_PADDING.top -
      COLLISION_PADDING.bottom,
  };

  // This for loop checks via the rectangularCollision function using nextpos to see if the player and the boundary are overlapping, if it does, it will return and exit the function before movement happens
  for (let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i];
    if (
      rectangularCollision({
        rectangle1: nextPos,
        rectangle2: boundary,
      })
    ) {
      return false;
    }
  }

  // the return true/false here might get used later for a condition on the movePlayer function
  characterMoving.position.x += dx;
  characterMoving.position.y += dy;
  return true;
};

const animate = () => {
  window.requestAnimationFrame(animate);
  // clears the canvas before drawing to avoid potential issues
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  background.drawBackground();

  // checks to see if characterMoving was properly created, meaning the sprites actually loaded, before it actually draws the character
  if (characterMoving) {
    characterMoving.drawCharacter();
  }

  boundaries.forEach((boundary) => {
    boundary.draw();
  });

  // These call the moveplayer function and pass it the direction to move
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
};

// this is implemented for smooth movement and to control the animation direction
let lastKey = "";
window.addEventListener("keydown", (evt) => {
  switch (evt.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      characterMoving.spriteCuts.valy = 1;
      break;

    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      characterMoving.spriteCuts.valy = 3;
      break;

    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      characterMoving.spriteCuts.valy = 0;
      break;

    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      characterMoving.spriteCuts.valy = 2;
      break;
  }
});

// This event is for stopping movement and for reseting values
window.addEventListener("keyup", (evt) => {
  switch (evt.key) {
    case "w":
      keys.w.pressed = false;
      characterMoving.moving = false;
      characterMoving.spriteCuts.elapsed = 0;
      characterMoving.spriteCuts.val = 1;
      break;

    case "a":
      keys.a.pressed = false;
      characterMoving.moving = false;
      characterMoving.spriteCuts.elapsed = 0;
      characterMoving.spriteCuts.val = 1;
      break;

    case "s":
      keys.s.pressed = false;
      characterMoving.moving = false;
      characterMoving.spriteCuts.elapsed = 0;
      characterMoving.spriteCuts.val = 1;
      break;

    case "d":
      keys.d.pressed = false;
      characterMoving.moving = false;
      characterMoving.spriteCuts.elapsed = 0;
      characterMoving.spriteCuts.val = 1;
      break;
  }
});
