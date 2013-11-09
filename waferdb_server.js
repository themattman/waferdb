var io                 = require('socket.io').listen(9000)
  , db                 = require('./db_adapter.js')
  , consistency_levels = ['refresh-on-dirty', 'flush-on-dirty', 'fire-and-forget']
  , consistency_level  = 0
  , server_cache       = []
;

io.sockets.on('connection', function(socket){
  console.log('connection established for WebSocket with wafer');
  console.log(socket.id);
  server_cache.push[{
    "id": socket.id,
    "values": [],
    "reconnected": false
  }];

  // Send the client it's id so that it can re-establish its connection if broken
  socket.emit('get_connected_id', { 'socket_id': socket.id });

  /**
    * Disconnect (default)
    *
    */
  socket.on('disconnect', function(){
    console.log('disconnect');
    setTimeout(function(){
      console.log('disconnect timeout');
      if(!reconnected) {
        delete server_cache[socket.id];
      } else {
        server_cache[socket.id].reconnected = false;
      }
    }, 60000); // gives client 60 seconds to reconnect
  });

  /**
    * Reconnect (thrown together sloppily)
    *
    */
  socket.on('reconnect', function(data){
    console.log('reconnect', socket.id);
    console.log(data);
    if(data && data.socket_id){
      server_cache[data.socket_id].reconnected = true;
    }
  });

  /**
    * GET
    *
    */
  socket.on('get', function(request){
    console.log('server_get('+request.key+')');

    db.getFromDatabase({ 'key': request.key }, function(db_response){
      if(db_response.result === 'error') {
        socket.emit('get_ack', { 'result': 'error' });
      } else {
        socket.emit('get_ack', { 'result': 'success' });
      }
    });
  });

  /**
    * PUT
    *
    */
  socket.on('put', function(request){
    console.log('server_put('+request.key+', '+request.value+')');

    db.writeToDatabase({ 'key': request.key, 'value': request.value }, function(db_response){
      if(request.result === 'error') {
        socket.emit('put_ack', { 'result': 'error' });
      } else {
        socket.emit('put_ack', { 'result': 'success' });
      }
    });
  });
});

exports.set_consistency_level = function(new_consistency_level){
  // TODO: this should only be callable before startup
  // might require rewriting major portions to ensure this
  consistency_level = new_consistency_level;
};

function invalidate(){

}
