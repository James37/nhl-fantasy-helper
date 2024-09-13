import { useContext } from "react";
import { Col, Form } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const SumSeasonsFilter = () => {
  const { filterOptions, setFilterOptions } = useContext(PlayerTableContext);

  return (
    <Col sm={3} lg="auto" className="mb-3">
      <Form.Group controlId="sumSeasons">
        <Form.Label>Sum Seasons</Form.Label>
        <Form.Switch
          type="switch"
          id="sumSeasonsToggle"
          label=""
          checked={filterOptions.sumSeasons}
          onChange={() =>
            setFilterOptions({
              ...filterOptions,
              sumSeasons: !filterOptions.sumSeasons,
            })
          }
        />
      </Form.Group>
    </Col>
  );
};

export default SumSeasonsFilter;
