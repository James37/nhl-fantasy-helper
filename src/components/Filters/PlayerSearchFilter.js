import { useContext } from "react";
import { Form } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const PlayerSearchFilter = () => {
  const { filterOptions, setFilterOptions } = useContext(PlayerTableContext);

  return (
    <Form.Group>
      <Form.Label>Search Player</Form.Label>
      <Form.Control
        type="text"
        value={filterOptions.searchTerm}
        onChange={(e) =>
          setFilterOptions({
            ...filterOptions,
            searchTerm: e.target.value,
          })
        }
        size="sm"
      />
    </Form.Group>
  );
};

export default PlayerSearchFilter;
