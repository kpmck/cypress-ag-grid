// specify the columns
const columnDefs = [
    {field: "year", pinned: 'left'},
    {field: "make", rowGroup: false, pinned: 'left'},
    {field: "model", filter: true},
    {field: "price", pinned: 'right', floatingFilter: false, sortable: false}
];

const autoGroupColumnDef = {
    headerName: "Model",
    field: "model",
    cellRenderer: "agGroupCellRenderer",
    cellRendererParams: {
        checkbox: true
    }
}

// let the grid know which columns to use
const gridOptions = {
    defaultColDef: {
        sortable: true,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        filterParams: {
            buttons: ['reset', 'apply'],
            debounceMs: 200
        },
        animateRows: true
    },
    autoGroupColumnDef: autoGroupColumnDef,
    groupSelectsChildren: true,
    columnDefs: columnDefs,
    rowSelection: 'multiple',
    domLayout: 'normal',
    pagination: true,
    paginationPageSize: 5,
    sideBar: true
};

// lookup the container we want the Grid to use
const eGridDiv = document.querySelector('#myGrid');

// create the grid passing in the div to use together with the columns &amp; data we want to use
new agGrid.Grid(eGridDiv, gridOptions);

agGrid.simpleHttpRequest({url: 'https://api.jsonbin.io/b/608304f69a9aa933335613a6/2'}).then(data => {
    gridOptions.api.setRowData(data);
});

gridOptions.api.sizeColumnsToFit()