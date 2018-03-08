var fs = require('fs-extra');
var Promise = require('bluebird');
var recursive = require("recursive-readdir");
var config = require('./settings.json');
var processBatch = require('./utils/process-batch');
var reportFile = './tools/report.html';

var sourceFolder = config.sourceDirectoryPath;

var outputFolder = './tools/output/';
var configFile = './results/config.js';

var arrayOfObjects = {'testSuite': 'Visual Regression Test', 'tests': [] }

var updateConfigFile = function() {

    return new Promise(function(resolve, reject) {
       console.log();
       console.log('process started');
       console.log('........ image analysis inprogress ........');
       fs.emptyDir('./results').then(() => {
           fs.copy('./tools/config.js', configFile, function (err) {
              if (err) return console.error(err)
              fs.ensureDir('./results/output/', err => {
                  if (err) throw err
                  resolve("success");
              })
           });
       })
    })
}

var processFiles = function() {

    return new Promise(function(resolve, reject) {
        recursive(sourceFolder, ["*.css", "*.html", "*.xml", "*.xhtml", "*.js"], function (err, files) {
          if (err) { throw err;}
            processBatch(files, resolve)
        });
    })
}

var updateReport = function() {

    return new Promise(function(resolve, reject) {
        console.log('process completed');
    })
}


updateConfigFile().then(
    function(result) {
        return processFiles().then(
            function(result) {
                  return updateReport();
            }
        )
    }
)


