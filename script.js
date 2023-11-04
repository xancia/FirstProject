const canvas = document.querySelector('canvas')
const ctr = canvas.getContext('2d')
canvas.width = 304;
canvas.height = 480;

const image = new Image()
image.src = './assets/Tile Set/zombieGameMap.png'
image.onload = () => {
    ctr.drawImage(image, 0, 0)
}
