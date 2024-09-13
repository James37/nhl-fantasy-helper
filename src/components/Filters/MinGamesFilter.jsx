import { useContext } from "react";
import { Col, Form } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const MinGamesFilter = () => {
  const { filterOptions, setFilterOptions } = useContext(PlayerTableContext);

  return (
    <Col sm={3} lg="auto" className="mb-3">
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
    </Col>
  );
};

export default MinGamesFilter;
