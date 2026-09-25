/**
 * COLEÇÃO HORIZONTE · MOTOR COMPARTILHADO DE UI & ÁUDIO
 * Garante navegação contínua, botão "Voltar ao Início", áudio sintetizado e feedback
 */

const HorizonteAudio = (() => {
  let audioCtx = null;
  let isMuted = localStorage.getItem('horizonte_muted') === 'true';

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(gainVal, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  return {
    toggleMute() {
      isMuted = !isMuted;
      localStorage.setItem('horizonte_muted', isMuted);
      return isMuted;
    },
    isMuted() {
      return isMuted;
    },
    playClick() {
      playTone(480, 'triangle', 0.08, 0.08);
    },
    playCorrect() {
      if (isMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          setTimeout(() => {
            playTone(freq, 'triangle', 0.22, 0.12);
          }, i * 75);
        });
      } catch (e) {}
    },
    playWrong() {
      if (isMuted) return;
      try {
        playTone(280, 'sawtooth', 0.15, 0.1);
        setTimeout(() => playTone(220, 'sawtooth', 0.2, 0.1), 120);
      } catch (e) {}
    },
    playFanfare() {
      if (isMuted) return;
      const notes = [
        { f: 523.25, d: 120 },
        { f: 659.25, d: 120 },
        { f: 783.99, d: 150 },
        { f: 1046.50, d: 350 },
      ];
      notes.forEach((note, index) => {
        setTimeout(() => {
          playTone(note.f, 'triangle', note.d / 1000, 0.15);
        }, index * 110);
      });
    }
  };
})();

/* Efeito de Confetes estilo HQ */
const HorizonteFX = (() => {
  let canvas = null;
  let ctx = null;
  let particles = [];
  let animId = null;

  function initCanvas() {
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'comic-confetti-canvas';
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
    }
  }

  function resize() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  function createParticles() {
    const colors = ['#009cc3', '#ffd166', '#f28c4b', '#2a9d8f', '#ffffff', '#e63946'];
    particles = [];
    const count = 90;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4 - 50,
        w: Math.random() * 12 + 6,
        h: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 4 + 3,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10
      });
    }
  }

  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vRot;

      if (p.y < canvas.height + 50) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#142d3d';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });

    if (active) {
      animId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animId);
    }
  }

  return {
    celebrate() {
      initCanvas();
      createParticles();
      if (animId) cancelAnimationFrame(animId);
      animate();
    }
  };
})();

/* Gerenciador Global da Barra de Navegação HUD e Placar */
const HorizonteNav = {
  activeGame: 'home',
  
  init(options = {}) {
    this.activeGame = options.activeGame || 'home';
    this.renderHeader();
    this.bindEvents();
  },

  renderHeader() {
    const existing = document.querySelector('.horizonte-nav-wrapper');
    if (existing) existing.remove();

    const wrapper = document.createElement('header');
    wrapper.className = 'horizonte-nav-wrapper';
    wrapper.innerHTML = `
      <div class="horizonte-nav">
        <div class="nav-left-group">
          <a href="index.html" class="btn-nav-home" id="btn-back-home" title="Retornar à página inicial de jogos">
            <span style="font-size: 1.1rem; line-height: 1;">🏠</span>
            <span>Início</span>
          </a>
          <span class="nav-brand-tag">
            <span>🚀</span> Coleção Horizonte · Volume Matemática
          </span>
        </div>

        <nav class="nav-games-switcher" aria-label="Navegação entre jogos">
          <a href="jogo_a.html" class="nav-game-link ${this.activeGame === 'a' ? 'active' : ''}" title="Jogo 1: Fatia do Saber">
            🍕 <span>1 · Fatia</span>
          </a>
          <a href="jogo_b.html" class="nav-game-link ${this.activeGame === 'b' ? 'active' : ''}" title="Jogo 2: Encontre a Figura">
            📐 <span>2 · Figuras</span>
          </a>
          <a href="jogo_c.html" class="nav-game-link ${this.activeGame === 'c' ? 'active' : ''}" title="Jogo 3: Dominó Equivalente">
            🁠 <span>3 · Dominó</span>
          </a>
          <a href="jogo_d.html" class="nav-game-link ${this.activeGame === 'd' ? 'active' : ''}" title="Jogo 4: Frações no Cotidiano">
            🛒 <span>4 · Cotidiano</span>
          </a>
        </nav>

        <div class="nav-right-group">
          <div class="nav-stat-pill stars" id="nav-stars-pill" title="Pontos conquistados">
            ★ <span id="nav-stars-count">0</span> pts
          </div>
          <button class="btn-sound-toggle" id="btn-sound-toggle" type="button" title="Alternar som do jogo">
            ${HorizonteAudio.isMuted() ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
    `;

    document.body.prepend(wrapper);
  },

  updateScore(score) {
    const el = document.getElementById('nav-stars-count');
    if (el) {
      el.textContent = score;
      el.parentElement.classList.add('animate-pop');
      setTimeout(() => el.parentElement.classList.remove('animate-pop'), 400);
    }
  },

  bindEvents() {
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isMuted = HorizonteAudio.toggleMute();
        soundBtn.textContent = isMuted ? '🔇' : '🔊';
        if (!isMuted) HorizonteAudio.playClick();
      });
    }

    const homeBtn = document.getElementById('btn-back-home');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        HorizonteAudio.playClick();
      });
    }

    document.querySelectorAll('.nav-game-link').forEach(link => {
      link.addEventListener('click', () => {
        HorizonteAudio.playClick();
      });
    });
  }
};
