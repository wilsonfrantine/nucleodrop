// desktop.js

function addDragListeners(element) {
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragover', event => event.preventDefault());
    element.addEventListener('drop', handleDrop);
}

function handleDragStart(event) {
    event.dataTransfer.setData("text", event.target.id);
    event.target.style.cursor = 'grabbing';
}

function handleDrop(event) {
    event.preventDefault();

    const nucleotide = event.dataTransfer.getData("text");
    const expectedNucleotide = nucleotideMapping[event.target.dataset.expected];

    if (nucleotide === expectedNucleotide) {
        const img = document.createElement('img');
        img.src = `./img/${expectedNucleotide}.svg`;
        img.classList.add('nucleotide');
        event.target.appendChild(img);
        event.target.classList.add('correct');

        playAudio(successSound);

        updateScore(10);
        checkCompletion();
    } else {
        loseLife();
        showFeedback('Errou! -1 Vida', 'red', errorSound);
    }
}

// Adicionar os eventos de arrastar e soltar para elementos de nucleotídeos
document.querySelectorAll('.nucleotide').forEach(nucleotide => {
    addDragListeners(nucleotide);
});
