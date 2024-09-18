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
      <div>
        <Button
          className="me-2"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          size="sm"
          variant="outline-primary"
        >
          Prev
        </Button>
        <Button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          size="sm"
          variant="outline-primary"
        >
          Next
        </Button>
      </div>
      <div className="d-flex align-items-center">
        <label className="me-2">Page Size: </label>
        <FormControl
          size="sm"
          className="w-50"
          type="number"
          min="1"
          value={pageSize}
          onChange={handlePageSizeChange}
        />
      </div>
      <div>
        Page {currentPage} of {totalPages} ({sortedData.length} players)
      </div>
    </div>
  );
};

export default Pagination;
