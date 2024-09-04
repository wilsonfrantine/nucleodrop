// mobile.js

let draggedElement = null;

function addTouchListeners(element) {
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function handleTouchStart(event) {
    event.preventDefault();
    draggedElement = event.target;
    draggedElement.style.position = 'absolute';
}

function handleTouchMove(event) {
    if (!draggedElement) return;
    event.preventDefault();
    const touch = event.touches[0];
    draggedElement.style.left = touch.clientX - draggedElement.clientWidth / 2 + 'px';
    draggedElement.style.top = touch.clientY - draggedElement.clientHeight / 2 + 'px';
}

function handleTouchEnd(event) {
    if (!draggedElement) return;
    const touch = event.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    if (dropTarget && dropTarget.classList.contains('slot')) {
        const nucleotide = draggedElement.id;
        const expectedNucleotide = nucleotideMapping[dropTarget.dataset.expected];

        if (nucleotide === expectedNucleotide) {
            const img = document.createElement('img');
            img.src = `./img/${expectedNucleotide}.svg`;
            img.classList.add('nucleotide');
            dropTarget.appendChild(img);
            dropTarget.classList.add('correct');

            playAudio(successSound);
            updateScore(10);
            checkCompletion();
        } else {
            loseLife();  // Agora deve funcionar, pois loseLife está definida globalmente
            showFeedback('Errou! -1 Vida', 'red', errorSound);
        }
    }

    draggedElement.style.position = ''; // Resetar posição
    draggedElement = null;
}

// Adicionar os eventos de toque para elementos de nucleotídeos
document.querySelectorAll('.nucleotide').forEach(nucleotide => {
    addTouchListeners(nucleotide);
});
