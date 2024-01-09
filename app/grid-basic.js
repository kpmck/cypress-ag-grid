// specify the columns
const columnDefs = [
  { field: "year", pinned: "left" },
  { field: "make", rowGroup: false, pinned: "left" },
  { field: "model", filter: true },
  { field: "condition",filter: "agTextColumnFilter", filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: 'OR', } },
  {
    field: "price",
    pinned: "right",
    floatingFilter: false,
    sortable: false,
    editable: true,
    cellEditor: "agTextCellEditor",
  },
];

const autoGroupColumnDef = {
  headerName: "Model",
  field: "model",
  cellRenderer: "agGroupCellRenderer",
  cellRendererParams: {
    checkbox: true,
  },
};

// let the grid know which columns to use
const gridOptions = {
  defaultColDef: {
    sortable: true,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    filterParams: {
      buttons: ["reset", "apply"],
      debounceMs: 200,
    },
    animateRows: true,
    resizable: true,
  },
  autoGroupColumnDef: autoGroupColumnDef,
  groupSelectsChildren: true,
  columnDefs: columnDefs,
  rowSelection: "multiple",
  domLayout: "normal",
  pagination: true,
  paginationPageSize: 5,
  sideBar: true,
};

// lookup the container we want the Grid to use
const eGridDiv = document.querySelector("#myGrid");

// create the grid passing in the div to use together with the columns &amp; data we want to use
new agGrid.Grid(eGridDiv, gridOptions);

// Grab the grid data from the supplied API endpoint
fetch("./data.json")
  .then(res => res.json())
  .then((data) => {
    gridOptions.api.setGridOption('rowData', data);
  });

function autoSizeAllColumns() {
  var allColumnIds = [];
  gridOptions.api.getAllColumns().forEach(function (column) {
    allColumnIds.push(column.colId);
  });
  gridOptions.api.autoSizeColumns(allColumnIds);
}

// If the Cypress test is running, ensure all columns fit within the window
if (window.Cypress) {
  gridOptions.api.sizeColumnsToFit();
} else {
  // Otherwise auto-size columns the way we wish to view the grid in production.
  autoSizeAllColumns();
}
