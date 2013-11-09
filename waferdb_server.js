var io                 = require('socket.io').listen(9000)
  , consistency_levels = ['refresh-on-dirty', 'flush-on-dirty', 'fire-and-forget']
  , consistency_level  = 0
  , server_cache       = []
;

io.sockets.on('connection', function (socket) {
  console.log('connection established for WebSocket with wafer');

  // Just a test here
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });

  /**
    * GET
    *
    */
  socket.on(function(request){
    console.log('server_get('+request.key+')');

    socket.emit('get_ack');
  };

  /**
    * PUT
    *
    */
  socket.on(function(request){
    console.log('server_put('+request.key+', '+request.value+')');

    socket.emit('put_ack');
  };
});

exports.set_consistency_level = function(new_consistency_level){
  consistency_level = new_consistency_level;
};

function invalidate(){

}
