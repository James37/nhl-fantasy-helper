import { useContext, useState } from "react";
import { Dropdown, Form, Row, Col } from "react-bootstrap";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const AgeFilter = () => {
  const { filterOptions, setFilterOptions } = useContext(PlayerTableContext);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <Col sm={3} lg="auto" className="mb-3">
      <Form.Group>
        <Form.Label>Age</Form.Label>
        <Dropdown
          show={showDropdown}
          onToggle={() => setShowDropdown(!showDropdown)}
        >
          <Dropdown.Toggle
            variant="outline-primary"
            id="age-dropdown"
            size="sm"
          >
            {filterOptions.age.min} - {filterOptions.age.max}
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="p-3"
            style={{ minWidth: "200px", fontSize: "13px" }}
          >
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Min</Form.Label>
                  <Form.Control
                    type="number"
                    value={filterOptions.age.min}
                    onChange={(e) =>
                      setFilterOptions({
                        ...filterOptions,
                        age: { ...filterOptions.age, min: e.target.value },
                      })
                    }
                    min={18}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Max</Form.Label>
                  <Form.Control
                    type="number"
                    value={filterOptions.age.max}
                    onChange={(e) =>
                      setFilterOptions({
                        ...filterOptions,
                        age: { ...filterOptions.age, max: e.target.value },
                      })
                    }
                    min={18}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Dropdown.Menu>
        </Dropdown>
      </Form.Group>
    </Col>
  );
};

export default AgeFilter;
