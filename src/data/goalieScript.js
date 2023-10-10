const fs = require('fs');

// Read the JSON file
const rawData = fs.readFileSync('gData.json');
const goalieData = JSON.parse(rawData);

// Modify the property name
const modifiedData = goalieData.map(item => ({
  ...item,
  skaterFullName: item.goalieFullName,
}));


// Write the modified data back to the file
fs.writeFileSync('gData.json', JSON.stringify(modifiedData, null, 2));

console.log('Property name modified in goalieData.json');
