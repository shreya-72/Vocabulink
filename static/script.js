let selectedWord = null;
let selectedDefinition = null;
let matches = {}; // User's matches
const lines = []; // Store lines for cleanup



// Handle word click
document.querySelectorAll('.word').forEach(word => {
    word.addEventListener('click', function () {
        selectedWord = this;
        highlight(this, 'word');
    });
});

// Handle definition click
document.querySelectorAll('.definition').forEach(def => {
    def.addEventListener('click', function () {
        selectedDefinition = this;
        highlight(this, 'definition');
        if (selectedWord && selectedDefinition) {
            drawLine(selectedWord, selectedDefinition);
            matches[selectedWord.dataset.word] = selectedDefinition.dataset.definition;
            selectedWord = null;
            selectedDefinition = null;
        }
    });
});

// Highlight selected elements
function highlight(element, type) {
    document.querySelectorAll('.' + type).forEach(el => el.style.backgroundColor = '');
    element.style.backgroundColor = '#d1e7dd';
}

// Draw a line between two elements
function drawLine(fromElem, toElem) {
    const line = new LeaderLine(
        fromElem,
        toElem,
        {
            color: 'grey ',
            size: 4,
            path: 'straight',
            startPlug: 'behind',
            endPlug: 'behind',
        }
    );
    lines.push(line);
}



// Function to handle Submit and load the next words if the matches are correct
function submitAndLoadNext() {
    const wordItems = document.querySelectorAll('.word');
    const matchesPayload = {};

    // Prepare matches for validation
    wordItems.forEach(word => {
        if (matches[word.dataset.word]) {
            matchesPayload[word.dataset.word] = matches[word.dataset.word];
        }
    });

    const deckName = document.getElementById('deck-name').textContent;
    const currentPage = parseInt(document.querySelector('#submit').dataset.page || 1);

    // Validate matches through the backend
    fetch('/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            deck: deckName,
            matches: matchesPayload,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.completed) {
                    alert(data.message); // Display congratulations message
                    document.querySelector('.game-container').innerHTML = `
                        <div class="congratulations-message">
                            <h2>${data.message}</h2>
                        </div>`;
                }else{
                resetLines();
                // If all matches are correct, fetch the next set of words
                fetch(`/group/${deckName}/${currentPage + 1}`)
                    .then(response => response.text())
                    .then(nextPageData => {
                        const gameContainer = document.querySelector('.game-container');
                        const newGameContent = document.createElement('div');
                        newGameContent.innerHTML = nextPageData;

                        gameContainer.innerHTML = newGameContent.querySelector('.game-container').innerHTML;

                        // Update the page number on the submit button
                        document.querySelector('#submit').dataset.page = currentPage + 1;

                        // Reinitialize click events
                        initializeClickEvents();
                    })
                    .catch(error => console.error('Error fetching next words:', error));
            } 
        }
            else {
                alert(data.error || 'Incorrect matches. Please try again!');
                resetLines();
            }
        })
        .catch(error => console.error('Error validating matches:', error));
}

// Helper function to reinitialize click events
function initializeClickEvents() {
    document.querySelectorAll('.word').forEach(word => {
        word.addEventListener('click', function () {
            selectedWord = this;
            highlight(this, 'word');
        });
    });

    document.querySelectorAll('.definition').forEach(def => {
        def.addEventListener('click', function () {
            selectedDefinition = this;
            highlight(this, 'definition');
            if (selectedWord && selectedDefinition) {
                drawLine(selectedWord, selectedDefinition);
                matches[selectedWord.dataset.word] = selectedDefinition.dataset.definition;
                selectedWord = null;
                selectedDefinition = null;
            }
        });
    });
}

// Reset lines and selections
function resetLines() {
    lines.forEach(line => line.remove());
    lines.length = 0;
    matches = {};
    selectedWord = null;
    selectedDefinition = null;
    document.querySelectorAll('.word, .definition').forEach(el => el.style.backgroundColor = '');
}
