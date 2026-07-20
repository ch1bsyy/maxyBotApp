import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Ellips Pagination
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - 1, 1);
    const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Dots only at right
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftRange = [1, 2, 3, 4, 5];
      return [...leftRange, "...", totalPages];
    }

    // Dots only at left
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightRange = [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
      return [firstPageIndex, "...", ...rightRange];
    }

    // Pages at middle
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = [leftSiblingIndex, currentPage, rightSiblingIndex];
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }
  };

  const pageNumbers = getPageNumbers();
  /* 
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }*/

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 sm:px-6 mt-auto rounded-b-2xl">
      {/* MOBILE */}
      <div className="flex flex-1 justify-between sm:hidden">
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex min-h-11 min-w-11 items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex min-h-11 min-w-11 items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <FiChevronRight size={18} />
          </button>
        </div>
        <p className="text-sm flex items-center text-gray-700 dark:text-gray-300">
          Hal. {currentPage} / {totalPages}
        </p>
      </div>

      {/* DESKTOP */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Menampilkan halaman{" "}
            <span className="font-medium">{currentPage}</span> dari{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative min-h-11 min-w-11 inline-flex items-center justify-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium ${currentPage === 1 ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"}`}
            >
              <span className="sr-only">Previous</span>
              <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            {pageNumbers.map((number, index) => {
              if (number === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex min-h-11 min-w-11 justify-center items-center px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-default"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={number}
                  onClick={() => onPageChange(number)}
                  className={`relative inline-flex min-h-11 min-w-11 justify-center items-center px-4 py-2 border text-sm font-medium transition-colors cursor-pointer ${
                    currentPage === number
                      ? "z-10 bg-brand-blue border-brand-blue text-white"
                      : "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {number}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex min-h-11 min-w-11 items-center justify-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium ${currentPage === totalPages ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"}`}
            >
              <span className="sr-only">Next</span>
              <FiChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
