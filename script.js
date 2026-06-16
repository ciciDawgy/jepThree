const gridContainer = document.querySelector('.grid-container');
const gridItems= document.querySelectorAll('.grid-item');
const active = document.querySelector('.active');
const modal = document.querySelector('.modal');
const modalBackDrop = document.querySelector('.modalBackDrop');
const modalContent = document.querySelector('.modalContent');
const modalContentP = document.querySelector('.modalContent p');
const removeModal = document.querySelector('.fa-x');
const nextBtn = document.querySelector('.fa-arrow-right');
const show = document.querySelector('.show');
const gridItemHead = document.querySelectorAll('.grid-item.head');
const para = document.querySelectorAll('.para');
const modalp = document.querySelector('.modal p');
const close = document.querySelector('.close');
const turn = document.querySelector('.turn');
const scoreDisplay = document.getElementById('score');
const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const score3 = document.getElementById('score3');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');


// 2. RUNTIME GAME VARIABLES
let activeGamePlayersCount = 1;         
let currentClueValueStore = 0; 
let currentCorrectAnswer = ""; 
let currentTargetTileElement = null; 
let currentPlayer = 1;

// 3. INITIALIZE INTERFACE HOOKS DYNAMICALLY ON RUNTIME
document.addEventListener("DOMContentLoaded", () => {
    buildSetupOverlay();
    buildScoreboardMarkup();
    setPlayerCount(1); // Instantiate setup field maps
    setupTwoWayFlipping(); // Initialize two-way card flipping listeners
});

// 4. PROGRAMMATICALLY INJECT SETUP OVERLAY MARKUP
function buildSetupOverlay() {
    const setupScreen = document.createElement('div');
    setupScreen.id = 'setup-screen';
    setupScreen.className = 'setup-overlay';
    setupScreen.innerHTML = `
        <div class="setup-box">
            <h2>JEOPARDY SETUP</h2>  
            <p>Select Number of Players:</p>
            <div class="setup-buttons">
                <button type="button" id="btn-count-1" class="select-btn" onclick="setPlayerCount(1)">1 Player</button>
                <button type="button" id="btn-count-2" class="select-btn" onclick="setPlayerCount(2)">2 Players</button>
                <button type="button" id="btn-count-3" class="select-btn" onclick="setPlayerCount(3)">3 Players</button>
            </div>
            <input type="text" id="p1-input" class="setup-input" placeholder="Player 1 Name">
            <input type="text" id="p2-input" class="setup-input" placeholder="Player 2 Name" style="display:none;">
            <input type="text" id="p3-input" class="setup-input" placeholder="Player 3 Name" style="display:none;">
            <button type="button" id="start-game-btn" onclick="startGame()">START GAME</button>
        </div>
    `;
    document.body.appendChild(setupScreen);
}

// 5. PROGRAMMATICALLY INJECT SCOREBOARD BAR MARKUP
function buildScoreboardMarkup() {
    const boardWrap = document.createElement('div');
    boardWrap.className = 'players';
    boardWrap.innerHTML = `
        <div id="p1-panel" style="border: 4px solid transparent; padding: 10px; border-radius: 5px; transition: all 0.4s;">
            <span id="p1-name-display">Player 1</span>: $<span id="score1">0</span>
        </div>
        <div id="p2-panel" style="border: 4px solid transparent; padding: 10px; border-radius: 5px; display: none; transition: all 0.4s;">
            <span id="p2-name-display">Player 2</span>: $<span id="score2">0</span>
        </div>
        <div id="p3-panel" style="border: 4px solid transparent; padding: 10px; border-radius: 5px; display: none; transition: all 0.4s;">
            <span id="p3-name-display">Player 3</span>: $<span id="score3">0</span>
        </div>
    `;
    document.body.appendChild(boardWrap);
}

// 6. TOGGLE PLAYER QUANTITY FIELDS ON SETUP CLICK
window.setPlayerCount = function(count) {
    activeGamePlayersCount = count;
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.backgroundColor = '#000088';
        btn.style.color = '#fff';
    });
    const currentBtn = document.getElementById(`btn-count-${count}`);
    if (currentBtn) {
        currentBtn.classList.add('active');
        currentBtn.style.backgroundColor = '#FFCC00';
        currentBtn.style.color = '#000';
    }
    if(document.getElementById('p1-input')) document.getElementById('p1-input').style.display = 'block';
    if(document.getElementById('p2-input')) document.getElementById('p2-input').style.display = count >= 2 ? 'block' : 'none';
    if(document.getElementById('p3-input')) document.getElementById('p3-input').style.display = count === 3 ? 'block' : 'none';
};

