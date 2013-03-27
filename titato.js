var fs = require("fs");
if (!fs.existsSync("./config.json")) {
  console.log('First time launch ? ...');
  fs.writeFileSync('config.json',fs.readFileSync('config.default.json'));
  console.log('... Configuration copied from default.');
}

var app = require('http').createServer(handler)
, config = require("./config")
, io = require('socket.io').listen(app);

// io.enable('browser client minification');
// io.enable('browser client etag');
// io.enable('browser client gzip');

function handler (req, res) {
  if (req.url === '/config.js') {
    data = 'var url = "http://'+config.server+":"+config.port+'";';
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

var connected_users = [];

io.sockets.on('connection', function (socket) {
  socket.on('hello', function () {
    if (socket.get('nickname')) {
      socket.emit('identified', socket.get('nickname'));
    }
  });
  socket.on('identify', function (data) {
    if (connected_users.indexOf(data.name) !== -1) {
      socket.emit('identified', { message: "This username is already taken, please chose another." });
    } else {
      socket.set('nickname', data.name);
      connected_users.push(data.name);
      socket.broadcast.emit("new player", { name: data.name });
      socket.broadcast.emit('users list', { users: connected_users });
      socket.emit('identified', data.name);
      socket.emit('users list', { users: connected_users });
    }
  });
  socket.on("list", function(socket) {
    socket.emit("list", connected_users);
  });
});

io.sockets.on('disconnect', function() {
  name = socket.get('nickname');
  connected_users.splice(connected_users.indexOf(name),1);
  socket.broadcast.emit('users list', { users: connected_users });
});

app.listen(config.port,config.server);
console.log('Server running at '+config.server+":"+config.port);