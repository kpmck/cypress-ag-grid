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

/**
 * Performs a deep include validation to verify the data exists within the displayed grid page
 * @param {*} actualTableData 
 * @param {*} expectedTableData 
 */
export function validateTableRowSubset(actualTableData, expectedTableData) {
  expectedTableData.forEach((item) =>
    expect(actualTableData).to.deep.include(item)
  );
}

/**
 *  * Validates the grid data across its pages. Performs a validation that he data exists on each page, not accounting for order.
 * @param {*} expectedPaginatedTableData Your paginated array to match the grid data.
 * @param {*} onlyColumns (Optional) If specified, ONLY these columns will be validated. If left blank, all columns are validated.
 */
export function validateTablePages(
  subject,
  expectedPaginatedTableData,
  onlyColumns = {}
) {
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
