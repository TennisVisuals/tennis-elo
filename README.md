# tennis-elo
Javascript implementation of Elo for Tennis 

Following the lead of the team at [FiveThirtyEight.com](http://fivethirtyeight.com/features/serena-williams-and-the-difference-between-all-time-great-and-greatest-of-all-time/) (see footnote #3)

Hat tip to [sleepomeno](https://github.com/sleepomeno/tennis_atp/blob/master/examples/elo.R) who implemented in R

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
