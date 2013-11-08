// Server-side API
// Will expose functionality underneath a global 'wafer' object.
exports.get = function(key){
  console.log('server_get('+key+')');
};

exports.put = function(key, value){
  console.log('server_put('+key+', '+value+')');
};

function invalidate(){

}