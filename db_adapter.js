var database
  , dbtype
;

exports.setupDB = function(db_type, db_object){
  dbtype = db_type;
  database = db_object;
  console.log(db_type);
};

function result_callback(err, result){
  if(err) {
    cb({'error': 'error'});
  } else {
    cb({'success': 'success'});
  }
}

function read_callback(err, result){
  if(err) {
    cb({'error': 'error'});
  } else {
    cb({
      'success': 'success',
      'key': key,
      'value': result
    });
  }
}

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
      database.insert({'_id': key, 'value': value}).toArray(result_callback);
      break;
    case 'redis':
      // set/get/set/del
      database.set(key, value, result_callback);
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
      database.find({'_id': key}).limit(1).toArray(read_callback);
      break;
    case 'redis':
      // set/get/set/del
      database.get(key, read_callback);
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
      database.update({'_id': key, 'value': value}).toArray(result_callback);
      break;
    case 'redis':
      // set/get/set/del
      database.set(key, value, result_callback);
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
      database.remove({'_id': key}).toArray(result_callback);
      break;
    case 'redis':
      // set/get/set/del
      database.del(key, result_callback);
      break;
    default:
      console.log('default');
      break;
  }
};
