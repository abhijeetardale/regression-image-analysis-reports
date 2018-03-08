var path = require('path')

module.exports = function createImageConfig(data, img) {

    var fileName = path.basename(img);
    var formatImg = fileName.replace(/[?]/g, '%3F')
    var filename = formatImg.replace(/\.[^/.]+$/, "");

    var status = data===null ? 'fail' : data.misMatchPercentage == 0 ? 'pass':'fail'

    var imgObj = {
        'pair': {
          'reference': './ScreenshotsBefore' + path.sep + formatImg,
          'test': './ScreenshotsAfter' + path.sep + formatImg,
          'selector': '',
          'fileName': filename,
          'label': filename,
          'misMatchThreshold': 0.1,
          'diff': data,
          'diffImage': './output' + path.sep + filename + '.png'
        },
        'status': status
     }

    return imgObj
}