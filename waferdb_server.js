var consistency_levels = ['refresh-on-dirty', 'flush-on-dirty', 'fire-and-forget']
  , consistency_level  = 0
;

// Server-side API
exports.get = function(key){
  console.log('server_get('+key+')');
};

exports.put = function(key, value){
  console.log('server_put('+key+', '+value+')');
};

exports.set_consistency_level = function(new_consistency_level){
  consistency_level = new_consistency_level;
};

function invalidate(){

}
