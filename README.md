# tennis-elo
Javascript implementation of Elo for Tennis 

Following the lead of the team at [FiveThirtyEight.com](http://fivethirtyeight.com/features/serena-williams-and-the-difference-between-all-time-great-and-greatest-of-all-time/) (see footnote #3)

Hat tip to [sleepomeno](https://github.com/sleepomeno/tennis_atp/blob/master/examples/elo.R) who implemented in R

[requires .csv files from TennisAbstract](https://github.com/JeffSackmann/tennis_atp)


```
 t = require('./taLoad');
 t.cacheURL = './';    // location of tennis abstract .csv files
 t.parseArchives();

 elo = require('./elo');
 
 players = elo.processMatches(t.matches);
 players['Novak Djokovic'].rating;
 
 clay = t.matches.filter(f=>f.surface == 'Clay');
 hard = t.matches.filter(f=>f.surface == 'Hard');
 grass = t.matches.filter(f=>f.surface == 'Grass');
 
 playersClay = elo.processMatches(clay);
 playersHard = elo.processMatches(hard);
 playersGrass = elo.processMatches(grass);

 playersClay['Novak Djokovic'].rating
```
