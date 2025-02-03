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

// Function to validate matches
function validateMatches() {
    const wordItems = document.querySelectorAll('.word');
    const matchesPayload = {};

    // Prepare matches for validation
    wordItems.forEach(word => {
        if (matches[word.dataset.word]) {
            matchesPayload[word.dataset.word] = matches[word.dataset.word];
        }
    });

    const deckName = document.getElementById('deck-name').textContent;

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
            const messageElement = document.getElementById('validation-message');

            if (data.success) {
                    if (data.completed) {
                    alert(data.message); // Display congratulations message
                    document.querySelector('.game-container').innerHTML = `
                        <div class="congratulations-message">
                            <h2>${data.message}</h2>
                        </div>`;
                }
                messageElement.textContent = 'All matches are correct!';
                messageElement.style.color = 'green';
                document.getElementById('submit').disabled = false; // Enable the Submit button
                // resetLines();
            } else {
                resetLines();
                messageElement.textContent = data.error || 'Some matches are incorrect. Please try again!';
                messageElement.style.color = 'red';
                document.getElementById('submit').disabled = true; // Disable the Submit button
            }
        })
        .catch(error => console.error('Error validating matches:', error));
        // resetLines();
}

// Function to load the next words
function submitWords() {
    if (document.getElementById('submit').disabled) {
        alert('Please ensure all matches are correct before proceeding.');
        return;
    }

    const deckName = document.getElementById('deck-name').textContent;
    const currentPage = parseInt(document.querySelector('#submit').dataset.page || 1);
    resetLines();

    fetch(`/group/${deckName}/${currentPage + 1}`)
        .then(response => response.text())
        .then(nextPageData => {
            const gameContainer = document.querySelector('.game-container');
            const newGameContent = document.createElement('div');
            newGameContent.innerHTML = nextPageData;

            gameContainer.innerHTML = newGameContent.querySelector('.game-container').innerHTML;

            // Reset the validation message and disable Submit
            document.getElementById('validation-message').textContent = '';
            document.getElementById('submit').disabled = true;

            // Update the page number on the submit button
            document.querySelector('#submit').dataset.page = currentPage + 1;

            // Reinitialize click events
            initializeClickEvents();
        })
        .catch(error => console.error('Error fetching next words:', error));
        resetLines();
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
