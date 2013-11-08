// Client-side API
// Will expose functionality underneath a global 'wafer' object.
var wafer = (function(){
  var API = {};

  API.get = function(key){
    console.log('client_get('+key+')');
  };

  API.put = function(key, value){
    console.log('client_put('+key+', '+value+')');
  };

  return API;
})();