const Game = {
    score: 0,
    highScore: 0,
    lastResultIndex: -1,
    isStarted: false,
    isPressing: false,
    isGameOver: false,
    state: 'BACK', 
    timer: null,
    scoreTimer: null,
    
    results: [
        { text: "「一天沒洗頭沒什麼～」", audioId: "audio-result-1" },
        { text: "「這個分數 還是讓芷妤幫你洗吧」", audioId: "audio-result-2" },
        { text: "「好啦 洗半頭也算有洗」", audioId: "audio-result-3" },
        { text: "「愛你但還有點油」", audioId: "audio-result-4" },
        { text: "「都是藉口罷了」", audioId: "audio-result-5" }
    ],

    images: {
        BACK: 'frame/back.PNG',
        TURN: 'frame/turn.PNG'
    },

    init() {
        this.imgContainer = document.getElementById('idol-img');
        this.scoreDisplay = document.getElementById('score-num');
        this.overlay = document.getElementById('overlay');
        this.endMsg = document.getElementById('end-msg');
        this.gameBox = document.getElementById('game-box');
        this.hintText = document.getElementById('status-hint');
        this.audioWash = document.getElementById('audio-wash');
        this.audioTurn = document.getElementById('audio-turn');
        this.scaryVideo = document.getElementById('scary-video');

        this.setupEvents();
        this.updateView();
    },

    setupEvents() {
        const startHandler = (e) => {
            if (e.target.classList.contains('btn-retry')) return;

            if (e.type === 'touchstart') e.preventDefault();
            this.handlePressStart(e.touches ? e.touches[0] : e);
        };
        const endHandler = (e) => {
            if (e.target.classList.contains('btn-retry')) return;
            this.handlePressEnd();
        };

        this.gameBox.addEventListener('touchstart', startHandler, { passive: false });
        this.gameBox.addEventListener('mousedown', startHandler);
        window.addEventListener('touchend', endHandler);
        window.addEventListener('mouseup', endHandler);
    },

    handlePressStart(e) {
        if (this.isGameOver) return;
        if (!this.isStarted) {
            this.unlockAudio();
            this.isStarted = true;
            if (this.hintText) this.hintText.style.display = 'none';
            this.startLogic();
        }

        this.isPressing = true;
        if (this.state === 'TURN') {
            this.triggerGameOver();
            return;
        }
        if (this.audioWash) this.audioWash.play().catch(() => {});
        this.startScoring();
    },

    unlockAudio() {
        const audios = [this.audioWash, this.audioTurn, this.scaryVideo];
        audios.forEach(a => { if(a) a.play().then(() => a.pause()).catch(() => {}); });
    },

    handlePressEnd() {
        this.isPressing = false;
        if (this.audioWash) {
            this.audioWash.pause();
            this.audioWash.currentTime = 0;
        }
        this.stopScoring();
    },

    updateView() {
        this.imgContainer.style.backgroundImage = `url(${this.images[this.state]})`;
    },

    startScoring() {
        if (this.scoreTimer) return;
        this.scoreTimer = setInterval(() => {
            if (this.isPressing && this.state === 'BACK') {
                this.score += 1; 
                this.scoreDisplay.innerText = this.score;
                this.spawnBubbles();
            }
        }, 200);
    },

    stopScoring() {
        clearInterval(this.scoreTimer);
        this.scoreTimer = null;
    },

    spawnBubbles() {
        for (let i = 0; i < 3; i++) {
            const b = document.createElement('div');
            b.className = 'bubble';
            
            const size = Math.random() * 30 + 15; 
            b.style.width = size + 'px';
            b.style.height = size + 'px';
            
            b.style.left = (Math.random() * 70 + 15) + '%';
            b.style.top = (Math.random() * 40 + 20) + '%';
            
            this.gameBox.appendChild(b);
            
            setTimeout(() => b.remove(), 800);
        }
    },

    startLogic() {
        if (this.isGameOver || !this.isStarted) return;
        const nextTurn = Math.random() * 2500 + 1500;
        this.timer = setTimeout(() => {
            if (this.isGameOver) return;
            this.state = 'TURN';
            if (this.audioTurn) this.audioTurn.play().catch(() => {});
            this.updateView();
            setTimeout(() => {
                if (this.isGameOver) return;
                if (this.isPressing) {
                    this.triggerGameOver();
                } else {
                    this.state = 'BACK';
                    this.updateView();
                    this.startLogic(); 
                }
            }, 350);
        }, nextTurn);
    },

    triggerGameOver() {
        this.isGameOver = true;
        this.isPressing = false;
        this.stopScoring();
        if (this.audioWash) this.audioWash.pause();
        clearTimeout(this.timer);

        this.scaryVideo.classList.add('video-zoom-in');
        this.scaryVideo.currentTime = 0;
        this.scaryVideo.muted = false; 
        this.scaryVideo.play().catch(() => { this.showSettlement(); });
        this.scaryVideo.onended = () => {
            this.scaryVideo.classList.remove('video-zoom-in');
            this.scaryVideo.style.display = 'none';
            this.showSettlement();
        };
    },

    showSettlement() {
        if (this.score > this.highScore) this.highScore = this.score;
        document.getElementById('high-score-num').innerText = this.highScore;
        
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.results.length);
        } while (newIndex === this.lastResultIndex);

        this.lastResultIndex = newIndex;
        const chosen = this.results[newIndex];
        this.endMsg.innerText = chosen.text;
        document.getElementById('last-score').innerText = this.score;
        this.overlay.style.display = 'flex';
        
        const resultAudio = document.getElementById(chosen.audioId);
        if (resultAudio) resultAudio.play().catch(() => {});
    },

    reset() {
        this.score = 0;
        this.isGameOver = false;
        this.isStarted = false;
        this.isPressing = false;
        this.state = 'BACK';
        this.scoreDisplay.innerText = '0';
        this.overlay.style.display = 'none';
        
        const audios = ['audio-result-1', 'audio-result-2', 'audio-result-3', 'audio-result-4', 'audio-result-5'];
        audios.forEach(id => {
            const a = document.getElementById(id);
            if (a) { a.pause(); a.currentTime = 0; }
        });
        
        this.scaryVideo.classList.remove('video-zoom-in');
        this.scaryVideo.style.display = 'none';
        this.scaryVideo.pause();
        if (this.hintText) this.hintText.style.display = 'block';
        this.updateView();
    }
};

window.onload = () => Game.init();