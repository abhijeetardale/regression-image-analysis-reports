const fs = require('fs')
const configFile = './results/config.js';
const reportFile = './results/report.html';
const opener = require("opener");

module.exports = function generateReport() {
    fs.readFile(configFile, 'utf-8', function(err, jsonData) {
        if (err) throw err

        if(!jsonData.startsWith("report(")){
            var configReport = 'report(' + jsonData + ')'

            fs.writeFile(configFile, configReport, function (err) {
              if (err) console.log(err)
            });
        }
        opener(reportFile);
    });
}