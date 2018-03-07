var path = require('path')
var config = require('../settings.json');

var sourceFolder = config.sourceDirectoryPath;
var destinationFolder = config.testDirectoryPath;
var outputFolder = './tools/output/';

module.exports = function createImageConfig(data, img) {

    var fileName = path.basename(img);
    var subDir = path.dirname(img).slice(sourceFolder.length) === "" ? "" :  path.dirname(img).slice(sourceFolder.length) +path.sep;
    var destination =  destinationFolder + subDir
    var output =  outputFolder + subDir

    var formatImg = fileName.replace(/[?]/g, '%3F')
    var filename = formatImg.replace(/\.[^/.]+$/, "");

    var status = data===null ? 'fail' : data.misMatchPercentage == 0 ? 'pass':'fail'

    var imgObj = {
        'pair': {
          'reference': path.relative("./tools", path.dirname(img)) + path.sep + formatImg,
          'test': path.relative("./tools", destination) + path.sep + formatImg,
          'selector': '',
          'fileName': filename,
          'label': filename,
          'misMatchThreshold': 0.1,
          'diff': data,
          'diffImage': path.relative("./tools", output) + path.sep + filename + '.png'
        },
        'status': status
     }

    return imgObj
}