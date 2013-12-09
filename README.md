waferDB.js -- Caching Middleware for JavaScript
==========

A lightweight caching layer for a key-value store.

<img src="http://semiaccurate.com/assets/uploads/2011/05/TSMC-Wafer.jpg" width="200px">

## usage

    wafer.create('user_2389', 'shopping_cart_full', function(response){
      if(response.success) {
        // ...
      }
    });

    wafer.read('user_2389', function(response){
      console.log(response);
    });

    wafer.update('user_2389', 'shopping_cart_empty', function(response){
      if(response.success) {
        // ...
      }
    });

    wafer.delete('user_2389', function(response){
      if(response.success) {
        // ...
      }
    });

## evaluation

Latency - A graph showing response times with and without waferDB.

Efficiency - A graph comparing the overhead of maintaining fresh objects in the cache vs. dumping objects on dirty.

Scalability - Measure performance with N clients.

## tests

Will get to this later...

## install (eventually)

`npm install waferdb`

### Authors:

Matt Kneiser

Vijairam Parasuraman

Balaji Soundararajan

## Features

- will return the object associated with that key. To optimize for low latency, this object maybe cached on the client. Caching takes into account dirty objects, and replenishes them according to the consistency level the server is set to.

- run a command to get statistics (cache hit rate, etc.)

- resilient to server going down/reconnects save state (write to fs asynchly, don't affect server perf)

- db adapter is modular and easy to extend

- API should let you write if(data.success) { "success": "success" }

## TODO
- don't invalidate cache of sender on delete
- ensure mongo integration
- cloud mongo integration
- pull/push changes
- CRUD
  - deleting non-existant keys
  - alert on failure not success
  - update/insert empty key (don't allow)



- //clean up DB & README for npm
- //npm publish
- graphs
- performance eval
- demo ready



VISUALS
- performance graphs
- view of the cache
- buttons to send data
