import React from "react";
import PlayerTable from "./components/PlayerTable";
import { Container } from "react-bootstrap";
import { PlayerTableProvider } from "./context/PlayerTableContext";

const App = () => {
  return (
    <Container className="min-vh-100">
      <PlayerTableProvider>
        <PlayerTable />
      </PlayerTableProvider>
    </Container>
  );
};

export default App;
