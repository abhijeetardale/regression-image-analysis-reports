var fs = require('fs-extra');
var path = require('path');
var recursive = require("recursive-readdir");
var batch = require('batchflow');
var resemble = require('resemblejs')
var sharp = require('sharp');
var config = require('./settings.json');
var open = require('open');


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

var reportFile = './demo/report.html';
var outputFolder = './demo/output/';
var configFile = './demo/config.js';
var maxRss = 0;

var arrayOfObjects = {'testSuite': 'Visual Regression Test', 'tests': [] }


sharp.concurrency(10);
sharp.cache(50);

process.env.UV_THREADPOOL_SIZE = 10;

 main();


    function createImgConfig (data, img) {
        const fileName = path.basename(img);
        const subDir = path.dirname(img).slice(sourceFolder.length) === "" ? "" :  path.dirname(img).slice(sourceFolder.length) +path.sep;
        const destination =  destinationFolder+subDir
        const output =  outputFolder+subDir
        //console.log(data, img)
        // What does the config file need to look like?
        // Replace any ? with %3F
        var formatImg = fileName.replace(/[?]/g, '%3F')
        var filename = formatImg.replace(/\.[^/.]+$/, "");
        var status = data===null ? 'fail' : data.misMatchPercentage == 0 ? 'pass':'fail'
        var imgObj = {
            'pair': {
              'reference': path.relative("./demo", path.dirname(img)) +path.sep+ formatImg,
              'test': path.relative("./demo", destination) +path.sep + formatImg,
              'selector': '',
              'fileName': filename,
              'label': filename,
              'misMatchThreshold': 0.1,
              'diff': data,
              'diffImage': path.relative("./demo", output) +path.sep + filename + '.png'
            },
            'status': status
         }

        return imgObj
    }

    async function updateFile(arrayOfObjects) {
        //await fs.writeFile(configFile, arrayOfObjects, 'utf-8', function(err) {
            //if (err) throw err
            fs.readFile(configFile, 'utf-8', function(err, jsonData) {
               if (err) throw err
               var configReport = 'report(' + arrayOfObjects + ')'
                fs.writeFile(configFile, configReport, function (err) {
                 if (err) console.log(err)
                 open(reportFile);
               });
            });
        //});
    }

    function main() {
        console.log();
        console.log('process started');
        console.log('........ image analysis inprogress ........');
        var start = new Date().getTime();

        fs.writeFile(configFile, arrayOfObjects, {spaces: 2}, function(err) {
          if (err) throw err
        });

        // ignore files that end in ".css" or  ".html".
        recursive(sourceFolder, ["*.css", "*.html", "*.xml", "*.xhtml", "*.js"], function (err, files) {
          if (err) { throw err;}


          batch(files).parallel(2).each(function(i, file, done) {
             var startImage = new Date().getTime();
             const fileName = path.basename(file);
             const subDir = path.dirname(file).slice(sourceFolder.length) === "" ? "" :  path.dirname(file).slice(sourceFolder.length) + path.sep;
             const destination =  destinationFolder+subDir
             const output =  outputFolder+subDir
             const destinationFileName =  destination+fileName
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
                                arrayOfObjects.tests.push(createImgConfig(data, file));
                                done(data);
                              })
                          })
                        })

                       } else {

                         arrayOfObjects.tests.push(createImgConfig (null, file))
                         done("");

                      }
            });
            }).end(function(results) {
               console.log('........ image analysis finished ........');
               console.log('........ report generated ........');
               updateFile(JSON.stringify(arrayOfObjects));
               console.log("done")
          });
        });
    }


