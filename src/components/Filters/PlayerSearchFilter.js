import { useContext } from "react";
import { Col, Form } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const PlayerSearchFilter = () => {
  const { filterOptions, setFilterOptions } = useContext(PlayerTableContext);

  return (
    <Col sm={3} lg="auto" className="mb-3">
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
    </Col>
  );
};

export default PlayerSearchFilter;
