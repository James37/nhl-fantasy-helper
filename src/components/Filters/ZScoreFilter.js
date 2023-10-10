import { useState, useContext } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Tooltip,
  OverlayTrigger,
  Container,
} from "react-bootstrap";
import headers from "../../data/tableHeaders.json";
import { PlayerTableContext } from "../../context/PlayerTableContext";

const ZScoreFilter = () => {
  const [showModal, setShowModal] = useState(false);

  const { scarcityFactors, weights, setScarcityFactors, setWeights } =
    useContext(PlayerTableContext);

  const [updatedScarcityFactors, setUpdatedScarcityFactors] =
    useState(scarcityFactors);
  const [updatedWeights, setUpdatedWeights] = useState(weights);

  const handleChange = (e, type, position, stat) => {
    const value = e.target.value;
    if (type === "scarcityFactors") {
      setUpdatedScarcityFactors((prev) => ({ ...prev, [position]: value }));
    } else if (type === "weights") {
      setUpdatedWeights((prev) => ({
        ...prev,
        [position]: { ...prev[position], [stat]: value },
      }));
    }
  };

  const handleBlur = (type, position, stat) => {
    if (type === "weights") {
      setUpdatedWeights((prev) => ({
        ...prev,
        [position]: {
          ...prev[position],
          [stat]: prev[position][stat] || "0",
        },
      }));
    } else if (type === "scarcityFactors") {
      setUpdatedScarcityFactors((prev) => ({
        ...prev,
        [position]: prev[position] || "0",
      }));
    }
  };

  const applyChanges = () => {
    setScarcityFactors(updatedScarcityFactors);
    setWeights(updatedWeights);
    setShowModal(false);
  };

  const tooltip = (
    <Tooltip>
      <div className="my-4">
        <div className="fw-bold">Scarcity</div>
        {Object.entries(updatedScarcityFactors)
          .map(([position, value]) => {
            const header = headers.find((header) => header.key === position);
            return `${header ? header.label : position}: ${value}`;
          })
          .join(", ")}
        <hr />
        <div className="fw-bold">Skater Weights</div>
        {Object.entries(updatedWeights.skater)
          .map(([stat, value]) => {
            const header = headers.find((header) => header.key === stat);
            return `${header ? header.label : stat}: ${value}`;
          })
          .join(", ")}
        <hr />
        <div className="fw-bold">Goalie Weights</div>
        {Object.entries(updatedWeights.goalie)
          .map(([stat, value]) => {
            const header = headers.find((header) => header.key === stat);
            return `${header ? header.label : stat}: ${value}`;
          })
          .join(", ")}
      </div>
    </Tooltip>
  );

  return (
    <>
      <OverlayTrigger placement="bottom" overlay={tooltip}>
        <Col sm={3} lg="auto" className="mb-3">
          <Form.Group controlId="zScoreFilter">
            <Form.Label>Z-Score</Form.Label>
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowModal(true)}
              >
                Customize
              </Button>
            </div>
          </Form.Group>
        </Col>
      </OverlayTrigger>

      <Modal
        show={showModal}
        onHide={() => {
          applyChanges(); // Apply changes when the modal is closed
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Z-Score Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Form>
              <Row className="mb-5">
                <Col>
                  <Form.Group controlId="scarcityFactors">
                    <Form.Label>
                      <h6>Position Scarcity Factors</h6>
                    </Form.Label>
                    <Row>
                      {Object.keys(updatedScarcityFactors).map((position) => (
                        <Col key={position}>
                          <Form.Group controlId={`scarcity-${position}`}>
                            <Form.Label>
                              {headers.find((header) => header.key === position)
                                ?.label || position}
                            </Form.Label>
                            <Form.Control
                              type="number"
                              placeholder={`Enter Scarcity Factor for ${
                                headers.find(
                                  (header) => header.key === position
                                )?.label || position
                              }`}
                              value={updatedScarcityFactors[position]}
                              onChange={(e) =>
                                handleChange(e, "scarcityFactors", position)
                              }
                              onBlur={() =>
                                handleBlur("scarcityFactors", position)
                              }
                            />
                          </Form.Group>
                        </Col>
                      ))}
                    </Row>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-5">
                <Col>
                  <Form.Group controlId="skaterWeights">
                    <Form.Label>
                      <h6>Skater Stats Weights</h6>
                    </Form.Label>
                    <Row>
                      {Object.keys(updatedWeights.skater).map((stat) => (
                        <Col key={stat}>
                          <Form.Group controlId={`skater-${stat}`}>
                            <Form.Label>
                              {headers.find((header) => header.key === stat)
                                ?.label || stat}
                            </Form.Label>
                            <Form.Control
                              type="number"
                              name={stat}
                              placeholder={`Enter Weight for ${
                                headers.find((header) => header.key === stat)
                                  ?.label || stat
                              }`}
                              value={updatedWeights.skater[stat]}
                              onChange={(e) =>
                                handleChange(e, "weights", "skater", stat)
                              }
                              onBlur={() =>
                                handleBlur("weights", "skater", stat)
                              }
                            />
                          </Form.Group>
                        </Col>
                      ))}
                    </Row>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-5">
                <Col>
                  <Form.Group controlId="goalieWeights">
                    <Form.Label>
                      <h6>Goalie Stats Weights</h6>
                    </Form.Label>
                    <Row>
                      {Object.keys(updatedWeights.goalie).map((stat) => (
                        <Col key={stat}>
                          <Form.Group controlId={`goalie-${stat}`}>
                            <Form.Label>
                              {headers.find((header) => header.key === stat)
                                ?.label || stat}
                            </Form.Label>
                            <Form.Control
                              type="number"
                              name={stat}
                              placeholder={`Enter Weight for ${
                                headers.find((header) => header.key === stat)
                                  ?.label || stat
                              }`}
                              value={updatedWeights.goalie[stat]}
                              onChange={(e) =>
                                handleChange(e, "weights", "goalie", stat)
                              }
                              onBlur={() =>
                                handleBlur("weights", "goalie", stat)
                              }
                            />
                          </Form.Group>
                        </Col>
                      ))}
                    </Row>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Container>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ZScoreFilter;
