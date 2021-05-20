'use strict'
const SPACE = ' ';
const EMPTY = '';
const MINE = '💥' // need to change
const FLAG = '🚩'
const EMOJI_SMILE = '😃'
const EMOJI_BLOWING = '🤯'
const EMOJI_SUNGLASSESS = '😎'

var gElEmoji = document.querySelector('.emoji')
var gElCountFlagsDown = document.querySelector('.flags')
var gElTime = document.querySelector('.time span')
var gHintToggle;
var gElLight;
var gElLives;
var gTimeInter;
var gBoard = []
var gMines = []
var gLevel = { SIZE: 4, MINES: 2 };
var gGame;
var gCountFlagsDown;



function getHint(elLight, board) {
    elLight.innerText = EMPTY;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (board[i][j].isMine && !board[i][j].isShown) {
                var elCell = document.getElementById(`cell-${i}-${j}`)
                gHintToggle = setInterval(function () {
                    elCell.classList.toggle('light-hint')
                }, 500);
            }
        }
    }
}

function countSeconds() {
    var seconds = gGame.secsPassed++
    var str = seconds.toString()
    var time = str.padStart(3, '00')
    gElTime.innerText = time
}

// open negs on empty cells - recursive
function openNegs(board, cellRowIdx, cellColIdx) {
    var cell = board[cellRowIdx][cellColIdx]
    for (var i = +cellRowIdx - 1; i <= +cellRowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = +cellColIdx - 1; j <= +cellColIdx + 1; j++) {
            if (i === +cellRowIdx && j === +cellColIdx) continue;
            if (j < 0 || j > board[i].length - 1) continue
            var elCell = document.getElementById(`cell-${+i}-${+j}`)
            getCoordsAndMarkOnCellClick(elCell, board)
        }
    }
}

// DOM - change the cell content the user see
function printCellContentOnBoard(board, i, j) {
    var cell = board[i][j]
    var elCell = document.querySelector(`#cell-${i}-${j}`)
    if (cell.isShown && !cell.isMine) {
        elCell.classList.add('cell-click')

        if (!(+cell.minesAroundCount)) {
            renderCell(i, j, EMPTY)
            openNegs(board, i, j)

        } else renderCell(i, j, cell.minesAroundCount);

    } else if (cell.isMarked) {
        renderCell(i, j, FLAG)
    } else if (!cell.isMarked && !cell.isMine) {
        renderCell(i, j, SPACE)
    } else if (cell.isMine) {
        renderCell(i, j, MINE);
    }

    return board;
}


function printAndUpdateModel(board, elCell, getCellIdxs) {
    var cellByIdxs = board[getCellIdxs.i][getCellIdxs.j]

    if (!gGame.isOn) return
    if ((!event.button || event.button === 2) && (!gGame.secsPassed)) {
        gGame.secsPassed += 1
        gTimeInter = setInterval(countSeconds, 1000);
        createMine(board, getCellIdxs.i, getCellIdxs.j)
        setCellsMinesNegs(board)
    }

    if (!event.button &&
        !cellByIdxs.isShown &&
        !cellByIdxs.isMarked &&
        !cellByIdxs.isMine) {
        //Model
        gGame.shownCount++;
        cellByIdxs.isShown = true


        //DOM
        printCellContentOnBoard(board, getCellIdxs.i, getCellIdxs.j)

        checkGameOver(board);

    } else if (!event.button &&
        !cellByIdxs.isShown &&
        !cellByIdxs.isMarked &&
        cellByIdxs.isMine) {
        // Model
        elCell.classList.add('cell-mine')
        gElLives = document.querySelector(`.live${gGame.lives}`)
        gElLives.innerText = '💔'
        gGame.lives--;
        gGame.stepOnMine++;
        checkGameOver(board)
        //DOM
        printCellContentOnBoard(board, getCellIdxs.i, getCellIdxs.j)
        if (!gGame.lives) gameOver(board)
    }

    if (event.button === 2 && !cellByIdxs.isMarked) {
        //Model
        cellByIdxs.isMarked = true
        gGame.markedCount++;
        gCountFlagsDown--

        //DOM
        gElCountFlagsDown.innerText = gCountFlagsDown;
        printCellContentOnBoard(board, getCellIdxs.i, getCellIdxs.j)

        checkGameOver(board);

    } else if (event.button === 2 && cellByIdxs.isMarked) {
        //Model
        cellByIdxs.isMarked = false
        gGame.markedCount--;
        gCountFlagsDown++

        //DOM
        printCellContentOnBoard(board, getCellIdxs.i, getCellIdxs.j)
        gElCountFlagsDown.innerText = gCountFlagsDown;
    }
}

