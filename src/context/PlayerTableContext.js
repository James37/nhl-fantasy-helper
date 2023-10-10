import React, { createContext, useState } from "react";
import skaterData from "../data/skaterData.json";
import goalieData from "../data/goalieData.json";
import defaultScarcityFactor from "../data/defaultScarcityFactors.json";
import defaultWeights from "../data/defaultWeights.json";

const PlayerTableContext = createContext();

const PlayerTableProvider = ({ children }) => {
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [statsPerGame, setStatsPerGame] = useState(false);
  const [scarcityFactors, setScarcityFactors] = useState(defaultScarcityFactor);
  const [weights, setWeights] = useState(defaultWeights);
  const [compareList, setCompareList] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    selectedPosition: "S",
    selectedTeam: "",
    minGamesPlayed: 0,
    searchTerm: "",
    selectedSeason: "20222023",
    compareSelected: false,
    sumSeasons: false,
  });

  const fullData = [
    ...skaterData["2021"],
    ...skaterData["2022"],
    ...goalieData["2021"],
    ...goalieData["2022"],
  ];
  const [filteredData, setFilteredData] = useState(fullData);

  return (
    <PlayerTableContext.Provider
      value={{
        pageSize,
        setPageSize,
        currentPage,
        setCurrentPage,
        fullData,
        filteredData,
        setFilteredData,
        statsPerGame,
        setStatsPerGame,
        scarcityFactors,
        weights,
        setScarcityFactors,
        setWeights,
        filterOptions,
        setFilterOptions,
        compareList,
        setCompareList,
      }}
    >
      {children}
    </PlayerTableContext.Provider>
  );
};

export { PlayerTableContext, PlayerTableProvider };
