/**
  * Get
  *
  *  input: {
  *    'key': key
  *  }
  * 
  *  output: {
  *    'result': 'error/success',
  *    'key': key,
  *    'value': value
  *  }
  *
  */
exports.getFromDatabase = function(key, cb){
  cb({
    'result': 'success',
    'key': key,
    'value': value
  });
};

/**
  * Write
  *
  *  input: {
  *    'key': key,
  *    'value': value
  *  }
  *
  *  output: {
  *    'result': 'error/success'
  *  } 
  *
  */
exports.writeToDatabase = function(key, cb){
  cb({
    'result': 'success'
  });
};
