window.onload = function () {
    const words = ["GATA", "CACA", "TATA", "TACA", "ATACA", "TACAGATG", "TACATACA"];
    const nucleotideMapping = {
        A: 'adenine',
        T: 'thymine',
        C: 'cytosine',
        G: 'guanine'
    };

    let currentTargetWord = '';
    let score = 0;
    let lives = 3;
    let draggedElement = null;
    let draggedElementId = '';

    // Elementos do DOM
    const feedbackElement = document.getElementById('feedback');
    const successSound = document.getElementById('success-sound');
    const errorSound = document.getElementById('error-sound');
    const correctBaseSound = document.getElementById('correctBaseSound'); 
    const dropArea = document.getElementById('drop-area');
    const scoreElement = document.getElementById('score');
    const targetWordElement = document.getElementById('target-word');
    const gameOverElement = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');
    const nucleotidesColumn = document.querySelector('.nucleotides-column');

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function loadNewWord() {
        currentTargetWord = words[Math.floor(Math.random() * words.length)];
        dropArea.innerHTML = '';  
        targetWordElement.textContent = currentTargetWord;  

        createDropSlots(currentTargetWord);
        setupNucleotideElements();
    }

    function createDropSlots(word) {
        dropArea.innerHTML = '';  // Limpar slots de drop
    
        word.split('').forEach((letter, i) => {
            if (letter !== ' ') {
                // Criar contêiner do slot
                const slotContainer = document.createElement('div');
                slotContainer.classList.add('slot-container');
    
                // Criar slot
                const slot = document.createElement('div');
                slot.classList.add('slot');
                slot.dataset.index = i;
                slot.dataset.expected = nucleotideMapping[letter];
                slot.addEventListener('dragover', event => event.preventDefault());
                slot.addEventListener('drop', handleDrop);
                slot.addEventListener('touchmove', event => event.preventDefault());
    
                // Criar a letra abaixo do slot
                const letterHint = document.createElement('div');
                letterHint.classList.add('letter-hint');
                letterHint.textContent = letter; // Exibir a letra da palavra-alvo
    
                // Adicionar slot e letra ao contêiner
                slotContainer.appendChild(slot);
                slotContainer.appendChild(letterHint);
    
                // Adicionar contêiner à área de drop
                dropArea.appendChild(slotContainer);
            }
        });
    }
    

    function setupNucleotideElements() {
        const nucleotideElements = Array.from(document.querySelectorAll('.nucleotide'));
        shuffleArray(nucleotideElements);
        nucleotidesColumn.innerHTML = '';
        nucleotideElements.forEach(nucleotide => {
            nucleotidesColumn.appendChild(nucleotide);
            addDragAndTouchListeners(nucleotide);
        });
    }

    function addDragAndTouchListeners(element) {
        element.addEventListener('dragstart', handleDragStart);  
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    function handleDragStart(event) {
        event.dataTransfer.setData("text", event.target.id);  
        event.target.style.cursor = 'grabbing';
    }

    function handleTouchStart(event) {
        event.preventDefault();
        draggedElement = event.target.cloneNode(true);  
        draggedElementId = event.target.id;  
        draggedElement.style.position = 'absolute';
        draggedElement.style.zIndex = '1000';
        document.body.appendChild(draggedElement);

        const rect = event.target.getBoundingClientRect();
        draggedElement.style.left = rect.left + 'px';
        draggedElement.style.top = rect.top + 'px';
    }

    function handleTouchMove(event) {
        if (!draggedElement) return;
        event.preventDefault();
        const touch = event.touches[0];
        draggedElement.style.left = touch.pageX - (draggedElement.offsetWidth / 2) + 'px';
        draggedElement.style.top = touch.pageY - (draggedElement.offsetHeight / 2) + 'px';
    
        // Centralizar na tela
        if (touch.pageX < 0 || touch.pageY < 0 || touch.pageX > window.innerWidth || touch.pageY > window.innerHeight) {
            document.querySelector('.container').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function handleTouchEnd(event) {
        if (!draggedElement) return;
        const touch = event.changedTouches[0];
        const slots = document.querySelectorAll('.slot');
        let collisionFound = false;

        slots.forEach(slot => {
            if (isColliding(slot, touch)) {
                collisionFound = true;
                const expectedNucleotide = slot.dataset.expected;

                if (draggedElementId === expectedNucleotide) {  
                    handleDropResult(slot, true);  
                } else {
                    handleDropResult(slot, false);  
                }
            }
        });

        if (!collisionFound) {
            cleanupDraggedElement();  
            return;
        }

        cleanupDraggedElement();
    }

    function isColliding(slot, touch) {
        const slotRect = slot.getBoundingClientRect();
        return (
            touch.clientX >= slotRect.left &&
            touch.clientX <= slotRect.right &&
            touch.clientY >= slotRect.top &&
            touch.clientY <= slotRect.bottom
        );
    }

    function cleanupDraggedElement() {
        if (draggedElement) {
            draggedElement.remove();
            draggedElement = null;
            draggedElementId = '';
        }
    }

    function handleDrop(event) {
        event.preventDefault();
    
        const nucleotide = event.dataTransfer.getData("text");
        const expectedNucleotide = event.target.dataset.expected;
    
        // Verificar se o slot já possui uma imagem atribuída
        if (event.target.querySelector('img')) {
            // Se já houver uma imagem, interrompe a função
            return;
        }
    
        handleDropResult(event.target, nucleotide === expectedNucleotide);
    }
    
    function handleDropResult(target, success) {
        if (success) {
            dropSuccess(target);
        } else {
            dropFail();
        }
    }

    function dropSuccess(dropTarget) {
        const img = document.createElement('img');
        img.src = `./img/${dropTarget.dataset.expected}.svg`;
        img.classList.add('nucleotide');
        dropTarget.appendChild(img);
        dropTarget.classList.add('correct');
        
        updateScore(10); // Chamar função de atualização de pontuação
    
        // Adiciona classe de brilho e remove após a animação
        dropTarget.classList.add('correct-glow');
        setTimeout(() => dropTarget.classList.remove('correct-glow'), 500);
        playAudio(correctBaseSound);
    
        checkCompletion();
    }

    function dropFail() {
        loseLife();
        playFeedback('Errou! -1 Vida', 'red', errorSound);
    }

    function playFeedback(message, color, sound) {
        feedbackElement.textContent = message;
        feedbackElement.style.backgroundColor = color;
        feedbackElement.style.display = 'block';
        playAudio(sound);
        setTimeout(() => feedbackElement.style.display = 'none', 1000);
    }

    function playAudio(audioElement) {
        audioElement.currentTime = 0;
        audioElement.play();
    }

    function loseLife() {
        if (lives > 0) {
            const lifeElement = document.getElementById(`life-${lives}`);
            lifeElement.classList.add('lost'); // Adiciona a classe 'lost' para a animação de pulso
            setTimeout(() => {
                lifeElement.style.opacity = '0.2'; // Define a opacidade final após a animação
                lifeElement.classList.remove('lost'); // Remove a classe de animação
            }, 2100); // 2100ms para permitir que a animação aconteça 3 vezes
            lives--;
        }
        if (lives === 0) endGame();
    }
    

    function checkCompletion() {
        const allSlots = document.querySelectorAll('.slot');
        const allCompleted = Array.from(allSlots).every(slot => slot.querySelector('img') !== null); 

        if (allCompleted) {
            playFeedback('Cópia perfeita! Avançando na fita...', 'green', successSound);
            setTimeout(loadNewWord, 2000);
        }
    }

    function endGame() {
        finalScoreElement.textContent = `Pontuação Final: ${score}`;
        gameOverElement.style.display = 'block';
    }

    function updateScore(points) {
        score += points;
        scoreElement.textContent = score;
        scoreElement.style.color = points > 0 ? 'green' : 'red';
        setTimeout(() => scoreElement.style.color = '#000', 300);
    }

    function restartGame() {
        score = 0;
        lives = 3;
        scoreElement.textContent = score;
        document.querySelectorAll('.life').forEach(life => life.style.opacity = '1');
        gameOverElement.style.display = 'none';
        loadNewWord();
    }

    restartBtn.addEventListener('click', restartGame);
    loadNewWord();
};
