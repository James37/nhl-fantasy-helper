import { useMemo, useState, useContext } from "react";
import { Table } from "react-bootstrap";
import headers from "../data/tableHeaders.json";
import Pagination from "./Pagination.jsx";
import Filters from "./Filters/Filters.jsx";
import {
  calculateStatValues,
  calculateZScore,
} from "../util/ZScoreCalculator.js";
import { formatValue, getCombinedSeasonId } from "../util/utilFunctions.jsx";
import { PlayerTableContext } from "../context/PlayerTableContext.jsx";
import sumSeasonsAttributes from "../data/sumSeasonsAttributes.json";
import statsPerGameAttributes from "../data/statsPerGameAttributes.json";
import meanPlayerAttributes from "../data/meanPlayerAttributes.json";

import _ from "lodash";

const PlayerTable = () => {
  const [sortColumn, setSortColumn] = useState("zScore");
  const [sortOrder, setSortOrder] = useState("desc");
  const [meansAndStdDevs, setMeansAndStdDevs] = useState();

  const {
    pageSize,
    currentPage,
    filteredData,
    statsPerGame,
    filterOptions,
    scarcityFactors,
    weights,
    compareList,
    setCompareList,
    seasonWeights,
  } = useContext(PlayerTableContext);

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(key);
      setSortOrder("desc");
    }
  };

  const sortedData = useMemo(() => {
    // Copy the filtered data
    let dataToSort = _.cloneDeep(filteredData);

    if (filterOptions.sumSeasons) {
      // Function to merge and sum stats, applying season weights
      const mergeStatsByPlayerIdWithWeights = (data) => {
        return _(data)
          .groupBy("playerId") // Group by playerId
          .mapValues((records) => {
            const combinedSeasonId = getCombinedSeasonId(records);

            // Initialize aggregation
            const mergedData = records.reduce((acc, record) => {
              // Set the stitched seasonId as a number
              acc.seasonId = combinedSeasonId;

              // Include any other stats not in statFieldsToMerge
              Object.keys(record).forEach((key) => {
                // Sum stats and calculate weighted stats
                if (
                  sumSeasonsAttributes.skater.includes(key) ||
                  sumSeasonsAttributes.goalie.includes(key)
                ) {
                  // Calculate normal and weighted sums
                  const statValue = record[key] ?? 0;
                  const weight = seasonWeights[record.seasonId] ?? 1;

                  // Sum normal stats
                  acc[key] = (acc[key] ?? 0) + statValue;

                  // Sum weighted stats
                  const weightedStatKey = `${key}Weighted`;
                  acc[weightedStatKey] =
                    (acc[weightedStatKey] ?? 0) + statValue * weight;
                  if (key === "goalsAgainst" || key === "timeOnIce") {
                    if (acc.goalsAgainst && acc.timeOnIce) {
                      acc.goalsAgainstAverage =
                        acc.goalsAgainst * 3600 / acc.timeOnIce;
                    }
                    acc.goalsAgainstAverageWeighted =
                      acc.goalsAgainstAverage * weight;
                  }
                  if (key === "saves" || key === "shotsAgainst") {
                    if (acc.shotsAgainst && acc.saves) {
                      acc.savePct = acc.saves / acc.shotsAgainst;
                    }
                    acc.savePctWeighted = acc.savePct * weight;
                  }
                } else if (!Object.prototype.hasOwnProperty.call(acc, key)) {
                  acc[key] = record[key]; // Keep the original value for any other stats
                }
              });
              return acc;
            }, {});

            return mergedData;
          })
          .values() // Convert object back to array if needed
          .value();
      };

      const aggregatedData = mergeStatsByPlayerIdWithWeights(dataToSort);
      dataToSort = aggregatedData;
    }

    if (statsPerGame) {
      const gamesPlayedKey = filterOptions.sumSeasons
        ? "gamesPlayedWeighted"
        : "gamesPlayed";

      dataToSort = dataToSort.map((player) => {
        // Create a copy of the player object
        const updatedPlayer = { ...player };

        statsPerGameAttributes.forEach((stat) => {
          // Define the games played attribute based on filter options
          const statName = filterOptions.sumSeasons ? `${stat}Weighted` : stat;

          const gamesPlayed = player[gamesPlayedKey];

          // Ensure games played is defined and not zero before division
          if (gamesPlayed && updatedPlayer[statName] !== undefined) {
            updatedPlayer[statName] = player[statName] / gamesPlayed;
            updatedPlayer[stat] = player[stat] / player.gamesPlayed;
          }
        });

        return updatedPlayer;
      });
    }

    const playerStats = dataToSort
      .filter((player) => player.positionCode !== "G")
      .map((player) => {
        const stats = {
          goals: player.goalsWeighted || player.goals,
          assists: player.assistsWeighted || player.assists,
          points: player.pointsWeighted || player.points,
          ppPoints: player.ppPointsWeighted || player.ppPoints,
          shots: player.shotsWeighted | player.shots,
          hits: player.hitsWeighted || player.hits,
          blockedShots: player.blockedShotsWeighted || player.blockedShots,
        };

        return stats;
      });

    const goalieStats = dataToSort
      .filter((player) => player.positionCode === "G")
      .map((player) => {
        const stats = {
          goalsAgainstAverage:
            player.goalsAgainstAverageWeighted || player.goalsAgainstAverage,
          savePct: player.savePctWeighted || player.savePct,
          wins: player.winsWeighted || player.wins,
        };

        return stats;
      });

    const playerStatsValues = calculateStatValues(playerStats);
    const goalieStatsValues = calculateStatValues(goalieStats);

    // Access the means and standard deviations
    const playerStatMeans = playerStatsValues.statMeans;
    const playerStatStdDevs = playerStatsValues.statStdDevs;

    const goalieStatMeans = goalieStatsValues.statMeans;
    const goalieStatStdDevs = goalieStatsValues.statStdDevs;
    setMeansAndStdDevs({
      means: { ...playerStatMeans, ...goalieStatMeans },
      standardDeviations: { ...playerStatStdDevs, ...goalieStatStdDevs },
    });

    // Calculate z-scores and format values
    return dataToSort
      .map((player) => {
        const zScore =
          player.positionCode === "G"
            ? calculateZScore(
                player,
                goalieStatMeans,
                goalieStatStdDevs,
                scarcityFactors,
                weights.goalie,
                filterOptions.sumSeasons
              )
            : calculateZScore(
                player,
                playerStatMeans,
                playerStatStdDevs,
                scarcityFactors,
                weights.skater,
                filterOptions.sumSeasons
              );

        return {
          ...player,
          zScore: zScore,
        };
      })
      .filter((player) => {
        return (
          !filterOptions.searchTerm ||
          player.skaterFullName
            .toLowerCase()
            .includes(filterOptions.searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => {
        if (sortColumn) {
          const valueA = a[sortColumn];
          const valueB = b[sortColumn];

          // Handle boolean values
          if (sortColumn === "compare") {
            const aChecked = compareList.includes(a.playerId + a.seasonId);
            const bChecked = compareList.includes(b.playerId + b.seasonId);

            if (aChecked && bChecked) return 0;
            return sortOrder === "asc"
              ? aChecked
                ? 1
                : -1
              : aChecked
              ? -1
              : 1;
          }

          // Check if the property is either undefined or null in both objects
          if (
            (valueA === undefined || valueA === null) &&
            (valueB === undefined || valueB === null)
          )
            return 0;
          if (valueA === undefined || valueA === null) return 1;
          if (valueB === undefined || valueB === null) return -1;

          if (typeof valueA === "number" && typeof valueB === "number") {
            return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
          }

          if (typeof valueA === "string" && typeof valueB === "string") {
            return sortOrder === "asc"
              ? valueA.localeCompare(valueB)
              : valueB.localeCompare(valueA);
          }
        }

        return 0;
      });
  }, [
    filteredData,
    scarcityFactors,
    seasonWeights,
    sortColumn,
    sortOrder,
    statsPerGame,
    weights.goalie,
    weights.skater,
  ]);

  const paginatedData = useMemo(() => {
    return sortedData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [sortedData, currentPage, pageSize]);

  const filterHeaders = () => {
    return headers.filter((header) => {
      if (
        (filterOptions.selectedPosition === "G" &&
          (header.key === "ppPoints" ||
            header.key === "shots" ||
            header.key === "hits" ||
            header.key === "blockedShots" ||
            header.key === "pointsPerGame" ||
            header.key === "points" ||
            header.key === "assists" ||
            header.key === "goals")) ||
        (filterOptions.selectedPosition &&
          filterOptions.selectedPosition !== "G" &&
          (header.key === "wins" ||
            header.key === "savePct" ||
            header.key === "goalsAgainstAverage"))
      ) {
        return false;
      }
      return true;
    });
  };

  const calculateIndex = (index) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  return (
    <>
      <Filters />
      <div className="stats-table mb-3">
        <Table striped hover responsive className="m-0">
          <thead>
            <tr>
              <th />
              {filterHeaders().map((header) => (
                <th
                  key={header.key}
                  className={sortColumn === header.key ? "sorted" : ""}
                  onClick={() => handleSort(header.key)}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meansAndStdDevs && (
              <tr className="table-warning">
                <td colSpan={2} />
                <td colSpan={6}>Mean Player</td>
                {filterHeaders()
                  .filter((header) => meanPlayerAttributes.includes(header.key))
                  .map((header) => (
                    <td key={header.key}>
                      {formatValue(
                        meansAndStdDevs.means,
                        meansAndStdDevs.means[header.key],
                        header.key,
                        compareList,
                        setCompareList
                      )}
                    </td>
                  ))}
                <td>0</td>
              </tr>
            )}
            {paginatedData.map((player, index) => (
              <tr key={index}>
                <td>{calculateIndex(index)}</td>
                {filterHeaders().map((header) => (
                  <td
                    key={header.key}
                    className={sortColumn === header.key ? "sorted" : ""}
                  >
                    {formatValue(
                      player,
                      player[header.key],
                      header.key,
                      compareList,
                      setCompareList
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {!paginatedData.length && (
              <tr>
                <td colSpan="100" className="text-center py-4">
                  <div className="text-muted">No Matching Players</div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      <Pagination sortedData={sortedData} />
    </>
  );
};

export default PlayerTable;
