import { useContext } from "react";
import { Form } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const StatsPerGameFilter = () => {
  const { statsPerGame, setStatsPerGame } = useContext(PlayerTableContext);

  return (
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
  );
};

export default StatsPerGameFilter;
