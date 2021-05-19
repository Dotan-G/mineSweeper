'use strict'
const EMPTY = ' ';
const MINE = '🤞' // need to change
const FLAG = '🚩'


var gBoard = []
var gMines = []
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame;


function initGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    document.querySelector('.game-over').style.display = 'none'
    gGame.isOn = true;
    gBoard = buildBoard(gLevel.SIZE)
    updateModelBoard(gBoard)
    printMat(gBoard, '.board-container')
    renderBoard(gBoard)
    console.table(gBoard)
}

// model
function buildBoard(size) {
    var board = [];
    var cell = {
        minesAroundCount: 0,
        isShown: true,
        isMine: false,
        isMarked: false
    }
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell;
            if ((i === 1 && j === 1) ||
                (i === 3 && j === 3)) {
                cell.isMine = true;
            }
        }
    }
    return board;
}

//update modelBoard
function updateModelBoard(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j);
        }
    }
    return board;
}

// DOM
function renderBoard(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (!board[i][j].isShown) renderCell(i, j, EMPTY);
        }
    }
    return board;
}



function markOnBoard(board, i, j) {
    var cell = board[i][j]
    if (cell.isShown && cell.isMine) {
        renderCell(i, j, MINE)
    } else if (cell.isShown && !cell.isMine) {
        if (!cell.minesAroundCount) renderCell(i, j, EMPTY);
        else renderCell(i, j, cell.minesAroundCount);
    } else if (cell.isMarked) {
        renderCell(i, j, FLAG)
    } else if (!cell.isMarked) renderCell(i, j, EMPTY)
    return board;
}



function mark(cellCoords, board, elCell) {
    var cellByIdxs = board[cellCoords.i][cellCoords.j]
    if (!gGame.isOn) return
    if (!event.button && !cellByIdxs.isShown && !cellByIdxs.isMarked) {
        //Model
        gGame.shownCount++;
        if (gGame.shownCount === 14 && gGame.markedCount === 2) won();
        cellByIdxs.isShown = true

        //DOM
        markOnBoard(board, cellCoords.i, cellCoords.j)
        elCell.classList.add('.cell-click')
    }
    if (!event.button && !cellByIdxs.isMarked && cellByIdxs.isMine) {
        elCell.style.backgroundColor = 'red';
        gameOver(board)
    }
    if (event.button === 2 && !cellByIdxs.isMarked) {

        //Model
        cellByIdxs.isMarked = true
        gGame.markedCount++;
        if (gGame.shownCount === 14 && gGame.markedCount === 2) won();

        //DOM
        markOnBoard(board, cellCoords.i, cellCoords.j)
    } else if (event.button === 2 && cellByIdxs.isMarked) {
        //Model
        cellByIdxs.isMarked = false
        gGame.markedCount--;

        //DOM
        markOnBoard(board, cellCoords.i, cellCoords.j)
    }
}

function setMinesNegsCount(board, cellRowIdx, cellColIdx) { // 1-3
    var counterMinesNegs = 0
    for (var i = cellRowIdx - 1; i <= cellRowIdx + 1; i++) { // 0-2
        if (i < 0 || i > board.length - 1) continue
        for (var j = cellColIdx - 1; j <= cellColIdx + 1; j++) { // 1-2
            if (i === cellRowIdx && j === cellColIdx) continue // 0-1(0), 0-2(0), 0-3(0)
            if (j < 0 || j > board[i].length - 1) continue
            if (board[i][j].isMine) counterMinesNegs++;
        }
    }
    return counterMinesNegs;
}

function getCoordsAndMark(elCell, board) {
    var cellCoords = getIdxsById(elCell)
    mark(cellCoords, board, elCell)
}

function getIdxsById(elCell) {
    var idArr = elCell.id.split('-')
    var cellIdxs = { i: idArr[1], j: idArr[2] }
    return cellIdxs
}


function gameOver(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (board[i][j].isMine) renderCell(i, j, MINE)
        }
    }
    gGame.isOn = false;
    document.querySelector('.game-over button').style.display = 'block'
}

function won() {
    gGame.isOn = false;
    document.querySelector('.game-over').style.display = 'block'
}







// function showMine(board) {
//     for (var i = 0; i < board.length; i++) {
//         for (var j = 0; j < board[i].length; j++) {
//             board[i][j] = cell;
//             if (cell.isShown && cell.isMine) {
//                 renderCell()
//             }
//         }
//     }
//     if (cell.isShown && cell.isMine) {
//         renderCell()
//     }
// }


// function createMine(rowIdx, colIdx) {
//     var mine = {
//         i: rowIdx,
//         j: colIdx
//     }
//     gMines.push(mine)
//     board[mine.i][mine.j] = MINE;
// }

// function createMines(board) {
//     gMines = []
//     createMine(1,1)
//     createMine(3,3)
// }
