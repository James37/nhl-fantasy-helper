How to Use This Script
This script automatically downloads NHL player data (skaters and goalies) for multiple seasons from the official NHL stats API, merges different data sources, cleans it up, and saves it as JSON.

1. Make sure you have these files:
skaterAttributes.json — list of fields to keep for skaters.

goalieAttributes.json — list of fields to keep for goalies.

(See examples below if you need to create them from scratch.)

2. Make sure this folder exists:
./src/data/playerData/
The script will save all output here.

3. Install dependencies:
npm install lodash
(Uses Node’s built-in fs and fetch, so no other packages needed.)

4. Run the script:
node skaterScript.js
5. What happens when you run it:
Fetches data for the seasons listed in years at the top of the script.

For each season:

Skaters → gets summary stats, bios, and realtime data

Goalies → gets summary stats and bios

Merges all the data into one record per player.

Keeps only the attributes you listed in the JSON files.

Saves:

skaterData.json — all skater data by season

goalieData.json — all goalie data by season

playersMissingAttributes.json — skaters missing any expected fields

goaliesMissingAttributes.json — goalies missing any expected fields

You can now load those JSON files in your app or analysis project.