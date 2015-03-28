// load in dependencies
var express = require('express')
  , app = express()
  , fs = require('fs');

// open port 5000
app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// return a list of log files
app.get('/', function(request, response) {
  var renderData = {};
  renderData.title = 'OneMinuteAt';

  fs.readdir('logs', function(err, files) {
    if (err) { throw err; }

    renderData.files = files;
    response.render('index', renderData);
  
  });  
});

// generate the booklet
app.get('/print/:logfile', function( request, response ) {
  var renderData = {};
  var logfile = request.params.logfile;
  var filePath = 'logs/'+logfile;
  var file = fs.createReadStream(filePath);
  var remaining = '';
  var dissectedData = [];
  renderData.title = logfile;


  renderData.logData = readLines(file);

  file.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      dissectedData.push(dissect(line));
      index = remaining.indexOf('\n');
    }
  });

  file.on('end', function() {
    if (remaining.length > 0) {
      dissectedData.push(dissect(remaining));
    }

    renderData.logData = dissectedData;
    response.render('booklet', renderData);
  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

// functions
function readLines(input) {
  var remaining = '';
  var dissectedData = [];

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      dissectedData.push(dissect(line));
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      dissectedData.push(dissect(remaining));
    }
  });
}

function dissect(line) {

    var regex = /(\S+?) (\S+?) (\S+?) (\S+? \+\S+?\]) "(\S+?) (\S+?) (\S+?)" (\S+?) (\S+?) "(\S+?)" "(.*?)"/
    var map = {
      1: 'deviceName',
      2: 'unknown',
      3: 'unknownTwo',
      4: 'timestamp',
      5: 'getpost?',
      6: 'url',
      7: 'protocol',
      8: 'unknownThree',
      9: 'unknownFour',
      10: 'unknownFive',
      11: 'deviceType'
    }

    var matches = line.match(regex)
                , ret = {};

    if (!matches) return null;

    for (var k in map) {
      var v = map[k];
      ret[v] = matches[k];
    }

    return ret;
  }