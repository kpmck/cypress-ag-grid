// specify the columns
const columnDefsGrouped = [
  { field: "year", pivot: true, },
  { field: "make", rowGroup: true, enableRowGroup: true },
  { field: "model", filter: true },
  { field: "price", editable: true, cellEditor: 'agTextCellEditor' },
  {
    field: "purchaseDate",
    filter: "agDateColumnFilter",
    floatingFilter: true,
    filterParams: {
      buttons: ["reset", "apply"],
      comparator: (filterLocalDateAtMidnight, cellValue) => {
        const dateAsString = cellValue;
        if (dateAsString == null) return -1;
        const dateParts = dateAsString.split("-");
        const cellDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
        if (cellDate < filterLocalDateAtMidnight) {
          return -1;
        } else if (cellDate > filterLocalDateAtMidnight) {
          return 1;
        } else {
          return 0;
        }
      },
    },
    valueFormatter: (params) => {
      if (params.value) {
        const dateParts = params.value.split("-");
        const date = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
        return date.toLocaleDateString();
      }
      return "";
    },
  },
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
fetch("./data.json")
  .then(res => res.json())
  .then((data) => {
    gridOptionsGrouped.api.setGridOption('rowData', data);
  });

function autoSizeAllColumns() {
  var allColumnIds = [];
  gridOptionsGrouped.api.getColumns().forEach(function (column) {
    allColumnIds.push(column.colId);
  });
  gridOptionsGrouped.api.autoSizeColumns(allColumnIds);
}

// If the Cypress test is running, ensure all columns fit within the window
if (window.Cypress) {
  gridOptionsGrouped.api.sizeColumnsToFit();
} else {
  // Otherwise auto-size columns the way we wish to view the grid in production.
  autoSizeAllColumns();
}
