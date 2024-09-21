const skaterAttributes = require("./skaterAttributes.json");
const goalieAttributes = require("./goalieAttributes.json");
const _ = require("lodash");
const fs = require("fs").promises;

const years = ["20212022", "20222023", "20232024"];
// Base URLs for skaters and goalies
const baseUrl = "https://api.nhle.com/stats/rest/en";
const baseUrlSummarySkater = baseUrl + "/skater/summary";
const baseUrlBiosSkater = baseUrl + "/skater/bios";
const baseUrlRealtimeSkater = baseUrl + "/skater/realtime";
const baseUrlSummaryGoalie = baseUrl + "/goalie/summary";
const baseUrlBiosGoalie = baseUrl + "/goalie/bios";

const dataDir = "./src/data/playerData/";

const buildApiUrl = (url, start, limit, year) => {
  const sortParams = encodeURIComponent(
    JSON.stringify([{ property: "playerId", direction: "ASC" }])
  );
  return `${url}?isAggregate=false&isGame=false&start=${start}&limit=${limit}&sort=${sortParams}&cayenneExp=gameTypeId=2%20and%20seasonId%3C%3D${year}%20and%20seasonId%3E%3D${year}`;
};

const handleRateLimit = async (response) => {
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After") || 5;
    console.log(`Rate limit hit, retrying after ${retryAfter} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return true; // Indicates retry should happen
  }
  return false;
};

const fetchData = async (url, year) => {
  let data = [];
  let start = 0;
  const limit = 100;
  let hasMore = true;

  try {
    while (hasMore) {
      const apiUrl = buildApiUrl(url, start, limit, year);
      const response = await fetch(apiUrl);

      if (await handleRateLimit(response)) continue; // Retry if rate-limited

      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${apiUrl}`);
      }

      const result = await response.json();
      data = [...data, ...result.data];
      start += limit;
      hasMore = result.data.length === limit;
    }
  } catch (error) {
    console.error(`Error fetching data for year ${year}:`, error);
  }

  return data;
};

const mergeDataByPlayerId = (summaryData, biosData, realtimeData) => {
  const lookupSummary = _.keyBy(summaryData, "playerId");
  const lookupBios = _.keyBy(biosData, "playerId");
  const lookupRealtime = _.keyBy(realtimeData, "playerId");

  const mergedData = Object.values(
    _.merge({}, lookupSummary, lookupRealtime, lookupBios)
  );

  return mergedData.map((playerData) => _.pick(playerData, skaterAttributes));
};

const mergeGoalieDataByPlayerId = (summaryData, biosData) => {
  const lookupSummary = _.keyBy(summaryData, "playerId");
  const lookupBios = _.keyBy(biosData, "playerId");

  const mergedData = Object.values(_.merge({}, lookupSummary, lookupBios));

  return mergedData.map((playerData) => ({
    ..._.pick(playerData, goalieAttributes),
    skaterFullName: playerData.goalieFullName,
    positionCode: "G",
  }));
};

const findMissingAttributes = (player, attributes) => {
  return attributes.filter((attribute) => !Object.hasOwn(player, attribute));
};

const saveJson = async (fileName, data) => {
  try {
    await fs.writeFile(fileName, JSON.stringify(data, null, 2));
    console.log(`Data written to ${fileName}`);
  } catch (error) {
    console.error(`Error writing file ${fileName}:`, error);
  }
};

const processYearData = async (year, isGoalie = false) => {
  console.log(
    `Fetching data for ${isGoalie ? "goalies" : "skaters"} in ${year}...`
  );

  const [summaryData, biosData] = await Promise.all([
    fetchData(isGoalie ? baseUrlSummaryGoalie : baseUrlSummarySkater, year),
    fetchData(isGoalie ? baseUrlBiosGoalie : baseUrlBiosSkater, year),
  ]);

  let mergedData;
  if (isGoalie) {
    mergedData = mergeGoalieDataByPlayerId(summaryData, biosData);
  } else {
    const realtimeData = await fetchData(baseUrlRealtimeSkater, year);
    mergedData = mergeDataByPlayerId(summaryData, biosData, realtimeData);
  }

  console.log(
    `Fetched ${mergedData.length} records for ${
      isGoalie ? "goalies" : "skaters"
    } in ${year}`
  );
  return mergedData;
};

const processAllYears = async (isGoalie = false) => {
  const finalData = {};
  const playersMissingAttributes = [];

  for (const year of years) {
    const yearData = await processYearData(year, isGoalie);
    finalData[year.substring(0, 4)] = yearData;

    const attributesToKeep = isGoalie ? goalieAttributes : skaterAttributes;
    yearData.forEach((player) => {
      const missingAttributes = findMissingAttributes(player, attributesToKeep);
      if (missingAttributes.length > 0) {
        playersMissingAttributes.push({
          player,
          missingAttributes,
        });
      }
    });
  }

  const outputFileName = isGoalie
    ? `${dataDir}goalieData.json`
    : `${dataDir}skaterData.json`;
  await saveJson(outputFileName, finalData);

  if (playersMissingAttributes.length > 0) {
    const missingFileName = isGoalie
      ? `${dataDir}goaliesMissingAttributes.json`
      : `${dataDir}playersMissingAttributes.json`;

    await saveJson(missingFileName, playersMissingAttributes);
    console.log(
      `${playersMissingAttributes.length} players missing attributes found and saved.`
    );
  }
};

// Run both skater and goalie data processing concurrently
const runBothScripts = async () => {
  try {
    const skaterPromise = processAllYears(false); // For skaters
    const goaliePromise = processAllYears(true); // For goalies

    // Wait for both to finish
    await Promise.all([skaterPromise, goaliePromise]);
  } catch (error) {
    console.error("Error processing data:", error);
  }
};

runBothScripts().catch(console.error);
