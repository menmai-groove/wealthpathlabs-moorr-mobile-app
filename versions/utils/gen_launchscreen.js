const fs = require('fs');

const { Image } = require('canvas');

const { generateImages } = require('./image-resizer');

fs.mkdirSync('assets/android/mipmap-mdpi', {
  recursive: true,
});
fs.mkdirSync('assets/android/mipmap-hdpi', {
  recursive: true,
});
fs.mkdirSync('assets/android/mipmap-xhdpi', {
  recursive: true,
});
fs.mkdirSync('assets/android/mipmap-xxhdpi', {
  recursive: true,
});
fs.mkdirSync('assets/android/mipmap-xxxhdpi', {
  recursive: true,
});
fs.mkdirSync('assets/ios/images', {
  recursive: true,
});

fs.readFile(process.argv[2], (_, image) => {
  const imgc = new Image();
  const filename = process.argv[2].split('/').pop();
  imgc.onload = () => {
    generateImages(imgc, ['android', 'ios', 'ipad'], filename).then(images => {
      images.forEach(img => {
        fs.writeFileSync(`assets/${img.filename}`, img.image);
      });
    });
  };
  imgc.src = image;
});
