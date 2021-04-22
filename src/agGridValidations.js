/// <reference types="cypress" />

export function validateEmptyTable(actualTableData){
  expect(actualTableData).to.be.empty;
}

export function validateTableExactOrder(actualTableData,expectedTableData){
  expect(actualTableData, `The expected table data did not match the actual table data`).to.deep.equal(expectedTableData);
}

export function validateTableRowSubset(actualTableData,expectedTableData){
  expectedTableData.forEach((item)=> expect(actualTableData).to.deep.include(item));
}

export function validateTablePages(agGridElement,expectedPaginatedTableData) {
  let iterator = 0;
  expectedPaginatedTableData.forEach((expectedPage) => {
    cy.get(agGridElement)
      .getTable()
      .then((table) => {
        const actualPage = JSON.parse(JSON.stringify(table));
        validateTableExactOrder(actualPage, expectedPage);
        cy.get(".ag-icon-next").click();
        iterator++;
      });
  });
}
