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
import SumSeasonsFilter from "./SumSeasonsFilter";
import { Nav, Navbar, Row } from "react-bootstrap";
import Login from "./Login";

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
      return (
        (!filterOptions.selectedPosition ||
          (filterOptions.selectedPosition === "S" &&
            player.positionCode !== "G") ||
          (filterOptions.selectedPosition === "F" &&
            player.positionCode !== "G" &&
            player.positionCode !== "D") ||
          filterOptions.selectedPosition === player.positionCode) &&
        (!filterOptions.selectedTeam ||
          player.teamAbbrevs === filterOptions.selectedTeam) &&
        (!filterOptions.selectedSeason ||
          player.seasonId?.toString() === filterOptions.selectedSeason) &&
        player.gamesPlayed >= filterOptions.minGamesPlayed &&
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
            {/* <SumSeasonsFilter /> */}
            <PositionFilter />
            <TeamFilter />
            <MinGamesFilter />
            <PlayerSearchFilter />
            <StatsPerGameFilter />
            <CompareSelectedFilter />
            <ZScoreFilter />
            <Login />
          </Row>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Filters;
