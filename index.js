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

  renderData.title = 'OneMinute '+logfile;

  fs.readFile( filePath , 'utf8', function ( err, file ) {
    if (err) { throw err; }

    renderData.file = file;
    response.render('booklet', renderData);

  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});