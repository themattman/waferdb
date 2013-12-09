// Client-side API
// Will expose functionality underneath a global 'wafer' object.
var wafer = (function(){
  var socket = io.connect('http://localhost:9000')
    , API       = {}
    , cache     = {}
    , socket_id = null
    , demo      = true
  ;

  /**
    * Socket.IO Event Handling
    *
    */
  socket.on('connecting', function(){
    console.log('connecting');
    $('#status').attr('fill', 'yellow');
    d3.select("#status").style("fill", 'yellow');
  });
  socket.on('connect', function(){
    console.log('connected');
    $('#status').attr('fill', 'green');
    d3.select("#status").style("fill", 'green');
  });
  socket.on('get_connected_id', function(data){
    console.log('get_connected_id', data);
    socket_id = data.socket_id;
  });
  socket.on('reconnect', function(){
    console.log('reconnected');
    socket.emit('reconnect', { 'socket_id': socket_id });
    //$('#status').attr('fill', 'yellow');
    d3.select("#status").style("fill", 'yellow');
  });
  socket.on('disconnect', function(){
    console.log('disconnected');
    $('#status').attr('fill', 'red');
    d3.select("#status").style("fill", 'red');
  });
  socket.on('invalidate', function(data){
    console.group('INVALIDATE');
    console.log(data);
    if(inCache(data.key)) {
      if(!data.value) {
        console.log('removing from cache');
        removeFromCache(data.key);
      } else {
        writeToCache(data.key, data.value);
      }

      if(demo) {
        $('.data-tbody #'+data.key).text(data.value);
      }
    }
    console.groupEnd();
  });
  socket.on('error', function(data){
    console.log('ERROR!');
    console.log(data);
  });


  function inCache(key){
    // Lookup the key in the cache
    // returns 'true' if the key is in the cache
    // returns 'false' otherwise
    if(cache[key]) {
      return true;
    } else {
      return false;
    }
  }

  function getFromCache(key){
    // Retrieve the value associated with the given key from the cache
    return cache[key];
  }

  function writeToCache(key, value){
    // write to the cache
    cache[key] = value;
    console.log('writeToCache');
    if($('.row-'+key).length > 0) {
      console.log(value);
      $('.row-'+key)[0].lastChild.innerHTML = value
    } else {
      $('.data-tbody').append('<tr class="row-'+key+'"><td>'+key+'</td><td>'+value+'</td></tr>');
    }
  }

  function removeFromCache(key){
    // remove from cache
    delete cache[key];
    $('.row-'+key).remove();
  }

  /**
    * CREATE:
    *  writes value to server
    *  writes value to cache
    *
    */
  API.create = function(key, value, cb){
    console.group('CREATE');
    console.log('waferdb_client.create('+key+', '+value+')');
    if(!key) {
      cb({'error': 'empty key provided'});
    } else {
      /**
        * CREATE to server
        *
        */
      socket.emit('create', { 'key': key, 'value': value });
      socket.on('create_ack', function(data) {
        console.log('waferdb_client.create_ack', data);
        console.groupEnd();

        if(data.success) {
          // Modify cache after server's create_ack
          writeToCache(key, value);
        }

        // return to user
        cb(data);
      });
    }
  };

  /**
    * READ:
    *  responds from cache
    *  otherwise goes to server
    *
    */
  API.read = function(key, cb){
    console.group('READ');
    console.log('waferdb_client.read('+key+')');
    if(!key) {
      cb({'error': 'empty key provided'});
    } else if(!inCache(key)) {
      /**
        * READ from server
        *
        */
      socket.emit('read', { 'key': key });
      socket.on('read_ack', function(data) {
        console.log('waferdb_client.read_ack', data);
        console.groupEnd();

        if(data.success) {
          // Cache the retrieved value
          writeToCache(key, data.value);
        }

        // return to user
        cb(data);
      });
    } else {
      console.groupEnd();
      // Retrieve from cache & return to user
      cb(getFromCache(key));
    }
  };
  
  /**
    * UPDATE:
    *  goes to server to add the line
    * Server could already have the line, in which case update the cache acordingly
    */
  API.update = function(key, value, cb){
    console.group('UPDATE');
    console.log('waferdb_client.update('+key+', '+value+')');
    if(!key) {
      cb({'error': 'empty key provided'});
    } else {
      /**
        * GET from server
        *
        */
      socket.emit('update', { 'key': key, 'value': value });
      socket.on('update_ack', function(data) {
        console.log('waferdb_client.update_ack', data);
        console.groupEnd();

        if(data.success) {
          // Cache the retrieved value
          writeToCache(key, value);
        }

        // return to user
        cb(data);
      });
    }
    
  };


 /**
    * DELETE:
    *  Deletes value from server
    *  Deletes value from cache
    *
    */
  API.delete = function(key, cb){
    console.group('DELETE');
    console.log('waferdb_client.delete('+key+')');
    if(!key) {
      cb({'error': 'empty key provided'});
    } else {
      /**
        * Delete in server
        *
        */
      socket.emit('delete', { 'key': key });
      socket.on('delete_ack', function(data) {
        console.log('waferdb_client.delete_ack', data);
        console.groupEnd();

        if(data.success) {
          if(inCache(key)) {
            // Delete cache line after server's delete_ack
            removeFromCache(key);
          }
        }

        cb(data);
      });
    }
  };

  return API;
})();
