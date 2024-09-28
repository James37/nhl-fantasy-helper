import { useContext, useEffect } from "react";
import PositionFilter from "./PositionFilter";
import TeamFilter from "./TeamFilter";
import SeasonFilter from "./SeasonFilter";
import ZScoreFilter from "./ZScoreFilter";
import StatsPerGameFilter from "./StatsPerGameFilter";
import { PlayerTableContext } from "../../context/PlayerTableContext";
import MinGamesFilter from "./MinGamesFilter";
import PlayerSearchFilter from "./PlayerSearchFilter";
import CompareSelectedFilter from "./CompareSelectedFilter";
import { Nav, Navbar, Row } from "react-bootstrap";
import SumSeasonsFilter from "./SumSeasonsFilter";
import AgeFilter from "./AgeFilter";
import { calculateAge } from "../../util/utilFunctions";

const Filters = () => {
  const {
    setCurrentPage,
    fullData,
    setFilteredData,
    filterOptions,
    compareList,
  } = useContext(PlayerTableContext);

  useEffect(() => {
    const filtered = fullData.filter((player) => {
      const age = calculateAge(player.birthDate);

      return (
        (!filterOptions.selectedPosition ||
          (filterOptions.selectedPosition === "S" &&
            player.positionCode !== "G") ||
          (filterOptions.selectedPosition === "F" &&
            player.positionCode !== "G" &&
            player.positionCode !== "D") ||
          filterOptions.selectedPosition === player.positionCode) &&
        (!filterOptions.selectedTeam ||
          player.currentTeamAbbrev === filterOptions.selectedTeam) &&
        (!filterOptions.selectedSeason ||
          player.seasonId?.toString() === filterOptions.selectedSeason) &&
        player.gamesPlayed >= filterOptions.minGamesPlayed &&
        age >= filterOptions.age.min &&
        age <= filterOptions.age.max &&
        (!filterOptions.compareSelected ||
          compareList.includes(player.playerId + player.seasonId))
      );
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [compareList, filterOptions, setCurrentPage, setFilteredData]);

  return (
    <Navbar expand="sm">
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="me-auto">
          <Row className="my-2 filter-row">
            <SeasonFilter />
            <SumSeasonsFilter />
            <PositionFilter />
            <TeamFilter />
            <AgeFilter />
            <MinGamesFilter />
            <PlayerSearchFilter />
            <StatsPerGameFilter />
            <CompareSelectedFilter />
            <ZScoreFilter />
          </Row>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Filters;
