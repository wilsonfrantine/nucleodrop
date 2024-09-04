// globals.js

// Variáveis globais
const nucleotideMapping = {
    A: 'adenine',
    T: 'thymine',
    C: 'cytosine',
    G: 'guanine'
};

// Funções utilitárias globais
function playAudio(audioElement) {
    audioElement.currentTime = 0;
    audioElement.play();
}

function showFeedback(message, color, sound) {
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = message;
    feedbackElement.style.backgroundColor = color;
    feedbackElement.style.display = 'block';
    playAudio(sound);
    setTimeout(() => {
        feedbackElement.style.display = 'none';
    }, 1000);
}
// Função para perder uma vida
function loseLife() {
    const lives = document.querySelectorAll('.life');
    if (lives.length > 0) {
        const lastLife = lives[lives.length - 1];
        lastLife.style.opacity = '0.2';  // Torna a imagem opaca para mostrar que perdeu uma vida
        lastLife.classList.remove('life');  // Remove a classe life para não contá-la novamente
    }

    if (lives.length === 0) {
        endGame();
    }
}

// Função para atualizar pontuação
function updateScore(points) {
    const scoreElement = document.getElementById('score');
    let score = parseInt(scoreElement.textContent, 10) || 0;
    score += points;
    scoreElement.textContent = score;
    scoreElement.style.color = points > 0 ? 'green' : 'red';
    setTimeout(() => scoreElement.style.color = '#000', 300);
}

// Função para terminar o jogo
function endGame() {
    const finalScoreElement = document.getElementById('final-score');
    const gameOverElement = document.getElementById('game-over');
    finalScoreElement.textContent = `Pontuação Final: ${score}`;
    gameOverElement.style.display = 'block';
}