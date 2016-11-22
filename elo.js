!function() {

   var elo = { 
      options: {}, 
      matches: [],
      default_rating: 1500,
      nSpread: 400,          // determines the 'spread' of the scale
      setCalc: false,        // win multipier is scaled by % sets won
      cacheURL: './cache/ta/matches/',
   };

   // external module dependencies
   var fs               = require('fs');
   var d3               = require('d3');
   var util             = require('util');
   var chardet          = require('chardet');
   var ProgressBar      = require('progress');
   // var cmn              = require('./convenience')();

   elo.processElo = function(matches) {
      var players = {};
      matches.forEach(match => {
         if (!players[match.winner_name]) players[match.winner_name] = { rating: [], matches: 0 };
         if (!players[match.loser_name])  players[match.loser_name] = { rating: [], matches: 0 };
         players[match.winner_name].matches += 1;
         players[match.loser_name].matches  += 1;
         elo.updateElo(players, match.winner_name, match.loser_name, match.score, match.level, match.date);
      });
      return players;
   };

   elo.updateElo = function(players, winner, loser, score, level, match_date) {
      if (!winner || !loser) return;

      var w_rating = lastElement(players[winner].rating) ? lastElement(players[winner].rating).value : elo.default_rating;
      var l_rating = lastElement(players[loser].rating)  ? lastElement(players[loser].rating).value  : elo.default_rating;
      var w_matches = players[winner].matches;
      var l_matches = players[loser].matches;

      var calc = elo.calcElo(w_rating, w_matches, l_rating, l_matches, score, level);

      players[winner].rating.push({ value: calc.winner, date: match_date });
      players[loser].rating.push( { value: calc.loser,  date: match_date });

      function lastElement(arr) { return arr[arr.length - 1]; }
   }

   elo.calcElo = function(w_rating, w_matches, l_rating, l_matches, score, level) {
      var k = 1; // win multiplier
      var w_expect = 1 / (1 + Math.pow(10, ((l_rating - w_rating) / elo.nSpread)));
      var l_expect = 1 / (1 + Math.pow(10, ((w_rating - l_rating) / elo.nSpread)));
      var w_kValue = 250 / Math.pow(w_matches + 5, .4);
      var l_kValue = 250 / Math.pow(l_matches + 5, .4);
      if (elo.setCalc) {
         // https://www.stat.berkeley.edu/~aldous/157/Old_Projects/huang.pdf
         k = level == "G" ? (3 / score.split(' ').length) : (2 / score.split(' ').length);
      }
      var w_new_rating = w_rating + (k * w_kValue) * (1 - w_expect);
      var l_new_rating = l_rating + (k * l_kValue) * (0 - l_expect);
      return { winner: w_new_rating, loser: l_new_rating };
   }

   elo.localCacheList = localCacheList;
   function localCacheList() {
      var files = fs.readdirSync(elo.cacheURL);
      var csvfile = /\.csv$/;
      files = files.filter(f=>csvfile.test(f));
      return files;
   }

   elo.parseArchives = function() {
      var archiveArray = localCacheList();
      if (elo.options.limit && typeof elo.options.limit != 'number') { limit = undefined; }
      var archiveQueue = (elo.options.limit && elo.options.limit > 0) ? archiveArray.splice(0, elo.options.limit) : archiveArray;
      var bar = new ProgressBar(':bar', { total: archiveQueue.length });
      return new Promise(function (resolve, reject) {
         console.log('Processing', archiveQueue.length, 'TA Match Archives');
         var parsed = Promise.all(archiveQueue.map(function(file_name) {
            bar.tick();
            return elo.parseArchive(file_name);
         }));
         parsed.then(function() {
            console.log('Parsed', elo.matches.length, 'matches');
            elo.matches.sort(getSortMethod('+date', '+num'));
            resolve();
         });
      });
   }

   elo.parseArchive = function(archive_name) {
      return new Promise(function (resolve, reject) {
         var promise = elo.loadFile(archive_name);
         promise.then(function(data) {
            var match_data = d3.csv.parse(data)
            var result = elo.parseMatchArray(match_data);
            resolve(result);
         });
      });
   }

   elo.parseMatchArray = parseMatchArray;
   function parseMatchArray(match_array) {
      console.log('Parsing:', match_array.length, 'Matches');
      for (var i = 0; i < match_array.length; i++) {
         elo.parseMatch(match_array[i]);
      }
   }

   elo.parseMatch = function(row) {
      var check_score = /[\d\ \-]+/g;

      // only accept matches where there was a valid score (no RET, W/O, DEF)
      if (check_score.test(row.score)) {
         elo.matches.push({ 
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

   elo.loadFile = function(file_name) {
      var targetFile = elo.cacheURL + file_name;
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

   function getSortMethod(){
      var _args = Array.prototype.slice.call(arguments);
      return function(a, b){
         for(var x in _args){
            var ax = a[_args[x].substring(1)];
            var bx = b[_args[x].substring(1)];
            var cx;

            ax = typeof ax == "string" ? ax.toLowerCase() : ax / 1;
            bx = typeof bx == "string" ? bx.toLowerCase() : bx / 1;

            if(_args[x].substring(0,1) == "-"){cx = ax; ax = bx; bx = cx;}
            if(ax != bx){return ax < bx ? -1 : 1;}
         }
      }
   }

   if (typeof define === "function" && define.amd) define(elo); else if (typeof module === "object" && module.exports) module.exports = elo;
   this.elo = elo;
 
}();
