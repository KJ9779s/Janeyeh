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

        this.disableDevTools();
    },

    disableDevTools() {
        document.addEventListener('contextmenu', (e) => e.preventDefault());

        document.addEventListener('keydown', (e) => {
            if (e.keyCode === 123) {
                e.preventDefault();
                return false;
            }

            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
            }

            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                return false;
            }

            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                return false;
            }
        });
    },

    setupEvents() {
        this.gameBox.addEventListener('mousedown', (e) => this.handlePressStart(e));
        window.addEventListener('mouseup', () => this.handlePressEnd());
        this.gameBox.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePressStart(e.touches[0]);
        });
        window.addEventListener('touchend', () => this.handlePressEnd());
    },

    handlePressStart(e) {
        if (this.isGameOver) return;
        if (!this.isStarted) {
            this.isStarted = true;
            if (this.hintText) this.hintText.style.display = 'none';
            this.startLogic();
        }
        this.isPressing = true;
        if (this.state === 'TURN') {
            this.triggerGameOver();
            return;
        }
        this.audioWash.play().catch(() => {});
        this.startScoring(e);
    },

    handlePressEnd() {
        this.isPressing = false;
        this.audioWash.pause();
        this.audioWash.currentTime = 0;
        this.stopScoring();
    },

    updateView() {
        this.imgContainer.style.backgroundImage = `url(${this.images[this.state]})`;
    },

    startScoring(e) {
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
        for (let i = 0; i < 2; i++) {
            const b = document.createElement('div');
            b.className = 'bubble';
            const size = Math.random() * 20 + 10;
            b.style.width = size + 'px';
            b.style.height = size + 'px';
            b.style.left = (Math.random() * 70 + 15) + '%';
            b.style.top = (Math.random() * 40 + 20) + '%';
            this.gameBox.appendChild(b);
            setTimeout(() => b.remove(), 700);
        }
    },

    startLogic() {
        if (this.isGameOver || !this.isStarted) return;
        const nextTurn = Math.random() * 2500 + 1500;
        this.timer = setTimeout(() => {
            if (this.isGameOver) return;
            this.state = 'TURN';
            this.audioTurn.play().catch(() => {});
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
        this.audioWash.pause();
        clearTimeout(this.timer);

        this.scaryVideo.classList.add('video-zoom-in');
        this.scaryVideo.currentTime = 0;
        this.scaryVideo.play();

        this.scaryVideo.onended = () => {
            this.scaryVideo.classList.remove('video-zoom-in');
            this.scaryVideo.style.display = 'none';
            this.showSettlement();
        };
    },

    showSettlement() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
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
        if (resultAudio) {
            resultAudio.play().catch(() => {});
        }
    },

    reset() {
        this.score = 0;
        this.isGameOver = false;
        this.isStarted = false;
        this.isPressing = false;
        this.state = 'BACK';
        this.scoreDisplay.innerText = '0';
        this.overlay.style.display = 'none';
        
        const a1 = document.getElementById('audio-result-1');
        const a2 = document.getElementById('audio-result-2');
        const a3 = document.getElementById('audio-result-3');
        const a4 = document.getElementById('audio-result-4');
        const a5 = document.getElementById('audio-result-5');
        [a1, a2, a3, a4, a5].forEach(a => { if(a) { a.pause(); a.currentTime = 0; } });
        
        this.scaryVideo.classList.remove('video-zoom-in');
        this.scaryVideo.style.display = 'none';
        this.scaryVideo.pause();
        this.scaryVideo.currentTime = 0;
        if (this.hintText) this.hintText.style.display = 'block';
        this.updateView();
    }
};

window.onload = () => Game.init();