import { useMemo, useState, useContext } from "react";
import { Table } from "react-bootstrap";
import headers from "../data/tableHeaders.json";
import Pagination from "./Pagination.jsx";
import Filters from "./Filters/Filters.jsx";
import {
  calculateStatValues,
  calculateZScore,
} from "../util/ZScoreCalculator.js";
import { formatValue } from "../util/utilFunctions.jsx";
import { PlayerTableContext } from "../context/PlayerTableContext.jsx";
import _ from "lodash";

const PlayerTable = () => {
  const [sortColumn, setSortColumn] = useState("zScore");
  const [sortOrder, setSortOrder] = useState("desc");

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
    let dataToSort = [...filteredData];

    if (filterOptions.sumSeasons) {
      const getCombinedSeasonId = (records) => {
        // Find the min and max seasonId
        const seasonIds = records.map((record) => record.seasonId);
        const minSeasonId = Math.min(...seasonIds);
        const maxSeasonId = Math.max(...seasonIds);

        const minSeasonIdStr = minSeasonId.toString();
        const maxSeasonIdStr = maxSeasonId.toString();

        return parseInt(minSeasonIdStr.slice(0, 4) + maxSeasonIdStr.slice(-4));
      };

      // Function to merge and sum stats, applying season weights
      const mergeStatsByPlayerIdWithWeights = (data) => {
        // Season weights
        const seasonWeights = {
          20212022: 1,
          20222023: 4,
          20232024: 7,
        };

        // Stats to sum together
        const statFieldsToMerge = [
          "assists",
          "blockedShots",
          "gamesPlayed",
          "goals",
          "hits",
          "points",
          "ppPoints",
          "shots",
        ];

        return _(data)
          .groupBy("playerId") // Group by playerId
          .mapValues((records) => {
            const combinedSeasonId = getCombinedSeasonId(records);

            // Initialize aggregation
            const mergedData = records.reduce((acc, record) => {
              // Set the stitched seasonId as a number
              acc.seasonId = combinedSeasonId;

              // Sum stats and calculate weighted stats
              statFieldsToMerge.forEach((stat) => {
                // Calculate normal and weighted sums
                const statValue = record[stat] || 0;
                const weight = seasonWeights[record.seasonId] || 1;

                // Sum normal stats
                acc[stat] = (acc[stat] || 0) + statValue;

                // Sum weighted stats
                const weightedStatKey = `${stat}Weighted`;
                acc[weightedStatKey] =
                  (acc[weightedStatKey] || 0) + statValue * weight;
              });

              // Include any other stats not in statFieldsToMerge
              Object.keys(record).forEach((key) => {
                if (
                  !Object.prototype.hasOwnProperty.call(acc, key) &&
                  !statFieldsToMerge.includes(key)
                ) {
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
      // Calculate per game stats if needed
      const perGameStats = [
        "goals",
        "assists",
        "points",
        "ppPoints",
        "shots",
        "hits",
        "blockedShots",
        "wins",
      ];

      dataToSort = dataToSort.map((player) => {
        const updatedPlayer = { ...player };
        perGameStats.forEach((stat) => {
          if (player.gamesPlayed !== 0 && updatedPlayer[stat] !== undefined) {
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
          goalsAgainstAverage: player.goalsAgainstAverage,
          savePct: player.savePct,
          wins: player.wins,
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
              <th></th>
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
