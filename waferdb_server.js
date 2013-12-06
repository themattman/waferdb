var io                 = require('socket.io').listen(9000).set('log level', 1) // reduce logging
  , db                 = require('./db_adapter.js')
  , consistency_levels = ['refresh-on-dirty', 'flush-on-dirty', 'fire-and-forget']
  , consistency_level  = 0
  , server_cache       = {}
  , program            = require('commander')
  , colors             = require('colors')
  , fs                 = require('fs')
  , path               = require('path')
  , fileName           = 'waferdb_metadata.js'
  , backupFileName   = path.join(__dirname, fileName)
  , backup_write_interval = 10000
  , basic_obj = { 'mykey': 'myval' }
;

exports.init = init;

io.sockets.on('connection', function(socket){
  console.log('connection established for WebSocket with wafer', socket.id);
  server_cache[socket.id] = {
    'keys': [],
    'socket': socket,
    'reconnected': false
  };

  //console.log(JSON.stringify(socket));

  //console.log(JSON.stringify({server_cache[socket_id]));

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
      //console.log(server_cache);
      if(!server_cache[socket.id].reconnected) {
        delete server_cache[socket.id];
        console.log('deleted');
      } else {
        server_cache[socket.id].reconnected = false;
        console.log('reconnected during grace period');
      }
      console.log(server_cache);
    }, 10000); // gives client 60 seconds to reconnect
  });

  /**
    * Reconnect
    *
    */
  socket.on('reconnect', function(data){
    console.log('reconnect -- new[' + socket.id + '] old[' + data.socket_id + ']');
    console.log(data);
    if(data && data.socket_id && server_cache[data.socket_id]) {
      // Create cache at new id
      server_cache[ socket.id ].keys = server_cache[ data.socket_id ].keys;
      server_cache[ socket.id ].socket = socket;
      server_cache[ socket.id ].reconnected = true;
      // Delete the old cache id
      delete server_cache[ data.socket_id ];

    } else {
      console.log('reconnect failed: server_cache didn\'t have the socket_id');
    }

    console.log(server_cache);
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
      invalidate_caches(request.key, request.value, socket, false, function(){
        //console.log('done invalidating caches');

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
    invalidate_caches(request.key, request.value, socket, false, function(){
      //console.log('done invalidating caches');
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
    invalidate_caches(request.key, request.value, socket, true, function(){
      //console.log('done invalidating caches');
    });
  });
});

function invalidate_caches(key, value, socket, delete_flag, cb){
  for(var i in server_cache) {
    // Do a safety check on the "keys" object
    if(server_cache[i].keys) {
      var key_loc = server_cache[i].keys.indexOf(key);
      if(key_loc > -1 && server_cache[i].socket && server_cache[i].socket !== socket) {
        console.log('invalidate', server_cache[i].socket.id, '| key:', key, 'value:', value);
        if(delete_flag) {
          server_cache[i].socket.emit('invalidate', { 'key': key });
        } else {
          server_cache[i].socket.emit('invalidate', { 'key': key, 'value': value });
        }
      }
    }
  }
  cb(); // placement of this depends on consistency level
}

function writeBackupToDisk(){
  console.log('\n\nwriteBackupToDisk fired');

  //check if server_cache is empty. if empty, don't write
  if(server_cache) {
    var server_cache_backup = {};
    var server_cache_backup_size = 0;
    for(var i in server_cache) {
      server_cache_backup[i] = {
        'keys': server_cache[i].keys,
        'reconnected': server_cache[i].reconnected
      };
      server_cache_backup_size++;
    }
    console.log('Writing the file (' + server_cache_backup_size + ')... ' + backupFileName);
    fs.writeFile(backupFileName, JSON.stringify(server_cache_backup), function(err) {
      if(err){throw err;}
      console.log('It\'s saved!');
    });
  }
}

function readBackupFromDisk() {
  fs.exists(backupFileName, function(exists) {
    if(exists) {
      console.log('Reading in the server_cache from disk.');
      var data = fs.readFileSync(backupFileName, 'utf8');
      server_cache = JSON.parse(data);
      console.log(server_cache);
      console.log('Done reading in data');
      setTimeout(function(){
        for(var i in server_cache) {
          if(!server_cache[i].socket) {
            console.log('Purging old backup tuple -', i);
            delete server_cache[i];
          }
        }
      }, 30000);
    } else {
      console.log('no Backup File. starting fresh');
    }
  });
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

  readBackupFromDisk();

  //call fun using set interval
  setInterval(writeBackupToDisk, backup_write_interval);

  db.setupDB(db_type, db_object);
}
