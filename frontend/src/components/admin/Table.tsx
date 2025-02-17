import React from 'react';

interface TableItem {
  _id: string;
  [key: string]: any;
}

interface Column {
  header: string;
  accessor: string;
}

interface ManagementTableProps<T extends TableItem> {
  items: T[];
  columns: Column[];
  onToggleBlock: (id: string, isBlocked: boolean) => void;
  loadingStatus: { [key: string]: boolean };
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function ManagementTable<T extends TableItem>({ 
  items, 
  columns, 
  onToggleBlock, 
  loadingStatus,
  currentPage,
  totalPages,
  onPageChange
}: ManagementTableProps<T>) {
  return (
    <>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.accessor} className="py-2 px-4 border-b text-center">
                {column.header}
              </th>
            ))}
            <th className="py-2 px-4 border-b text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} className="hover:bg-gray-100 transition-colors duration-200">
              {columns.map((column) => (
                <td key={`${item._id}-${column.accessor}`} className="py-2 px-4 border-b text-center">
                  {item[column.accessor]}
                </td>
              ))}
              <td className="py-2 px-4 border-b text-center">
                <button
                  onClick={() => onToggleBlock(item._id, item.isBlocked)}
                  className={`py-1 px-3 rounded ${
                    item.isBlocked ? 'bg-red-500' : 'bg-green-500'
                  } text-white`}
                  disabled={loadingStatus[item._id]}
                >
                  {loadingStatus[item._id]
                    ? 'Loading...'
                    : item.isBlocked
                    ? 'Unblock'
                    : 'Block'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between">
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </>
  );
}

export default ManagementTable;

