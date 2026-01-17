import React from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
} from '@coreui/react'
import PropTypes from 'prop-types'

/**
 * Table Component
 * Standardizes the "sleek and minimal" table design across the admin panel.
 */
const Table = ({ columns, children, ...props }) => {
  return (
    <>
      <div className="modern-table-wrapper">
        <CTable hover align="middle" className="mb-0 custom-modern-table" {...props}>
          <CTableHead>
            <CTableRow>
              {columns.map((col, index) => (
                <CTableHeaderCell
                  key={index}
                  className={`text-body-secondary small fw-bold text-uppercase ${col.className || ''}`}
                  style={col.style}
                >
                  {col.label}
                </CTableHeaderCell>
              ))}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {children}
          </CTableBody>
        </CTable>
      </div>

      <style>{`
        .modern-table-wrapper {
          height: 100%;
          overflow-x: auto;
          overflow-y: auto;
          border-top: 1px solid var(--cui-border-color-translucent);
        }

        .custom-modern-table {
          border-collapse: collapse;
          border-spacing: 0;
          width: 100%;
          table-layout: fixed;
        }

        .custom-modern-table thead th {
          padding: 1rem 0.75rem;
          border-bottom: 1px solid var(--cui-border-color-translucent);
          letter-spacing: 0.05em;
          background-color: var(--cui-body-bg);
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          position: sticky;
          top: 0;
          z-index: 10;
          vertical-align: middle;
        }

        .custom-modern-table tbody tr {
          transition: all 0.2s ease;
          margin: 0;
          padding: 0;
          border: 0;
        }

        .custom-modern-table tbody td {
          border-bottom: 1px solid var(--cui-border-color-translucent) !important;
          padding: 0.75rem 0.75rem !important;
          vertical-align: middle;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        /* Ensure first column always has consistent left spacing/indentation */
        .custom-modern-table thead th:first-child,
        .custom-modern-table tbody td:first-child {
            padding-left: 1.5rem !important;
        }

        /* Ensure last column always has consistent right spacing */
        .custom-modern-table thead th:last-child,
        .custom-modern-table tbody td:last-child {
            padding-right: 1.5rem !important;
        }

        .custom-modern-table tbody td > div,
        .custom-modern-table tbody td > span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Actions column - no truncation, allow content to show */
        .custom-modern-table thead th:last-child,
        .custom-modern-table tbody td:last-child {
          overflow: visible;
          white-space: nowrap;
        }

        .custom-modern-table tbody td:last-child > div {
          overflow: visible;
          white-space: nowrap;
        }

        .custom-modern-table tbody tr:hover {
          background-color: var(--cui-body-tertiary-bg) !important;
        }

        /* Allow specific cells to wrap if needed */
        .custom-modern-table tbody td.allow-wrap {
          white-space: normal;
          overflow: visible;
        }

        .x-small { font-size: 0.72rem; }
        
        .transition-all { transition: all 0.2s ease-in-out; }

        .action-icon-btn {
            padding: 8px;
            transition: all 0.2s ease;
            color: var(--cui-body-color);
            background: transparent !important;
            border: none !important;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
        }

        .action-icon-btn:hover {
            transform: translateY(-2px);
            opacity: 1;
        }

        .action-icon-btn:hover svg {
            stroke-width: 2.5px;
        }

        .text-warning.action-icon-btn:hover { color: #f9b115 !important; }
        .action-icon-btn[style*="#ffc107"]:hover { color: #f9b115 !important; }
        .text-danger.action-icon-btn:hover { color: #e55353 !important; }
        .text-info.action-icon-btn:hover { color: #39f !important; }
      `}</style>
    </>
  )
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node,
      className: PropTypes.string,
      style: PropTypes.object,
    })
  ).isRequired,
  children: PropTypes.node,
}

export default Table
