const SPACE = ' ';
const EMPTY = '';
const MINE = '💥';
const FLAG = '🚩';
const EMOJI_SMILE = '😃';
const EMOJI_BLOWING = '🤯';
const EMOJI_SUNGLASSES = '😎';

let gLevel = { SIZE: 4, MINES: 2 };
let gTimeInter;
let gBoard = [];
let gMines = [];
let gGameSetting;
let gSafeClick = 3;
let gFlagsDownCount;
let gFlowOfGame = [];
let gElEmoji;
let gElTime;
let gElFlagsDownCount;
let gElHint;
let gElGameOver;
let gElSafeClick;

function init() {
    clearInterval(gTimeInter);
    initialGame();
    gBoard = buildBoard(gLevel.SIZE);
    printMat(gBoard, '.board-container');
    renderBoard(gBoard);
    getBestScore();
}

function initialGame() {
    resetGameSetting();
    getLivesAndHints(gGameSetting);
    gFlagsDownCount = gLevel.MINES; // Model
    gElFlagsDownCount = document.querySelector('.flags');
    gElFlagsDownCount.innerText = gFlagsDownCount; // DOM
    gElEmoji = document.querySelector('.emoji');
    gElEmoji.innerText = EMOJI_SMILE;
    gElTime = document.querySelector('.time span');
    gElTime.innerText = '000';
    gElGameOver = document.querySelector('.game-over')
    gElGameOver.classList.remove('flex', 'justify-center', 'align-center');
    gElSafeClick = document.querySelector('.safe-click');
    gElSafeClick.disabled = false;
    gFlowOfGame = [];
}

function resetGameSetting() {
    return gGameSetting = {
        // isOn: false,
        isOn: true,
        isHint: false,
        shownCells: 0,
        flaggedCells: 0,
        secsPassed: 0,
        stepOnMine: 0,
        lives: 3,
        hints: 3,
        safeClick: 3
    };
    // gGameSetting.isOn = true;
}


// model
function buildBoard(size) {
    let board = [];
    for (let i = 0; i < size; i++) {
        board[i] = [];
        for (let j = 0; j < size; j++) {
            board[i][j] = {
                minesAround: 0,
                isShown: false,
                isMine: false,
                isFlagged: false
            };
        };
    };
    return board;
}

// DOM
function renderBoard(board, ev) {
    let cell;
    let elCell;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            cell = board[i][j];
            elCell = document.getElementById('cell-' + i + '-' + j)
            if (cell.isShown) {
                if (cell.isMine) {
                    renderCell(i, j, MINE)
                    elCell.classList.add('cell-mine')
                } else if (!cell.minesAround && !cell.isMine) {
                    renderCell(i, j, EMPTY)
                    elCell.classList.add('cell-open')
                } else if (cell.minesAround) {
                    renderCell(i, j, cell.minesAround)
                    elCell.classList.add('cell-open')
                }
            } else if (cell.isFlagged) {
                renderCell(i, j, FLAG)
                elCell.classList.remove('cell-mine', 'cell-open')
            } else {
                renderCell(i, j, SPACE);
                elCell.classList.remove('cell-mine', 'cell-open')
            }
        };
    };
    return board;
}

function onGameStart(board, i, j) {
    createMine(board, i, j)
    setCellsMinesNeigs(board)
    gGameSetting.secsPassed += 1
    gTimeInter = setInterval(countSeconds, 1000);
}


function onCellClick(i, j) {
    let hintCheck = false;
    let gameSetting = getGameSetting();
    if (!gameSetting.isOn) return;
    let board = getBoard();
    let cell = board[i][j];
    if (cell.isShown) return;
    if (cell.isFlagged && !event.button) return;
    if ((!event.button || event.button === 2)
        && (!gameSetting.secsPassed)) onGameStart(board, i, j);
    let flowOfGame = getFlowOfGame();
    if (!cell.minesAround && !cell.isMine || gameSetting.isHint) {
        flowOfGame.push({ i, j, otherCellsOpened: [] });
        if (gameSetting.isHint) hintCheck = true; // if hints it will not check gameover()
    } else flowOfGame.push({ i, j })
    revelCell(board, i, j);
    renderBoard(board);
    updateGameSettingModel();
    getLivesAndHints(gameSetting)
    if (!hintCheck) {
        if (!gameSetting.lives) gameOver(board);
        else if (gameSetting.shownCells === ((gLevel.SIZE ** 2) - gLevel.MINES)
            && (gameSetting.stepOnMine + gameSetting.flaggedCells) === gLevel.MINES
            && gameSetting.flaggedCells >= 0) {
            gameOver(board, true);
        }
    }
}

