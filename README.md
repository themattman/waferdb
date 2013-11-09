waferDB.js -- Caching Middleware for JavaScript
==========

A lightweight caching layer for a key-value store.

<img src="http://semiaccurate.com/assets/uploads/2011/05/TSMC-Wafer.jpg" width="200px">

## usage

    wafer.get('user_2389', function(data){
      console.log(data);
    });

will return the object associated with that key. To optimize for low latency, this object maybe cached on the client. Caching takes into account dirty objects, and replenishes them according to the consistency level the server is set to.

    wafer.put('user_3823', 'shopping_cart_full', function(response){
      console.log(response);
    });

## tunable consistency

### refresh-on-dirty

### purge-on-dirty

### fire-and-forget

## evaluation

Latency - A graph showing response times with and without waferDB.

Efficiency - A graph comparing the overhead of maintaining fresh objects in the cache vs. dumping objects on dirty.

Scalability - Measure performance with N clients.

## tests

We will have a `test` folder that utilizes tap `https://npmjs.org/package/tap`

## install (eventually)

`npm install waferdb`

### Authors:

Matt Kneiser

Vijairam Parasuraman

Balaji Soundararajan

## Features

- run a command to get statistics (cache hit rate, etc.)

- resilient to server going down (write to fs asynchly, don't affect server perf)
