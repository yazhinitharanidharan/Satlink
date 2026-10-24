import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import './DataTable.css';

const DataTable = ({ 
  columns, 
  data, 
  onRowClick, 
  emptyMessage = 'No data available',
  pageSize = 10,
  searchable = true,
  searchPlaceholder = 'Search...',
  filters = [],
  rowKey = (row, i) => i
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] = useState(() => 
    filters.reduce((acc, f) => ({ ...acc, [f.key]: 'all' }), {})
  );

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchable && searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(row =>
        columns.some(col => {
          const val = row[col.accessor];
          return val != null && String(val).toLowerCase().includes(term);
        })
      );
    }

    filters.forEach(filter => {
      const value = filterValues[filter.key];
      if (value && value !== 'all') {
        result = result.filter(row => String(row[filter.accessor]) === String(value));
      }
    });

    return result;
  }, [data, searchTerm, columns, filters, filterValues, searchable]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc' 
        ? aStr.localeCompare(bStr) 
        : bStr.localeCompare(aStr);
    });
    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (accessor) => {
    setSortConfig(prev => ({
      key: accessor,
      direction: prev.key === accessor && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };


  return (
    <div className="data-table-container">
      {(searchable || filters.length > 0) && (
        <div className="data-table-toolbar">
          {searchable && (
            <div className="search-box">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                aria-label="Search table"
              />
            </div>
          )}
          {filters.map(filter => (
            <select
              key={filter.key}
              className="filter-select"
              value={filterValues[filter.key] || 'all'}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              aria-label={filter.label}
            >
              <option value="all">{filter.label}: All</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
        </div>
      )}

      {paginatedData.length === 0 ? (
        <div className="data-table-empty">
          <Inbox size={40} />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} style={col.width ? { width: col.width } : {}}>
                    {col.sortable !== false && col.accessor ? (
                      <button className="sort-button" onClick={() => handleSort(col.accessor)}>
                        {col.header}
                        {sortConfig.key === col.accessor && (
                          sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        )}
                      </button>
                    ) : col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowKey(row, rowIndex)}
                  className={onRowClick ? 'table-row-clickable' : ''}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sortedData.length > pageSize && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="pagination-page">Page {currentPage} of {totalPages}</span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
