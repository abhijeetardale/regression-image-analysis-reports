var fs = require('fs-extra');
var Promise = require('bluebird');
var recursive = require("recursive-readdir");
var config = require('./settings.json');
var processBatch = require('./utils/process-batch');
var report = require('./report');

var sourceFolder = config.sourceDirectoryPath;

var outputFolder = './tools/output/';
var configFile = './tools/config.js';

var arrayOfObjects = {'testSuite': 'Visual Regression Test', 'tests': [] }

var updateConfigFile = function() {

    return new Promise(function(resolve, reject) {
       console.log();
       console.log('process started');
       console.log('........ image analysis inprogress ........');

       fs.writeFile(configFile, arrayOfObjects, {spaces: 2}, function(err) {
         if (err) throw err
       });
       resolve("success");
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
        report(resolve)
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


