import { useContext } from "react";
import { Col, Form } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const PositionFilter = () => {
  const { filterOptions, setFilterOptions } = useContext(PlayerTableContext);

  return (
    <Col sm={3} lg="auto" className="mb-3">
      <Form.Group>
        <Form.Label>Position</Form.Label>
        <Form.Control
          as="select"
          value={filterOptions.selectedPosition}
          onChange={(e) =>
            setFilterOptions({
              ...filterOptions,
              selectedPosition: e.target.value,
            })
          }
          size="sm"
        >
          <option value="">All</option>
          <option value="S">Skaters</option>
          <option value="C">Center</option>
          <option value="R">Right Wing</option>
          <option value="L">Left Wing</option>
          <option value="F">Forwards</option>
          <option value="D">Defense</option>
          <option value="G">Goalie</option>
        </Form.Control>
      </Form.Group>
    </Col>
  );
};

export default PositionFilter;