function showNeigs(board, cellRowIdx, cellColIdx) {
    let flowOfGame = getFlowOfGame();
    let hintCheck = false;
    for (let i = cellRowIdx - 1; i <= cellRowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (let j = cellColIdx - 1; j <= cellColIdx + 1; j++) {
            if (i === cellRowIdx && j === cellColIdx) continue;
            if (j < 0 || j > board[i].length - 1) continue;
            if (board[i][j].isShown) continue;
            if (board[i][j].isFlagged) continue;
            let gameSetting = getGameSetting()
            if (gameSetting.isHint) {
                hintCheck = true;
                flowOfGame[flowOfGame.length - 1].otherCellsOpened.push({ i, j });
                board[i][j].isShown = true;
                // renderBoard(board);
                turnOffHintTimeout()
            } else {
                flowOfGame[flowOfGame.length - 1].otherCellsOpened.push({ i, j });
                // board[i][j].isShown = true;
                revelCell(board, i, j, hintCheck);
            }
        }
    }
}

function revelCell(board, i, j, hintCheck) {
    let cell = board[i][j];
    let gameSetting = getGameSetting();
    if (event.button === 2) {
        return cell.isFlagged = !cell.isFlagged
    }
    cell.isShown = true;
    if (gameSetting.isHint) return showNeigs(board, i, j);
    if (!cell.minesAround && !cell.isMine && !hintCheck) return showNeigs(board, i, j);
}

function onUndo() {
    let flowOfGame = getFlowOfGame();
    if (!flowOfGame.length) return;
    let board = getBoard()
    let idx = flowOfGame.length - 1;
    if (flowOfGame[idx].otherCellsOpened && flowOfGame[idx].otherCellsOpened.length > 0) {
        let { i, j, otherCellsOpened } = flowOfGame[idx];
        hideCell(board, i, j, otherCellsOpened);
    } else {
        let { i, j } = flowOfGame[idx];
        hideCell(board, i, j);
    }
    flowOfGame.pop()
    renderBoard(board);
    updateGameSettingModel();
    getLivesAndHints(gGameSetting);
}

function hideCell(board, i, j, otherCellsOpened) {
    let cell;
    if (Array.isArray(otherCellsOpened) && otherCellsOpened.length) {
        while (otherCellsOpened.length) {
            let { i, j } = otherCellsOpened[otherCellsOpened.length - 1];
            let cellX = board[i][j];
            otherCellsOpened.pop();
            cellX.isShown = false;
        }
    }
    cell = board[i][j];
    cell.isShown ? cell.isShown = false : cell.isFlagged = false;
    // cell.isShown = false;
}

function onGetHint(elHint) {
    gElHint = elHint || gElHint;
    let gameSetting = getGameSetting();
    elHint.style.backgroundColor = 'green';
    gameSetting.isHint = true;
    gameSetting.hints--
    return;
}
function turnOffHintTimeout() {
    let gameSetting = getGameSetting();
    gameSetting.isHint = false;
    return setTimeout(() => {
        onUndo()
        gElHint.style.backgroundColor = 'transparent';
    }, 1000);
}

function createMine(board, i, j) {
    let minesCounts = 0;
    while (minesCounts < gLevel.MINES) {
        let randI = +getRandomIntInclusive(0, gLevel.SIZE - 1)
        let randJ = +getRandomIntInclusive(0, gLevel.SIZE - 1)
        if (randI === i && randJ === j) continue
        if (board[randI][randJ].isMine) continue
        board[randI][randJ].isMine = true;
        minesCounts++
    }
    return board
}

//update model mines Neigs
function setCellsMinesNeigs(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            board[i][j].minesAround = getMinesNeigsCount(board, i, j);
        }
    }
    return board;
}

// check mines Neigs
function getMinesNeigsCount(board, cellRowIdx, cellColIdx) {
    let counterMinesNeigs = 0
    for (let i = cellRowIdx - 1; i <= cellRowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (let j = cellColIdx - 1; j <= cellColIdx + 1; j++) {
            if (i === cellRowIdx && j === cellColIdx) continue
            if (j < 0 || j > board[i].length - 1) continue
            if (board[i][j].isMine) counterMinesNeigs++;
        }
    }
    return counterMinesNeigs;
}

function updateGameSettingModel() {
    const board = getBoard();
    const gameSetting = getGameSetting();
    gameSetting.shownCells = 0;
    gameSetting.flaggedCells = 0;
    gameSetting.stepOnMine = 0;
    gFlagsDownCount = gLevel.MINES;
    gameSetting.lives = 3;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (board[i][j].isShown) {
                if (board[i][j].isMine) { //&& !gameSetting.isHint
                    gameSetting.stepOnMine++
                    gameSetting.lives--;
                } else gameSetting.shownCells++;
            }
            if (board[i][j].isFlagged) {
                gameSetting.flaggedCells++
            };
            gElFlagsDownCount.innerText = gFlagsDownCount - gameSetting.flaggedCells;
        }
    }
}

