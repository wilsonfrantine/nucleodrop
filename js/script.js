// script.js

window.onload = function() {
    const words = ["GATA", "CACA", "TATA", "TACA", "ATACA", "TACA GATO", "TACA CACA"];
    const nucleotideMapping = {
        A: 'adenine',
        T: 'thymine',
        C: 'cytosine',
        G: 'guanine'
    };
    let currentTargetWord = '';
    let score = 0;
    let lives = 3;  // Número de vidas
    const feedbackElement = document.getElementById('feedback');
    const successSound = document.getElementById('success-sound');
    const errorSound = document.getElementById('error-sound');
    const dropArea = document.getElementById('drop-area');
    const scoreElement = document.getElementById('score');
    const targetWordElement = document.getElementById('target-word');
    const gameOverElement = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');
    let clonedElement = null;  // Elemento clonado sendo arrastado (para eventos de toque)

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Carregar uma nova palavra alvo
    function loadNewWord() {
        currentTargetWord = words[Math.floor(Math.random() * words.length)];
        dropArea.innerHTML = ''; // Limpar slots de soltura
        targetWordElement.textContent = currentTargetWord; // Exibir a palavra

        // Criar slots de soltura e letras correspondentes para cada letra (ignorando espaços)
        for (let i = 0; i < currentTargetWord.length; i++) {
            const letter = currentTargetWord[i];
            if (letter !== ' ') {  // Ignora espaços ao criar os slots
                const slotContainer = document.createElement('div');
                slotContainer.style.display = 'flex';
                slotContainer.style.flexDirection = 'column';
                slotContainer.style.alignItems = 'center';

                const slot = document.createElement('div');
                slot.classList.add('slot');
                slot.dataset.index = i;
                slot.dataset.expected = letter; // Define a letra esperada
                slot.addEventListener('dragover', event => event.preventDefault());
                slot.addEventListener('drop', handleDrop);
                slot.addEventListener('touchmove', event => event.preventDefault());  // Prevenir comportamento padrão de scroll

                // Exibir a letra correspondente em cinza claro
                const letterHint = document.createElement('span');
                letterHint.classList.add('letter-hint');
                letterHint.textContent = letter;
                slot.appendChild(letterHint);

                slotContainer.appendChild(slot);
                dropArea.appendChild(slotContainer);
            }
        }

        // Embaralhar a ordem das bases e adicionar à coluna de nucleotídeos
        const nucleotideElements = Array.from(document.querySelectorAll('.nucleotide'));
        shuffleArray(nucleotideElements);
        const nucleotidesColumn = document.querySelector('.nucleotides-column');
        nucleotidesColumn.innerHTML = '';  // Limpa a coluna antes de adicionar os elementos embaralhados
        nucleotideElements.forEach(nucleotide => {
            nucleotidesColumn.appendChild(nucleotide);
            addDragAndTouchListeners(nucleotide);  // Adicionar eventos de drag e touch
        });
    }

    // Adicionar eventos de arrastar e toque
    function addDragAndTouchListeners(element) {
        // Eventos de mouse para desktop
        element.addEventListener('dragstart', handleDragStart);

        // Eventos de toque para dispositivos móveis
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    // Manipuladores de eventos de arrastar e soltar
    function handleDragStart(event) {
        event.dataTransfer.setData("text", event.target.id);
        event.target.style.cursor = 'grabbing';  // Cursor estilo drag-drop
    }

    // Manipuladores de eventos de toque
    function handleTouchStart(event) {
        event.preventDefault();
        const originalElement = event.target;  // Armazenar o elemento original
        clonedElement = originalElement.cloneNode(true);  // Criar um clone do elemento
        clonedElement.id = originalElement.id;  // Copiar o ID do elemento original
        clonedElement.style.position = 'absolute';
        clonedElement.style.zIndex = '1000';
        document.body.appendChild(clonedElement);  // Adicionar o clone ao corpo para manipulação
    
        clonedElement.style.left = originalElement.getBoundingClientRect().left + 'px';
        clonedElement.style.top = originalElement.getBoundingClientRect().top + 'px';
    }
    

    function handleTouchMove(event) {
        if (!clonedElement) return;  // Se nenhum elemento está sendo arrastado, sair

        const touch = event.touches[0];
        clonedElement.style.left = touch.pageX - (clonedElement.offsetWidth / 2) + 'px';
        clonedElement.style.top = touch.pageY - (clonedElement.offsetHeight / 2) + 'px';
    }

    function handleTouchEnd(event) {
        const touch = event.changedTouches[0];
        const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);  // Detectar o elemento sob o toque
    
        if (dropTarget && dropTarget.classList.contains('slot')) {
            // Cria um objeto de evento simulado
            const simulatedEvent = {
                target: dropTarget,
                dataTransfer: {
                    getData: () => clonedElement.id  // Use o ID do clone
                },
                preventDefault: function() {}  // Simulação do método preventDefault
            };
    
            handleDrop(simulatedEvent);  // Chama handleDrop com o evento simulado
        }
    
        // Remover o clone
        if (clonedElement) {
            clonedElement.remove();
            clonedElement = null;
        }
    }
    

    function handleDrop(event) {
        event.preventDefault();  // Garantir que o comportamento padrão seja prevenido

        const nucleotide = event.dataTransfer.getData("text");
        const expectedNucleotide = nucleotideMapping[event.target.dataset.expected];

        if (nucleotide === expectedNucleotide) {
            const img = document.createElement('img');
            img.src = `./img/${nucleotide}.svg`; // Atualize o caminho dos SVGs
            img.classList.add('nucleotide');
            event.target.appendChild(img);
            event.target.removeEventListener('drop', handleDrop);
            event.target.classList.add('correct');

            // Tocar o som de sucesso
            playAudio(successSound);

            // Remover a letra de dica (cinza claro)
            const letterHint = event.target.querySelector('.letter-hint');
            if (letterHint) {
                letterHint.remove();
            }

            updateScore(10);  // Pontuação para cada acerto

            checkCompletion();
        } else {
            loseLife();  // Perder uma vida
            showFeedback('Errou! -1 Vida', 'red', errorSound);
        }
    }

    // Função para reproduzir áudio
    function playAudio(audioElement) {
        audioElement.currentTime = 0;  // Reinicia o áudio do início
        audioElement.play();
    }

    // Perder uma vida
    function loseLife() {
        if (lives > 0) {
            document.getElementById(`life-${lives}`).style.opacity = '0.2';  // Torna a imagem opaca
            lives--;
        }

        if (lives === 0) {
            endGame();  // Fim do jogo quando as vidas terminam
        }
    }

    // Verificar se todas as letras foram preenchidas corretamente
    function checkCompletion() {
        const slots = document.querySelectorAll('.slot');
        let completed = true;

        slots.forEach(slot => {
            if (!slot.classList.contains('correct')) {
                completed = false;
            }
        });

        if (completed) {
            showFeedback('Palavra Completa!', 'green', successSound);
            setTimeout(loadNewWord, 1000);
        }
    }

    // Fim do jogo
    function endGame() {
        finalScoreElement.textContent = `Pontuação Final: ${score}`;
        gameOverElement.style.display = 'block';
    }

    // Atualizar pontuação
    function updateScore(points) {
        score += points;
        scoreElement.textContent = score;
        scoreElement.style.color = points > 0 ? 'green' : 'red';
        setTimeout(() => scoreElement.style.color = '#000', 300);  // Retorna à cor original
    }

    // Mostrar feedback visual e sonoro
    function showFeedback(message, color, sound) {
        feedbackElement.textContent = message;
        feedbackElement.style.backgroundColor = color;
        feedbackElement.style.display = 'block';
        playAudio(sound);  // Reproduz o áudio de erro
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 1000);
    }

    // Reiniciar o jogo
    function restartGame() {
        score = 0;
        lives = 3;
        scoreElement.textContent = score;
        document.querySelectorAll('.life').forEach(life => life.style.opacity = '1');  // Restaurar vidas
        gameOverElement.style.display = 'none';
        loadNewWord();
    }

    // Configurar os eventos de drag e drop
    document.querySelectorAll('.nucleotide').forEach(nucleotide => {
        addDragAndTouchListeners(nucleotide);  // Adicionar eventos de drag e toque
    });

    // Evento de reinício
    restartBtn.addEventListener('click', restartGame);

    // Inicializa o jogo
    loadNewWord();
};
