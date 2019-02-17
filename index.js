const fs = require('fs');

let fileContents = fs.readFileSync('a_example.in', { encoding: 'utf8' });
let rows = fileContents.split('\n');
// Remove empty last row
rows.pop();
let firstRow = rows.shift();
let rowStuff = firstRow.split(' ');
const NUMBER_OF_ROWS = rowStuff[0];
const NUMBER_OF_COLUMNS = rowStuff[1];
const MIN_INGREDIENTS = rowStuff[2];
const MAX_CELLS = rowStuff[3];
rows = rows.map(row => row.split(''));

let data = [];
for (let index = 0; index < rows[0].length; index++) {
  data[index] = [];
  for (let index2 = 0; index2 < rows.length; index2++) {
    data[index][index2] = rows[index2][index];
  }
}

let newData = data.map(data => data.map(data => ({ patternID: 0 })));

const patterns = [
  [2, 1],
  [1, 2],
  [2, 2],
  [2, 3],
  [3, 2],
  [3, 1],
  [1, 3],
  [4, 1],
  [1, 4],
  [5, 1],
  [1, 5],
  [6, 1],
  [1, 6]
];

let numberOfPatternsFound = 0;

const tryPattern = (pattern, x, y) => {
  let M_FOUND = 0;
  let T_FOUND = 0;
  for (let col = 0; col < pattern[0]; col++) {
    for (let row = 0; row < pattern[1]; row++) {
      if (col + x > NUMBER_OF_COLUMNS - 1 || row + y > NUMBER_OF_ROWS - 1) return false;
      if (newData[x + col][y + row].patternID > 0) return false;
      if (data[x + col][y + row] === 'M') M_FOUND++;
      else T_FOUND++;
    }
  }
  if (M_FOUND >= MIN_INGREDIENTS && T_FOUND >= MIN_INGREDIENTS) {
    numberOfPatternsFound++;
    for (let col = 0; col < pattern[0]; col++) {
      for (let row = 0; row < pattern[1]; row++) {
        if (col + x > NUMBER_OF_COLUMNS - 1 || row + y > NUMBER_OF_ROWS - 1) return false;
        newData[x + col][y + row] = { patternID: numberOfPatternsFound, pattern, topLeft: { x, y } };
      }
    }
    return true;
  } else {
    return false;
  }
};

const findSolution = (x, y) => {
  for (let pattern of patterns) {
    if (tryPattern(pattern, x, y)) return true;
  }
  return false;
};

data.forEach((col, x) => {
  col.forEach((row, y) => {
    findSolution(x, y);
  });
});

const mergeFns = [
  // Left
  (x, y) => {
    if (x === 0) return false;
    let leftObj =  newData[x-1][y];
    if (leftObj.patternID === 0) return false;
    if (!patterns.some(pattern => pattern[0] === leftObj.pattern[0] + 1 && pattern[1] === leftObj.pattern[1])) return false;
    let length = leftObj.pattern[1];
    for (let index = leftObj.topLeft.y; index < leftObj.topLeft.y + leftObj.pattern[1]; index++) {
      if (newData[x][index].patternID > 0) return false;
    }
    newObject = leftObj;
    newObject.pattern[0] += 1;
    for (let colIndex = leftObj.topLeft.x; colIndex < leftObj.topLeft.x + leftObj.pattern[0] + 1; colIndex++) {
      for (let rowIndex = leftObj.topLeft.y; rowIndex < leftObj.topLeft.y + leftObj.pattern[1]; rowIndex++) {
        newData[colIndex][rowIndex] = newObject;
      }
    }
    return true;
  },
  // Up
  /*(x, y) => {

  },
  // Right
  (x, y) => {

  },
  // Down
  (x, y) => {

  }*/
];

const tryMerge = (x, y) => {
  for (let fn of mergeFns) {
    if (fn(x, y)) return;
  }
};

data.forEach((col, x) => {
  col.forEach((row, y) => {
    if (newData[x][y].patternID === 0) tryMerge(x, y);
  });
});





console.log(numberOfPatternsFound);
