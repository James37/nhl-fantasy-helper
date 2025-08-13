import { useContext } from "react";
import { Col, Form } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const SeasonFilter = () => {
  const { filterOptions, setFilterOptions } = useContext(PlayerTableContext);

  return (
    <Col sm={3} lg="auto" className="mb-3">
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
          <option value="20242025">2024-2025</option>
          <option value="20232024">2023-2024</option>
          <option value="20222023">2022-2023</option>
          <option value="20212022">2021-2022</option>
        </Form.Control>
      </Form.Group>
    </Col>
  );
};

export default SeasonFilter;