// 7. REMOVE OVERLAY ELEMENT LAYERS AND UNLOCK CLICK LIGHTBOX INTERACTION
window.startGame = function() {
    const name1 = document.getElementById('p1-input').value.trim() || "Player 1";
    const name2 = document.getElementById('p2-input').value.trim() || "Player 2";
    const name3 = document.getElementById('p3-input').value.trim() || "Player 3";

    document.getElementById('p1-name-display').textContent = name1;
    document.getElementById('p2-name-display').textContent = name2;
    document.getElementById('p3-name-display').textContent = name3;

    document.getElementById('p1-panel').style.display = 'block';
    document.getElementById('p2-panel').style.display = activeGamePlayersCount >= 2 ? 'block' : 'none';
    document.getElementById('p3-panel').style.display = activeGamePlayersCount === 3 ? 'block' : 'none';

    const setupScreen = document.getElementById('setup-screen');
    if (setupScreen) {
        setupScreen.style.display = 'none';
    }

    currentPlayer = 1;
    updateActiveIndicatorGlowStyles();
    setupGridListeners(); // Unlock board cells now that the game has officially begun
};

// 8. SETUP BOARD CLICK LISTENERS AFTER GAME START
function setupGridListeners() {
    gridItems.forEach(gridItem => {
        gridItem.addEventListener('click', () => {
       
            if (gridItem.classList.contains('played')) return;
            
            /*currentTargetTileElement = gridItem; */
            modalBackDrop.classList.add('active');
            if (modalContent) modalContent.classList.remove('flip'); 

            const question = gridItem.getAttribute('data-question');
            const options = gridItem.getAttribute('data-options').split('|'); 
            currentCorrectAnswer = gridItem.getAttribute('data-answer');
            currentClueValueStore = parseInt(gridItem.getAttribute('data-value'));

            if (questionEl) questionEl.textContent = question;
            if (optionsEl) {
                optionsEl.innerHTML = '';

                options.forEach(option => {
                    const list = document.createElement('li');
                    
                    // Create an input radio wrapper to match your original styling intent
                    list.innerHTML = `<label><input type="radio" name="jeopardy-choice" value="${option}"> ${option}</label>`; 
                    list.innerHTML = `<input type="radio" name="jeopardy-choice" value="${option}"> <span>${option}</span>`;

                    list.style.cursor = 'pointer';
                    
                    // Handle option picking interaction
                    list.onclick = () => {
                        
                        const score1 = document.getElementById('score1');
                        const score2 = document.getElementById('score2');
                        const score3 = document.getElementById('score3');
                        
                        if (option === currentCorrectAnswer) {
                            // Correct answer logic: Add points and KEEP turn
                            if (currentPlayer === 1 && score1) {
                                score1.textContent = parseInt(score1.textContent) + currentClueValueStore;
                            } else if (currentPlayer === 2 && score2) {
                                score2.textContent = parseInt(score2.textContent) + currentClueValueStore;
                            } else if (currentPlayer === 3 && score3) {
                                score3.textContent = parseInt(score3.textContent) + currentClueValueStore;
                            }
                        } else {
                            // Incorrect answer logic: Notify and CHANGE turn
                            
                            // Cycle turns back through active player count bounds
                               currentPlayer = (currentPlayer % activeGamePlayersCount) + 1;
                        } 
                        

                        // Update the glowing box on the scoreboard to match who owns the next turn
                        updateActiveIndicatorGlowStyles();

                        // Visual clean up of spent board cell tiles
                        gridItem.classList.add('played');
                        gridItem.style.pointerEvents = 'none';
                        gridItem.style.color = '#0000ff';
                        gridItem.style.border = 'none';
                        gridItem.style.textShadow = "none";
                        gridItem.innerText = ""; 

                        // Visual clean up of spent board cell tiles

                        
                        closeModal();

                    };
                    optionsEl.appendChild(list);
                });
            }
        });
    });
} 

