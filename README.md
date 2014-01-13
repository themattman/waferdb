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
    
## motivation

WaferDB is a Javascript library that client-side Web applications can use to access a database. From the client’s perspective, WaferDB is the entire datastore. From the server’s perspective, WaferDB is a caching layer.

The database behind WaferDB can either be local to the web server, or a remote cloud service. The main purpose of WaferDB is to provide an easy-to-use client-side API for data access, as well as a layer that reduces latency to clients of a webserver. This layer will cache objects on the client whenever possible and will be backed by a shared, server-side database system.

In other words, WaferDB is a caching middleware for Javascript that allows a client to cache all kinds of data in native JSON format. The server maintains metadata about all the client-side caches and coordinates consistency between them.

## install

`npm install waferdb`

### Authors:

Matt Kneiser

Vijairam Parasuraman

Balaji Soundararajan

## Features

- will return the object associated with that key. To optimize for low latency, this object maybe cached on the client. Caching takes into account dirty objects, and replenishes them according to the consistency level the server is set to.

- resilient to server going down/reconnects save state (write to fs asynchly, doesn't affect server performance too much)

- db adapter is modular and easy to extend

- front-end API should let you write if(data.success) { "success": "success" }
