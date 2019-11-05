var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
app.use(cors());
var server = require('http').Server(app);
// var io = require('socket.io')(server);
var io = require('socket.io')(server, {
  handlePreflightRequest: (req, res) => {
    const headers = {
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': req.headers.origin, //or the specific origin you want to give access to,
      'Access-Control-Allow-Credentials': true
    };
    res.writeHead(200, headers);
    res.end();
  }
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// view engine middleware
require('./middlewares/view_engine.middleware')(app);

require('./middlewares/link_route.middleware')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

const clients = {};
const addClient = socket => {
  console.log('New client connected', socket.id);
  clients[socket.id] = socket;
};
const removeClient = socket => {
  console.log('Client disconnected', socket.id);
  delete clients[socket.id];
};

io.sockets.on('connection', socket => {
  let id = socket.id;

  addClient(socket);

  socket.on('mousemove', data => {
    data.id = id;
    socket.broadcast.emit('moving', data);
  });

  socket.on('disconnect', () => {
    removeClient(socket);
    socket.broadcast.emit('clientdisconnect', id);
  });
});

var players = {},
  unmatched;

function joinGame(socket) {
  // Add the player to our object of players
  players[socket.id] = {
    // The opponent will either be the socket that is
    // currently unmatched, or it will be null if no
    // players are unmatched
    opponent: unmatched,

    // The symbol will become 'O' if the player is unmatched
    symbol: 'X',

    // The socket that is associated with this player
    socket: socket
  };

  // Every other player is marked as 'unmatched', which means
  // there is not another player to pair them with yet. As soon
  // as the next socket joins, the unmatched player is paired with
  // the new socket and the unmatched variable is set back to null
  if (unmatched) {
    players[socket.id].symbol = 'O';
    players[unmatched].opponent = socket.id;
    unmatched = null;
  } else {
    unmatched = socket.id;
  }
}

// Returns the opponent socket
function getOpponent(socket) {
  if (!players[socket.id].opponent) {
    return;
  }

  return players[players[socket.id].opponent].socket;
}

io.on('connection', function(socket) {
  joinGame(socket);

  // Once the socket has an opponent, we can begin the game
  if (getOpponent(socket)) {
    socket.emit('game.begin', {
      symbol: players[socket.id].symbol
    });

    getOpponent(socket).emit('game.begin', {
      symbol: players[getOpponent(socket).id].symbol
    });
  }

  // Listens for a move to be made and emits an event to both
  // players after the move is completed
  socket.on('make.move', function(data) {
    if (!getOpponent(socket)) {
      return;
    }

    socket.emit('move.made', data);
    getOpponent(socket).emit('move.made', data);
  });

  // Emit an event to the opponent when the player leaves
  socket.on('disconnect', function() {
    if (getOpponent(socket)) {
      getOpponent(socket).emit('opponent.left');
    }
  });
});
