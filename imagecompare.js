var fs = require("mz/fs");
var path = require('path');
var recursive = require("recursive-readdir");
var promiseLimit = require('promise-limit');
var compareImages = require('resemblejs/compareImages');
var config = require('./settings.json');

const options = {
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

const limit = promiseLimit(5)

const sourceFolder = config.sourceDirectoryPath;
const destinationFolder = config.testDirectoryPath;
const outputFolder = './demo/output/';
const configFile = './demo/config.js';

var arrayOfObjects = {'testSuite': 'Visual Regression Test', 'tests': [] }


process.env.UV_THREADPOOL_SIZE = 1;

var fs = require('fs');
var sharp = require('sharp');

sharp.concurrency(1);
sharp.cache(50);

var maxRss = 0;


 main();

    async function getDiff(file){
        var startImage = new Date().getTime();
        console.log('image comparison started at '+startImage +' ... '+file);

        const fileName = path.basename(file);
        const subDir = path.dirname(file).slice(sourceFolder.length) === "" ? "" :  path.dirname(file).slice(sourceFolder.length) +path.sep;
        const destination =  destinationFolder+subDir
        const output =  outputFolder+subDir
        // The parameters can be Node Buffers
        // data is the same as usual with an additional getBuffer() function
        const fileExists = fs.existsSync(destination+fileName);


        if(fileExists) {

            const data = await compareImages(
                await fs.readFile(file),
                await fs.readFile(destination+fileName),
                options,
                );



            const name = fileName.replace(/\.[^/.]+$/, "");

            if (!fs.existsSync(output)){
              fs.mkdirSync(output);
            }

            await fs.writeFile(output+name+'.png', data.getBuffer());

            await fs.readFile(configFile, 'utf-8', function(err, jsonData) {
                if (err) throw err

                arrayOfObjects.tests.push(createImgConfig(data, file));

                updateFile(JSON.stringify(arrayOfObjects));
                });

        } else {

            await fs.readFile(configFile, 'utf-8', function(err, jsonData) {
                if (err) throw err

                arrayOfObjects.tests.push(createImgConfig (null, file))

                updateFile(JSON.stringify(arrayOfObjects));
                });

        }
        console.log('image comparison ended in ' + (new Date().getTime()-startImage) +".  ...."+file);
        return true;
    }

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
        await fs.writeFile(configFile, arrayOfObjects, 'utf-8', function(err) {
            if (err) throw err
        });
    }



    function main() {
        console.log();
        console.log('process started... image analysis inprogress');
        var start = new Date().getTime();

        fs.writeFile(configFile, arrayOfObjects, {spaces: 2}, function(err) {
          if (err) throw err
        });

         // ignore files that end in ".css" or  ".html".
       // recursive(sourceFolder, ["*.css", "*.html", "*.xml", "*.xhtml", "*.js"], function (err, files) {
         //  if (err) {
          //     throw err;
         //  }

           fs.readdirSync(sourceFolder).forEach(function(filename) {

               var input = fs.createReadStream(sourceFolder + filename);
               var output = fs.createWriteStream(destinationFileName);
               var transform = sharp().resize(100,100).jpeg({quality : 75, force : false});//sharp().resize(1024, 576).quality(80);

               input.on('error', function(err) {
                 console.log('input err ' + err);
               });
               output.on('error', function(err) {
                 console.log('output err ' + err);
               });
               transform.on('error', function(err) {
                 console.log('transform err ' + err);
               });

               output.on('finish', function(err) {
                 console.dir(sharp.counters());
                 if (process.memoryUsage().rss > maxRss) {
                   maxRss = process.memoryUsage().rss;
                   console.log(maxRss);
                 }
               });

               input.pipe(transform).pipe(output);

             });

//batch(files).sequential()
//.each(function(i, file, done) {
//         var startImage = new Date().getTime();
//         var fileName = path.basename(file);
//         var subDir = path.dirname(file).slice(sourceFolder.length) === "" ? "" :  path.dirname(file).slice(sourceFolder.length) + path.sep;
//         var destination =  destinationFolder+subDir
//         var output =  outputFolder+subDir
//         var destinationFileName =  destination+fileName
//        fs.readFile(file, function(err, res1){
//                  if(err){
//                     console.log(err);
//                  }
//                  fs.readFile(destinationFileName, function(err,res2){
//                      if(err){
//                         console.log(err);
//                      }
//                            setTimeout(() =>
//                                  require('resemblejs').compare(res1, res2, options, function(err, data) {
//
//                                  var fileExists = fs.existsSync(destinationFileName);
//
//                                  if(fileExists) {
//
//                                     var name = fileName.replace(/\.[^/.]+$/, "");
//
//                                      if (!fs.existsSync(output)){
//                                        fs.mkdirSync(output);
//                                      }
//
//                                      fs.writeFileSync(output+name+'.png', data);
//
//                                     // arrayOfObjects.tests.push(createImgConfig(result, file));
//
//
//
//                                  } else {
//
//                                       //arrayOfObjects.tests.push(createImgConfig (null, file))
//                                  }
//                                res1=null;
//                                res2=null;
//                                data = "4"
//                                done(data);
//                              }),500)
//                           })
//                       });
//        }).end(function(results) {
//           console.log(results)
//        });
//           var promises= files.map(function(file){
//               return new Promise(function(file, resolve, reject){
//                 var startImage = new Date().getTime();
//                 console.log('image comparison started at ');
//                 const fileName = path.basename(file);
//                 const subDir = path.dirname(file).slice(sourceFolder.length) === "" ? "" :  path.dirname(file).slice(sourceFolder.length) + path.sep;
//                 const destination =  destinationFolder+subDir
//                 const output =  outputFolder+subDir
//                   fs.readFile(file, function(err, res1){
//                       if(err){
//                          console.log(err);
//                       }
//                       fs.readFile(destination+fileName, function(err, res2){
//                           if(err){
//                              console.log(err);
//                           }
//                           getDiffData(res1, res2).then((result) => {
//
////                                var fileExists = fs.exists(destination+fileName);
////
////                                if(fileExists) {
////
////                                   var name = fileName.replace(/\.[^/.]+$/, "");
////
////                                    if (!fs.exists(output)){
////                                      fs.mkdir(output);
////                                    }
////
////                                    //fs.writeFileSync(output+name+'.png', data.getBuffer());
////
////                                   // arrayOfObjects.tests.push(createImgConfig(result, file));
////
////
////
////                                } else {
////
////                                     //arrayOfObjects.tests.push(createImgConfig (null, file))
////                                }
////                                result = null;
////                                res1 = null;
////                                res2 = null;
//                                resolve("3");
//                          })
//                       })
//                   });
//               }.bind(this, file));
//           });
//           Promise.all(promises).then(function(results){
//               console.log(results);
//           });
//           Promise.all(files.map((file) => {
//             return limit(() => readFile(file))
//           })).then(results => {
//             console.log();
//             console.log('process ended... image analysis finished');
//             console.log('Execution time : ' + Math.round((new Date().getTime()-start)) +"seconds");
//             console.log();
//           });
        //});
    }

