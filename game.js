
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let stats = { missions:0, kills:0, xp:0 };

let sub = { x:400, y:250, torpedoes:5 };

let enemies = [
 {x:200,y:200,hp:2},
 {x:600,y:300,hp:2}
];

function startMission(){
 stats.missions++;
 loop();
}

function showStats(){
 alert("Missions: "+stats.missions+" | Kills: "+stats.kills+" | XP: "+stats.xp);
}

function fire(){
 if(sub.torpedoes<=0) return;
 sub.torpedoes--;
 enemies.forEach(e=>{
  let d = Math.hypot(e.x-sub.x,e.y-sub.y);
  if(d<150 && e.hp>0){
   e.hp--;
   if(e.hp<=0){
    stats.kills++;
    stats.xp+=10;
   }
  }
 });
}

document.addEventListener("keydown",(e)=>{
 if(e.key==="ArrowUp") sub.y-=10;
 if(e.key==="ArrowDown") sub.y+=10;
 if(e.key==="ArrowLeft") sub.x-=10;
 if(e.key==="ArrowRight") sub.x+=10;
 if(e.key===" ") fire();
});

function draw(){
 ctx.clearRect(0,0,800,500);
 ctx.fillStyle="cyan";
 ctx.fillRect(sub.x-5,sub.y-5,10,10);

 ctx.fillStyle="red";
 enemies.forEach(e=>{
  if(e.hp>0) ctx.fillRect(e.x-5,e.y-5,10,10);
 });
}

function loop(){
 draw();
 requestAnimationFrame(loop);
}
