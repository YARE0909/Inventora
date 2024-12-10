import React, { useState, ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LoaderCircle } from "lucide-react";

interface PaginatedTableProps {
  children: ReactNode; // Accept rows as children
  columns: string[]; // Columns for the table
  loadingState: boolean; // Loading state for the table
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({
  children,
  columns,
  loadingState,
}) => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the total number of pages
  const totalPages = Math.ceil(React.Children.count(children) / rowsPerPage);

  // Handle changing rows per page
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page when rows per page change
  };

  // Handle page navigation
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Get the rows to be displayed on the current page
  const paginatedRows = React.Children.toArray(children).slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="w-full bg-background shadow-md rounded-lg overflow-hidden">
      <div className="p-4 overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-b-border">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-2 text-left text-textAlt text-xs uppercase"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loadingState ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 font-semibold text-sm text-center text-textAlt"
                >
                  <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                </td>
              </tr>
            ) : null}
            {!loadingState && paginatedRows.length > 0 ? (
              paginatedRows
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 font-semibold text-sm text-center text-textAlt"
                >
                  No data available
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center p-4 text-textAlt text-sm">
        <div className="flex items-center">
          <label htmlFor="rows-per-page" className="mr-2">
            Rows per page:
          </label>
          <select
            id="rows-per-page"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border border-border p-1 rounded bg-background"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center">
          <button
            className="p-1"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="p-1"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginatedTable;
