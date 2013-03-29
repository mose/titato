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

var userlist = new game.Userlist();
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

// io.configure(function (){
//   io.set("authorization", function (data, accept) {
//     data.sid = md5(data.address.address + data.headers['user-agent']);
//     accept(null, true);
//   });
// });

io.sockets.on('connection', function (socket) {
  socket.emit('users list', userlist.available() );

  socket.on('identify', function (data) {
    data = encodeURIComponent(data);
    if (data.length > 32) {
      socket.emit('identified', { message: "This username too long (&gt;32)." });
    } else {
      if (userlist.addUser(data)) {
        socket.me = data;
        available = userlist.available();
        socket.broadcast.emit('users list', available );
        socket.emit('users list', available );
        socket.emit('identified', data);
      } else {
        socket.emit('identified', { message: "This username is already taken, please chose another." });
      }
    }
  });

  socket.on("challenge", function(data) {
    socket.game = new game.Game(socket.me, data);
    connected_users[data].game = socket.game;
    first = socket.game.firstplayer();
    connected_users[data].emit("fight", { op: socket.me, first: (first === data)} );
    socket.emit("fight", { op: data, first: (first === socket.me)});
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