var fs = require("fs");
if (!fs.existsSync("./config.json")) {
  console.log('First time launch ? ...');
  fs.writeFileSync('config.json',fs.readFileSync('config.default.json'));
  console.log('... Configuration copied from default.');
}

var app = require('http').createServer(handler)
, config = require("./config")
, io = require('socket.io').listen(app);


function handler (req, res) {
  fs.readFile(__dirname + '/index-node.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index-node.html');
    }
    res.writeHead(200, {
      'Content-Length': data.length,
      'Content-Type': 'text/html'
    });
    res.end(data);
  });
}
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

app.listen(config.port,config.server);
console.log('Server running at '+config.server+":"+config.port);