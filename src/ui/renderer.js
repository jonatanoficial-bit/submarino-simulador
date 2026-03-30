import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/config.js';

export function renderScene(ctx, player, enemies, contacts) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawGrid(ctx);
  drawPlayer(ctx, player);
  drawEnemies(ctx, enemies);
  drawContacts(ctx, player, contacts);
}

function drawGrid(ctx) {
  ctx.strokeStyle = 'rgba(121, 197, 255, 0.08)';
  for (let x = 0; x <= CANVAS_WIDTH; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
  }
  for (let y = 0; y <= CANVAS_HEIGHT; y += 48) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
  }
}

function drawPlayer(ctx, player) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.heading);
  ctx.fillStyle = '#79c5ff';
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(-14, -8);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-14, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawEnemies(ctx, enemies) {
  enemies.filter((enemy) => enemy.hp > 0).forEach((enemy) => {
    ctx.fillStyle = enemy.type === 'Cargo Ship' ? '#d8d29c' : '#ef7676';
    ctx.fillRect(enemy.x - 10, enemy.y - 6, 20, 12);
  });
}

function drawContacts(ctx, player, contacts) {
  contacts.forEach((contact) => {
    const angle = Math.atan2(contact.enemyRef.y - player.y, contact.enemyRef.x - player.x);
    const markerX = player.x + Math.cos(angle) * 70;
    const markerY = player.y + Math.sin(angle) * 70;
    ctx.strokeStyle = 'rgba(240, 195, 106, 0.9)';
    ctx.beginPath();
    ctx.arc(markerX, markerY, 8, 0, Math.PI * 2);
    ctx.stroke();
  });
}