var batch = require('batchflow');



function readFile(file){
  return new Promise(function (resolve, reject){
      var startImage = new Date().getTime();
      console.log('image comparison started at ');
      const fileName = path.basename(file);
      const subDir = path.dirname(file).slice(sourceFolder.length) === "" ? "" :  path.dirname(file).slice(sourceFolder.length) + path.sep;
      const destination =  destinationFolder+subDir
      const output =  outputFolder+subDir

      fs.readFile(file).then(
        res1 =>
            fs.readFile(destination+fileName).then(
                 res2 =>
                    getDiffData(res1, res2).then((result) => {

                        var fileExists = fs.exists(destination+fileName);

                         if(fileExists) {

                            var name = fileName.replace(/\.[^/.]+$/, "");

                             if (!fs.exists(output)){
                               fs.mkdir(output);
                             }

                             //fs.writeFileSync(output+name+'.png', data.getBuffer());

                            // arrayOfObjects.tests.push(createImgConfig(result, file));



                         } else {

                              //arrayOfObjects.tests.push(createImgConfig (null, file))
                         }
                         result = null;
                         res1 = null;
                         res2 = null;
                         resolve();
                   }))).catch(err => console.error(err));

//      fs.readFile(file, function (err, res1){
//        if (err) reject(err);
//        else {
//            fs.readFile(destination+fileName, function (err, res2){
//                if (err) reject(err);
//                else {
//                    getDiffData(res1, res2).then((result) => {
//
//                            var fileExists = fs.exists(destination+fileName);
//
//                             if(fileExists) {
//
//                                var name = fileName.replace(/\.[^/.]+$/, "");
//
//                                 if (!fs.exists(output)){
//                                   fs.mkdir(output);
//                                 }
//
//                                 //fs.writeFileSync(output+name+'.png', data.getBuffer());
//
//                                // arrayOfObjects.tests.push(createImgConfig(result, file));
//
//
//
//                             } else {
//
//                                  //arrayOfObjects.tests.push(createImgConfig (null, file))
//                             }
//                       }).then(() => { result = null;
//                                       res1 = null;
//                                       res2 = null;});
//                    resolve();
//                }
//            });
//        }
//      });
  });
}

async function getDiffData(file1, file2){
        var compare = require('resemblejs');
        resemble.compare(image1, image2, options, function(err, data) {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            });
        return data.getBuffer();
}


