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
    // Check if all the current matches are correct
    let allCorrect = true;
    const wordItems = document.querySelectorAll('.word');
    const definitionItems = document.querySelectorAll('.definition');

    wordItems.forEach(word => {
        const matchedDefinition = document.querySelector(`.definition[data-definition="${matches[word.dataset.word]}"]`);
        if (!matchedDefinition || matchedDefinition.textContent !== matches[word.dataset.word]) {
            allCorrect = false;
        }
    });

    // If all matches are correct, load the next set of words
    if (allCorrect) {
        resetLines();

        const deckName = document.getElementById('deck-name').textContent;
        const currentPage = parseInt(document.querySelector('#submit').dataset.page || 1);

        // Fetch the next 5 words
        fetch(`/group/${deckName}/${currentPage + 1}`)
            .then(response => response.text())
            .then(data => {
                // Replace the game container with new words and definitions
                // document.querySelector('.game-container').innerHTML = data;
                const gameContainer = document.querySelector('.game-container');
                const newGameContent = document.createElement('div');
                newGameContent.innerHTML = data;
                
                gameContainer.innerHTML = newGameContent.querySelector('.game-container').innerHTML;
                // Update the page number on the submit button
                document.querySelector('#submit').dataset.page = currentPage + 1;

                // Reinitialize word and definition click events
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
            })
            .catch(error => {
                console.error('Error fetching next words:', error);
            });
    } else {
        // Display a message indicating that some matches were incorrect
        alert("Some matches are incorrect. Please try again!");
    }
}



// // Validate matches
// document.getElementById('submit').addEventListener('click', function () {
//     fetch('/validate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ matches }),
//     })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 document.getElementById('message').textContent = 'Correct! You can proceed.';
//                 document.getElementById('message').style.color = 'green';
//                 if (data.message) {
//                     // Display success message
//                     alert(data.message); // Show the completion message
//                 }
//                 resetLines();
//                 // Fetch the next set of words
//                 loadNextWords();
//             } else {
//                 document.getElementById('message').textContent = data.error;
//                 document.getElementById('message').style.color = 'red';
//                 resetLines();
//             }
//         });
// });


// // This function is triggered when the "Next 5 Words" button is clicked
// function loadNextWords(page) {
//     // Get the current deck name (you can store it globally or fetch it from the DOM)
//     const deckName = document.getElementById('deck-name').textContent;
    
//     // Fetch the next batch of words for the selected deck
//     fetch(`/group/${deckName}/${page}`)
//         .then(response => response.text())
//         .then(data => {
//             // Replace the existing content with the new batch of words
//             document.querySelector('.game-container').innerHTML = data;
            
//             // Re-initialize event listeners after the DOM update
//             document.querySelectorAll('.word').forEach(word => {
//                 word.addEventListener('click', function () {
//                     selectedWord = this;
//                     highlight(this, 'word');
//                 });
//             });
//             document.querySelectorAll('.definition').forEach(def => {
//                 def.addEventListener('click', function () {
//                     selectedDefinition = this;
//                     highlight(this, 'definition');
//                     if (selectedWord && selectedDefinition) {
//                         drawLine(selectedWord, selectedDefinition);
//                         matches[selectedWord.dataset.word] = selectedDefinition.dataset.definition;
//                         selectedWord = null;
//                         selectedDefinition = null;
//                     }
//                 });
//             });
//         })
//         .catch(error => console.error('Error loading words:', error));
// }



// // Fetch the next set of words and render them
// function loadNextWords() {
//     fetch(`/group/${deckName}`)
//     .then(response => response.text())
//     .then(data => {
//         // document.querySelector('.game-container').innerHTML = data;
//         // Re-initialize events after DOM update
//                 // Replace only the content inside the game-container
//                 const gameContainer = document.querySelector('.game-container');
//                 const newGameContent = document.createElement('div');
//                 newGameContent.innerHTML = data;
        
//                 // Keep the existing content that you want to retain
//                 gameContainer.innerHTML = newGameContent.querySelector('.game-container').innerHTML;
        
//         document.querySelectorAll('.word').forEach(word => {
//             word.addEventListener('click', function () {
//                 selectedWord = this;
//                 highlight(this, 'word');
//             });
//         });

//         document.querySelectorAll('.definition').forEach(def => {
//             def.addEventListener('click', function () {
//                 selectedDefinition = this;
//                 highlight(this, 'definition');
//                 if (selectedWord && selectedDefinition) {
//                     drawLine(selectedWord, selectedDefinition);
//                     matches[selectedWord.dataset.word] = selectedDefinition.dataset.definition;
//                     selectedWord = null;
//                     selectedDefinition = null;
//                 }
//             });
//         });
//     });
// }

// Reset lines and selections
function resetLines() {
    lines.forEach(line => line.remove());
    lines.length = 0;
    matches = {};
    selectedWord = null;
    selectedDefinition = null;
    document.querySelectorAll('.word, .definition').forEach(el => el.style.backgroundColor = '');
}
