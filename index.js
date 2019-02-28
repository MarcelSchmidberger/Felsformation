const fs = require('fs');

let fileContents = fs.readFileSync('c_memorable_moments.txt', { encoding: 'utf8' });
let lines = fileContents.split('\n');
let firstLine = lines.shift();
let data = lines.map(line => {
  let splitLine = line.split(' ');
  return {
    orientation: splitLine[0],
    tags: splitLine.slice(2)
  };
});