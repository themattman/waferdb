var io                 = require('socket.io').listen(9000)
  , db                 = require('./db_adapter.js')
  , consistency_levels = ['refresh-on-dirty', 'flush-on-dirty', 'fire-and-forget']
  , consistency_level  = 0
  , server_cache       = {}
  , program            = require('commander')
  , colors             = require('colors')
  , fs                 = require('fs')
  , path               = require('path')
;

exports.init = init;

io.sockets.on('connection', function(socket){
  console.log('connection established for WebSocket with wafer', socket.id);
  server_cache[socket.id] = {
    'keys': [],
    'reconnected': false
  };

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
    if(data && data.socket_id) {
      server_cache.id[data.socket_id].reconnected = true;
    }
  });

  /**
    * GET
    *
    */
  socket.on('get', function(request){
    // 1. Log the get operation
    console.log('server_get('+request.key+')');

    // 2. Read the value from the database
    db.readFromDatabase({ 'key': request.key }, function(db_response){
      if(db_response.result === 'error') {
        socket.emit('get_ack', { 'result': 'error' });
      } else {
        socket.emit('get_ack', db_response);
      }
    });

    // 3. Update server cache when the client get's a key
    // Saving on time? This should execute during db I/O
    server_cache[socket.id].keys.push(request.key);
  });

  /**
    * PUT
    *
    */
  socket.on('put', function(request){
    // 1. Log the put operation
    console.log('server_put('+request.key+', '+request.value+')');

    // 2. Write the value to the database
    db.updateDatabase({ 'key': request.key, 'value': request.value }, function(db_response){
      if(request.result === 'error') {
        socket.emit('put_ack', { 'result': 'error' });
      } else {
        socket.emit('put_ack', db_response);
      }
    });

    // 3. Invalidate the other caches
    invalidate_caches(request.key, request.value, socket, function(){
      console.log('done invalidating caches');
    });
  });
});

//  /**
//    * UPDATE
//    *
//    */
//  socket.on('update', function(request){
//    // 1. Log the get operation
//    console.log('server_delete('+request.key+')', '+request.value+')');
//
//    // 2. Update the value to the database
//    db.updateDatabase({ 'key': request.key, 'value': request.value }, function(db_response){
//      if(db_response.result === 'error') {
//        socket.emit('update_ack', { 'result': 'error' });
//      } else {
//        socket.emit('update_ack', db_response);
//      }
//    });
//
//    // 3. Invalidate the other caches
//    invalidate_caches(request.key, request.value, socket, function(){
//      console.log('done invalidating caches');
//    });
//  });
//
//  /**
//    * DELETE
//    *
//    */
//  socket.on('delete', function(request){
//    // 1. Log the put operation
//    console.log('server_delete('+request.key+')');
//
//    // 2. Write the value to the database
//    db.deleteDatabase({ 'key': request.key }, function(db_response){
//      if(request.result === 'error') {
//        socket.emit('del_ack', { 'result': 'error' });
//      } else {
//        socket.emit('del_ack', db_response);
//      }
//    });
//
//    // 3. Invalidate the other caches
//    invalidate_caches(request.key, request.value, socket, function(){
//      console.log('done invalidating caches');
//    });
//  });
//});


function invalidate_caches(key, value, socket, cb){
  for(var i in server_cache[socket.id].keys) {
    if(server_cache[socket.id].keys[i] === key) {
      socket.emit('invalidate', { 'key': key, 'value': value });
      // socket.on('invalidate_done', function(){});
    }
  }
  cb(); // placement of this depends on consistency level
}

function init(db_type, db_object){
  /**
    * Set consistency level and config at startup
    *
    */
  program
    .version('0.0.1')
    .option('-f, --config', 'Config Filename')
    .option('-c, --consistency [level]', 'Tunably Consistency Level')
    .parse(process.argv);


  if(program.consistency) consistency_level = program.consistency;
  if(!program.config) console.log('Server running with default config file.'.yellow);

  console.log('Running server with consistency of ['.yellow, consistency_levels[consistency_level], ']'.yellow);

  db.setupDB(db_type, db_object);
}
