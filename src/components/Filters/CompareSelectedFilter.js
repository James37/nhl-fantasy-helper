import { useContext } from "react";
import { Form } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const CompareSelectedFilter = () => {
  const { filterOptions, setFilterOptions } = useContext(PlayerTableContext);

  return (
    <Form.Group controlId="compareSelected">
      <Form.Label>Compare Selected</Form.Label>
      <Form.Switch
        type="switch"
        id="compareSelectedToggle"
        label=""
        checked={filterOptions.compareSelected}
        onChange={() =>
          setFilterOptions({
            ...filterOptions,
            compareSelected: !filterOptions.compareSelected,
          })
        }
      />
    </Form.Group>
  );
};

export default CompareSelectedFilter;
