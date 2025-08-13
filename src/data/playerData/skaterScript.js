import skaterAttributes from "./skaterAttributes.json" assert { type: "json" };
import goalieAttributes from "./goalieAttributes.json" assert { type: "json" };
import _ from "lodash";
import { promises as fs } from "fs";

const years = ["20212022", "20222023", "20232024", "20242025"];

// Base URLs for the NHL stats API endpoints for skaters and goalies
const baseUrl = "https://api.nhle.com/stats/rest/en";
const baseUrlSummarySkater = baseUrl + "/skater/summary";
const baseUrlBiosSkater = baseUrl + "/skater/bios";
const baseUrlRealtimeSkater = baseUrl + "/skater/realtime";
const baseUrlSummaryGoalie = baseUrl + "/goalie/summary";
const baseUrlBiosGoalie = baseUrl + "/goalie/bios";

const dataDir = "./src/data/playerData/";

/**
 * Builds the NHL API URL with query parameters:
 * - start and limit for pagination
 * - sorted by playerId ascending
 * - filtered to regular season games for the specific season year
 */
const buildApiUrl = (url, start, limit, year) => {
  // Sort param encoded as JSON string
  const sortParams = encodeURIComponent(
    JSON.stringify([{ property: "playerId", direction: "ASC" }])
  );

  // Construct the full URL with filters for season and gameTypeId
  // gameTypeId=2 means regular season, seasonId filters to exact season
  return `${url}?isAggregate=false&isGame=false&start=${start}&limit=${limit}&sort=${sortParams}&cayenneExp=gameTypeId=2%20and%20seasonId%3C%3D${year}%20and%20seasonId%3E%3D${year}`;
};

/**
 * Handles rate limiting from the NHL API.
 * If response status is 429 (too many requests),
 * waits for the "Retry-After" seconds (or defaults to 5s) before retrying.
 */
const handleRateLimit = async (response) => {
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After") || 5;
    console.log(`Rate limit hit, retrying after ${retryAfter} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return true; // Signal to retry
  }
  return false;
};

/**
 * Fetches data from the NHL API in a paginated way.
 * Continues to fetch until a page returns fewer than `limit` results,
 * indicating no more data available.
 */
const fetchData = async (url, year) => {
  let data = [];
  let start = 0;
  const limit = 100; // Batch size for each API call
  let hasMore = true;

  try {
    while (hasMore) {
      // Build API URL for current page
      const apiUrl = buildApiUrl(url, start, limit, year);
      const response = await fetch(apiUrl);

      // Check and handle rate limiting; if hit, retry the loop iteration
      if (await handleRateLimit(response)) continue;

      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${apiUrl}`);
      }

      // Parse JSON and append current batch of data
      const result = await response.json();
      data = [...data, ...result.data];

      // Prepare for next page
      start += limit;
      // If less than limit returned, we reached the last page
      hasMore = result.data.length === limit;
    }
  } catch (error) {
    console.error(`Error fetching data for year ${year}:`, error);
  }

  return data;
};

/**
 * Merges the summary, bios, and realtime data for skaters,
 * keyed by playerId, into unified player objects.
 * Filters each player to only keep desired attributes.
 */
const mergeDataByPlayerId = (summaryData, biosData, realtimeData) => {
  // Create lookup objects keyed by playerId for fast merging
  const lookupSummary = _.keyBy(summaryData, "playerId");
  const lookupBios = _.keyBy(biosData, "playerId");
  const lookupRealtime = _.keyBy(realtimeData, "playerId");

  // Merge all three data sources per playerId into one object per player
  // lodash.merge merges deeply, prioritizing later objects (realtime, bios override summary)
  const mergedData = Object.values(
    _.merge({}, lookupSummary, lookupRealtime, lookupBios)
  );

  // Filter each player object to only include specified skaterAttributes
  return mergedData.map((playerData) => _.pick(playerData, skaterAttributes));
};

/**
 * Merges the summary and bios data for goalies,
 * keyed by playerId, into unified player objects.
 * Also renames goalieFullName to skaterFullName for consistency,
 * and sets positionCode to "G" (goalie).
 */
const mergeGoalieDataByPlayerId = (summaryData, biosData) => {
  const lookupSummary = _.keyBy(summaryData, "playerId");
  const lookupBios = _.keyBy(biosData, "playerId");

  const mergedData = Object.values(_.merge({}, lookupSummary, lookupBios));

  return mergedData.map((playerData) => ({
    ..._.pick(playerData, goalieAttributes),
    skaterFullName: playerData.goalieFullName, // unify name property with skaters
    positionCode: "G", // mark as goalie
  }));
};

/**
 * Given a player object and a list of required attributes,
 * returns a list of attributes that are missing in the player object.
 */
const findMissingAttributes = (player, attributes) => {
  return attributes.filter((attribute) => !Object.hasOwn(player, attribute));
};

/**
 * Saves data as pretty-printed JSON to disk.
 * Logs success or errors.
 */
const saveJson = async (fileName, data) => {
  try {
    await fs.writeFile(fileName, JSON.stringify(data, null, 2));
    console.log(`Data written to ${fileName}`);
  } catch (error) {
    console.error(`Error writing file ${fileName}:`, error);
  }
};

/**
 * Fetches, merges, and processes player data for a given year.
 * Supports skaters or goalies depending on `isGoalie` flag.
 */
const processYearData = async (year, isGoalie = false) => {
  console.log(
    `Fetching data for ${isGoalie ? "goalies" : "skaters"} in ${year}...`
  );

  // Fetch summary and bios concurrently
  const [summaryData, biosData] = await Promise.all([
    fetchData(isGoalie ? baseUrlSummaryGoalie : baseUrlSummarySkater, year),
    fetchData(isGoalie ? baseUrlBiosGoalie : baseUrlBiosSkater, year),
  ]);

  let mergedData;
  if (isGoalie) {
    // For goalies, just merge summary and bios
    mergedData = mergeGoalieDataByPlayerId(summaryData, biosData);
  } else {
    // For skaters, also fetch realtime data and merge all three
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

/**
 * Processes all years in the `years` array for either skaters or goalies.
 * Collects all processed data by year, and tracks players missing attributes.
 * Saves both the combined player data and missing attribute info to JSON files.
 */
const processAllYears = async (isGoalie = false) => {
  const finalData = {};
  const playersMissingAttributes = [];

  for (const year of years) {
    // Fetch and process data for a single year
    const yearData = await processYearData(year, isGoalie);
    finalData[year.substring(0, 4)] = yearData; // Key by starting year, e.g. "2021"

    // Check for missing attributes per player for data quality
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

  // Save combined player data to disk
  const outputFileName = isGoalie
    ? `${dataDir}goalieData.json`
    : `${dataDir}skaterData.json`;
  await saveJson(outputFileName, finalData);

  // Save info on players missing attributes for later inspection
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

/**
 * Main runner that triggers skater and goalie data processing concurrently.
 * Wraps in try/catch for top-level error handling.
 */
const runBothScripts = async () => {
  try {
    const skaterPromise = processAllYears(false); // Process skaters
    const goaliePromise = processAllYears(true); // Process goalies

    await Promise.all([skaterPromise, goaliePromise]);
  } catch (error) {
    console.error("Error processing data:", error);
  }
};

// Start the script
runBothScripts().catch(console.error);
