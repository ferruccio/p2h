var express = require('express');
var app = express();

app.use('/bower', express.static('bower_components'));
app.use('/file', express.static('pdfs'));
app.use('/css', express.static('views'));

app.set('view engine', 'pug');

app.get('/', function(req, res) {
    res.send('use /pdf/<filename>');
});

app.get('/pdf/:filename', function(req, res) {
    console.log('GET: ' + req.params.filename);
    res.render('index', { title: 'PDF file', file: req.params.filename });
});

var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
});
