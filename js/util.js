function printMat(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var id = 'cell-' + i + '-' + j
            var className = 'cell';
            strHTML += `<td onmouseup="getCoordsAndMark(this, gBoard)"  id="${id}" class=" ${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function renderCell(i, j, value) {
    var elCell = document.querySelector(`#cell-${i}-${j}`);
    elCell.innerHTML = value;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function getEmptyCells(board) {
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j] === EMPTY) {
                var obj = { i, j }
                console.log(obj)
                emptyCells.push(obj)
                console.log(emptyCells)
            }
        }
    }
    return emptyCells
}
