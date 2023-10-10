const fs = require("fs");

const playerData = require("./sData.json");
const extraData = require("./extraData.json");

// Create a Map to store the merged data by playerId
const mergedDataMap = new Map();

// Add data from playerData.json
playerData.forEach((player) => {
  mergedDataMap.set(player.playerId, player);
});

// Add or overwrite data from extraData.json
extraData.forEach((extra) => {
  mergedDataMap.set(extra.playerId, {
    ...mergedDataMap.get(extra.playerId),
    ...extra,
  });
});

// Convert the Map back to an array of objects
const mergedData = Array.from(mergedDataMap.values());

// Write the merged data to a new file
fs.writeFileSync("mergedData.json", JSON.stringify(mergedData, null, 2));

console.log("Merged data saved to mergedData.json");
