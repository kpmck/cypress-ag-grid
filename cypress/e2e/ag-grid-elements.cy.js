import { filterOperator } from "../../src/agGrid/filterOperator.enum";

const agGridSelector = "#myGrid2";

describe("ag-grid get elements scenario", () => {
  beforeEach(() => {
    cy.visit("../app/index.html");
    cy.get(".ag-cell", { timeout: 10000 }).should("be.visible");
  });

  it("able to update grid cell value", () => {
    // filter to only show the porsche
    cy.get(agGridSelector).agGridColumnFilterTextFloating({
      searchCriteria: {
        columnName: "Make",
        filterValue: "Porsche",
        operator: filterOperator.equals,
      },
      hasApplyButton: true,
    });

    // expected values before changing the price
    const expectedTableBeforeEditing = [
      { Year: "2020", Make: "Porsche", Model: "Boxter", Price: "72000" },
      { Year: "2020", Make: "Porsche", Model: "Boxter", Price: "99000" },
    ];

    // verify values before editing
    cy.get(agGridSelector)
      .getAgGridData()
      .then((tableData) => {
        cy.agGridValidateRowsSubset(tableData, expectedTableBeforeEditing);
      });

    // edit the porsche boxter from 72000 to 66000
    cy.get(agGridSelector)
      .getAgGridElements()
      .then((tableElements) => {
        const porscheRow = tableElements.find(
          (row) => row.Price.innerText === "72000"
        );
        const priceCell = porscheRow.Price;
        cy.wrap(priceCell).dblclick().type("66000{enter}");
      });

    // expected values after changing the price
    const expectedTableAfterEditing = [
      { Year: "2020", Make: "Porsche", Model: "Boxter", Price: "66000" },
      { Year: "2020", Make: "Porsche", Model: "Boxter", Price: "99000" },
    ];

    // verify values before editing
    cy.get(agGridSelector)
      .getAgGridData()
      .then((tableData) => {
        cy.agGridValidateRowsSubset(tableData, expectedTableAfterEditing);
      });
  });
});
