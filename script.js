(() => {
  const intro = document.getElementById('intro');
  const game = document.getElementById('game');
  const ending = document.getElementById('ending');
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const storyText = document.getElementById('story-text');
  const toast = document.getElementById('toast');
  const TILE = 40;
  const COLS = 9, ROWS = 12;
  // 0 = floor, 1 = wall/shelf, 2 = inspectable shelf, 3 = final book
  const map = [
    [1,1,1,1,1,1,1,1,1],
    [1,2,1,0,0,0,1,2,1],
    [1,0,1,0,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1],
    [1,1,1,0,0,0,1,1,1],
    [1,2,0,0,1,0,0,2,1],
    [1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1],
    [1,1,0,1,3,1,0,1,1],
    [1,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1]
  ];
  let player = {x: 3, y: 8};
  let foundClues = new Set();
  let bookFound = false;
  let toastTimeout;
  let soundOn = false;
  let audioCtx = null;

  function showScreen(screen) {
    [intro, game, ending].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
  document.getElementById('start-button').addEventListener('click', () => {
    showScreen(game); draw();
    storyText.textContent = 'A poeira dança sob a luz das velas. Em algum lugar desta biblioteca, um livro espera por você.';
    say('A biblioteca se abre diante de você.');
  });
  document.getElementById('restart-button').addEventListener('click', () => {
    player = {x:3, y:8}; foundClues = new Set(); bookFound = false;
    showScreen(intro); draw();
  });

  function say(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('visible'), 2500);
  }
  function beep(freq=440, duration=.07) {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq; gain.gain.value = .045;
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + duration);
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }
  document.getElementById('sound-button').addEventListener('click', (e) => {
    soundOn = !soundOn; e.currentTarget.textContent = soundOn ? '♫' : '♩';
    say(soundOn ? 'Os pequenos sons estão ativados.' : 'Som desativado.');
    beep(520);
  });

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // warm floor
    for (let y=0; y<ROWS; y++) for (let x=0; x<COLS; x++) {
      const t = map[y][x];
      ctx.fillStyle = (x+y)%2 ? '#33202a' : '#2d1b24';
      ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
      ctx.strokeStyle = '#4a2d39'; ctx.lineWidth = 1;
      ctx.strokeRect(x*TILE+.5,y*TILE+.5,TILE-1,TILE-1);
      if (t === 1 || t === 2) drawShelf(x*TILE,y*TILE, t===2);
      if (t === 3) drawBook(x*TILE,y*TILE);
    }
    // candle glow spots
    [[2,3],[6,4],[1,8],[7,8]].forEach(([x,y]) => {
      const gx=x*TILE+20, gy=y*TILE+18;
      const grad=ctx.createRadialGradient(gx,gy,1,gx,gy,28);
      grad.addColorStop(0,'rgba(228,164,93,.19)'); grad.addColorStop(1,'rgba(228,164,93,0)');
      ctx.fillStyle=grad; ctx.fillRect(gx-28,gy-28,56,56);
      ctx.fillStyle='#e7b875'; ctx.fillRect(gx-2,gy-7,4,8);
      ctx.fillStyle='rgba(255,218,145,.45)'; ctx.fillRect(gx-5,gy-12,10,6);
    });
    drawPlayer(player.x*TILE, player.y*TILE);
  }
  function drawShelf(px,py, special) {
    ctx.fillStyle = '#160e14'; ctx.fillRect(px+4,py+4,32,32);
    ctx.fillStyle = special ? '#73404d' : '#4b2935'; ctx.fillRect(px+6,py+5,28,28);
    ctx.fillStyle = '#9b6b55'; ctx.fillRect(px+5,py+5,30,3); ctx.fillRect(px+5,py+33,30,3);
    const colors = ['#a35c52','#d0a46b','#6f8790','#81475b','#c4b28c'];
    for (let i=0;i<5;i++) {
      const bx=px+7+i*5, bh=13+(i%3)*4;
      ctx.fillStyle=colors[(i+(special?1:0))%colors.length];
      ctx.fillRect(bx,py+31-bh,4,bh);
      ctx.fillStyle='rgba(245,220,180,.55)'; ctx.fillRect(bx+1,py+31-bh+3,1,bh-5);
    }
    if (special) { ctx.fillStyle='#d4b778'; ctx.fillRect(px+17,py+12,6,2); }
  }
  function drawBook(px,py) {
    ctx.fillStyle='#0e0910'; ctx.fillRect(px+5,py+5,30,31);
    ctx.fillStyle='#7b2e45'; ctx.fillRect(px+10,py+7,20,27);
    ctx.fillStyle='#d6b575'; ctx.fillRect(px+12,py+9,16,23);
    ctx.fillStyle='#572138'; ctx.fillRect(px+14,py+11,12,19);
    ctx.strokeStyle='#d6b575'; ctx.lineWidth=1; ctx.strokeRect(px+15,py+12,10,17);
    ctx.fillStyle='#d6b575'; ctx.fillRect(px+19,py+15,2,10); ctx.fillRect(px+16,py+19,8,2);
    if (!bookFound) {
      ctx.fillStyle='rgba(226,184,117,.22)'; ctx.fillRect(px,py,40,40);
    }
  }
  function drawPlayer(px,py) {
    // shadow
    ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(px+9,py+30,23,5);
    // hair
    ctx.fillStyle='#21151b'; ctx.fillRect(px+11,py+8,18,12); ctx.fillRect(px+9,py+13,4,12);
    // face
    ctx.fillStyle='#d7a58f'; ctx.fillRect(px+13,py+12,14,12);
    ctx.fillStyle='#30202a'; ctx.fillRect(px+16,py+17,2,2); ctx.fillRect(px+23,py+17,2,2);
    // coat
    ctx.fillStyle='#743347'; ctx.fillRect(px+10,py+23,20,13);
    ctx.fillStyle='#d0a46b'; ctx.fillRect(px+19,py+24,2,10);
    ctx.fillStyle='#24141e'; ctx.fillRect(px+12,py+35,6,4); ctx.fillRect(px+23,py+35,6,4);
    // little marker
    ctx.fillStyle='#e6c88c'; ctx.fillRect(px+18,py+2,4,3);
  }
  function move(dx,dy) {
    const nx=player.x+dx, ny=player.y+dy;
    if (nx<0 || ny<0 || nx>=COLS || ny>=ROWS || map[ny][nx]===1 || map[ny][nx]===2) {
      // special shelves are solid too; they can be examined from nearby
      beep(180,.04); return;
    }
    player={x:nx,y:ny}; draw(); beep(330,.04);
    if (map[ny][nx]===3) {
      storyText.textContent='Um livro de capa vinho repousa sobre um pedestal. Parece que a busca termina aqui.';
      say('Você encontrou algo diferente. Pressione Examinar.');
    } else {
      storyText.textContent='A biblioteca guarda silêncio. Talvez uma das estantes tenha algo a revelar.';
    }
  }
  document.querySelectorAll('[data-move]').forEach(btn => {
    const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
    btn.addEventListener('click',()=>move(...dirs[btn.dataset.move]));
  });
  // Keyboard controls are useful when testing on desktop.
 window.addEventListener('keydown', e => {
    if (!game.classList.contains('active')) return;
    const dirs={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
    if (dirs[e.key]) { e.preventDefault(); move(...dirs[e.key]); }
    if (e.key===' ' || e.key==='Enter') { e.preventDefault(); interact(); }
  });
  function interact() {
    const nearby = [];
    for (let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) {
      if ((map[y][x]===2 || map[y][x]===3) && Math.abs(x-player.x)+Math.abs(y-player.y)<=1) nearby.push({x,y,t:map[y][x]});
    }
    if (nearby.length) {
      const target=nearby[0];
      if (target.t===3) {
        bookFound=true; draw();
        storyText.textContent='A capa traz uma dedicatória. Você sente que este livro foi escrito especialmente para você.';
        say('O livro finalmente encontrou sua leitora.');
        setTimeout(()=>showScreen(ending), 1150);
      } else {
        const key=target.x+','+target.y;
        const lines=[
          'Você encontra anotações antigas nas margens de um livro: “Nem toda busca é feita para encontrar respostas.”',
          'Entre páginas amareladas, há uma pequena flor prensada. Alguém a guardou com muito cuidado.',
          'Uma frase foi escrita à mão: “Algumas pessoas fazem o mundo parecer menos escuro.”'
        ];
        const idx=foundClues.has(key) ? (foundClues.size % lines.length) : foundClues.size % lines.length;
        foundClues.add(key); storyText.textContent=lines[idx]; say(lines[idx]); beep(660,.1);
      }
      return;
    }
    say('Aproxime-se de uma estante ou do livro para examinar.');
    storyText.textContent='Talvez você precise explorar mais um pouco e se aproximar dos objetos.';
  }
  document.getElementById('interact-button').addEventListener('click',interact);

  // Tap a nearby tile in the scene to move one step toward it.
  canvas.addEventListener('click', e => {
    const r=canvas.getBoundingClientRect();
    const tx=Math.floor((e.clientX-r.left)/r.width*COLS);
    const ty=Math.floor((e.clientY-r.top)/r.height*ROWS);
    if (Math.abs(tx-player.x)+Math.abs(ty-player.y)===1) move(Math.sign(tx-player.x),Math.sign(ty-player.y));
    else if (map[ty] && map[ty][tx]===3) {
      const dx=Math.sign(tx-player.x), dy=Math.sign(ty-player.y);
      if (Math.abs(tx-player.x)>Math.abs(ty-player.y)) move(dx,0); else move(0,dy);
    }
  });
  draw();
})();
