!function() {

   var ta = {
      cacheURL: './cache/ta/matches/',
      matches: [],
      options: {},
   };

   // external module dependencies
   var fs               = require('fs');
   var d3               = require('d3');
   var util             = require('util');
   var chardet          = require('chardet');
   var ProgressBar      = require('progress');
   // var cmn              = require('./convenience')();

   ta.localCacheList = localCacheList;
   function localCacheList() {
      var files = fs.readdirSync(ta.cacheURL);
      var csvfile = /\.csv$/;
      files = files.filter(f=>csvfile.test(f));
      return files;
   }

   ta.parseArchives = function() {
      var archiveArray = localCacheList();
      if (ta.options.limit && typeof ta.options.limit != 'number') { limit = undefined; }
      var archiveQueue = (ta.options.limit && ta.options.limit > 0) ? archiveArray.splice(0, ta.options.limit) : archiveArray;
      var bar = new ProgressBar(':bar', { total: archiveQueue.length });
      return new Promise(function (resolve, reject) {
         console.log('Processing', archiveQueue.length, 'TA Match Archives');
         var parsed = Promise.all(archiveQueue.map(function(file_name) {
            bar.tick();
            return ta.parseArchive(file_name);
         }));
         parsed.then(function() {
            console.log('Parsed', ta.matches.length, 'matches');
            resolve();
         });
      });
   }

   ta.parseArchive = function(archive_name) {
      return new Promise(function (resolve, reject) {
         var promise = ta.loadFile(archive_name);
         promise.then(function(data) {
            var match_data = d3.csv.parse(data)
            var result = ta.parseMatchArray(match_data);
            resolve(result);
         });
      });
   }

   ta.parseMatchArray = parseMatchArray;
   function parseMatchArray(match_array) {
      console.log('Parsing:', match_array.length, 'Matches');
      for (var i = 0; i < match_array.length; i++) {
         ta.parseMatch(match_array[i]);
      }
   }

   ta.parseMatch = function(row) {
      var check_score = /[\d\ \-]+/g;

      // only accept matches where there was a valid score (no RET, W/O, DEF)
      if (check_score.test(row.score)) {
         ta.matches.push({ 
            // winner_name: cmn.normalizeName(row.winner_name),
            // loser_name: cmn.normalizeName(row.loser_name),
            winner_name: row.winner_name,
            loser_name: row.loser_name,
            score: row.score,
            surface: row.surface,
            level: row.tourney_level,
            date: parseDate(row.tourney_date),
            num: +row.match_num
         });
      }

      function parseDate(numerical) {
         return numerical.substring(0,4) + '-' + numerical.substring(4, 6) + '-' + numerical.substring(6);
      }
   }

   ta.loadFile = function(file_name) {
      var targetFile = ta.cacheURL + file_name;
      var chard = chardet.detectFileSync(targetFile);
      var encoding = (chard.indexOf('ISO') >= 0 || ['UTF-8','windows-1252','GB18030'].indexOf(chard) >= 0) ? 'utf8' : 'utf16le';
      return new Promise(function (resolve, reject) {
         fs.readFile(targetFile, encoding, function (err, data) { 
            if (!err) { 
               resolve(data);
            } else {
               console.log(err);
               reject();
            }
         });
      });
   }

   if (typeof define === "function" && define.amd) define(ta); else if (typeof module === "object" && module.exports) module.exports = ta;
   this.ta = ta;
 
}();
