var database;

exports.setupDB = function(db_type, db_object){
  console.log(db_type);
  switch(db_type) {
    case 'mongo':
      database = db_object;
      break;
    case 'redis':
      database = {};
      break;
    default:
      console.log('default');
      break;
  }
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
  database.insert({'_id': key, 'value': value}).toArray(function(err, result){

    if(err) {
      cb({'error': 'error'});
    } else {
      cb({'success': 'success'});
    }
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
  database.find({'_id': key}).limit(1).toArray(function(err, result){

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
  database.update({'_id': key, 'value': value}).toArray(function(err, result){

    if(err) {
      cb({'error': 'error'});
    } else {
      cb({'success': 'success'});
    }
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
  database.remove({'_id': key}, function(err, result){

    if(err) {
      cb({'error': 'error'});
    } else {
      cb({'success': 'success'});
    }
  });
};