import { useContext } from "react";
import { Form } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const MinGamesFilter = () => {
  const { filterOptions, setFilterOptions } = useContext(PlayerTableContext);

  return (
    <Form.Group>
      <Form.Label>Min. Games Played</Form.Label>
      <Form.Control
        type="number"
        min="0"
        value={filterOptions.minGamesPlayed}
        onChange={(e) =>
          setFilterOptions({
            ...filterOptions,
            minGamesPlayed: e.target.value,
          })
        }
        size="sm"
      />
    </Form.Group>
  );
};

export default MinGamesFilter;
