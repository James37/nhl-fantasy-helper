import { useContext } from "react";
import { Form } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const SeasonFilter = () => {
  const { filterOptions, setFilterOptions } = useContext(PlayerTableContext);

  return (
    <Form.Group controlId="seasonFilter">
      <Form.Label>Season</Form.Label>
      <Form.Control
        as="select"
        value={filterOptions.selectedSeason}
        onChange={(e) =>
          setFilterOptions({
            ...filterOptions,
            selectedSeason: e.target.value,
          })
        }
        size="sm"
      >
        <option value="">All</option>
        <option value="20222023">2022-2023</option>
        <option value="20212022">2021-2022</option>
      </Form.Control>
    </Form.Group>
  );
};

export default SeasonFilter;
