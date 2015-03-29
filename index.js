// load in dependencies
var express = require('express')
  , app = express()
  , fs = require('fs')
  , moment = require('moment');

// open port 5000
app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'))

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

  file.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      var dissected = dissect(line);
      if (dissected != null) dissectedData.push(dissected);
      index = remaining.indexOf('\n');
    }
  });

  file.on('end', function() {
    if (remaining.length > 0) {
      var dissected = dissect(remaining);
      if (dissected != null) dissectedData.push(remaining);
    }

    renderData.logData = dissectedData;
    renderData.lastLog = dissectedData.length - 1;
    renderData.time = calculateTime(dissectedData[0].timestamp, dissectedData[dissectedData.length-1].timestamp);
    response.render('booklet', renderData);
  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

/*
 * Functions
 */
function dissect(line) {

  var regex = /(\S+?) (\S+?) (\S+?) (\S+? \+\S+?\]) "(\S+?) (\S+?) (\S+?)" (\S+?) (\S+?) "(\S+?)" "(.*?)"/
  var map = {
    1: 'deviceName',
    2: 'unknown',
    3: 'unknownTwo',
    4: 'timestamp',
    5: 'requests',
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

  if (!isImage(ret.url)) return null;
  return ret;
}

function calculateTime(start, end) {
  var regex = /\[(\S+?)\/(\S+?)\/(\S+?):(\S+?):(\S+?):(\S+?) (\S+?)]/
  var map = {
    1: 'day',
    2: 'month',
    3: 'year',
    4: 'hours',
    5: 'minutes',
    6: 'seconds',
    7: 'timezone',
  }

  var startMatch = start.match(regex)
    , st = {}
    , endMatch = end.match(regex)
    , et = {};

  for (var key in map) {
    var val = map[key];
    st[val] = startMatch[key];
    et[val] = endMatch[key];
  }

  var starttime = moment(st.year+'-'+st.month+'-'+st.day+' '+st.hours+':'+st.minutes+':'+st.seconds);
  var endtime = moment(et.year+'-'+et.month+'-'+et.day+' '+et.hours+':'+et.minutes+':'+et.seconds);
  var difference = endtime.diff(starttime, 'minutes');

  if (difference > 1) return difference + ' minutes';
  return difference + ' minute';
}

function isImage(file) {
  if (~file.indexOf('.jpg') || ~file.indexOf('.jpeg') || ~file.indexOf('.png') || ~file.indexOf('.gif')) return true;
  return false;
}





