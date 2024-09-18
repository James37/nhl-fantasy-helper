import { Button, FormControl } from "react-bootstrap";
import { PlayerTableContext } from "../context/PlayerTableContext";
import { useContext } from "react";

const Pagination = ({ sortedData }) => {
  const { pageSize, setPageSize, currentPage, setCurrentPage } =
    useContext(PlayerTableContext);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="d-flex justify-content-between sticky-bottom table-pagination">
      <div className="d-flex align-items-center" style={{ maxWidth: "25%" }}>
        <label className="me-1">Rows:</label>
        <FormControl
          size="sm"
          type="number"
          min="1"
          value={pageSize}
          onChange={handlePageSizeChange}
        />
      </div>
      <div className="d-flex align-items-center">
        <Button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          size="sm"
          variant="outline-primary"
        >
          {"<"}
        </Button>

        <div className="mx-2">
          Page {currentPage} / {totalPages} ({sortedData.length} players)
        </div>

        <Button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          size="sm"
          variant="outline-primary"
        >
          {">"}
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
