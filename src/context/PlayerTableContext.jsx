import { createContext, useState, useMemo } from "react";
import skaterData from "../data/playerData/skaterData.json";
import goalieData from "../data/playerData/goalieData.json";
import defaultScarcityFactors from "../data/defaultScarcityFactors.json";
import defaultSeasonWeights from "../data/defaultSeasonWeights.json";
import defaultWeights from "../data/defaultWeights.json";

const PlayerTableContext = createContext();

const PlayerTableProvider = ({ children }) => {
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [statsPerGame, setStatsPerGame] = useState(false);
  const [scarcityFactors, setScarcityFactors] = useState(defaultScarcityFactors);
  const [seasonWeights, setSeasonWeights] = useState(defaultSeasonWeights);
  const [weights, setWeights] = useState(defaultWeights);
  const [compareList, setCompareList] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    selectedPosition: "S",
    selectedTeam: "",
    minGamesPlayed: 0,
    searchTerm: "",
    selectedSeason: "20232024",
    compareSelected: false,
    sumSeasons: false,
  });

  const fullData = useMemo(
    () => [
      ...skaterData["2021"],
      ...skaterData["2022"],
      ...skaterData["2023"],
      ...goalieData["2021"],
      ...goalieData["2022"],
      ...goalieData["2023"],
    ],
    []
  );

  const [filteredData, setFilteredData] = useState(fullData);

  const contextValue = useMemo(
    () => ({
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
      seasonWeights,
      setSeasonWeights,
      setWeights,
      filterOptions,
      setFilterOptions,
      compareList,
      setCompareList,
    }),
    [
      pageSize,
      currentPage,
      fullData,
      filteredData,
      statsPerGame,
      scarcityFactors,
      weights,
      seasonWeights,
      filterOptions,
      compareList,
    ]
  );

  return (
    <PlayerTableContext.Provider value={contextValue}>
      {children}
    </PlayerTableContext.Provider>
  );
};

export { PlayerTableContext, PlayerTableProvider };
