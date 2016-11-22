!function() {

   var elo = { 
      default_rating: 1500,
      nSpread:        400,    // determines the 'spread' of the scale
      kCalc:          k538,   // use calculation defined by FiveThirtyEight.com
      kMultiplier:    kSet    // change to kDefault for value of 1
   };

   elo.processMatches = function(matches) {
      var players = {};
      matches.sort(getSortMethod('+date', '+num'));
      matches.forEach(match => {
         if (!players[match.winner_name]) players[match.winner_name] = { rating: [], matches: 0 };
         if (!players[match.loser_name])  players[match.loser_name] = { rating: [], matches: 0 };
         players[match.winner_name].matches += 1;
         players[match.loser_name].matches  += 1;
         elo.updatePlayers(players, match.winner_name, match.loser_name, match.score, match.level, match.date);
      });
      return players;
   };

   elo.updatePlayers = function(players, winner, loser, score, level, match_date) {
      if (!winner || !loser) return;

      var w_rating = lastElement(players[winner].rating) ? lastElement(players[winner].rating).value : elo.default_rating;
      var l_rating = lastElement(players[loser].rating)  ? lastElement(players[loser].rating).value  : elo.default_rating;
      var w_matches = players[winner].matches;
      var l_matches = players[loser].matches;

      var calc = elo.calculate(w_rating, w_matches, l_rating, l_matches, score, level);

      players[winner].rating.push({ value: calc.winner, date: match_date });
      players[loser].rating.push( { value: calc.loser,  date: match_date });

      function lastElement(arr) { return arr[arr.length - 1]; }
   }

   elo.expect = function(a, b) { return 1 / (1 + Math.pow(10, ((a - b) / elo.nSpread))); }

   elo.calculate = function(w_rating, w_matches, l_rating, l_matches, score, level) {
      var w_expect = elo.expect(l_rating, w_rating);
      var l_expect = elo.expect(w_rating, l_rating);
      var w_kValue = elo.kCalc(w_matches);
      var l_kValue = elo.kCalc(l_matches);
      var k = elo.kMultiplier(level, score);
      var w_new_rating = w_rating + (k * w_kValue) * (1 - w_expect);
      var l_new_rating = l_rating + (k * l_kValue) * (0 - l_expect);
      return { winner: w_new_rating, loser: l_new_rating };
   }

   // see footnote #3 here:
   // http://fivethirtyeight.com/features/serena-williams-and-the-difference-between-all-time-great-and-greatest-of-all-time/
   function k538(matches) { return 250 / Math.pow(matches + 5, .4); }

   function kDefault() { return 1; }

   // win multipier is scaled by % sets won
   // https://www.stat.berkeley.edu/~aldous/157/Old_Projects/huang.pdf
   function kSet(level, score) {
      return level == "G" ? (3 / score.split(' ').length) : (2 / score.split(' ').length);
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

            if (_args[x].substring(0, 1) == "-") { cx = ax; ax = bx; bx = cx; }
            if (ax != bx) { return ax < bx ? -1 : 1; }
         }
      }
   }

   if (typeof define === "function" && define.amd) define(elo); else if (typeof module === "object" && module.exports) module.exports = elo;
   this.elo = elo;
 
}();
