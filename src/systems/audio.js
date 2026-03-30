
let audioCtx = null;
function ensureCtx(){
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
export function beep(freq = 440, duration = 0.08, type = 'sine', gainValue = 0.03){
  const ctx = ensureCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = gainValue;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}
export function sonarPing(){ beep(860, 0.12, 'sine', 0.025); }
export function torpedoShot(){ beep(180, 0.15, 'square', 0.03); }
export function impactHit(){ beep(120, 0.22, 'sawtooth', 0.035); }
export function warningTone(){ beep(520, 0.18, 'triangle', 0.03); }
