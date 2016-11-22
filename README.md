# tennis-elo
Javascript implementation of Elo for Tennis inspired by FiveThirtyEight.com

[requires .csv files from TennisAbstract](https://github.com/JeffSackmann/tennis_atp)


```
 elo = require('./elo');
 elo.cacheURL = './';    // location of tennis abstract .csv files
 elo.parseArchives();
 
 players = elo.processElo(elo.matches);
 players['Novak Djokovic'].rating;
 
 clay = elo.matches.filter(f=>f.surface == 'Clay');
 hard = elo.matches.filter(f=>f.surface == 'Hard');
 grass = elo.matches.filter(f=>f.surface == 'Grass');
 
 playersClay = elo.processElo(clay);
 playersHard = elo.processElo(hard);
 playersGrass = elo.processElo(grass);

 playersClay['Novak Djokovic'].rating
```
