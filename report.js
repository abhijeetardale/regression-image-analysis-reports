const fs = require('fs')
const configFile = './demo/config.js';
const reportFile = './demo/report.html';
const open = require("open");


fs.readFile(configFile, 'utf-8', function(err, jsonData) {
    if (err) throw err

    if(!jsonData.startsWith("report(")){
        var configReport = 'report(' + jsonData + ')'

        fs.writeFile(configFile, configReport, function (err) {
          if (err) console.log(err)
        });
    }

    open(reportFile);
});

