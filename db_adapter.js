var database
  , dbtype
;

exports.setupDB = function(db_type, db_object){
  dbtype = db_type;
  database = db_object;
  console.log(db_type);
};

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
  switch(dbtype) {
    case 'mongodb':
      // insert/find/update/remove
      database.insert({'_id': key, 'value': value}, function(err, result){
        if(err) {
          cb({'error': 'error'});
        } else {
          cb({'success': 'success'});
        }
      });
      break;
    case 'redis':
      // set/get/set/del
      database.set(key, value, function(err, result){
        if(err) {
          cb({'error': 'error'});
        } else {
          cb({'success': 'success'});
        }
      });
      break;
    default:
      console.log('default');
      break;
  }
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
  switch(dbtype) {
    case 'mongodb':
      // insert/find/update/remove
      database.find({'_id': key}).limit(1).toArray(function(err, result){
        if(err) {
          cb({'error': 'error'});
        } else {
          cb({
            'success': 'success',
            'key': key,
            'value': result[0].value
          });
        }
      });
      break;
    case 'redis':
      // set/get/set/del
      database.get(key, function(err, result){
        if(err) {
          cb({'error': 'error'});
        } else {
          cb({
            'success': 'success',
            'key': key,
            'value': result
          });
        }
      });
      break;
    default:
      console.log('default');
      break;
  }
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
  switch(dbtype) {
    case 'mongodb':
      // insert/find/update/remove
      database.update({'_id': key}, {'value': value}, function(err, result){
        if(err) {
          cb({'error': 'error'});
        } else {
          cb({'success': 'success'});
        }
      });
      break;
    case 'redis':
      // set/get/set/del
      database.set(key, value, function(err, result){
        if(err) {
          cb({'error': 'error'});
        } else {
          cb({'success': 'success'});
        }
      });
      break;
    default:
      console.log('default');
      break;
  }
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
  switch(dbtype) {
    case 'mongodb':
      // insert/find/update/remove
      database.remove({'_id': key}, function(err, result){
        if(err) {
          cb({'error': 'error'});
        } else {
          cb({'success': 'success'});
        }
      });
      break;
    case 'redis':
      // set/get/set/del
      database.del(key, function(err, result){
        if(err) {
          cb({'error': 'error'});
        } else {
          cb({'success': 'success'});
        }
      });
      break;
    default:
      console.log('default');
      break;
  }
};
