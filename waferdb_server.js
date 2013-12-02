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
    'socket': socket,
    'reconnected': false
  };

  // Send the client it's id so that it can re-establish its connection if broken
  socket.emit('get_connected_id', { 'socket_id': socket.id });

  /**
    * Disconnect (default)
    *
    */
  socket.on('disconnect', function(data){
    console.log('disconnect');
    setTimeout(function(){
      console.log('disconnect timeout');
      console.log(server_cache);
      if(!server_cache[socket.id].reconnected) {
        delete server_cache[socket.id];
        console.log('deleted');
      } else {
        server_cache[socket.id].reconnected = false;
        console.log('grace period');
      }
      console.log(server_cache);
    }, 2000); // gives client 60 seconds to reconnect
  });

  /**
    * Reconnect (thrown together sloppily)
    *
    */
  socket.on('reconnect', function(data){
    console.log('reconnect', socket.id);
    console.log(data);
    if(data && data.socket_id && server_cache[data.socket_id]) {
      server_cache[data.socket_id].reconnected = true;
    } else {
      console.log('reconnect failed: server_cache didn\'t have the socket_id');
    }
  });

  /**
    * CREATE
    *
    */
  socket.on('create', function(request){
    // 1. Log the put operation
    console.log('server_create('+request.key+', '+request.value+')');

    // 2. Write the value to the database
    db.insertIntoDatabase(request.key, request.value, function(db_response){

      // 3. Invalidate the other caches
      invalidate_caches(request.key, request.value, socket, function(){
        console.log('done invalidating caches');

        // 4. Insert into server_cache
        console.log(server_cache);
        server_cache[socket.id].keys.push(request.key);
        console.log(server_cache);

        // 5. Confirm write to client
        socket.emit('create_ack', db_response);
      });
    });
  });

  /**
    * READ
    *
    */
  socket.on('read', function(request){
    // 1. Log the get operation
    console.log('server_read('+request.key+')');

    // 2. Read the value from the database
    db.readFromDatabase(request.key, function(db_response){
      socket.emit('read_ack', db_response);
    });

    // 3. Update server cache when the client get's a key
    // Saving on time? This should execute during db I/O
    server_cache[socket.id].keys.push(request.key);
  });

  /**
    * UPDATE
    *
    */
  socket.on('update', function(request){
    // 1. Log the get operation
    console.log('server_update('+request.key+', '+request.value+')');

    // 2. Update the value to the database
    db.updateDatabase(request.key, request.value, function(db_response){
      socket.emit('update_ack', db_response);
    });

    // 3. Update the server_cache


    // 3. Invalidate the other caches
    invalidate_caches(request.key, request.value, socket, function(){
      console.log('done invalidating caches');
    });
  });

  /**
    * DELETE
    *
    */
  socket.on('delete', function(request){
    // 1. Log the put operation
    console.log('server_delete('+request.key+')');

    // 2. Write the value to the database
    db.deleteInDatabase(request.key, function(db_response){
      socket.emit('delete_ack', db_response);
    });

    // 3. Invalidate the other caches
    invalidate_caches(request.key, request.value, socket, function(){
      console.log('done invalidating caches');
    });
  });
});

function invalidate_caches(key, value, socket, cb){
  console.log('INVALIDATE PRINTOUT');
  for(var i in server_cache) {
    var key_loc = server_cache[i].keys.indexOf(key);
    if(key_loc > -1 && server_cache[i].socket !== socket) {
      console.log('invalidate', server_cache[i].socket.id, '| key:', key, 'value:', value);
      server_cache[i].socket.emit('invalidate', { 'key': key, 'value': value });
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
