// Client-side API
// Will expose functionality underneath a global 'wafer' object.
var wafer = (function(){
  var socket = io.connect('http://localhost:9000')
    , API       = {}
    , cache     = {}
    , socket_id = null
  ;

  /**
    * Socket.IO Event Handling
    *
    */
  socket.on('connecting', function(){
    console.log('connecting');
  });
  socket.on('connect', function(){
    console.log('connected');
  });
  socket.on('get_connected_id', function(data){
    console.log('get_connected_id', data);
    socket_id = data.socket_id;
  });
  socket.on('reconnect', function(){
    console.log('reconnected');
    socket.emit('reconnect', { 'socket_id': socket_id });
  });
  socket.on('disconnect', function(){
    console.log('disconnected');
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
  }

  function removeFromCache(key){
    // remove from cache
    delete cache[key];
  }

  /**
    * CREATE:
    *  writes value to server
    *  writes value to cache
    *
    */
  API.create = function(key, value, cb){
    console.log('client_create('+key+', '+value+')');

    /**
      * CREATE to server
      *
      */
    socket.emit('create', { 'key': key, 'value': value });
    socket.on('create_ack', function(data) {
      console.log('#create_ack#');
      console.log(data);

      if(data.success) {
        if(inCache(key)) {
          // Modify cache after server's create_ack
          writeToCache(key, value);
        }
      }

      // return to user
      cb(data);
    });
  };

  /**
    * READ:
    *  responds from cache
    *  otherwise goes to server
    *
    */
  API.read = function(key, cb){
    console.log('client_read('+key+')');

    if(!inCache(key)) {
      /**
        * READ from server
        *
        */
      socket.emit('read', { 'key': key });
      socket.on('read_ack', function(data) {
        console.log('#read_ack#');
        console.log(data);

        if(data.success) {
          // Cache the retrieved value
          writeToCache(key, data.value);
        }

        // return to user
        cb(data);
      });
    } else {
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
    console.log('client_update('+key+', '+value+')');
  
      /**
        * GET from server
        *
        */
      socket.emit('update', { 'key': key, 'value': value });
      socket.on('update_ack', function(data) {
        console.log('#update_ack#');
        console.log(data);

        if(data.success) {
          if(inCache(key)) {
            // Cache the retrieved value
            writeToCache(key, data.value);
          }
        }

        // return to user
        cb(data);
      });
    
  };


 /**
    * DELETE:
    *  Deletes value from server
    *  Deletes value from cache
    *
    */
  API.delete = function(key, cb){
    console.log('client_delete('+key+')');

    /**
      * Delete in server
      *
      */
    socket.emit('delete', { 'key': key });
    socket.on('delete_ack', function(data) {
      console.log('#delete_ack#');
      console.log(data);

      if(data.success) {
        if(inCache(key)) {
          // Delete cache line after server's delete_ack
          removeFromCache(key);
        }
      }

      cb(data);
    });
  };

  return API;
})();
