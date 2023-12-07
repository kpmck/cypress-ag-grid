// specify the columns
const columnDefsGrouped = [
  { field: "year", pivot: true, },
  { field: "make", rowGroup: true, enableRowGroup: true },
  { field: "model", filter: true },
  { field: "price", editable: true, cellEditor: 'agTextCellEditor'  },
];

const autoGroupColumnDefGrouped = {
  headerName: "Model",
  field: "model",
  cellRenderer: "agGroupCellRenderer",
  cellRendererParams: {
    checkbox: true,
  },
};

// let the grid know which columns to use
const gridOptionsGrouped = {
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
  groupDefaultExpanded: 2,
  autoGroupColumnDef: autoGroupColumnDefGrouped,
  groupSelectsChildren: true,
  columnDefs: columnDefsGrouped,
  rowSelection: "multiple",
  domLayout: "normal",
  pagination: true,
  paginationPageSize: 5,
  sideBar: false,
};

// lookup the container we want the Grid to use
const eGridDivGrouped = document.querySelector("#myGrid2");

// create the grid passing in the div to use together with the columns &amp; data we want to use
new agGrid.Grid(eGridDivGrouped, gridOptionsGrouped);

// Grab the grid data from the supplied API endpoint
agGrid
  .simpleHttpRequest({
    url: "./data.json",
  })
  .then((data) => {
    gridOptionsGrouped.api.setRowData(data);
  });

function autoSizeAllColumns() {
  var allColumnIds = [];
  gridOptionsGrouped.columnApi.getAllColumns().forEach(function (column) {
    allColumnIds.push(column.colId);
  });
  gridOptionsGrouped.columnApi.autoSizeColumns(allColumnIds);
}

// If the Cypress test is running, ensure all columns fit within the window
if (window.Cypress) {
  gridOptionsGrouped.api.sizeColumnsToFit();
} else {
    // Otherwise auto-size columns the way we wish to view the grid in production.
    autoSizeAllColumns();
}
