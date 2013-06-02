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
        'Content-Type': 'text/javascript'
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
    data = data.replace("<",'');
    if (data.length > 16) {
      socket.emit('identified', { message: "This username too long (&gt;32)." });
    } else {
      if (userlist.addUser(data,socket)) {
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
    userlist.getUser(data).socket.game = socket.game;
    userlist.getUser(socket.me).playing = true;
    userlist.getUser(data).playing = true;
    first = socket.game.firstplayer();
    userlist.getUser(data).socket.emit("fight", { op: socket.me, first: (first === data)} );
    socket.emit("fight", { op: data, first: (first === socket.me)});
    available = userlist.available();
    socket.broadcast.emit('users list', available );
    socket.emit('users list', available );
  });

  socket.on("play", function(data) {
    if (socket.game) {
      if (data.shot && data.shot.match(/[0-2][0-2]/) && socket.game.play(socket.me,data.shot)) {
        next = socket.game.nextplayer(socket.me);
        winner = socket.game.checkwinner();
        if (winner) {
          socket.emit("next", { result: "win", player: winner });
          userlist.getUser(next).socket.emit("next", { result: "win", player: winner, position: data.shot });
        } else if (socket.game.finished()) {
          socket.emit("next", { result: "draw" });
          userlist.getUser(next).socket.emit("next", { result: "draw", position: data.shot });
        } else {
          socket.emit("next", { player: next });
          userlist.getUser(next).socket.emit("next", { player: next, position: data.shot });
        }
      } else {
        socket.emit("message", "Something went wrong.");
        userlist.getUser(next).socket.emit("message", "Something went wrong.");
      }
    } else {
      socket.emit("message", "Sorry your opponent disconnected.");
    }
  });

  socket.on('disconnect', function(data) {
    name = socket.me;
    if (socket.game) {
      next = socket.game.nextplayer(name);
      userlist.getUser(next).playing = false;
      userlist.getUser(next).socket.emit("disco", {} );
      delete socket.game;
      delete userlist.getUser(next).socket.game;
    }
    delete userlist.dropUser(name);
    socket.broadcast.emit('users list', userlist.available() );
  });

});

app.listen(config.port,config.server);
console.log('Server running at '+config.server+":"+config.port);