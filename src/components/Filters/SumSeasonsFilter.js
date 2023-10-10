import { useContext } from "react";
import { Form } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const SumSeasonsFilter = () => {
  const { filterOptions, setFilterOptions } = useContext(PlayerTableContext);

  return (
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
  );
};

export default SumSeasonsFilter;
