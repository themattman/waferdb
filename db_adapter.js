var mongo = require('./database.js')
;

/**
  * CRUD Operations *UNTESTED*
  *
  */


/**
  * Create
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
exports.insertIntoDatabase = function(key, value, cb){
  mongo.db.collection('', function(err, col){
    if(err){throw err;}
    col.insert.limit(1).toArray(function(err, result){

      if(err) {
        cb({'result': 'error'});
      } else {
        cb({'result': 'success'});
      }
    });
  });
};

/**
  * Read
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
exports.readFromDatabase = function(key, cb){
  mongo.db.collection('', function(err, col){
    if(err){throw err;}
    col.find({'_id': key}).limit(1).toArray(function(err, result){

      if(err) {
        cb({'result': 'error'});
      } else {

        cb({
          'result': 'success',
          'key': key,
          'value': result
        });

      }
    });
  });
};

/**
  * Update
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
exports.updateDatabase = function(key, value, cb){
  mongo.db.collection('', function(err, col){
    if(err){throw err;}
    col.update({'_id': key, 'value': value}).toArray(function(err, result){

      if(err) {
        cb({'result': 'error'});
      } else {
        cb({'result': 'success'});
      }
    });
  });
};

/**
  * Delete
  *
  *  input: {
  *    'key': key
  *  }
  *
  *  output: {
  *    'result': 'error/success'
  *  } 
  *
  */
exports.deleteInDatabase = function(key, cb){
  mongo.db.collection('', function(err, col){
    if(err){throw err;}
    col.insert({'_id': key}, function(err, result){

      if(err) {
        cb({'result': 'error'});
      } else {
        cb({'result': 'success'});
      }
    });
  });
};