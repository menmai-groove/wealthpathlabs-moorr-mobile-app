const { createCanvas } = require('canvas');

const AppIconSizes = require('./appicon-sizes.json');
const ImageSizes = require('./image-sizes');

let TargetImageSizes;

exports.generateImage = (blob, platforms, type = 'app-icon', name) => {
  const iconSizes = type === 'app-icon' ? AppIconSizes : TargetImageSizes;
  const images = [];
  const promises = [];

  platforms.forEach(p => {
    if (iconSizes[p]) {
      const sizes = iconSizes[p];
      images[p] = {};
      sizes.forEach(size => {
        let filename = name || size.filename;
        if (size.folder) {
          filename = size.folder + '/' + filename;
        }
        promises.push(
          resize(blob, {
            width: size['expected-size'],
            height: size['expected-size'],
            round: size.round,
          }).then(image => {
            images.push({
              filename,
              image,
            });
          }),
        );
      });
    }
  });

  return Promise.all(promises).then(() => images);
};

exports.generateImages = (blob, platforms, name) => {
  const transformedImages = [];
  const promises = [];
  TargetImageSizes = ImageSizes;
  platforms.forEach(p => {
    if (TargetImageSizes[p]) {
      TargetImageSizes[p].forEach(size => {
        let filename = name || size.filename;
        if (p === 'ios') {
          const ext = '.' + name.split('.').pop();
          filename = [filename.replace(ext, ''), size.postfix, ext].join('');
        }
        if (size.folder) {
          filename = size.folder + '/' + filename;
        }
        promises.push(
          resize(blob, null, size.scale, size.base).then(image => {
            transformedImages.push({
              filename,
              image,
            });
          }),
        );
      });
    }
  });
  return Promise.all(promises).then(() => transformedImages);
};

function resize(blob, size, scale, base) {
  return new Promise(resolve => {
    let toCanvas;
    let ctx;
    if (scale) {
      const width = Math.ceil(blob.width / (base / scale));
      const height = Math.ceil(blob.height / (base / scale));
      toCanvas = createCanvas(width, height);
    } else {
      const width = size.width;
      const height = size.height;
      toCanvas = createCanvas(width, height);
    }

    ctx = toCanvas.getContext('2d');
    if (size && size.round) {
      ctx.beginPath();
      ctx.arc(
        toCanvas.width / 2,
        toCanvas.width / 2,
        toCanvas.width / 2,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.clip();
    }
    ctx.drawImage(blob, 0, 0, toCanvas.width, toCanvas.height);
    return resolve(toCanvas.toBuffer());
  });
}
