const fs = require('fs');

const print = (stuff) => {
  console.log(stuff);
};
let fileContents = fs.readFileSync('d_pet_pictures.txt', { encoding: 'utf8' });
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
    tags: localTags
  };
});
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

let beginTimeStamp = Date.now();
let numImages = images.length;
const updateCounter = (newValue) => {
  if (newValue % 10) return;
  let currentProgress = newValue / numImages;
  let newDate = Date.now();
  let processTime = newDate - beginTimeStamp;
  print(processTime * (numImages / newValue));
};

for (let image of images) {
  updateCounter(image.index);
  let connectedImagesIndices = new Set();
  for (let tag of image.tags) {
    let imageTags = tagMap[tag];
    if (!imageTags) debugger;
    imageTags.forEach(imageTag => {
      connectedImagesIndices.add(imageTag);
    });
  }
  connectedImagesIndices = Array.from(connectedImagesIndices);
  let sortedIndices = connectedImagesIndices.sort((img1Index, img2Index) => {
    let image1 = images[img1Index];
    let image2 = images[img2Index];
    let result1 = fitnessFunc(image, images[img1Index]);
    let result2 = fitnessFunc(image, images[img2Index]);
    return result1 > result2;
  });

  for (let sortedImgIndex of sortedIndices) {
    if (images[sortedImgIndex].freeToUse) {
      images[sortedImgIndex].freeToUse = false;
      presentation.push(sortedImgIndex);
      break;
    }
  }
}