function getCoordsAndMarkOnCellClick(elCell, board) { // when user click
    clearInterval(gHintToggle);
    var getCellIdxs = getIdxsById(elCell) // util
    printAndUpdateModel(board, elCell, getCellIdxs)
}


function gameOver(board) {
    clearInterval(gTimeInter)
    if (gGame.shownCount === ((gLevel.SIZE ** 2) - gLevel.MINES) &&
        (gGame.markedCount + gGame.stepOnMine) === gLevel.MINES) {
        gElEmoji.innerText = EMOJI_SUNGLASSESS;
        document.querySelector('.game-over').style.display = 'block'
    } else {
        gElEmoji.innerText = EMOJI_BLOWING;
        for (var i = 0; i < gLevel.SIZE; i++) {
            for (var j = 0; j < gLevel.SIZE; j++) {
                if (board[i][j].isMine) renderCell(i, j, MINE)
                if (board[i][j].isMine && board[i][j].isMarked) {
                    var elCell = document.getElementById(`cell-${i}-${J}`)
                    elCell.classList.add('.cell-mine')
                }
            }
        }
    }

    gGame.isOn = false;
}

function checkGameOver(board) {
    if (gGame.shownCount === ((gLevel.SIZE ** 2) - gLevel.MINES) &&
        (gGame.markedCount + gGame.stepOnMine) === gLevel.MINES) return gameOver(board);
}

//  change board size
function changeBoard(elBtn) {
    if (elBtn.innerText === '4') {
        gLevel = { SIZE: 4, MINES: 2 };
        gElCountFlagsDown.innerText = gLevel.MINES;
    } else if (elBtn.innerText === '8') {
        gLevel = { SIZE: 8, MINES: 12 };
        gElCountFlagsDown.innerText = gLevel.MINES;
    } else if (elBtn.innerText === '12') {
        gLevel = { SIZE: 12, MINES: 30 };
        gElCountFlagsDown.innerText = gLevel.MINES;
    }
    initGame()
}

// DOM
function renderBoard(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            renderCell(i, j, SPACE);
        }
    }
    return board;
}

// check mines negs
function setMinesNegsCount(board, cellRowIdx, cellColIdx) {
    var counterMinesNegs = 0
    for (var i = +cellRowIdx - 1; i <= +cellRowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = +cellColIdx - 1; j <= +cellColIdx + 1; j++) {
            if (i === +cellRowIdx && j === +cellColIdx) continue
            if (j < 0 || j > board[i].length - 1) continue
            if (board[i][j].isMine) counterMinesNegs++;
        }
    }
    return counterMinesNegs;
}

//update model mines negs
function setCellsMinesNegs(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j);
        }
    }
    return board;
}

function createMine(board, i, j) {
    var minesCount = 0;
    while (minesCount < gLevel.MINES) {
        var randI = +getRandomIntInclusive(0, gLevel.SIZE - 1)
        var randJ = +getRandomIntInclusive(0, gLevel.SIZE - 1)
        if (!board[randI][randJ].isMine) {
            if (i === randI && j === randJ) continue
            board[randI][randJ].isMine = true;
            minesCount++
        }
    }
    return board
}

// model
function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }

    return board;
}

function initBeforeGame() {
    clearInterval(gTimeInter)
    for (var i = 1; i <= 3; i++) {
        gElLight = document.querySelector(`.light${i}`)
        gElLives = document.querySelector(`.live${i}`)
        gElLight.innerText = '💡'
        gElLives.innerText = '❤️'
    }
    document.querySelector('.game-over').style.display = 'none'
    gElCountFlagsDown.innerText = gLevel.MINES
    gCountFlagsDown = gLevel.MINES
    gElEmoji.innerText = EMOJI_SMILE;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        stepOnMine: 0
    }
    gGame.isOn = true;
    gElTime.innerText = '000'
}

function initGame() {
    initBeforeGame()
    gBoard = buildBoard(gLevel.SIZE)
    printMat(gBoard, '.board-container')
    renderBoard(gBoard)
    console.table(gBoard)
}

















// ////////////////////////////////////////////

// function updateModel(board, i, j) {
//     var cell = board[i][j]
//     var elCell = document.querySelector(`#cell-${i}-${j}`)
//     if (cell.isShown && !cell.isMine) {
//         elCell.classList.add('cell-click')
//         if (!cell.minesAroundCount) {
//             renderCell(i, j, EMPTY)
//             openNegs(board, i, j)
//         }
//         else renderCell(i, j, cell.minesAroundCount);
//     } else if (cell.isMarked) {
//         renderCell(i, j, FLAG)
//     } else if (!cell.isMarked) renderCell(i, j, EMPTY)
//     return board;
// }