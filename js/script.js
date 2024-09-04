// script.js

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
    let draggedElement = null;  // Elemento arrastado ou clonado
    let draggedElementId = '';  // ID do elemento arrastado para verificar colisão

    // Elementos do DOM (cache para evitar consultas repetidas)
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
        dropArea.innerHTML = '';  // Limpar slots de drop
        targetWordElement.textContent = currentTargetWord;  // Exibir a palavra

        createDropSlots(currentTargetWord);
        setupNucleotideElements();
    }

    function createDropSlots(word) {
        word.split('').forEach((letter, i) => {
            if (letter !== ' ') {  // Ignora espaços ao criar os slots
                const slotContainer = document.createElement('div');
                slotContainer.classList.add('slot-container');

                const slot = document.createElement('div');
                slot.classList.add('slot');
                slot.dataset.index = i;
                slot.dataset.expected = nucleotideMapping[letter];
                slot.addEventListener('dragover', event => event.preventDefault());
                slot.addEventListener('drop', handleDrop);
                slot.addEventListener('touchmove', event => event.preventDefault());

                const letterHint = document.createElement('span');
                letterHint.classList.add('letter-hint');
                letterHint.textContent = letter;
                slot.appendChild(letterHint);

                slotContainer.appendChild(slot);
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
        element.addEventListener('dragstart', handleDragStart);  // Desktop
        element.addEventListener('touchstart', handleTouchStart, { passive: false });  // Mobile
        element.addEventListener('touchmove', handleTouchMove, { passive: false });  // Mobile
        element.addEventListener('touchend', handleTouchEnd, { passive: false });  // Mobile
    }

    function handleDragStart(event) {
        event.dataTransfer.setData("text", event.target.id);  // Usar id do elemento
        event.target.style.cursor = 'grabbing';
    }

    function handleTouchStart(event) {
        event.preventDefault();
        draggedElement = event.target.cloneNode(true);  // Criar um clone do elemento
        draggedElementId = event.target.id;  // Armazena o id do elemento original
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
                    handleDropResult(slot, true);  // Sucesso
                } else {
                    handleDropResult(slot, false);  // Falha
                }
            }
        });

        if (!collisionFound) {
            cleanupDraggedElement();  // Remove o elemento arrastado sem computar falha
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
            document.getElementById(`life-${lives}`).style.opacity = '0.2';
            lives--;
        }
        if (lives === 0) endGame();
    }

    function checkCompletion() {
        const allSlots = document.querySelectorAll('.slot');
        const allCompleted = Array.from(allSlots).every(slot => slot.querySelector('img') !== null); // Verifica se todos os slots têm uma imagem

        if (allCompleted) {
            playFeedback('Palavra Completa!', 'green', successSound);
            setTimeout(loadNewWord, 1000);
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
