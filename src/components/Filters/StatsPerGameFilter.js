import { useContext } from "react";
import { Col, Form } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const StatsPerGameFilter = () => {
  const { statsPerGame, setStatsPerGame } = useContext(PlayerTableContext);

  return (
    <Col sm={3} lg="auto" className="mb-3">
      <Form.Group controlId="statsPerGame">
        <Form.Label>Stats Per Game</Form.Label>
        <Form.Switch
          type="switch"
          id="statsPerGameToggle"
          label=""
          checked={statsPerGame}
          onChange={() => setStatsPerGame(!statsPerGame)}
        />
      </Form.Group>
    </Col>
  );
};

export default StatsPerGameFilter;
