        // Game configuration
        const CONFIG = {
            technologies: [
                { name: 'angular', icon: 'devicon-angularjs-plain colored', displayName: 'Angular' },
                { name: 'vuejs', icon: 'devicon-vuejs-plain colored', displayName: 'Vue.js' },
                { name: 'css3', icon: 'devicon-css3-plain colored', displayName: 'CSS3' },
                { name: 'github', icon: 'devicon-github-original', displayName: 'GitHub' },
                { name: 'gulp', icon: 'devicon-gulp-plain colored', displayName: 'Gulp' },
                { name: 'html5', icon: 'devicon-html5-plain colored', displayName: 'HTML5' },
                { name: 'jest', icon: 'devicon-jest-plain colored', displayName: 'Jest' },
                { name: 'mongodb', icon: 'devicon-mongodb-plain colored', displayName: 'MongoDB' },
                { name: 'python', icon: 'devicon-python-plain colored', displayName: 'Python' },
                { name: 'react', icon: 'devicon-react-original colored', displayName: 'React' }
            ],
            flipDuration: 600,
            maxWrongTries: 20
        };

        // Sound configuration
        const SOUNDS = {
            welcome: ['welcome'],
            flip: ['flip'],
            win: ['win1', 'win2', 'win3'],      // For successful card matches
            fail: ['fail1', 'fail2', 'fail3'],  // For failed matches
            success: ['success1']               // For completing the entire game
        };

        // Game state
        let gameState = {
            playerName: 'Unknown',
            wrongTries: 0,
            startTime: null,
            flippedBlocks: [],
            matchedPairs: 0,
            totalPairs: CONFIG.technologies.length,
            isProcessing: false,
            blocks: [],
            soundEnabled: true
        };

        // DOM Elements
        const loadingScreen = document.querySelector('.loading-screen');
        const startScreen = document.querySelector('.start-screen');
        const gameUI = document.querySelector('.game-ui');
        const winScreen = document.querySelector('.win-screen');
        const resultsScreen = document.querySelector('.results-screen');
        const progressBar = document.querySelector('.progress');
        const progressText = document.querySelector('.loading-percentage');
        const playerNameInput = document.getElementById('player-name');
        const startButton = document.getElementById('start-game-btn');
        const playerNameSpan = document.getElementById('player-display');
        const wrongTriesSpan = document.getElementById('wrong-tries');
        const finalTriesSpan = document.getElementById('final-tries');
        const finalTimeSpan = document.getElementById('final-time');
        const playAgainButton = document.querySelector('.play-again');
        const newPlayerButton = document.querySelector('.new-player');
        const blocksContainer = document.querySelector('.memory-game-blocks');
        const soundToggle = document.getElementById('sound-toggle');
        const resultsToggle = document.getElementById('results-toggle');
        const resultsBody = document.getElementById('results-body');
        const clearResultsButton = document.getElementById('clear-results');
        const backToGameButton = document.querySelector('.back-to-game');
        const confirmationPopup = document.getElementById('confirmation-popup');
        const popupMessage = document.getElementById('popup-message');
        const popupConfirm = document.getElementById('popup-confirm');
        const popupCancel = document.getElementById('popup-cancel');

        // Sound management functions
        function playSound(soundType) {
            if (!gameState.soundEnabled) return;
            
            const soundIds = SOUNDS[soundType];
            if (!soundIds || soundIds.length === 0) return;
            
            // For single sounds, just play the first one
            if (soundType === 'welcome' || soundType === 'flip' || soundType === 'success') {
                const audio = document.getElementById(soundIds[0]);
                if (audio) {
                    audio.currentTime = 0;
                    audio.play().catch(e => console.log("Audio play failed:", e));
                }
            } 
            // For multiple sounds, pick a random one
            else {
                const randomIndex = Math.floor(Math.random() * soundIds.length);
                const audio = document.getElementById(soundIds[randomIndex]);
                if (audio) {
                    audio.currentTime = 0;
                    audio.play().catch(e => console.log("Audio play failed:", e));
                }
            }
        }

        // Initialize the game
        function init() {
            // Simulate loading assets
            simulateLoading();
            
            // Set up event listeners
            playerNameInput.addEventListener('input', validateName);
            startButton.addEventListener('click', startGame);
            playAgainButton.addEventListener('click', resetGame);
            newPlayerButton.addEventListener('click', newPlayer);
            soundToggle.addEventListener('click', toggleSound);
            resultsToggle.addEventListener('click', showResults);
            clearResultsButton.addEventListener('click', () => showPopup('clear'));
            backToGameButton.addEventListener('click', hideResults);
            popupConfirm.addEventListener('click', handlePopupConfirm);
            popupCancel.addEventListener('click', hidePopup);
            
            // Load results from localStorage
            loadResults();
        }

        // Show popup
        function showPopup(action) {
            if (action === 'clear') {
                popupMessage.textContent = 'Are you sure you want to clear all results?';
            }
            confirmationPopup.classList.add('show');
        }

        // Hide popup
        function hidePopup() {
            confirmationPopup.classList.remove('show');
        }

        // Handle popup confirmation
        function handlePopupConfirm() {
            clearResults();
            hidePopup();
        }

        // Toggle sound
        function toggleSound() {
            gameState.soundEnabled = !gameState.soundEnabled;
            soundToggle.classList.toggle('muted', !gameState.soundEnabled);
            
            const icon = soundToggle.querySelector('i');
            if (gameState.soundEnabled) {
                icon.className = 'fas fa-volume-up';
                // Play a test sound when enabling
                playSound('flip');
            } else {
                icon.className = 'fas fa-volume-mute';
            }
        }

        // Validate player name
        function validateName() {
            const name = playerNameInput.value.trim();
            if (name.length > 0) {
                startButton.disabled = false;
            } else {
                startButton.disabled = true;
            }
        }

        // Simulate loading assets with progress bar
        function simulateLoading() {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTimeout(() => {
                        loadingScreen.classList.add('hidden');
                        startScreen.classList.remove('hidden');
                    }, 500);
                }
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${Math.round(progress)}%`;
            }, 200);
        }

        // Start the game
        function startGame() {
            // Get player name
            const playerName = playerNameInput.value.trim() || 'Unknown';
            gameState.playerName = playerName;
            playerNameSpan.textContent = playerName;
            
            // Hide start screen and show game UI
            startScreen.classList.add('hidden');
            setTimeout(() => {
                gameUI.classList.add('visible');
            }, 300);
            
            // Play welcome sound
            playSound('welcome');
            
            // Initialize game board
            initializeGameBoard();
            
            // Start timer
            gameState.startTime = Date.now();
        }

        // Initialize the game board
        function initializeGameBoard() {
            // Reset game state
            gameState.wrongTries = 0;
            gameState.matchedPairs = 0;
            gameState.flippedBlocks = [];
            gameState.isProcessing = false;
            wrongTriesSpan.textContent = '0';
            
            // Clear the board
            blocksContainer.innerHTML = '';
            gameState.blocks = [];
            
            // Create game blocks
            const allBlocks = [];
            CONFIG.technologies.forEach(tech => {
                for (let i = 0; i < 2; i++) {
                    allBlocks.push({
                        name: tech.name,
                        icon: tech.icon,
                        displayName: tech.displayName
                    });
                }
            });
            
            // Shuffle blocks
            const shuffledBlocks = shuffleArray(allBlocks);
            
            // Create DOM elements for blocks
            shuffledBlocks.forEach((block, index) => {
                const blockElement = document.createElement('div');
                blockElement.className = 'game-block';
                blockElement.dataset.technology = block.name;
                blockElement.dataset.index = index;
                
                blockElement.innerHTML = `
                    <div class="face front"></div>
                    <div class="face back">
                        <i class="${block.icon}"></i>
                        <div class="tech-name">${block.displayName}</div>
                    </div>
                `;
                
                blockElement.addEventListener('click', () => flipBlock(blockElement));
                blocksContainer.appendChild(blockElement);
                gameState.blocks.push(blockElement);
            });
        }

        // Flip a block
        function flipBlock(block) {
            if (block.classList.contains('is-flipped') || 
                block.classList.contains('has-match') || 
                gameState.isProcessing ||
                gameState.flippedBlocks.length >= 2) {
                return;
            }
            
            // Play flip sound
            playSound('flip');
            
            block.classList.add('is-flipped');
            gameState.flippedBlocks.push(block);
            
            if (gameState.flippedBlocks.length === 2) {
                gameState.isProcessing = true;
                setTimeout(checkMatch, CONFIG.flipDuration / 2);
            }
        }

        // Check if flipped blocks match
        function checkMatch() {
            const [firstBlock, secondBlock] = gameState.flippedBlocks;
            
            if (firstBlock.dataset.technology === secondBlock.dataset.technology) {
                // Play match sound
                playSound('win');
                
                firstBlock.classList.add('has-match');
                secondBlock.classList.add('has-match');
                
                gameState.matchedPairs++;
                
                if (gameState.matchedPairs === gameState.totalPairs) {
                    setTimeout(endGame, CONFIG.flipDuration);
                }
            } else {
                // Play mismatch sound
                playSound('fail');
                
                gameState.wrongTries++;
                wrongTriesSpan.textContent = gameState.wrongTries;
                
                setTimeout(() => {
                    firstBlock.classList.remove('is-flipped');
                    secondBlock.classList.remove('is-flipped');
                }, CONFIG.flipDuration);
            }
            
            gameState.flippedBlocks = [];
            setTimeout(() => {
                gameState.isProcessing = false;
            }, CONFIG.flipDuration);
        }

        // End the game
        function endGame() {
            const endTime = Date.now();
            const timeTaken = Math.floor((endTime - gameState.startTime) / 1000);
            
            finalTriesSpan.textContent = gameState.wrongTries;
            finalTimeSpan.textContent = timeTaken;
            
            // Play win sound
            playSound('success');
            
            // Save the result
            saveResult(gameState.playerName, gameState.wrongTries, timeTaken);
            
            winScreen.classList.add('show');
        }

        // Save result to localStorage
        function saveResult(playerName, wrongTries, timeTaken) {
            const result = {
                playerName,
                wrongTries,
                timeTaken,
                date: new Date().toLocaleString()
            };
            
            let results = JSON.parse(localStorage.getItem('memoryGameResults')) || [];
            results.push(result);
            
            // Sort results by wrong tries (ascending), then by time (ascending)
            results.sort((a, b) => {
                if (a.wrongTries !== b.wrongTries) {
                    return a.wrongTries - b.wrongTries;
                }
                return a.timeTaken - b.timeTaken;
            });
            
            // Keep only top 20 results
            if (results.length > 20) {
                results = results.slice(0, 20);
            }
            
            localStorage.setItem('memoryGameResults', JSON.stringify(results));
            
            // Update the results table
            loadResults();
        }

        // Load results from localStorage
        function loadResults() {
            const results = JSON.parse(localStorage.getItem('memoryGameResults')) || [];
            resultsBody.innerHTML = '';
            
            if (results.length === 0) {
                resultsBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 20px;">
                            No results yet. Play a game to see your scores here!
                        </td>
                    </tr>
                `;
                return;
            }
            
            results.forEach((result, index) => {
                const row = document.createElement('tr');
                
                // Add special styling for top 3 players
                if (index === 0) {
                    row.classList.add('gold');
                } else if (index === 1) {
                    row.classList.add('silver');
                } else if (index === 2) {
                    row.classList.add('bronze');
                }
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${result.playerName}</td>
                    <td>${result.wrongTries}</td>
                    <td>${result.timeTaken}</td>
                    <td>${result.date}</td>
                `;
                
                resultsBody.appendChild(row);
            });
        }

        // Show results table
        function showResults() {
            loadResults();
            resultsScreen.classList.add('show');
        }

        // Hide results table
        function hideResults() {
            resultsScreen.classList.remove('show');
        }

        // Clear all results
        function clearResults() {
            localStorage.removeItem('memoryGameResults');
            loadResults();
        }

        // Reset the game
        function resetGame() {
            winScreen.classList.remove('show');
            initializeGameBoard();
            gameState.startTime = Date.now();
        }

        // Start with a new player
        function newPlayer() {
            winScreen.classList.remove('show');
            startScreen.classList.remove('hidden');
            gameUI.classList.remove('visible');
            playerNameInput.value = '';
            startButton.disabled = true;
        }

        // Utility function to shuffle array
        function shuffleArray(array) {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        }

        // Initialize the game when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);