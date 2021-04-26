export function validateEmptyTable(agGridElement, actualTableData){
    expect(actualTableData).to.be.empty;
}

export function validateTableExactOrder(agGridElement, actualTableData,expectedTableData){
    expect(actualTableData, `The expected table data did not match the actual table data`).to.deep.equal(expectedTableData);
}

export function validateTableRowSubset(agGridElement, actualTableData,expectedTableData){
    expectedTableData.forEach((item)=> expect(actualTableData).to.deep.include(item));
}

export function validateTablePages(agGridElement,expectedPaginatedTableData, onlyColumns = {}) {
    let iterator = 0;
    expectedPaginatedTableData.forEach((expectedPage) => {
        cy.get(agGridElement)
            .getAgGridData(onlyColumns)
            .then((table) => {
                const actualPage = JSON.parse(JSON.stringify(table));
                validateTableExactOrder(agGridElement, actualPage, expectedPage);
                cy.get(".ag-icon-next").click();
                iterator++;
            });
    });
}
