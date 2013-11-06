/*
 * grunt-rev
 * https://github.com/cbas/grunt-rev
 *
 * Copyright (c) 2013 Sebastiaan Deckers
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs'),
  path = require('path'),
  crypto = require('crypto');

var BUFFER_SIZE = 1024 * 64;

module.exports = function(grunt) {

  function md5(filepath, algorithm, encoding, fileEncoding) {
    var hash = crypto.createHash(algorithm);
    grunt.log.verbose.write('Hashing ' + filepath + '...');
    hash.update(grunt.file.read(filepath), fileEncoding);
    return hash.digest(encoding);
  }

  grunt.registerMultiTask('rev', 'Prefix static asset file names with a content hash', function() {

    var options = this.options({
      encoding: 'utf8',
      algorithm: 'md5',
      length: 8,
      preserve: false
    });

    this.files.forEach(function(filePair) {
      filePair.src.forEach(function(f) {

        var hash = md5(f, options.algorithm, 'hex', options.encoding),
          prefix = hash.slice(0, options.length),
          renamed = [prefix, path.basename(f)].join('.'),
          outPath = path.resolve(path.dirname(f), renamed),
          buffer = new Buffer(BUFFER_SIZE),
          reader = fs.openSync(f, 'r'),
          writer = fs.openSync(outPath, 'w'),
          bytesRead = 0,
          pos = 0;

        grunt.verbose.ok().ok(hash);

        do {
          bytesRead = fs.readSync(reader, buffer, 0, BUFFER_SIZE, pos);
          fs.writeSync(writer, buffer, 0, bytesRead);
          pos += bytesRead;
        } while ( bytesRead > 0 )

        fs.closeSync(reader);
        fs.closeSync(writer);

        if ( !options.preserve ) {
          fs.unlinkSync(f);
        }

        grunt.log.write(f + ' ').ok(renamed);
      });
    });

  });

};
