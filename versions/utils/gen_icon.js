const fs = require('fs');

const { Image } = require('canvas');

const { generateImage } = require('./image-resizer');

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
fs.mkdirSync('assets/ios/AppIcon.appiconset', {
  recursive: true,
});

fs.readFile(process.argv[2], (_, image) => {
  const imgc = new Image();
  imgc.onload = () => {
    generateImage(imgc, ['ios', 'android'], 'app-icon').then(images => {
      images.forEach(img => {
        fs.writeFileSync(`assets/${img.filename}`, img.image, {
          flag: 'w',
        });
      });
    });
  };
  imgc.src = image;
});
