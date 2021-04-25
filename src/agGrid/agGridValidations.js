/// <reference types="cypress" />

export function validateEmptyTable(actualTableData) {
      expect(actualTableData).to.be.empty;
}

export function validateTableExactOrder(actualTableData, expectedTableData) {
      expect(
        actualTableData,
        `The expected table data did not match the actual table data`
      ).to.deep.equal(expectedTableData);
}

export function validateTableRowSubset(actualTableData, expectedTableData) {
      expectedTableData.forEach((item) =>
        expect(actualTableData).to.deep.include(item)
      );
}

export function validateTablePages(subject, expectedPaginatedTableData, onlyColumns = {}) {
  let iterator = 0;
  expectedPaginatedTableData.forEach((expectedPageTableData) => {
    cy.get(subject)
      .getAgGrid(onlyColumns)
      .then((actualPageTableData) => {
        validateTableRowSubset(actualPageTableData, expectedPageTableData);
        cy.get(subject).find(".ag-icon-next").click();
        iterator++;
      });
  });
}
