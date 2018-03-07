const fs = require('fs')
const configFile = './tools/config.js';
const reportFile = './tools/report.html';
const open = require("open");

module.exports = function generateReport(resolve) {
    fs.readFile(configFile, 'utf-8', function(err, jsonData) {
        if (err) throw err

        if(!jsonData.startsWith("report(")){
            var configReport = 'report(' + jsonData + ')'

            fs.writeFile(configFile, configReport, function (err) {
              if (err) console.log(err)
            });
        }

        open(reportFile);
        resolve("success")
    });
}

