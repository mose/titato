var fs = require("fs");
if (!fs.existsSync("./config.json")) {
  console.log('First time launch ? ...');
  fs.writeFileSync('config.json',fs.readFileSync('config.default.json'));
  console.log('... Configuration copied from default.');
}

var app = require('http').createServer(handler)
, statics = require('node-static')
, config = require("./config")
, game = require("./lib/game")
, md5 = require('MD5')
, path = require('path')
, io = require('socket.io').listen(app);

var files = new (statics.Server)(path.join(__dirname, config.public_dir), {
  cache: 600
});

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
  } else if (req.url === '/') {
    fs.readFile(__dirname + '/index-node.html', function (err, data) {
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
  } else {
    files.serve(req, res, function(e, r) {
      if (e && (e.status === 404)) {
        files.serveFile('/404.html', 404, {}, req, res);
      }
    });
  }
}

var connected_users = {};
var users = {};

io.configure(function (){
  io.set("authorization", function (data, accept) {
    data.sid = md5(data.address.address + data.headers['user-agent']);
    accept(null, true);
  });
});

io.sockets.on('connection', function (socket) {
  socket.emit('users list', Object.keys(connected_users) );

  socket.on('identify', function (data) {
    if (connected_users[data]) {
      socket.emit('identified', { message: "This username is already taken, please chose another." });
    } else if (data.length > 32) {
      socket.emit('identified', { message: "This username too long (&gt;32)." });
    } else {
      socket.me = encodeURI(data);
      connected_users[data] = socket;
      users[data] = socket.handshake.sid;
      socket.broadcast.emit('users list', Object.keys(connected_users) );
      socket.emit('users list', Object.keys(connected_users) );
      socket.emit('identified', data);
    }
  });

  socket.on("fight", function(data) {
    console.log(data);
    connected_users[data].emit("fight", socket.me);
    socket.emit("fight", data);
  });
  socket.on("play", function(data) {
  });  
  socket.on('disconnect', function() {
    name = socket.me;
    delete connected_users[name];
    socket.broadcast.emit('users list', Object.keys(connected_users) );
  });

});



app.listen(config.port,config.server);
console.log('Server running at '+config.server+":"+config.port);