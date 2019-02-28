const fs = require('fs');
const file = 'c_memorable_moments';
const print = (stuff) => {
  console.log(stuff);
};
let fileContents = fs.readFileSync(file + '.txt', { encoding: 'utf8' });
let lines = fileContents.split('\n');
lines.pop();
let firstLine = lines.shift();
let tags = new Set();
let images = lines.map((line, index) => {
  let splitLine = line.split(' ');
  let localTags = splitLine.slice(2);
  localTags.forEach(localTag => {
    tags.add(localTag);
  });
  return {
    index,
    freeToUse: true,
    orientation: splitLine[0],
    tags: localTags,
    otherV: null,
    oldIndices: null
  };
});

let tagMap = {};
let newImages = [];
let lastV = null;
images.forEach((img) => {
  if (img.orientation === 'V') {
    if (lastV) {
      img.tags.push(...(lastV.tags));
      img['oldIndices'] = [lastV.index, img.index];
      img.tags.forEach(tag => {
        if (!tagMap[tag]) tagMap[tag] = [newImages.length];
        else tagMap[tag].push(newImages.length);
      });
      newImages.push(img);
      lastV = null;
    } else {
      lastV = img
    }
  } else {
    img['oldIndices'] = [img.index];
    img.tags.forEach(tag => {
      if (!tagMap[tag]) tagMap[tag] = [newImages.length];
      else tagMap[tag].push(newImages.length);
    });
    newImages.push(img);
  }
});


print("start NewImages");
images = newImages.map((img, index) => {
  img.index = index;
  return img;
});

//let tagMap = {};

print("start tagMap");
/*for (let tag of tags) {
  print(tag);
  tagMap[tag] = images.filter(a => a.tags.includes(tag)).map(a => a.index);
}*/

print("completed preprocessing");

const fitnessFunc = (img1, img2) => {
  const common = img1.tags.filter(tag => img2.tags.includes(tag));
  const commonSize = common.length;
  const leftSize = img1.tags.length - commonSize;
  const rightSize = img2.tags.length - commonSize;
  return Math.min(commonSize, leftSize, rightSize);
};

let presentation = [];

let next = images[0];
while (next) {
  print(next.index);
  let connectedImagesIndices = new Set();
  for (let tag of next.tags) {
    let imageTags = tagMap[tag];
    if (!imageTags) debugger;
    imageTags.forEach(imageTag => {
      connectedImagesIndices.add(imageTag);
    });
  }
  connectedImagesIndices = Array.from(connectedImagesIndices);
  let sortedIndices = connectedImagesIndices.sort((img1Index, img2Index) => {
    let result1 = fitnessFunc(next, images[img1Index]);
    let result2 = fitnessFunc(next, images[img2Index]);
    return result1 - result2;
  });

  let found = false;
  for (let sortedImgIndex of sortedIndices) {
    if (images[sortedImgIndex].freeToUse) {
      next = images[sortedImgIndex];
      found = true;
      images[sortedImgIndex].freeToUse = false;
      presentation.push(sortedImgIndex);
      break;
    }
  }
  if (!found) next = images.find(img => img.freeToUse);
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
fs.writeFileSync(file + '_abgabe.txt', result);