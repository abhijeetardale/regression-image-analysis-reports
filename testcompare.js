const fs = require("mz/fs");
const path = require('path');
const recursive = require("recursive-readdir");
const compareImages = require('./compareImages');
const config = require('./settings.json');

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



const sourceFolder = config.sourceDirectoryPath;
const destinationFolder = config.testDirectoryPath;
const outputFolder = './demo/output/';
const configFile = './demo/config.js';

var arrayOfObjects = {'testSuite': 'Visual Regression Test', 'tests': [] }

 main();

    async function main() {

    return test()
        .then(result => {
            console.log('process started... generating report');
        });
     }



    async function getDiff(file){

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

    async function test() {

        await fs.writeFile(configFile, arrayOfObjects, {spaces: 2}, function(err) {
          if (err) throw err
        });

         // ignore files that end in ".css" or  ".html".
        recursive(sourceFolder, ["*.css", "*.html"], function (err, files) {
           if (err) {
               throw err;
           }
           files.forEach(async function (file) {
             await getDiff(file);
          });
        });
    }


