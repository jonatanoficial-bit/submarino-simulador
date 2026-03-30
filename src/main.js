
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerImg = new Image();
playerImg.src = 'assets/images/vessels/player_sub.png';

function draw(){
  ctx.clearRect(0,0,800,400);
  ctx.fillStyle="#001f33";
  ctx.fillRect(0,0,800,400);
  ctx.drawImage(playerImg,100,150,120,60);
  requestAnimationFrame(draw);
}
draw();
