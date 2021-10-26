// +++++++++++ Settings
const settings = require('./settings.json');

// +++++++++++ Requires
var express = require('express');
var path = require('path');

let metrics = require('./metrics.js'); // Melonking.Net Metrics
let rss = require('./rss.js'); // RSS loader
let newsletter = require('./newsletter.js'); // RSS loader

var app = express();

app.use('/', express.static('../web'));

// Ozway Game Server
app.use('/oz', express.static('../oz'));

// Melonking.Net Metrics
app.get('/metrics', function (req, res) {
    res.send(metrics.getHTML());
});
app.get('/hit', function (req, res) {
    res.send(metrics.doAHit(req.query.p));
});

// Melonking.Net RSS
app.get('/rss', function (req, res) {
    res.setHeader('content-type', 'application/xml');
    res.send(rss.generate());
});

// Melonking Newsletter
app.get('/newsletter', function (req, res) {
    newsletter.go(req, res);
});

var server = app.listen(settings.webPort, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Web Server listening at http://%s:%s', host, port);
});

// +++++++++++ Extra
require('./oz-server.js'); // Ozway game server
