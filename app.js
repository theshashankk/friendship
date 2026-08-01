/* ==========================================================
   FRIENDSHIP DAY WEB APP INTERACTIVE LOGIC
   Personalized for Shruti from Shashank
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---------------- 1. PARTICLES GENERATOR ----------------
    const particlesContainer = document.getElementById('particles');
    const particleSymbols = ['🎈', '💖', '✨', '🌸', '⭐', '💌', '🎉'];

    function createParticle() {
        if (!particlesContainer) return;
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.innerText = particleSymbols[Math.floor(Math.random() * particleSymbols.length)];
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDuration = (Math.random() * 5 + 6) + 's';
        particle.style.fontSize = (Math.random() * 1 + 0.8) + 'rem';
        particlesContainer.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 10000);
    }

    setInterval(createParticle, 600);

    // ---------------- 2. ENVELOPE & INTRO ANIMATION ----------------
    const envelopeBtn = document.getElementById('envelopeBtn');
    const introScreen = document.getElementById('introScreen');
    const mainContent = document.getElementById('mainContent');

    if (envelopeBtn) {
        envelopeBtn.addEventListener('click', () => {
            envelopeBtn.classList.add('open');
            // Auto play audio if available
            tryPlayAudio();

            setTimeout(() => {
                introScreen.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                introScreen.style.opacity = '0';
                introScreen.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    introScreen.classList.add('hidden');
                    mainContent.classList.remove('hidden');
                    mainContent.style.opacity = '0';
                    mainContent.style.transition = 'opacity 0.8s ease';
                    requestAnimationFrame(() => {
                        mainContent.style.opacity = '1';
                    });
                    initScratchCards();
                }, 800);
            }, 600);
        });
    }

    // ---------------- 3. AUDIO PLAYER ----------------
    const bgAudio = document.getElementById('bgAudio');
    const playAudioBtn = document.getElementById('playAudioBtn');
    const discSpin = document.getElementById('discSpin');
    const audioWave = document.getElementById('audioWave');
    const progressBar = document.getElementById('progressBar');
    const progressWrapper = document.getElementById('progressWrapper');
    const timeDisplay = document.getElementById('timeDisplay');

    function tryPlayAudio() {
        if (!bgAudio) return;
        bgAudio.play().then(() => {
            updateAudioUI(true);
        }).catch(err => {
            console.log('Audio autoplay prevented by browser policy:', err);
            updateAudioUI(false);
        });
    }

    function updateAudioUI(isPlaying) {
        if (isPlaying) {
            playAudioBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            discSpin.classList.add('playing');
            audioWave.classList.add('active');
        } else {
            playAudioBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            discSpin.classList.remove('playing');
            audioWave.classList.remove('active');
        }
    }

    if (playAudioBtn && bgAudio) {
        playAudioBtn.addEventListener('click', () => {
            if (bgAudio.paused) {
                bgAudio.play();
                updateAudioUI(true);
            } else {
                bgAudio.pause();
                updateAudioUI(false);
            }
        });

        bgAudio.addEventListener('timeupdate', () => {
            if (bgAudio.duration) {
                const pct = (bgAudio.currentTime / bgAudio.duration) * 100;
                progressBar.style.width = pct + '%';
                
                const mins = Math.floor(bgAudio.currentTime / 60);
                const secs = Math.floor(bgAudio.currentTime % 60).toString().padStart(2, '0');
                timeDisplay.innerText = `${mins}:${secs}`;
            }
        });

        if (progressWrapper) {
            progressWrapper.addEventListener('click', (e) => {
                const rect = progressWrapper.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                if (bgAudio.duration) {
                    bgAudio.currentTime = (clickX / width) * bgAudio.duration;
                }
            });
        }
    }

    // ---------------- 4. POLAROID FLIP CARDS ----------------
    const polaroidCards = document.querySelectorAll('.polaroid-card');
    polaroidCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });

    // ---------------- 5. SCRATCH CARDS CANVAS LOGIC ----------------
    function initScratchCards() {
        const canvases = document.querySelectorAll('.scratch-canvas');
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            // Draw Scratch Surface
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(0, 0, width, height);

            // Add shiny texture pattern
            ctx.fillStyle = '#94a3b8';
            for (let i = 0; i < width; i += 20) {
                ctx.fillRect(i, 0, 10, height);
            }

            // Overlay Text
            ctx.font = 'bold 16px Outfit, sans-serif';
            ctx.fillStyle = '#475569';
            ctx.textAlign = 'center';
            ctx.fillText('✨ Scratch for Shruti ✨', width / 2, height / 2 + 5);

            let isScratching = false;

            function scratch(e) {
                if (!isScratching) return;
                const rect = canvas.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                const x = (clientX - rect.left) * (canvas.width / rect.width);
                const y = (clientY - rect.top) * (canvas.height / rect.height);

                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(x, y, 22, 0, Math.PI * 2);
                ctx.fill();

                checkScratchPercent(canvas, ctx);
            }

            canvas.addEventListener('mousedown', (e) => { isScratching = true; scratch(e); });
            canvas.addEventListener('mousemove', scratch);
            canvas.addEventListener('mouseup', () => { isScratching = false; });
            canvas.addEventListener('mouseleave', () => { isScratching = false; });

            canvas.addEventListener('touchstart', (e) => { isScratching = true; scratch(e); }, { passive: true });
            canvas.addEventListener('touchmove', scratch, { passive: true });
            canvas.addEventListener('touchend', () => { isScratching = false; });
        });
    }

    function checkScratchPercent(canvas, ctx) {
        if (canvas.dataset.cleared === 'true') return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let clearPixels = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) clearPixels++;
        }

        const percent = (clearPixels / (pixels.length / 4)) * 100;
        if (percent > 45) {
            canvas.dataset.cleared = 'true';
            canvas.style.transition = 'opacity 0.5s ease';
            canvas.style.opacity = '0';
            setTimeout(() => { canvas.style.display = 'none'; }, 500);
        }
    }

});
