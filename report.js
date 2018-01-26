const fs = require('fs')
const configFile = './demo/config.js';


fs.readFile(configFile, 'utf-8', function(err, jsonData) {
    if (err) throw err

    var configReport = 'report(' + jsonData + ')'

    fs.writeFile(configFile, configReport, function (err) {
      if (err) console.log(err)
    });
});

