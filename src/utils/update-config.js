var path = require('path')
var fs = require('fs-extra');
var configFile = './results/config.js';

module.exports = async function updateFile(arrayOfObjects, resolve) {
    await fs.readFile(configFile, 'utf-8', function(err, jsonData) {
       if (err) throw err
       var configReport = 'report(' + arrayOfObjects + ')'
        fs.writeFile(configFile, configReport, function (err) {
         if (err) console.log(err)
         resolve("success");
       });
    });
}