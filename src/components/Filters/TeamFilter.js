import { useContext } from "react";
import { Form } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";
import teams from "../../data/teams.json"

const TeamFilter = () => {
  const { filterOptions, setFilterOptions } = useContext(PlayerTableContext);

  return (
    <div>
      <Form.Label className="mr-2">Team</Form.Label>
      <Form.Control
        as="select"
        value={filterOptions.selectedTeam}
        onChange={(e) =>
          setFilterOptions({
            ...filterOptions,
            selectedTeam: e.target.value,
          })
        }
        size="sm"
      >
        <option value="">All</option>
        {teams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </Form.Control>
    </div>
  );
};

export default TeamFilter;
