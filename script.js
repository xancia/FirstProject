const canvas = document.querySelector("canvas");
const ctr = canvas.getContext("2d");
canvas.width = 304;
canvas.height = 480;

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 19) {
  collisionsMap.push(collisions.slice(i, i + 19));
} // 19 because there are 19 tiles for the width in tiles, which represent 1 row

class Boundary {
  static width = 16;
  static height = 16;
  constructor({ position }) {
    this.position = position;
    this.width = 16;
    this.height = 16;
  } // height and width is set to 16 because the map assets is 16x16 tileset

  draw() {
    ctr.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctr.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

// This is checking my collissionMap array stored in collisions.js, the data is used via tiled to get the accurate position for where to draw the collisions. It will only draw where there is a 257 which is where the collision object is.
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

const image = new Image();
image.src = "./assets/Tile Set/zombieGameMap.png";

const playerImageWalking = new Image();
playerImageWalking.src = "./assets/Apocalypse Character Pack/Player/Walk.png";

class Sprite {
  constructor({ position, image, spriteCuts }) {
    this.position = position;
    this.image = image;
    this.spriteCuts = {...spriteCuts, val:0,valy:0, elapsed:0};
    this.moving = false;
  }

  drawBackground() {
    ctr.drawImage(this.image, 0, 0);
  }

  drawCharacterMoving() {
    ctr.drawImage(
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
    // this is to slow down the animation
    
    this.spriteCuts.elapsed++
    
    
    if (this.spriteCuts.elapsed % 25 === 0) {
    if (this.spriteCuts.val < 3) {
        this.spriteCuts.val++
    } else {
        this.spriteCuts.val = 0
    }}
  }}
} // this class is used to store the methods for drawing images

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

playerImageWalking.onload = () => {
  characterMoving = new Sprite({
    position: {
      x: 136,
      y: 400,
    },
    spriteCuts: {
    //   sx: 0,
    //   sy: 0,
      sw: playerImageWalking.width / 5,
      sh: playerImageWalking.height / 4,
      dw: playerImageWalking.width / 5,
      dh: playerImageWalking.height / 4,
    },
    image: playerImageWalking,
  });

  animate();
};

const rectangularCollision = function ({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  );
};

const COLLISION_PADDING = {
  top: 5,
  bottom: 0,
  left: 10,
  right: 10,
}; // This is to add padding since the collision was happening too soon compared to character sprite

const movePlayer = (dx, dy) => {
    characterMoving.moving = true
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
  }; // this object is used to check if the next position will be colliding or not, if it does, it rejects the input so that the player doesn't actually collide

  for (let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i];
    if (
      rectangularCollision({
        rectangle1: nextPos,
        rectangle2: boundary,
      })
    ) {
      return false; // This for loop checks via the rectangularCollision function to see if the player and the boundary are overlapping
    }
  }

  characterMoving.position.x += dx;
  characterMoving.position.y += dy;
  return true; // the return true/false here might get used later for a condition on the movePlayer function
};

const animate = () => {
  window.requestAnimationFrame(animate);
  ctr.clearRect(0, 0, canvas.width, canvas.height);
  background.drawBackground();

  if (characterMoving) {
    characterMoving.drawCharacterMoving();
  }

  let player = {
    position: characterMoving.position,
    width: characterMoving.spriteCuts.sw,
    height: characterMoving.spriteCuts.sh,

  };

  boundaries.forEach((boundary) => {
    boundary.draw();
  });

  // These call the moveplayer function
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

let lastKey = "";
window.addEventListener("keydown", (evt) => {
  switch (evt.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      characterMoving.spriteCuts.valy = 1
      break;

    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      characterMoving.spriteCuts.valy = 3
      break;

    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      characterMoving.spriteCuts.valy = 0
      break;

    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      characterMoving.spriteCuts.valy = 2
      break;
  }
});

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
