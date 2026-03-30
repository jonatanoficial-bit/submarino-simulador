
export function drawScene(ctx, game){
  const w = ctx.canvas.width, h = ctx.canvas.height;
  ctx.clearRect(0,0,w,h);
  const grad = ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0, '#0e3b58'); grad.addColorStop(1, '#071826');
  ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  for(let x=0;x<w;x+=60){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for(let y=0;y<h;y+=60){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

  if (game.player){
    for (let r=60;r<=180;r+=40){
      ctx.beginPath(); ctx.strokeStyle = 'rgba(79,195,247,0.15)';
      ctx.arc(game.player.x, game.player.y, r, 0, Math.PI*2); ctx.stroke();
    }
  }

  for (const e of game.enemies || []){
    if (e.hull <= 0) continue;
    ctx.fillStyle = e.civilian ? '#f5c04c' : e.type === 'submarine' ? '#b58cff' : e.type === 'escort' ? '#ef6b73' : '#ffa27a';
    ctx.beginPath(); ctx.arc(e.x, e.y, e.type === 'escort' ? 10 : 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.fillRect(e.x - 16, e.y - 18, Math.max(0, e.hull/4), 4);
  }

  if (game.player){
    const p = game.player;
    ctx.save(); ctx.translate(p.x, p.y);
    ctx.fillStyle = p.submerged ? '#8be9fd' : '#4fc3f7';
    ctx.beginPath(); ctx.moveTo(-16,0); ctx.lineTo(10,-8); ctx.lineTo(18,0); ctx.lineTo(10,8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d7f5ff'; ctx.fillRect(-2,-6,4,12); ctx.restore();
    ctx.fillStyle = '#d7f5ff'; ctx.font = '14px Arial'; ctx.fillText(`Depth ${p.depth}m`, p.x + 18, p.y - 12);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(w-150, 10, 130, 80);
  ctx.fillStyle = '#d7f5ff'; ctx.font = '14px Arial';
  ctx.fillText('N', w-88, 28); ctx.fillText('W', w-128, 53); ctx.fillText('E', w-46, 53); ctx.fillText('S', w-88, 79);
  ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.arc(w-86, 52, 24, 0, Math.PI*2); ctx.stroke();
}
