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
  if (req.url === '/config.js') {
    data = 'var url = "'+config.server+":"+config.port+'"';
      res.writeHead(200, {
        'Content-Length': data.length,
        'Content-Type': 'text/html'
      });    
    res.end(data);
  } else {
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
}

var connected_users = {};

io.sockets.on('connection', function (socket) {
  socket.on('identify', function (name) {
    console.log(name);
    socket.set('nickname', name, function () {
      socket.broadcast.emit('connected', { name: name });
      socket.emit('ready');
    });
  });
  socket.on("list", function(socket) {
    socket.emit("list", connected_users);
  });
});

app.listen(config.port,config.server);
console.log('Server running at '+config.server+":"+config.port);