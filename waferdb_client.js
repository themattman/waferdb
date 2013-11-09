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
    return true; // for testing purposes only
  }

  function getKey(key){
    // Retrieve the value associated with the given key from the cache
    return true; // for testing purposes only
  }

  function writeCache(key, value){
    // write to the cache
  }

  /**
    * GET:
    *  responds from cache
    *  otherwise goes to server
    *
    */
  API.get = function(key, cb){
    console.log('client_get('+key+')');

    if(!inCache(key)) {
      /**
        * GET from server
        *
        */
      socket.emit('get', { 'key': key });
      socket.on('get_ack', function(data) {
        console.log('#get_ack#');
        console.log(data);

        // return to user
        cb({ 'result': data });
      });
    } else {
      // Retrieve from cache & return to user
      cb({ 'result': getKey(key) });
    }
  };

  /**
    * PUT:
    *  writes value to server
    *  writes value to cache
    *
    */
  API.put = function(key, value, cb){
    console.log('client_put('+key+', '+value+')');

    /**
      * PUT to server
      *
      */
    socket.emit('put', { 'key': key, 'value': value });
    socket.on('put_ack', function(data) {
      console.log('#put_ack#');
      console.log(data);

      if(data.result === 'error') {

        // return to user
        cb({ 'result': 'error' });
      } else {
        if(inCache(key)) {
          // Modify cache after server's put_ack
          writeCache(key, value);
        }

        // return to user
        cb({ 'result': 'success' });
      }
    });
  };

  return API;
})();
