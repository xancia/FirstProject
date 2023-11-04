const canvas = document.querySelector("canvas");
const ctr = canvas.getContext("2d");
canvas.width = 304;
canvas.height = 480;

const image = new Image();
image.src = "./assets/Tile Set/zombieGameMap.png";

const playerImageWalking = new Image();
playerImageWalking.src = "./assets/Apocalypse Character Pack/Player/Walk.png";

class Sprite {
  constructor({ position, image, spriteCuts}) {
    this.position = position;
    this.image = image;
    this.spriteCuts = spriteCuts;
  }

  drawBackground() {
    ctr.drawImage(this.image, 0, 0);
  }

  drawCharacterMoving() {
    ctr.drawImage(
        this.image,
        this.spriteCuts.sx,
        this.spriteCuts.sy,
        this.spriteCuts.sw,
        this.spriteCuts.sh,
        this.position.x,
        this.position.y,
        this.spriteCuts.dw,
        this.spriteCuts.dh,
    )
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

playerImageWalking.onload = () => {
    characterMoving = new Sprite({
        position: {
            x: 136,
            y: 400
        },
        spriteCuts: {
            sx: 0,
            sy: 0,
            sw: playerImageWalking.width / 5,
            sh: playerImageWalking.height / 4,
            dw: playerImageWalking.width / 5,
            dh: playerImageWalking.height / 4
        },
        image: playerImageWalking
    });
  
    animate(); 
};

const animate = () => {
    window.requestAnimationFrame(animate);
    ctr.clearRect(0, 0, canvas.width, canvas.height); 
    background.drawBackground();
  
    if (characterMoving) { 
      characterMoving.drawCharacterMoving();
    }

    if (keys.a.pressed) {
        characterMoving.position.x = characterMoving.position.x - 1
    }

    if (keys.d.pressed) {
        characterMoving.position.x = characterMoving.position.x + 1
    }

    if (keys.w.pressed) {
        characterMoving.position.y = characterMoving.position.y - 1
    }

    if (keys.s.pressed) {
        characterMoving.position.y = characterMoving.position.y + 1
    }

}


window.addEventListener("keydown", (evt) => {
  switch (evt.key) {
    case "w":
      keys.w.pressed = true;
      break;

    case "a":
      keys.a.pressed = true;
      break;

    case "s":
      keys.s.pressed = true;
      break;

    case "d":
      keys.d.pressed = true;
      break;
  }
});

window.addEventListener("keyup", (evt) => {
    switch (evt.key) {
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
  });
