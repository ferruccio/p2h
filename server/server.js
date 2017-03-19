var express = require('express');

var app = express();

app.use(function (req, res, next) {
    console.log('request: ' + req.url);
    next();
});

app.use('/bower', express.static('bower_components'));
app.use('/file', express.static('pdfs'));
app.use('/views', express.static('views'));

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

    console.log("listening on %s port:%s", host, port)
});
