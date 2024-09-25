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
import { getShortFormSeason } from "../../util/utilFunctions";
import defaultScarcityFactors from "../../data/defaultScarcityFactors.json";
import defaultSeasonWeights from "../../data/defaultSeasonWeights.json";
import defaultWeights from "../../data/defaultWeights.json";

const ZScoreFilter = () => {
  const [showModal, setShowModal] = useState(false);

  const {
    scarcityFactors,
    weights,
    setScarcityFactors,
    setWeights,
    seasonWeights,
    setSeasonWeights,
  } = useContext(PlayerTableContext);

  const [updatedScarcityFactors, setUpdatedScarcityFactors] =
    useState(scarcityFactors);
  const [updatedWeights, setUpdatedWeights] = useState(weights);
  const [updatedSeasonWeights, setUpdatedSeasonWeights] =
    useState(seasonWeights);

  const handleChange = (e, type, position, stat) => {
    const value = e.target.value;
    if (type === "scarcityFactors") {
      setUpdatedScarcityFactors((prev) => ({ ...prev, [position]: value }));
    } else if (type === "weights") {
      setUpdatedWeights((prev) => ({
        ...prev,
        [position]: { ...prev[position], [stat]: value },
      }));
    } else if (type === "seasonWeights") {
      setUpdatedSeasonWeights((prev) => ({
        ...prev,
        [position]: value,
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
    } else if (type === "seasonWeights") {
      setUpdatedSeasonWeights((prev) => ({
        ...prev,
        [position]: prev[position] || "0",
      }));
    }
  };

  const applyChanges = () => {
    setScarcityFactors(updatedScarcityFactors);
    setWeights(updatedWeights);
    setSeasonWeights(updatedSeasonWeights);
    setShowModal(false);
  };

  // Function to reset to default values
  const resetToDefaults = () => {
    setUpdatedScarcityFactors(defaultScarcityFactors);
    setUpdatedWeights(defaultWeights);
    setUpdatedSeasonWeights(defaultSeasonWeights);
  };

  const tooltip = (
    <Tooltip>
      <div className="my-4">
        <div className="fw-bold mb-1">Scarcity</div>
        {Object.entries(updatedScarcityFactors)
          .map(([position, value]) => {
            const header = headers.find((header) => header.key === position);
            return `${header ? header.label : position}: ${value}`;
          })
          .join(", ")}
        <hr />
        <div className="fw-bold mb-1">Skater</div>
        {Object.entries(updatedWeights.skater)
          .map(([stat, value]) => {
            const header = headers.find((header) => header.key === stat);
            return `${header ? header.label : stat}: ${value}`;
          })
          .join(", ")}
        <hr />
        <div className="fw-bold mb-1">Goalie</div>
        {Object.entries(updatedWeights.goalie)
          .map(([stat, value]) => {
            const header = headers.find((header) => header.key === stat);
            return `${header ? header.label : stat}: ${value}`;
          })
          .join(", ")}
        <hr />
        <div className="fw-bold mb-1">Season</div>
        {Object.entries(updatedSeasonWeights)
          .map(([season, value]) => {
            return `${getShortFormSeason(season)}: ${value}`;
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
        <Modal.Header closeButton>Z-Score Weights</Modal.Header>
        <Modal.Body>
          <Container>
            <Form className="my-2">
              <Row className="mb-4">
                <Col>
                  <Form.Group controlId="scarcityFactors">
                    <Form.Label className="fw-bold mb-3">
                      Position Scarcity
                    </Form.Label>
                    <Row>
                      {Object.keys(updatedScarcityFactors).map((position) => (
                        <Col key={position} className="mb-4">
                          <Form.Group controlId={`scarcity-${position}`}>
                            <Form.Label>
                              {headers.find((header) => header.key === position)
                                ?.label || position}
                            </Form.Label>
                            <Form.Control
                              type="number"
                              size="sm"
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
              <Row className="mb-4">
                <Col>
                  <Form.Group controlId="skaterWeights">
                    <Form.Label className="fw-bold mb-3">
                      Skater Stats
                    </Form.Label>
                    <Row>
                      {Object.keys(updatedWeights.skater).map((stat) => (
                        <Col key={stat} xs={3} sm={true} className="mb-4">
                          <Form.Group controlId={`skater-${stat}`}>
                            <Form.Label>
                              {headers.find((header) => header.key === stat)
                                ?.label || stat}
                            </Form.Label>
                            <Form.Control
                              type="number"
                              size="sm"
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
              <Row className="mb-4">
                <Col>
                  <Form.Group controlId="goalieWeights">
                    <Form.Label className="fw-bold mb-3">
                      Goalie Stats
                    </Form.Label>
                    <Row>
                      {Object.keys(updatedWeights.goalie).map((stat) => (
                        <Col key={stat} className="mb-4">
                          <Form.Group controlId={`goalie-${stat}`}>
                            <Form.Label>
                              {headers.find((header) => header.key === stat)
                                ?.label || stat}
                            </Form.Label>
                            <Form.Control
                              type="number"
                              size="sm"
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
              <Row>
                <Col>
                  <Form.Group controlId="seasonWeights">
                    <Form.Label className="fw-bold mb-3">
                      Summed Season
                    </Form.Label>
                    <Row>
                      {Object.keys(updatedSeasonWeights).map((season) => (
                        <Col key={season} className="mb-4">
                          <Form.Group controlId={`season-${season}`}>
                            <Form.Label>
                              {getShortFormSeason(season)}
                            </Form.Label>
                            <Form.Control
                              type="number"
                              size="sm"
                              name={season}
                              placeholder={`Enter Weight for ${getShortFormSeason(
                                season
                              )}`}
                              value={updatedSeasonWeights[season]}
                              onChange={(e) =>
                                handleChange(e, "seasonWeights", season)
                              }
                              onBlur={() => handleBlur("seasonWeights", season)}
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
        <Modal.Footer>
          <Button size="sm" variant="primary" onClick={resetToDefaults}>
            Reset
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ZScoreFilter;
