var fs = require('fs-extra');
var path = require('path');
var recursive = require("recursive-readdir");
var batch = require('batchflow');
var resemble = require('resemblejs')
var sharp = require('sharp');
var config = require('../settings.json');


var sourceFolder = config.sourceDirectoryPath;
var destinationFolder = config.testDirectoryPath;

var options = {
  output: {
    errorColor: {
      red: 255,
      green: 0,
      blue: 0,
      brightness: 255
    },
    errorType: 'movement',
    transparency: 0.3,
    largeImageThreshold: 1200,
    useCrossOrigin: false,
    outputDiff: true
  }
};

var outputFolder = './tools/output/';
var configFile = './tools/config.js';
var maxRss = 0;

var arrayOfObjects = {'testSuite': 'Visual Regression Test', 'tests': [] }


sharp.concurrency(10);
sharp.cache(50);

process.env.UV_THREADPOOL_SIZE = 10;

var imageConfig = require('./create-img-config')
var jsonConfig = require('./update-config')

module.exports = function processBatch(files, resolve) {

    batch(files).parallel(2).each(function(index, file, done) {
        var startImage = new Date().getTime();
        const fileName = path.basename(file);
        const subDir = path.dirname(file).slice(sourceFolder.length) === "" ? "" :  path.dirname(file).slice(sourceFolder.length) + path.sep;
        const destination =  destinationFolder + subDir
        const output =  outputFolder +  subDir
        const destinationFileName =  destination + fileName
        sharp(file).resize(1024, 576).toBuffer(function(err, res1){
            if(err){
             console.log(err);
            }

            if(fs.existsSync(destinationFileName)) {
            sharp(destinationFileName).resize(1024, 576).toBuffer(function(err,res2){
              if(err){
                 console.log(err);
              }

              if (process.memoryUsage().rss > maxRss) {
                 maxRss = process.memoryUsage().rss;
              }

              resemble.compare(res1, res2, options, function (err, data) {
                  var diffImage = data.getBuffer()

                  if (!fs.existsSync(output)){
                    fs.mkdirSync(output);
                  }

                  var name = fileName.replace(/\.[^/.]+$/, "");

                  fs.writeFile(output+name+'.png', diffImage, function(err) {
                    if(err){
                        console.log(err);
                    }
                    arrayOfObjects.tests.push(imageConfig(data, file));
                    done(data);
                  })
              })
            })

            } else {

             arrayOfObjects.tests.push(imageConfig(null, file))
             done("");

            }
        });
    }).end(function(results) {
        console.log('........ image analysis finished ........');
        console.log('........ report generated ........');
        jsonConfig(JSON.stringify(arrayOfObjects), resolve);
    });
}