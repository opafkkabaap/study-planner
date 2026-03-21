import { useState, useEffect, useRef, useCallback } from 'react';
import './Pomodoro.css';

const PRESETS = [25, 45, 75, 105];

export default function Pomodoro() {
  const [timeLeft, setTimeLeft]         = useState(25 * 60);
  const [isRunning, setIsRunning]       = useState(false);
  const [isPaused, setIsPaused]         = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(25);
  const [isBreak, setIsBreak]           = useState(false);
  const [sessionsDone, setSessionsDone] = useState(0);

  const timerRef  = useRef(null);
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  // animation state kept in a ref so canvas loop always reads latest
  const anim = useRef({
    progress: 0,       // 0 → 1 across the journey
    arrived: false,
    restT: 0,
    cloudX: [40, 180, 320],
    birdT: 0,
    campfireT: 0,
    bounceT: 0,
    treeSway: 0,
  });

  const totalSecs = selectedPreset * 60;
  const progress  = (totalSecs - timeLeft) / totalSecs;

  // keep anim.progress in sync
  useEffect(() => {
    anim.current.progress  = isBreak ? 1 : progress;
    anim.current.arrived   = isBreak;
  }, [progress, isBreak]);

  // format MM:SS
  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(selectedPreset * 60);
    setIsBreak(false);
    anim.current.progress = 0;
    anim.current.arrived  = false;
  }, [selectedPreset]);

  const startTimer = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          setIsBreak(b => {
            if (b) {
              // break ended → new work session
              setSessionsDone(s => s + 1);
              setIsBreak(false);
              setTimeLeft(selectedPreset * 60);
              anim.current.progress = 0;
              anim.current.arrived  = false;
            } else {
              // work ended → start break
              setIsBreak(true);
              setTimeLeft(5 * 60);
            }
            return !b;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isRunning, selectedPreset]);

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(true);
  };

  const selectPreset = min => {
    stopTimer();
    setSelectedPreset(min);
    setTimeLeft(min * 60);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── CANVAS ANIMATION LOOP ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w   = canvas.parentElement.offsetWidth || 400;
      canvas.width  = w * dpr;
      canvas.height = 160 * dpr;
      canvas.style.width  = w + 'px';
      canvas.style.height = '160px';
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    function getW() { return canvas.width / (window.devicePixelRatio||1); }
    function getH() { return 160; }

    // easing
    const easeInOut = t => t<.5 ? 2*t*t : -1+(4-2*t)*t;

    // draw sky gradient
    function drawSky(W, H, onBreak) {
      const grad = ctx.createLinearGradient(0,0,0,H);
      if (onBreak) {
        grad.addColorStop(0,'#1a1a3e');
        grad.addColorStop(1,'#2d1b4e');
      } else {
        grad.addColorStop(0,'#87CEEB');
        grad.addColorStop(1,'#e0f7fa');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,W,H);
    }

    // stars (break mode)
    function drawStars(W, t) {
      ctx.save();
      for (let i=0;i<18;i++){
        const sx = (i*137+50)%W;
        const sy = (i*79+20)%60;
        const twinkle = 0.4 + 0.6*Math.sin(t*0.03+i*1.3);
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sx,sy,1.2,0,Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }

    // clouds
    function drawClouds(W, a, cloudX) {
      ctx.save();
      ctx.globalAlpha = a.arrived ? 0.25 : 0.7;
      cloudX.forEach((x,i) => {
        const y = [18,28,22][i];
        drawCloud(x, y, [55,40,48][i]);
      });
      ctx.restore();
    }
    function drawCloud(x,y,r) {
      ctx.fillStyle='white';
      ctx.beginPath(); ctx.arc(x,y,r*.55,0,Math.PI*2);
      ctx.arc(x+r*.45,y+r*.1,r*.42,0,Math.PI*2);
      ctx.arc(x-r*.35,y+r*.12,r*.38,0,Math.PI*2);
      ctx.arc(x+r*.15,y-r*.2,r*.3,0,Math.PI*2);
      ctx.fill();
    }

    // ground
    function drawGround(W, H) {
      ctx.fillStyle='#4CAF50';
      ctx.beginPath();
      ctx.moveTo(0,H-28);
      for(let x=0;x<=W;x+=8){
        ctx.lineTo(x, H-28+Math.sin(x*.08)*.8);
      }
      ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
      ctx.fill();
      // darker strip
      ctx.fillStyle='#388E3C';
      ctx.fillRect(0,H-14,W,14);
    }

    // dashed track road
    function drawTrack(W, H) {
      const y = H - 36;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([12,10]);
      ctx.beginPath();
      ctx.moveTo(28, y);
      ctx.lineTo(W-28, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // progress fill on track
    function drawTrackProgress(W, H, prog) {
      const y = H - 36;
      const startX = 28, endX = W - 28;
      ctx.save();
      ctx.strokeStyle = '#6c5ce7';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + (endX-startX)*prog, y);
      ctx.stroke();
      ctx.restore();
    }

    // start flag
    function drawStartFlag(H) {
      const x=28, y=H-36;
      ctx.save();
      ctx.strokeStyle='#aaa';
      ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y-22); ctx.stroke();
      ctx.fillStyle='#e74c3c';
      ctx.beginPath();
      ctx.moveTo(x,y-22); ctx.lineTo(x+14,y-17); ctx.lineTo(x,y-12);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    // campsite destination
    function drawCampsite(W, H, arrived, campfireT) {
      const x = W-36, y = H-36;
      ctx.save();
      // pole
      ctx.strokeStyle='#8d6e63'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y-28); ctx.stroke();
      // flag
      const fc = arrived ? '#6c5ce7' : '#bdc3c7';
      ctx.fillStyle = fc;
      ctx.beginPath();
      ctx.moveTo(x,y-28); ctx.lineTo(x+16,y-22); ctx.lineTo(x,y-16);
      ctx.closePath(); ctx.fill();

      if (arrived) {
        // tent
        const tx = x - 22, ty = y;
        ctx.fillStyle='#e74c3c';
        ctx.beginPath();
        ctx.moveTo(tx-18,ty); ctx.lineTo(tx,ty-22); ctx.lineTo(tx+18,ty);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle='#c0392b';
        ctx.beginPath();
        ctx.moveTo(tx-6,ty); ctx.lineTo(tx,ty-12); ctx.lineTo(tx+6,ty);
        ctx.closePath(); ctx.fill();

        // campfire
        const fx = x + 14, fy = y - 4;
        // logs
        ctx.strokeStyle='#5d4037'; ctx.lineWidth=3; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(fx-7,fy); ctx.lineTo(fx+2,fy-6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx+7,fy); ctx.lineTo(fx-2,fy-6); ctx.stroke();
        // flame layers
        const flicker = Math.sin(campfireT*0.18)*0.4;
        [[8,'#f39c12'],[5,'#e74c3c'],[3,'#f1c40f']].forEach(([r,col],i)=>{
          ctx.fillStyle=col;
          ctx.globalAlpha=0.85+flicker*(i===2?.3:.15);
          ctx.beginPath();
          ctx.ellipse(fx, fy-(r+2)*(1+flicker*.15), r*.7, r, 0, 0, Math.PI*2);
          ctx.fill();
        });
        ctx.globalAlpha=1;
      }
      ctx.restore();
    }

    // trees
    function drawTrees(W, H, sway) {
      const positions = [0.22, 0.45, 0.67, 0.85];
      positions.forEach((p,i) => {
        const tx = W*p;
        const ty = H - 30;
        const s  = Math.sin(sway*.04 + i*1.2) * 1.2;
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(s*Math.PI/180);
        // trunk
        ctx.fillStyle='#5d4037';
        ctx.fillRect(-4,0,8,18);
        // foliage layers
        [[0,-14,18],[0,-24,14],[0,-32,10]].forEach(([ox,oy,r])=>{
          ctx.fillStyle=`hsl(${120+i*8},45%,${30+i*3}%)`;
          ctx.beginPath();
          ctx.arc(ox,oy,r,0,Math.PI*2);
          ctx.fill();
        });
        ctx.restore();
      });
    }

    // bicycle
    function drawBicycle(x, y, bounceT, arrived) {
      ctx.save();
      ctx.translate(x, y + Math.sin(bounceT*.12)*(arrived?0:1.2));

      // wheels
      const wR = 11;
      const wheelRot = bounceT * (arrived ? 0 : 0.15);
      [-14,14].forEach(wx => {
        ctx.strokeStyle='#2c3e50'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(wx,2,wR,0,Math.PI*2); ctx.stroke();
        // spokes
        for(let s=0;s<4;s++){
          const a = wheelRot + s*Math.PI/2;
          ctx.beginPath();
          ctx.moveTo(wx,2);
          ctx.lineTo(wx+Math.cos(a)*wR,2+Math.sin(a)*wR);
          ctx.stroke();
        }
        ctx.fillStyle='#7f8c8d';
        ctx.beginPath(); ctx.arc(wx,2,2.5,0,Math.PI*2); ctx.fill();
      });

      // frame
      ctx.strokeStyle='#6c5ce7'; ctx.lineWidth=2.5; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(-14,2); ctx.lineTo(0,-8); ctx.lineTo(14,2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(-4,2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(4,-14); ctx.stroke();

      // handlebar
      ctx.strokeStyle='#2c3e50'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(10,-14); ctx.lineTo(18,-14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10,-14); ctx.lineTo(14,2); ctx.stroke();

      // seat
      ctx.fillStyle='#2c3e50';
      ctx.beginPath(); ctx.ellipse(-2,-10,6,2,-.2,0,Math.PI*2); ctx.fill();

      // rider
      // body
      ctx.fillStyle='#e67e22';
      ctx.beginPath(); ctx.ellipse(2,-20,5,7,0,0,Math.PI*2); ctx.fill();
      // head
      ctx.fillStyle='#FDBCB4';
      ctx.beginPath(); ctx.arc(4,-30,6,0,Math.PI*2); ctx.fill();
      // helmet
      ctx.fillStyle='#6c5ce7';
      ctx.beginPath();
      ctx.arc(4,-30,6.5,Math.PI,0);
      ctx.closePath(); ctx.fill();
      // eye
      ctx.fillStyle='#2c3e50';
      ctx.beginPath(); ctx.arc(7,-29,1.2,0,Math.PI*2); ctx.fill();
      // legs
      const legSpin = arrived ? 0 : bounceT*0.18;
      ctx.strokeStyle='#2c3e50'; ctx.lineWidth=2.5;
      ctx.beginPath();
      ctx.moveTo(0,-14);
      ctx.lineTo(-4+Math.cos(legSpin)*6, -6+Math.sin(legSpin)*4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0,-14);
      ctx.lineTo(-4+Math.cos(legSpin+Math.PI)*6, -6+Math.sin(legSpin+Math.PI)*4);
      ctx.stroke();
      // scarf waving
      if(!arrived){
        ctx.save();
        ctx.strokeStyle='#e74c3c'; ctx.lineWidth=2; ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(4,-28);
        for(let i=0;i<5;i++){
          ctx.lineTo(4-8-i*4, -28+Math.sin(bounceT*.15+i)*3);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    // birds
    function drawBirds(W, birdT) {
      ctx.save();
      ctx.strokeStyle='#2c3e50'; ctx.lineWidth=1.2;
      [[0.3,35],[0.5,20],[0.7,42]].forEach(([frac,yo],i)=>{
        const bx = ((birdT*0.4 + frac*W + i*120) % (W+40)) - 20;
        const by = yo + Math.sin(birdT*.08+i)*4;
        const wing = Math.sin(birdT*.22+i*1.5)*5;
        ctx.beginPath();
        ctx.moveTo(bx-8, by+wing);
        ctx.quadraticCurveTo(bx,by-4,bx+8,by+wing);
        ctx.stroke();
      });
      ctx.restore();
    }

    let t = 0;
    function loop() {
      animRef.current = requestAnimationFrame(loop);
      const a   = anim.current;
      const W   = getW();
      const H   = getH();

      t++;
      a.bounceT    = t;
      a.birdT      = t;
      a.campfireT  = t;
      a.treeSway   = t;
      a.cloudX     = a.cloudX.map((x,i) => {
        const spd = [0.18,0.10,0.14][i];
        return (x + spd) % (W + 60) - 60;
      });

      ctx.clearRect(0,0,W,H);

      drawSky(W,H,a.arrived);
      if(a.arrived) drawStars(W,t);
      drawClouds(W,a,a.cloudX);
      drawBirds(W,a.birdT);
      drawTrees(W,H,a.treeSway);
      drawGround(W,H);
      drawTrack(W,H);
      drawTrackProgress(W,H,a.progress);
      drawStartFlag(H);
      drawCampsite(W,H,a.arrived,a.campfireT);

      // bicycle position
      const trackStart = 28, trackEnd = W - 36;
      const bikeX = trackStart + (trackEnd - trackStart) * a.progress;
      const bikeY = H - 36;
      drawBicycle(bikeX, bikeY, a.bounceT, a.arrived);

      // milestone dots on ground
      [0.25,0.5,0.75,1].forEach((mp,i)=>{
        const mx = trackStart + (trackEnd-trackStart)*mp;
        ctx.beginPath();
        ctx.arc(mx, H-36, 3, 0, Math.PI*2);
        ctx.fillStyle = a.progress >= mp ? '#6c5ce7' : 'rgba(255,255,255,0.3)';
        ctx.fill();
      });
    }

    loop();
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  // sync session dots
  const dots = Array.from({length:4},(_,i)=>i<sessionsDone);

  const circum = 2 * Math.PI * 54;

  return (
    <div className="pomodoro-wrapper">
      <h1>Pomodoro Timer</h1>

      <div className="preset-buttons">
        {PRESETS.map(min => (
          <button
            key={min}
            className={`preset-btn ${selectedPreset===min?'active':''}`}
            onClick={()=>selectPreset(min)}
          >
            {min>=60?`${Math.floor(min/60)}:${String(min%60).padStart(2,'0')}`:` ${min} min`}
          </button>
        ))}
      </div>

      <div className="timer-container">

        {/* circular progress */}
        <div className="circle-timer">
          <svg viewBox="0 0 120 120" className="progress-ring">
            <circle className="progress-ring__circle-bg" cx="60" cy="60" r="54"/>
            <circle
              className="progress-ring__circle"
              cx="60" cy="60" r="54"
              strokeDasharray={circum}
              strokeDashoffset={circum*(1-progress)}
              stroke={isBreak?'#00b894':'#e74c3c'}
            />
          </svg>
          <div className="timer-display">{fmt(timeLeft)}</div>
        </div>

        {/* phase badge */}
        <div className={`phase-badge ${isBreak?'break':''}`}>
          {isBreak ? "☕ Break Time — You've arrived!" : "🚴 Work Session"}
        </div>

        {/* controls */}
        <div className="controls">
          {!isRunning && !isPaused && (
            <button className="control-btn start" onClick={startTimer}>Start</button>
          )}
          {isRunning && (
            <button className="control-btn pause" onClick={pauseTimer}>Pause</button>
          )}
          {isPaused && (
            <button className="control-btn resume" onClick={startTimer}>Resume</button>
          )}
          <button className="control-btn stop" onClick={stopTimer}>Stop</button>
        </div>

        {/* session dots */}
        <div className="session-dots">
          {dots.map((done,i)=>(
            <div key={i} className={`session-dot ${done?'done':''}`}/>
          ))}
        </div>

        {/* CANVAS ANIMATION */}
        <div className="animation-box journey-box">
          <canvas ref={canvasRef}/>
        </div>

        {timeLeft===0 && !isRunning && !isBreak && (
          <p className="finished-message">Session complete! Time to rest 🎉</p>
        )}
      </div>
    </div>
  );
}
