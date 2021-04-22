   // specify the columns
   const columnDefs = [
    { field: "make", rowGroup: false, pinned: 'left' },
    { field: "model" },
    { field: "price", pinned: 'right' }
  ];

  const autoGroupColumnDef = {
      headerName: "Model",
      field: "model",
      cellRenderer: "agGroupCellRenderer",
      cellRendererParams:{
          checkbox: true
      }
  }

  // let the grid know which columns to use
  const gridOptions = {
    defaultColDef: {
        sortable: true,
        filter: true,
        filterParams: {
            buttons: ['reset', 'apply'],
            debounceMs: 200
        },
        animateRows: true
    },
    autoGroupColumnDef: autoGroupColumnDef,
    groupSelectsChildren: true,
    columnDefs: columnDefs,
    rowSelection: 'multiple'
  };

// lookup the container we want the Grid to use
const eGridDiv = document.querySelector('#myGrid');

// create the grid passing in the div to use together with the columns &amp; data we want to use
new agGrid.Grid(eGridDiv, gridOptions);

agGrid.simpleHttpRequest({url: 'https://www.ag-grid.com/example-assets/row-data.json'}).then(data => {
    gridOptions.api.setRowData(data);
});