/*
function setupTwoWayFlipping() {
    const flipArrows = document.querySelectorAll('.fa-arrow-right');
    if (flipArrows.length > 0 && modalContent) {
        flipArrows.forEach(arrow => {
            arrow.addEventListener('click', () => {
                if (modalContent.classList.contains('flip')) {
                    modalContent.classList.remove('flip'); // Flip back to front
                } else {
                    modalContent.classList.add('flip'); // Flip to back options
                }
            });
        });
    }
} */

nextBtn.addEventListener('click', () => {
   modalContent.classList.toggle('flip') 
}) 

turn.addEventListener('click', () => {
    modalContent.classList.remove('flip')
}) 

// 10. HELPER UI METHODS
function closeModal() {
    if (modalBackDrop) modalBackDrop.classList.remove('active');
    if (modalContent) modalContent.classList.remove('flip');
}

function updateActiveIndicatorGlowStyles() {
    const p1 = document.getElementById('p1-panel');
    const p2 = document.getElementById('p2-panel');
    const p3 = document.getElementById('p3-panel');
    
    if(p1) p1.style.borderColor = currentPlayer === 1 ? '#FFCC00' : 'transparent';
    if(p2) p2.style.borderColor = currentPlayer === 2 ? '#FFCC00' : 'transparent';
    if(p3) p3.style.borderColor = currentPlayer === 3 ? '#FFCC00' : 'transparent';
}

setupTwoWayFlipping();


let score = 0


gridItems.forEach(gridItem => {
    gridItem.addEventListener('click', () => {
        modalBackDrop.classList.add('active')
            const question = gridItem.getAttribute('data-question');
           const options = gridItem.getAttribute('data-options').split('|'); 
            const answer = gridItem.getAttribute('data-answer');
            const value = parseInt(gridItem.getAttribute('data-value'));

                questionEl.textContent = question;
                optionsEl.innerHTML = '';

                options.forEach(option => {
                    const list = document.createElement('li');
                    list.textContent = option; 
                    list.style.input
                    list.onclick = () => {
                       modalContent.classList.remove('flip')
                        if (option === answer) {
                            if (currentPlayer === 1) {
                                score1.textContent = parseInt(score1.textContent) + value;
                            } else if (currentPlayer === 2) {
                                score2.textContent = parseInt(score2.textContent) + value;
                            } else if (currentPlayer === 3) {
                                score3.textContent = parseInt(score3.textContent) + value;
                            }
                        }

                        currentPlayer = currentPlayer % 3 + 1;
                        gridItem.style.pointerEvents = 'none';
                        gridItem.style.color = '#0000ff';
                        gridItem.style.border = 'none';
                        gridItem.style.textShadow = "none";
                         if (modalContent) modalContent.classList.remove('flip');
                        closeModal();
                    };
                    optionsEl.appendChild(list);
                });

                openModal();
            });
        });


        function closeModal() {
            modalBackDrop.classList.remove('active');
        } 
    /*
       function setupTwoWayFlipping() {
        const flipArrows = document.querySelectorAll('.fa-arrow-right');
        if (flipArrows.length > 0 && modalContent) {
            flipArrows.forEach(arrow => {
                arrow.addEventListener('click', () => {
                    if (modalContent.classList.contains('flip')) {
                        modalContent.classList.remove('flip'); // Flip back to front
                    } else {
                        modalContent.classList.add('flip'); // Flip to back options
                    }
                });
        });
    }
} */

    /*
document.getElementById('start-game-btn').addEventListener('submit', function(event) {
   event.preventDefault();

  const grid_container_show  = document.querySelector('.grid-container');
  const show = document.querySelector('.show');
    grid_container_show.classList.add('.show');
 
  */



removeModal.addEventListener('click', () => {
    modalBackDrop.classList.remove('active')
}) 


// NEED TO PREVENT DOUBLE CLICKING
removeModal.addEventListener('dblclick', function(event) {
    event.preventDefault()
  }); 


removeModal.addEventListener('dblclick', removeModalOnClick); 

nextBtn.addEventListener('click', () => {
   modalContent.classList.add('flip') 
}) 


turn.addEventListener('click', () => {
    modalContent.classList.remove('flip')
})  


close.addEventListener('click', () => {
    modalBackDrop.classList.remove('active')
}) 
