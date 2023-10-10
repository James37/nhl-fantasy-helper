import React, { useMemo, useState, useContext } from "react";
import { Table } from "react-bootstrap";
import headers from "../data/tableHeaders.json";
import Pagination from "./Pagination";
import Filters from "./Filters/Filters";
import { calculateStatValues, calculateZScore } from "../util/ZScoreCalculator";
import { formatValue } from "../util/utilFunctions";
import { PlayerTableContext } from "../context/PlayerTableContext";

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
      const aggregatedData = {};
      const seasonIds = dataToSort.map((record) => record.seasonId);

      const minSeasonId = Math.min(...seasonIds);
      const maxSeasonId = Math.max(...seasonIds);

      const minSeasonIdStr = minSeasonId.toString();
      const maxSeasonIdStr = maxSeasonId.toString();

      const newSeasonId = parseInt(
        minSeasonIdStr.slice(0, 4) + maxSeasonIdStr.slice(-4)
      );

      dataToSort.forEach((record) => {
        const {
          playerId,
          skaterFullName,
          positionCode,
          teamAbbrevs,
          seasonId,
          ...rest
        } = record;

        if (!aggregatedData[playerId]) {
          aggregatedData[playerId] = {
            playerId,
            skaterFullName,
            positionCode,
            teamAbbrevs,
            seasonId: newSeasonId,
            ...rest,
          };
        } else {
          Object.keys(rest).forEach((key) => {
            aggregatedData[playerId][key] =
              (aggregatedData[playerId][key] || 0) + (rest[key] || 0);
          });
        }
      });

      dataToSort = Object.values(aggregatedData);
      console.log(dataToSort);
    }

    if (statsPerGame) {
      // Calculate per game stats if needed
      const perGameStats = [
        "goals",
        "assists",
        "ppPoints",
        "shots",
        "hits",
        "blockedShots",
        "wins",
      ];

      dataToSort = dataToSort.map((player) => {
        const updatedPlayer = { ...player };
        perGameStats.forEach((stat) => {
          if (player.gamesPlayed !== 0 && updatedPlayer[stat]) {
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
          goals: player.goals,
          assists: player.assists,
          points: player.points,
          ppPoints: player.ppPoints,
          shots: player.shots,
          hits: player.hits,
          blockedShots: player.blockedShots,
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
                weights.goalie
              )
            : calculateZScore(
                player,
                playerStatMeans,
                playerStatStdDevs,
                scarcityFactors,
                weights.skater
              );

        return {
          ...player,
          zScore: formatValue(player, zScore, "zScore"),
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
