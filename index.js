var bresenhamCircle = function (origin, radius) {
    var points = [];
    var x = 0;
    var y = radius;
    var d = 3 - (2 * radius);
    points.push({ x: origin.x + x, y: origin.y + y }, { x: origin.x + x, y: origin.y - y }, { x: origin.x - x, y: origin.y - y }, { x: origin.x - x, y: origin.y + y }, { x: origin.x + y, y: origin.y + x }, { x: origin.x + y, y: origin.y - x }, { x: origin.x - y, y: origin.y - x }, { x: origin.x - y, y: origin.y + x });
    while (y >= x) {
        x++;
        if (d > 0) {
            y--;
            d = d + 4 * (x - y) + 10;
        }
        else {
            d = d + 4 * x + 6;
        }
        points.push({ x: origin.x + x, y: origin.y + y }, { x: origin.x + x, y: origin.y - y }, { x: origin.x - x, y: origin.y - y }, { x: origin.x - x, y: origin.y + y }, { x: origin.x + y, y: origin.y + x }, { x: origin.x + y, y: origin.y - x }, { x: origin.x - y, y: origin.y - x }, { x: origin.x - y, y: origin.y + x });
    }
    return points;
};
var clickedCheckboxes = [];
var CHECKBOX_SIZE = 12;
var container = document.querySelector('.container');
var containerRect = container.getBoundingClientRect();
var numRows = Math.floor(containerRect.height / CHECKBOX_SIZE);
var numCols = Math.floor(containerRect.width / CHECKBOX_SIZE);
var checkboxes = [];
var init = function () {
    var containerEl = document.querySelector('.container');
    for (var row = 0; row < numRows; row++) {
        var rowEl = document.createElement('div');
        var className = document.createAttribute('class');
        className.value = 'row';
        rowEl.setAttributeNode(className);
        var rowCheckboxes = [];
        for (var col = 0; col < numCols; col++) {
            var checkboxEl = document.createElement('input');
            var inputType = document.createAttribute('type');
            inputType.value = 'checkbox';
            checkboxEl.setAttributeNode(inputType);
            rowEl.appendChild(checkboxEl);
            rowCheckboxes.push(checkboxEl);
        }
        containerEl.appendChild(rowEl);
        checkboxes.push(rowCheckboxes);
    }
    containerEl.addEventListener("click", function (e) {
        clickedCheckboxes.push({
            origin: {
                y: Math.floor((e.clientY - containerRect.top) / CHECKBOX_SIZE),
                x: Math.floor((e.clientX - containerRect.left) / CHECKBOX_SIZE)
            },
            timestamp: Date.now(),
            lifespan: Math.random() * 4500 + 500
        });
    });
};
var TICK_LENGTH = 250; // ms
var begin = Date.now();
var checkedBoxesInPreviousFrame = {};
init();
setInterval(function () {
    var checkedBoxesInThisFrame = {};
    for (var i = 0; i < clickedCheckboxes.length;) {
        var checkbox = clickedCheckboxes[i];
        var age = Date.now() - checkbox.timestamp;
        if (age > checkbox.lifespan) {
            clickedCheckboxes.splice(i, 1);
            continue;
        }
        var radius = Math.floor(age / TICK_LENGTH);
        var points = [];
        if (radius > 0) {
            points = bresenhamCircle(checkbox.origin, radius);
        }
        else {
            if (!checkedBoxesInThisFrame[checkbox.origin.y]) {
                checkedBoxesInThisFrame[checkbox.origin.y] = {};
            }
            checkedBoxesInThisFrame[checkbox.origin.y][checkbox.origin.x] = true;
        }
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var p = points_1[_i];
            if (p.y < 0 || p.y >= numRows || p.x < 0 || p.x >= numCols) {
                continue;
            }
            if (!checkedBoxesInThisFrame[p.y]) {
                checkedBoxesInThisFrame[p.y] = {};
            }
            checkedBoxesInThisFrame[p.y][p.x] = true;
            var checkbox_1 = checkboxes[p.y][p.x];
            if (checkbox_1) {
                checkbox_1.checked = true;
            }
        }
        i++;
    }
    for (var _a = 0, _b = Object.keys(checkedBoxesInPreviousFrame); _a < _b.length; _a++) {
        var row = _b[_a];
        for (var _c = 0, _d = Object.keys(checkedBoxesInPreviousFrame[row]); _c < _d.length; _c++) {
            var column = _d[_c];
            if (checkedBoxesInThisFrame[row] && checkedBoxesInThisFrame[row][column]) {
                continue;
            }
            var checkbox = checkboxes[row][column];
            if (checkbox) {
                checkbox.checked = false;
            }
        }
    }
    checkedBoxesInPreviousFrame = checkedBoxesInThisFrame;
}, TICK_LENGTH);
