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
    zombieGenerationSpeed -= 25;
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

function drawPlayButton() {
  const boxWidth = 400;
  const boxHeight = 200;
  const boxX = canvas.width / 2 - boxWidth / 2;
  const boxY = canvas.height / 2 - boxHeight / 2;
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; // semi-transparent white
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  // Draw Play button
  ctx.fillStyle = "#000";
  ctx.fillRect(canvas.width / 2 - buttonWidth / 2, canvas.height / 2 - 20, buttonWidth, buttonHeight);

  // Draw Play button text
  ctx.fillStyle = "#FFF";
  ctx.font = "15px Arial";
  ctx.fillText("Play Game", canvas.width / 2 - 35, canvas.height / 2 + 10);

  canvas,addEventListener("click", playGame)
}

function playGame(event) {
  const clickX = event.clientX - canvas.getBoundingClientRect().left;
  const clickY = event.clientY - canvas.getBoundingClientRect().top;

  if (
    clickX >= canvas.width / 2 - buttonWidth / 2 &&
    clickX <= canvas.width / 2 - buttonWidth / 2 + buttonWidth &&
    clickY >= canvas.height / 2 - 20 &&
    clickY <= canvas.height / 2 - 20 + buttonHeight
  ) {
    loadAssetsAndStartGame();
    zombieSpawnInterval();
  }
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
  zombieGenerationSpeed = 5000;
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
const attackAudio = new Audio('data:audio/x-wav;base64,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5w/qD7sPZRAxD/kPeBJLAdLvru+f7zTve+9s723vau9u72/vcO9w73Hvcu9y73Pvde9273bvd+9473fvfe9573bvhO9s75zviPLJ+HD7cfqs+sD6pPqx+q76r/qv+q/6r/qw+rD6sPqw+rH6sfqx+rH6svqy+rL6svqy+rP6s/qz+rP6tPq0+rX6tfq1+rX6tvq2+rb6tvq3+rf6t/q3+rf6uPq4+rf6uPq4+rj6u/q6+rn6s/rP+q76g/rM+iDz+emo6l7rreoD6/Hq8ury6vXq9Or26vjq+Or56vrq++r86v3q/er/6gHrAesB6wLrA+sF6wbrBusH6wjrCesJ6wrrDOsN6w3rDusP6xHrEusS6xPrFesW6xbrF+sY6xnrGusb6xzrHese6x7rH+sg6yHrIusj6yXrJusl6yXrKOsw6xXrLeuB6+rqnPOY/1n/Kv4d/7b+yP7K/sv+yP7J/sn+yv7K/sr+yf7K/sr+yv7K/sr+y/7L/sr+yv7L/sv+y/7K/sv+y/7K/sv+y/7K/sr+y/7L/sv+y/7M/sz+y/7L/sv+zP7M/sz+zP7M/sz+zP7N/sz+zf6//vL+l/7U/or/hfp39XD1avVM9WD1XfVd9V31X/Vf9V/1X/Vg9WH1YfVh9WL1Y/Vi9WP1ZPVk9WX1ZfVl9Wb1Z/Vn9Wf1aPVo9Wj1afVp9Wr1a/Vr9Wz1bPVt9W31bfVu9W/1bvVv9XD1cPVy9XH1cPV19Vb1mPSe84HzovOR85bzmPOX85fzl/OY85nzmfOZ85rzm/Oc85zznPOd857znvOe85/zoPOh86DzoPOi86Pzo/Oj86PzpPOl86XzpvOm86fzp/On86jzqfOq86rzq/Ol87jzovP/87H1c/Yg9jf2PPY19jj2N/Y59jn2OvY69jr2O/Y79jv2PPY89jz2PPY89j72P/Y+9j72P/Y/9kD2QfZB9kH2QfZC9kL2QvZD9kP2Q/ZE9kb2Q/ZK9kT2PfZx9sv1u/SY9KL0mPSd9Jz0nfSd9J70nvSf9J/0oPSg9KD0ofSi9KH0ovSj9KT0pfSk9KT0pfSm9Kb0pvSm9Kj0qPSo9Kn0qvSn9Kr0p/TH9GL0B/W79BXzB/0XC5MPiw9lD4sPcw93D3oPdw92D3cPdQ90D3QPdA9zD3IPcg9yD3EPcA9wD28Pbg9uD20PbA9sD2sPag9qD2kP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cQdxB3AHbwdvB24HbgdtB2wHbAdrB2oHaQdpB2kHaAdoB2cHZgdmB2YHZAdjB2MHYgdhB2EHYQdgB18HXwdeB14HXQdcB1sHWwdaB1oHWgdZB1cHVwdXB1YHVQdUB1MHUwdSB1IHUQdRB1AHUAdPB04HTgdNB0wHTAdMB0sHSgdJB0kHSAdHB0YHRQdFB0UHRAdDB0MHQgdBB0EHQAc/Bz8HPgc9Bz0HPAc7BzsHOwc6BzkHOAc3BzcHOAcxBz8HLQckB/cH2AgPCQsJCQkKCQgJCAkGCQYJBQkECQMJAgkBCQEJAAn/CP4I/Qj9CPwI+wj6CPkI+Aj4CPcI9gj2CPUI9AjyCPII8gjxCPAI7wjvCO0I7AjsCOsI6gjqCOkI6AjoCOcI5QjlCOUI4wjiCOII4QjgCN8I3gjeCNwI3AjbCNoI2gjZCNcI1gjWCNUI1QjUCNMI0gjRCNEI0QjQCM4IzQjMCMwIywjKCMkIyQjICMYIxgjGCMUIxAjDCMIIwgjACL8Ivwi/CL0Iuwi+CLkIuwg5CYIKOQsHCwoLEgsJCwsLCgsJCwgLBwsGCwQLAwsCCwILAAv/Cv4K/gr9CvwK+wr5CvgK9wr2CvUK9Ar0CvIK8ArvCu8K7grtCuwK7ArqCukK6ArnCuYK5QrkCuIK4grhCuAK3wrfCt0K3ArbCtkK2QrYCtcK1QrVCtQK0grRCtEKzwrOCs0KzQrMCssKygrICsgKxwrFCsQKxArCCsEKwAq/Cr4KvQq8CrsKuwq5CrgKtwq2CrYKtgqvCrUKsAplCv8J1gneCdwJ2QnaCdkJ2AnXCdYJ1QnUCdMJ0gnRCdEJzwnOCc0JzAnLCcsJygnICcgJxwnFCcUJxQnDCcIJwQm/Cb8Jvwm+CbwJuwm6CbkJuAm4CbcJtQm0CbUJtAmyCbEJsAmvCa8JrQmsCawJqgmqCakJpwmnCaYJpQmkCaMJogmhCaAJnwmeCZ4JnQmbCZsJmgmYCZcJlwmWCZQJlAmUCZIJkQmPCY8JjwmNCYwJjAmLCYkJiQmICYYJhgmFCYMJggmCCYEJgAl/CX4Jfgl8CXsJewl6CXkJeAl3CXYJdQlzCXoJpgneCeMJ2wneCdwJ2wnaCdkJ2QnXCdYJ1QnUCdMJ0gnRCdAJ0AnOCc0JzAnMCcoJygnJCccJxwnGCcQJwwnDCcEJwQnACb8Jvgm9CbwJuwm6CbkJuAm3CbYJtQmzCbMJswmxCbAJrwmuCa0JrAmrCakJqQmoCacJpgmmCaUJpAmjCaEJoQmgCZ4JnQmdCZsJmgmZCZkJmAmWCZUJlAmUCZMJkQmRCZEJjwmOCY0JjAmLCYoJiQmHCYcJhgmFCYQJgwmCCYEJgAl/CX4JfQl8CXsJegl6CXkJeAl3CXYJdQl0CXIJcglwCW8JbgluCW0JawlqCWoJaQloCWcJZQllCWQJYwliCWIJYAlfCV4JXQlcCVsJWglaCVkJVwlXCVYJVQlUCVIJUQlRCVAJTglNCU0JTAlKCUwJSwlACUAJkAmICFMK8gjr/NX4PPtV+mv6jvp7+n36f/qA+oD6gPqB+oH6gvqD+oP6hPqF+ob6hvqH+of6iPqI+oj6ivqK+or6i/qL+oz6jfqN+o76jvqP+pD6kPqR+pL6kvqS+pP6k/qU+pX6lfqW+pf6mPqY+pj6mfqa+pr6mvqb+pz6nPqd+p36nvqf+p/6oPqg+qH6ofqi+qP6pPqk+qT6pfqm+qb6pvqn+qj6qfqp+qn6qvqr+qv6q/qt+q36rfqu+q76r/qw+rD6sfqy+rL6svqz+rP6tPq1+rX6tvq3+rj6uPq4+rn6uvq6+rr6u/q8+r36vfq++r76v/rA+sD6wPrB+sL6wvrC+sP6wvrE+sX62PqI+i77kfrK+S4CCAgmBmsGqwZvBoUGgQaBBn8GfgZ+Bn0GfAZ7BnsGegZ5BngGeAZ3BnYGdQZ1BnUGdAZzBnIGcgZxBnAGbwZvBm4GbQZtBmwGawZrBmoGaQZoBmgGZwZmBmUGZQZlBmQGYgZiBmIGYQZgBl8GXwZeBl0GXAZcBlwGWwZZBlkGWQZXBlcGVwZVBlQGVAZUBlMGUgZRBlEGUQZPBk8GTgZNBk0GTAZKBkoGSgZJBkgGRwZHBkYGRQZFBkQGQwZDBkMGQQZABkAGPwY+Bj4GPgY8BjsGOwY7BjoGOQY4BjgGNwY3BjYGMQY0BkcG9wWVBuIF8AE5AH8AVABcAF4AXgBcAF0AXABcAF0AXQBcAF0AXQBdAF0AXQBdAF0AXQBdAFwAXABcAFwAXABcAFwAXABcAFsAWwBcAFsAWwBcAFwAXABcAFwAXABbAFsAWwBbAFwAWwBbAFsAWwBcAFsAWwBbAFsAWwBaAFoAWwBaAFoAWwBbAFoAWwBbAFsAWgBaAFsAWwBaAFoAWgBaAFsAWgBaAFoAWgBaAFoAWgBaAFoAWQBZAFkAWgBaAFkAWQBaAFoAWQBZAFkAWQBZAFkAWQBZAFkAWQBbAFMAXgBmAFsAiwLxBLAEiAS0BJwEoQShBKIEoASfBJ8EnwSeBJ4EnQScBJsEmwSbBJoEmgSZBJgEmASYBJgElgSVBJUElQSVBJQElASTBJIEkQSRBJEEkASPBI8EjgSNBI0EjQSMBIwEiwSKBIsEigSJBIkEiASHBIcEhwSGBIUEhQSFBIQEgwSDBIIEggSBBIAEgASABH8EfwR+BH0EfQR8BHsEewR7BHsEegR5BHkEeQR4BHcEdwR3BHYEdQR1BHUEdARzBHIEcQRxBHEEcARwBG8EbgRuBG0EbQRtBGwEawRrBGsEagRqBGkEaQRoBGcEZgRmBGYEZQRlBGQEZARkBGIEYgRiBGEEYQRgBGAEYARfBF4EXQRdBFwEXARbBFoEWgRaBFkEWQRZBFgEVwRXBFYEVQRVBFQEVARUBFMEUwRSBFIEUgRQBFAEUARPBE8ETgRNBE0ETQRMBEsESwRKBEsERARRBEYENASOBHADFABC/eD8Lv0I/RL9Fv0S/RP9FP0U/RX9Ff0V/Rb9Fv0W/Rb9F/0X/Rf9GP0Z/Rn9Gf0a/Rr9Gv0b/Rv9G/0c/Rz9HP0c/R39Hf0e/R79Hv0e/R/9H/0f/SD9IP0g/SL9Iv0h/SL9Iv0i/SP9I/0k/ST9JP0l/Sb9Jv0m/Sb9J/0n/Sf9KP0o/Sj9KP0p/Sn9Kv0q/Sr9K/0r/Sz9LP0s/S39Lf0t/S79Lv0u/S/9L/0v/TD9MP0w/TD9Mf0x/TH9Mf0z/TL9Mv0z/TP9NP01/TX9Nf01/Tb9Nv02/Tf9N/04/Tj9OP05/Tn9Of05/Tn9Ov07/Tv9O/08/Tz9PP08/T39Pf09/T79P/0//T/9P/0//UD9QP1A/UH9Qf1B/UH9Qv1C/UP9Q/1D/UT9Rf1E/UT9Rv1G/Ub9R/1H/Uf9SP1I/Uj9Sf1J/Uf9S/1K/Un9T/0t/Uj8CPvW+gP77frz+vX69Pr1+vb69vr3+vj6+Pr5+vr6+/r7+vv6/Pr9+v76/vr++v/6APsA+wH7AvsD+wP7A/sF+wX7BfsG+wf7B/sI+wj7CfsK+wr7C/sM+wz7DfsO+w77DvsP+xD7EfsR+xL7E/sT+xP7FPsV+xX7FfsW+xj7GPsY+xn7Gvsb+xz7HPsc+x37Hvse+x77H/sg+yD7Ifsi+yL7Ivsj+yT7Jfsl+yX7J/sn+yj7KPsp+yr7K/ss+yz7LPst+y77Lvsu+y/7MPsw+zD7Mfsy+zP7M/s0+zX7Nfs1+zb7N/s4+zn7Ofs5+zr7O/s7+zv7PPs++z77Pvs/+z/7P/s++zz7PPs6+zn7OPs4+zb7Nfs0+zP7Mvsx+zD7Lvsx+yX7N/t++6j7rPup+6j7p/um+6b7pfuk+6P7ovuh+6D7nvue+577nPub+5v7mfuY+5f7l/uW+5X7lPuT+5L7kfuQ+4/7j/uN+4z7i/uK+4r7ifuI+4b7hvuG+4X7g/uC+4L7gft/+377fvt++3z7e/t6+3n7ePt3+3b7dvt1+3T7c/ty+3H7cPtv+2/7bvtt+2z7a/tq+2n7Z/tn+2b7Zftk+2P7Y/th+2D7YPtf+177Xftc+1v7W/ta+1j7V/tX+1b7VftU+1P7UvtR+1D7T/tP+077TftL+0r7SvtJ+0j7R/tG+0b7RftD+0P7QvtB+0D7P/s/+z77PPs6+zr7Ovs4+zj7OPs2+zb7Nfsr+0X7GPsx+3/8O/0k/TD9Lv0t/S39LP0r/Sv9K/0r/Sr9Kf0o/Sj9KP0n/Sb9Jv0m/SX9JP0k/ST9Iv0i/SL9If0g/SD9H/0f/R/9Hv0e/R79Hf0c/Rv9Gv0a/Rr9Gf0Z/Rn9GP0X/Rf9F/0W/RX9FP0T/RP9FP0T/RL9Ev0R/RD9EP0P/Q/9D/0N/Q39Df0M/Qv9C/0L/Qv9Cf0J/Qn9Cf0I/Qb9Bv0G/QX9BP0E/QT9BP0D/QL9Av0C/QH9AP0A/QD9//z+/P78/vz9/P38+/z7/Pv8+vz6/Pn8+fz5/Pj89/z3/Pb89fz1/PX89fz0/PP88vzy/PL88fzw/PD87/zu/O/87vzt/O387Pzr/Ov86/zq/Or86vzp/Oj86Pzo/Of85vzm/OX85Pzk/OT84/zj/OL84fzh/OH84Pzf/N/83vzd/N383fzc/Nz82/za/Nr82fzZ/Nn82PzX/Nf81/zW/Nb81fzV/NX81PzT/NP80vzR/NH80PzQ/ND8zvzP/M/8zfzM/M38zfzM/Mv8y/zL/Mr8yfzI/Mj8yPzH/Mf8xvzG/MX8xPzE/MT8w/zC/ML8wfzB/MH8v/zA/MD8v/y+/L38vPy8/Lz8u/y7/Lv8uvy5/Lv8r/zO/KX8j/x3/U76N/a39vP2pfbM9sD2wPa99r32vPa59rj2t/a29rT2s/ax9rD2r/at9qv2qvap9qf2pvak9qP2ovah9p/2nvac9pr2mfaY9pf2lPaT9pL2kfaP9o72jPaL9or2iPaH9ob2hPaC9oH2f/Z+9n32fPZ69nn2d/Z19nT2cvZx9nD2bvZt9mz2avZp9mj2ZvZk9mP2YvZg9l/2XfZc9lv2WvZY9lb2VvZU9lL2UPZQ9k/2TfZL9kr2SPZH9kb2RPZD9kL2QPY+9j32O/Y69jj2N/Y29jT2M/Yy9jD2L/Yu9iv2KvYq9ij2JvYk9iT2I/Yh9h/2H/Ye9hz2GvYY9hf2FvYU9hL2EvYQ9g72DPYM9gv2CfYH9gb2BPYD9gH2//X/9f71/PX79fn1+PX39fT18/Xy9fH17/Xt9ez16vXp9ej15/Xl9eT14vXg9eD13/Xd9dv12vXZ9dj11fXV9dP10fXQ9c/1zfXM9cr1yfXI9cb1xfXE9cL1wfXA9b31u/W49cX1qPWo9SL2qvSM91H/XgHpAD8BIwElASQBKAEmASYBJwEnAScBJwEoAScBJwEoASgBKAEoASkBKQEpASkBKQEpASoBKgEqASoBKgEqASoBKwErASsBKwErASwBKwErASwBLAEtAS0BLQEtAS0BLQEtAS0BLgEtAS0BLQEuAS8BLgEuAS8BLwEvATABMAEwATABMAEwATABMAEwATABMAExATEBMgEyATIBMgEyATIBMwEzATIBMgEzATMBMwEzATMBNAEzATQBNAE0ATUBNAE0ATUBNQE1ATUBNQE2ATYBNgE2ATYBNwE3ATcBNwE4ATcBNwE3ATgBOAE4ATgBOAE5ATgBOAE5ATkBOQE6AToBOgE6AToBOgE6AToBOwE7ATsBOwE8ATsBOwE8ATwBPAE9AT0BPQE9AT0BPQE9AT0BPQE9AT4BPgE+AT4BPgE/AT8BPwE/AUABQAFAAUABQAFAAUABQQFBAUEBQgE+AUwBZQFwAXABcAFwAXEBcAFwAXEBcQFyAXIBcgFyAXIBcgFyAXIBcwFyAXIBcwF0AXQBcwFzAXQBdAF1AXQBdAF1AXYBdQF1AXYBdgF3AXcBdgF3AXcBdwF3AXcBeAF4AXgBeAF4AXgBeAF5AXkBeQF6AXoBegF6AXsBewF6AXsBewF7AXwBfAF8AXwBfAF8AX0BfAF8AX0BfQF9AX4BfgF+AX8BfgF+AX8BfwF/AX8BfwGAAYABgQGBAYABgQGBAYEBggGBAYIBggGCAYIBggGDAYMBggGDAYMBgwGEAYQBhAGEAYUBhQGFAYUBhQGFAYUBhQGFAYYBhwGHAYYBhgGHAYcBhwGHAYgBiAGIAYgBiAGIAYkBiQGJAYoBigGKAYoBigGKAYoBigGLAYsBiwGMAYwBiwGMAYwBjAGNAY0BjQGNAY0BjgGOAY4BjgGPAY8BjwGPAY8BjwGPAY8BjwGQAZEBkAGQAZEBkQGRAZEBkQGSAZIBkgGSAZIBkgGSAZMBlAGUAZQBlAGUAZQBlQGVAZUBlQGVAZUBlQGWAZYBlwGXAZYBlwGYAZcBlwGXAZcBmAGYAZgBmQGZAZkBmQGZAZkBmgGaAZoBmwGaAZoBmwGbAZsBmwGcAZwBnAGcAZwBnQGcAZ0BnQGdAZ4BngGeAZ4BngGeAZ8BnwGfAZ8BoAGfAZ8BoAGgAaABoQGhAaEBogGiAaIBogGiAaMBowGiAaMBowGjAaMBpAGkAaQBpAGkAaQBpQGlAaUBpgGmAaYBpgGmAaYBpgGmAacBpwGpAaQBqwG2AXUBDwIlAR79jvo8+k/6SvpH+kv6RvpG+kX6RfpF+kT6Q/pC+kL6QvpA+kD6QPo/+j76PPo8+jv6Ovo6+jn6Ofo5+jf6Nvo2+jb6Nfo0+jT6M/oy+jH6MPow+jD6Lvot+i36Lfos+iv6K/oq+in6KPon+ib6Jvom+iT6JPok+iL6Ifog+iD6IPog+h/6Hfod+h36G/ob+hv6GvoZ+hj6GPoX+hX6FfoV+hT6E/oT+hP6EvoR+hD6D/oP+g76DPoM+gz6C/oK+gn6CPoI+gj6BvoG+gX6BPoE+gP6A/oC+gH6APr/+f/5//n9+f35/fn8+fv5+fn4+fj5+Pn3+fb59vn1+fT58/nz+fL58fnw+fD57/nu+e757fnt+ez56vnq+en56Pno+ef55vnm+eX55Pnj+eP54vnh+eH54Pnf+d/53vne+dz52/nb+dr52vnZ+dj51/nX+db51fnU+dP50/nS+dH50PnQ+dD5z/nO+c75zfnM+cv5yvnK+cn5yPnH+cf5xvnF+cT5xPnD+cL5wfnA+cD5v/m++b35vfm8+bv5uvm5+bn5ufm3+bb5tvm1+bX5tPm0+bP5sfmw+bD5sPmv+a75rfmt+az5q/mq+an5qfmp+af5pvmm+aX5pPmj+aP5ovmh+aD5oPmg+Z/5nvmd+Zz5nPmb+Zr5mPmY+Zz5n/ln+f/5FPmC+XwBeQjXCbIJsAnCCbIJvAm8Cb4Jvgm/CcEJwgnCCcMJxQnGCccJyQnKCcsJzAnNCc4JzwnQCdIJ0wnUCdUJ1gnXCdgJ2QnaCdwJ3QnfCd8J4AniCeMJ5AnlCecJ6AnpCeoJ6wnsCe0J7gnwCfEJ8gn0CfQJ9Qn2CfgJ+Qn6CfsJ/Qn+Cf8JAQoCCgMKBAoFCgUKBwoICgoKCwoMCg4KDgoPChEKEgoTChUKFgoXChgKGQoaChwKHQodCh4KIAoiCiMKIwokCiYKJwopCioKKwotCi0KLgowCjEKMQozCjQKNgo3CjgKOQo6CjwKPQo+Cj8KQQpBCkMKRApFCkYKSApJCkoKTApMCk0KTwpRClIKUwpUClUKVwpYClkKWgpcClwKXgpfCmAKYQpjCmQKZQpmCmgKaQpqCmsKbApuCm8KcQpyCnMKdAp1CnYKeAp5CnoKfAp9Cn4KfwqACoEKgwqECoUKhwqHCogKigqMCo0KjgqPCpEKkgqTCpUKlgqXCpgKmQqaCpwKnQqeCp8KoAqiCqMKpQqmCqcKqAqpCqoKrQquCq4KrwqxCrMKswq0CrYKuAq4CrkKuwq9Cr4KvwrACsEKwwrECsYKxwrICskKywrMCs0KzwrQCtEK0grTCtQK1grXCtgK2QrbCtwK3QrfCuAK4QrjCuUK5QrmCugK6grrCuwK7QruCvAK8QryCvMK9Qr2CvcK+Ar6CvwK/Ar9Cv8KAQsCCwQLBQsGCwYLCAsJCwsLDQsOCw8LEAsSCxMLFAsVCxcLGAsZCxoLHAseCx4LIAsiCyMLJAslCyYLKAsqCyoLKwstCy8LMAsyCzMLNAs1CzcLOAs5CzoLPAs9Cz8LQAtBC0ILQwtGC0cLRwtJC0sLTQtNC04LUAtRC1ILVAtVC1cLWAtZC1oLXAteC18LYAthC2MLZAtlC2YLaAtpC2sLbAtuC3ALcAtxC3MLdAt1C3cLeAt6C3sLfQt+C38LgguCC4MLhQuHC4cLiAuKC4wLjguOC48LkQuTC5QLlQuWC5gLmQuaC58LngulC3cLDAwtC08LiQ4wAO/ww/Mz9C3zx/OY85vzl/OZ85bzlPOU85LzkPOO843zjfOK84jzhvOG84Xzg/OB84HzgPN+83zzevN483fzdvN083PzcvNw827zbfNr82nzZ/Nm82XzZPNi82DzX/Ne81zzWvNZ81fzVvNU81LzUfNQ80/zTPNM80vzSfNH80fzRfNE80LzQPNA8z/zPfM78zvzOvM48zbzNfM08zPzMfMv8y/zLvMs8yrzKfMo8yfzJfMk8yPzIvMg8x7zHfMb8xrzGfMY8xbzFfMT8xLzEvMR8w/zDfMM8wvzCfMH8wbzBfME8wPzAfMA8/7y/PL78vry+fL48vby9fLz8vLy8fLv8u7y7fLs8ury6fLo8uby5PLj8uLy4fLf8t3y3PLb8try1/LX8tby1PLT8tLy0PLP8s3yy/LL8snyx/LG8sXyw/LC8sDyv/K+8r3yu/K58rnyt/K18rTys/Kx8rDyrvKs8qzyq/Kp8qfypvKk8qPyovKh8p/ynvKd8pvymvKZ8pfylfKU8pLykfKP8o3yjfKM8oryiPKH8oXyhPKD8oHygPJ/8n3ye/J68nnyd/J28nXydPJy8nDyb/Ju8m3yavJo8mjyZ/Jl8mPyYvJg8l/yXvJd8lvyWfJY8lbyVvJV8lPyUPJQ8k/yTPJK8knySPJH8kXyQ/JC8kHyQPI+8j3yO/I58jjyN/I18jTyM/Iw8jDyL/It8ivyKvIo8ibyJfIk8iLyIfIg8h7yHPIa8hnyF/IW8hXyFPIS8hDyD/IO8gzyCvIJ8gjyBvIE8gTyAvIA8v/x/fH88fvx+fH38fbx9PHz8fHx7/Hv8e3x6/Hq8ejx5/Hm8eTx4vHg8d/x3vHd8dvx2fHX8dbx1fHU8dLx0PHP8c3xzPHK8cjxx/HG8cTxwvHB8cDxv/G88brxuvG58bfxtPGz8bLxsPGv8a7xrPGq8anxp/Gl8aTxo/Gg8Z/xnvGd8ZvxmfGY8ZfxlPGS8ZLxkfGP8YzxjPGK8YjxhvGG8YTxgvGB8X/xffF88XrxePF38XbxdPFz8XLxcPFu8WzxavFq8WjxZvFk8WTxYvFg8V7xXfFc8VvxWPFW8VXxVPFS8VDxT/FO8UzxSvFI8UjxRfFD8ULxQPE+8T3xPPE78TnxN/E18TTxMvEx8S/xLPEr8SrxKPEm8SbxJPEi8SDxHvEd8RzxG/EZ8RjxFvEU8RLxEfEP8Q7xDPEK8QnxB/EF8QTxAvEA8f/w/fD88Prw+PD38PXw9PDy8PDw7/Dt8Ovw6vDo8Ofw5fDk8OLw4PDf8N3w2/DZ8Njw1/DU8NLw0fDR8M7wzPDK8MnwyPDG8MTww/DB8MDwvvC78LvwufC38LbwtPCy8LHwr/Ct8KvwqvCo8KbwpfCk8KLwoPCf8J7wnPCZ8JjwlvCV8JPwkPCP8I7wjPCK8Inwh/CG8ITwgfCB8IDwffB78HrwefB38HXwc/By8G/wbfBs8GvwafBo8GXwZPBh8GDwX/Bq8CfwvPAD8M7vRPfF/Gn8m/yq/Jf8m/yb/Jz8m/yb/Jr8mfyY/Jj8mPyY/Jj8mPyX/Jb8lvyW/Jb8lfyV/JX8k/yT/JP8kvyS/JL8kvyR/JD8kPyQ/I/8kPyQ/I/8jvyO/I78jfyN/I38jPyM/Iz8i/yK/Ir8ivyJ/In8ifyJ/Ij8iPyH/If8h/yG/Ib8hvyF/IT8hPyD/IP8g/yC/IL8gvyC/IL8gfyA/ID8gPx//H/8f/x+/H38fvx+/H38fPx8/Hz8e/x7/Hr8evx6/Hn8efx5/Hn8ePx4/Hf8dvx2/Hb8dvx1/HX8dfx0/HT8dPxz/HP8cfxx/HH8cfxw/HD8cPxv/G/8b/xv/G78bfxt/G38bfxs/Gz8bPxq/Gr8avxp/Gn8afxp/Gj8Z/xn/Gb8Zvxm/Gb8Zfxl/GT8ZPxk/GT8Y/xi/GL8Yvxi/GD8Yfxh/GD8X/xf/F/8Xvxd/F38Xfxd/Fz8W/xb/Fv8W/xa/Fr8WvxZ/Fj8WPxY/Fj8V/xX/Ff8VvxW/FX8VPxU/FT8VPxT/FP8U/xS/FH8UfxR/FD8UPxP/E/8T/xP/E78TfxN/E38TPxM/Ez8S/xL/Er8SvxK/En8SfxJ/Ej8SPxH/Ef8R/xG/EX8RfxF/ET8RPxE/ET8Q/xC/EL8QvxC/EH8QfxA/ED8QPw//D78Pvw9/D38Pfw8/Dz8PPw7/Dv8O/w6/Dr8Ofw4/Dj8OPw4/Df8N/w2/DX8Nfw1/DT8NPw0/DT8NPwz/DP8M/wy/DH8MPww/DD8MPwv/C78Lvwu/C38Lfws/Cz8LPwr/Cv8K/wq/Cn8Kfwp/Cn8KPwn/Cf8J/wn/CX8Jfwl/CX8JPwk/CT8I/wi/CL8Ifwh/CH8Ifwg/CD8IPwf/B78Hfwd/B38Hfwc/Bz8HPwc/Bv8Gvwa/Br8GfwZ/Bn8GPwX/Bf8F/wW/Bb8FfwU/BT8FPwU/BP8E/wS/BL8EvwR/BD8EPwQ/BD8D/wO/A/8DvwN/A38DfwM/Av8C/wL/Ar8CvwK/Ar8CfwI/Aj8CPwH/Ab8BvwG/AX8BPwF/AX8BPwD/AP8A/wC/AH8AfwB/AH8APz/+//7//v++/77/fv9+/37/Pv8+/z7+/v6+/n7+fv5+/n7+Pv3+/f79/v2+/b79vv2+/X79Pv0+/T78/vz+/L78vvy+/H78Pvw+/D78Pvu++777vvu++377fvt++z76/vr++r76vvq++n76Pvo++j75/vn++b75vtzbXBsPAAAAAAAAAAAAAAAlFgAADwAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAgAABAAAAAAAAMhUAAAAAAAAAAAAAExJU1QaAAAASU5GT0lTRlQNAAAARkwgU3R1ZGlvIDIwAAA=')
attackAudio.volume = 0.2;

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
    attackAudio.play()
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

drawPlayButton() // Calls loadAssetsAndStartGame() & zombieSpawnInterval()

