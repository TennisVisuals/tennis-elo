# tennis-elo
Javascript implementation of Elo for Tennis inspired by FiveThirtyEight.com

requires .csv files from TennisAbstract https://github.com/JeffSackmann/tennis_atp

```
 elo = require('./elo');
 elo.cacheURL = './';    // location of tennis abstract .csv files
 elo.parseArchives();
 elo.processElo();
 elo.players['Novak Djokovic'].rating;
```