function gameOver(board, win) {
    clearInterval(gTimeInter)
    const gameSetting = getGameSetting()
    if (win) {
        let scoreFromStorage = JSON.parse(localStorage.getItem('bestScore')) || [];
        console.log(scoreFromStorage);
        if (!scoreFromStorage.length) {
            scoreFromStorage.push({ boardSize: gLevel.SIZE, score: gameSetting.secsPassed })
            localStorage.setItem('bestScore', JSON.stringify(scoreFromStorage))
        } else {
            console.log('else');
            for (let i = 0; i < scoreFromStorage.length; i++) {
                const obj = scoreFromStorage[i];
                if (gLevel.SIZE === obj.boardSize) {
                    if (gameSetting.secsPassed < obj.score) {
                        scoreFromStorage.splice(i, 1, { boardSize: gLevel.SIZE, score: gameSetting.secsPassed });
                    };
                } else {
                    scoreFromStorage.push({ boardSize: gLevel.SIZE, score: gameSetting.secsPassed })
                };
                localStorage.setItem('bestScore', JSON.stringify(scoreFromStorage))
            }
        }
        gElEmoji.innerText = EMOJI_SUNGLASSES;
        gElGameOver.classList.add('flex', 'justify-center', 'align-center');
        getBestScore()
    } else {
        blowMines(board);
        gElEmoji.innerText = EMOJI_BLOWING;
    }
    gameSetting.isOn = false;
}
function blowMines(board) {
    for (let i = 0; i < gLevel.SIZE; i++) {
        for (let j = 0; j < gLevel.SIZE; j++) {
            let cell = board[i][j];
            if (cell.isMine && !cell.isShown) renderCell(i, j, MINE)
            if (cell.isMine && board[i][j].isMarked) {
                let elCell = document.getElementById(`cell-${i}-${j}`)
                elCell.classList.add('.cell-mine')
            }
        }
    }
}

function onChangeBoard(size) {
    if (size === 4) {
        gLevel = { SIZE: 4, MINES: 2 };
    } else if (size === 8) {
        gLevel = { SIZE: 8, MINES: 12 };
    } else if (size === 12) {
        gLevel = { SIZE: 12, MINES: 30 };
    }
    gElFlagsDownCount.innerText = gLevel.MINES;
    init()
}

function countSeconds() {
    let seconds = gGameSetting.secsPassed++
    let str = seconds.toString()
    let time = str.padStart(3, '00')
    gElTime.innerText = time
}

function getLivesAndHints(game) {
    document.querySelector('.features .lives').innerHTML = getLives(game);
    document.querySelector('.features .hints').innerHTML = getHints(game);
    return
}
function getLives(game) {
    let strHTMLs = '';
    for (let i = 0; i < game.lives; i++) {
        strHTMLs += `<div class="live live${i + 1}">❤️</div>`;
    }
    return strHTMLs
}
function getHints(game) {
    let strHTMLs = '';
    for (let i = 0; i < game.hints; i++) {
        strHTMLs += `<div class="hint hint${i + 1}" onclick="onGetHint(this)">💡</div>`;
    };
    return strHTMLs;
}
function getBestScore() {
    let scoreFromStorage = JSON.parse(localStorage.getItem('bestScore')) || []
    for (let i = 0; i < scoreFromStorage.length; i++) {
        const obj = scoreFromStorage[i];
        if (gLevel.SIZE === obj.boardSize) {
            return document.querySelector('.best-score span').innerText = ` ${obj.score} seconds`;
        }
    }
    return document.querySelector('.best-score span').innerText = '';
}

function getBoard() {
    return gBoard
}
function getFlowOfGame() {
    return gFlowOfGame
}
function getGameSetting() {
    return gGameSetting
}

function onSafeClick(elSafeClick) {
    let board = getBoard()
    let gameSetting = getGameSetting()
    let i;
    let j;
    let keepLoop = true;
    while (keepLoop) {
        i = +getRandomIntInclusive(0, gLevel.SIZE - 1)
        j = +getRandomIntInclusive(0, gLevel.SIZE - 1)
        if (board[i][j].isMine || board[i][j].isShown || board[i][j].isFlagged) continue;
        keepLoop = false;
        gameSetting.safeClick--
        if (!gameSetting.safeClick) elSafeClick.disabled = true;
    };
    let intervalId = setInterval(() => {
        document.querySelector(`#cell-${i}-${j}`).classList.toggle('cell-safe');
    }, 250);
    setTimeout(() => {
        clearInterval(intervalId)
    }, 2100);
}