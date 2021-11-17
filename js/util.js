function printMat(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (let i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (let j = 0; j < mat[i].length; j++) {
            let cell = mat[i][j];
            let id = 'cell-' + i + '-' + j;
            let className = 'cell';
            strHTML += `<td onmouseup="onCellClick(${i}, ${j})" 
            oncontextmenu="return false" id="${id}" class="${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    let elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function renderCell(i, j, value) {
    let elCell = document.querySelector(`#cell-${i}-${j}`);
    elCell.innerHTML = value;
}

function getRandomIntInclusive(min, max) { //The maximum is inclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}