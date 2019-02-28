const fs = require('fs');

const print = (stuff) => {
  console.log(stuff);
};
let fileContents = fs.readFileSync('a_example.txt', { encoding: 'utf8' });
let lines = fileContents.split('\n');
lines.pop();
let firstLine = lines.shift();
let tags = new Set();
let images = lines.map((line, index) => {
  let splitLine = line.split(' ');
  let localTags = splitLine.slice(2);
  localTags.forEach(localTag => tags.add(localTag));
  return {
    index,
    freeToUse: true,
    orientation: splitLine[0],
    tags: localTags,
    otherV: null,
    oldIndices: null
  };
});

let newImages = [];
let lastV = null;
images.forEach((img) => {
  if (img.orientation === 'V') {
    if (lastV) {
      img.tags.push(...(lastV.tags));
      img['oldIndices'] = [lastV.index, img.index];
      newImages.push(img);
      lastV = null;
    } else {
      lastV = img
    }
  } else {
    img['oldIndices'] = [img.index];
    newImages.push(img);
  }
});

images = newImages.map((img, index) => {
  img.index = index;
  return img;
});

console.log(images.length);

let tagMap = {};
for (let tag of tags) {
  tagMap[tag] = images.filter(a => a.tags.includes(tag)).map(a => a.index);
}

const fitnessFunc = (img1, img2) => {
  const common = img1.tags.filter(tag => img2.tags.includes(tag));
  const commonSize = common.length;
  const leftSize = img1.tags.length - commonSize;
  const rightSize = img2.tags.length - commonSize;
  return Math.min(commonSize, leftSize, rightSize);
};

let presentation = [];

for (let image of images) {
  let connectedImagesIndices = new Set();
  for (let tag of image.tags) {
    let imageTags = tagMap[tag];
    if (!imageTags) debugger;
    imageTags.forEach(imageTag => {
      connectedImagesIndices.add(imageTag);
    });
  }
  connectedImagesIndices = Array.from(connectedImagesIndices);
  /*let imgsWithFitness = connectedImagesIndices.map(cII => { return { img: cII, fitness: fitnessFunc(image, images[cII])}});
  let sorted = imgsWithFitness((a, b) => { return a.fitness > b.fitness });*/

  let sortedIndices = connectedImagesIndices.sort((img1Index, img2Index) => {
    let image1 = images[img1Index];
    let image2 = images[img2Index];
    let result1 = fitnessFunc(image, images[img1Index]);
    let result2 = fitnessFunc(image, images[img2Index]);
    return result2 - result1;
  });

  //for (let sortedImgIndex of sorted.map(s => s.index)) {
  for (let sortedImgIndex of sortedIndices) {
    if (images[sortedImgIndex].freeToUse) {
      //print(fitnessFunc(images[sortedImgIndex], image));
      images[sortedImgIndex].freeToUse = false;
      presentation.push(sortedImgIndex);
      break;
    }
  }
}

let score = presentation.reduce((score, newDings, index) => {
  let image = images[newDings];
  let image2 = images[presentation[index + 1]];
  if (image && image2) {
    return score + fitnessFunc(image, image2);
  } else return score;
});

print(score);

const result = presentation.length + '\n' + presentation.map(p => {
  return images[p].oldIndices.join(' ')
}).join('\n');
//console.log(result);
fs.writeFileSync('test.txt', result);