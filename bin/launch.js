/**
 * Module dependencies.
 */

var debug = require('debug')('*:*');
var fs = require('fs');
var http = require('http');
var IO = require('socket.io');
var app = require('../app');
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.npm_package_config_port || '3000');
app.set('port', port);

console.log(process.env.npm_package_config_port, port);

/**
 * Create HTTP server.
 */


var server = http.createServer(app);
IO(server).on('connection', function (socket) {
  socket.on('save', function(event){
      socket.broadcast.emit('newsave');
  });
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
