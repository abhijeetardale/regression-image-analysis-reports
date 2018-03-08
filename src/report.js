var fs = require("fs-extra");
var config = require('./settings.json');
var Promise = require('bluebird');
var report = require('./utils/extract-report');

var sourceFolder = config.sourceDirectoryPath;
var destinationFolder = config.testDirectoryPath;

var copySource = function() {

    return new Promise(function(resolve, reject) {
       fs.copy(sourceFolder, './results/ScreenshotsBefore', function (err) {
         if (err) return console.error(err)
         resolve("success");
       });
    })
}

var copyDestination = function() {

    return new Promise(function(resolve, reject) {
        fs.copy(destinationFolder, './results/ScreenshotsAfter', function (err) {
          if (err) return console.error(err)
          resolve("success");
        });
    })
}

var copyTools = function() {

    return new Promise(function(resolve, reject) {
        fs.copy('./tools/report.html', './results/report.html', function (err) {
          if (err) return console.error(err)
        });
        fs.copy('./tools/compare', './results/compare', function (err) {
          if (err) return console.error(err)
          resolve("success");
        });
    })
}

copySource().then(
    function(results) {
        return copyDestination().then(
            function(results) {
                  return copyTools().then(
                        function(results) {
                              return report();
                        }
                  )
            }
        )
    }
)


