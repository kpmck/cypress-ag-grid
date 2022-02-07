/// <reference types="cypress" />

import { sort } from "../../src/agGrid/sort.enum";
import {
  deleteKey,
  sortedCollectionByProperty,
} from "../../src/helpers/arrayHelpers";
import { filterOperator } from "../../src/agGrid/filterOperator.enum";

const _pageSize = 5;
const agGridSelector = "#myGrid";

describe("ag-grid scenarios", () => {
  beforeEach(() => {
    cy.visit("../app/index.html");
    cy.get(".ag-cell", {timeout: 10000}).should("be.visible");
  });

  it("verify paginated table data - include all columns", () => {
    const expectedPaginatedTableData = [
      [
        { Year: "2020", Make: "Toyota", Model: "Celica", Price: "35000" },
        { Year: "2020", Make: "Ford", Model: "Mondeo", Price: "32000" },
        { Year: "2020", Make: "Porsche", Model: "Boxter", Price: "72000" },
        { Year: "2020", Make: "BMW", Model: "3-series", Price: "45000" },
        { Year: "2020", Make: "Mercedes", Model: "GLC300", Price: "53000" },
      ],
      [
        { Year: "2020", Make: "Honda", Model: "Civic", Price: "22000" },
        { Year: "2020", Make: "Honda", Model: "Accord", Price: "32000" },
        { Year: "2020", Make: "Ford", Model: "Taurus", Price: "19000" },
        { Year: "2020", Make: "Hyundai", Model: "Elantra", Price: "22000" },
        { Year: "2020", Make: "Toyota", Model: "Celica", Price: "5000" },
      ],
      [
        { Year: "2020", Make: "Ford", Model: "Mondeo", Price: "25000" },
        { Year: "2020", Make: "Porsche", Model: "Boxter", Price: "99000" },
        { Year: "2020", Make: "BMW", Model: "3-series", Price: "32000" },
        { Year: "2020", Make: "Mercedes", Model: "GLC300", Price: "35000" },
        { Year: "2011", Make: "Honda", Model: "Civic", Price: "9000" },
      ],
      [
        { Year: "2020", Make: "Honda", Model: "Accord", Price: "34000" },
        { Year: "1990", Make: "Ford", Model: "Taurus", Price: "900" },
        { Year: "2020", Make: "Hyundai", Model: "Elantra", Price: "3000" },
        { Year: "2020", Make: "BMW", Model: "2002", Price: "88001" },
      ],
    ];
    cy.get(agGridSelector).agGridValidatePaginatedTable(
      expectedPaginatedTableData
    );
  });

  it("verify paginated table data - excluding columns", () => {
    const expectedPaginatedTableData = [
      [
        { Year: "2020", Make: "Toyota", Model: "Celica" },
        { Year: "2020", Make: "Ford", Model: "Mondeo" },
        { Year: "2020", Make: "Porsche", Model: "Boxter" },
        { Year: "2020", Make: "BMW", Model: "3-series" },
        { Year: "2020", Make: "Mercedes", Model: "GLC300" },
      ],
      [
        { Year: "2020", Make: "Honda", Model: "Civic" },
        { Year: "2020", Make: "Honda", Model: "Accord" },
        { Year: "2020", Make: "Ford", Model: "Taurus" },
        { Year: "2020", Make: "Hyundai", Model: "Elantra" },
        { Year: "2020", Make: "Toyota", Model: "Celica" },
      ],
      [
        { Year: "2020", Make: "Ford", Model: "Mondeo" },
        { Year: "2020", Make: "Porsche", Model: "Boxter" },
        { Year: "2020", Make: "BMW", Model: "3-series" },
        { Year: "2020", Make: "Mercedes", Model: "GLC300" },
        { Year: "2011", Make: "Honda", Model: "Civic" },
      ],
      [
        { Year: "2020", Make: "Honda", Model: "Accord" },
        { Year: "1990", Make: "Ford", Model: "Taurus" },
        { Year: "2020", Make: "Hyundai", Model: "Elantra" },
        { Year: "2020", Make: "BMW", Model: "2002" },
      ],
    ];
    cy.get(agGridSelector).agGridValidatePaginatedTable(
      expectedPaginatedTableData,
      {
        onlyColumns: ["Year", "Make", "Model"],
      }
    );
  });

  it("able to filter by checkbox", () => {
    const expectedTableData = [
      { Year: "2020", Make: "BMW", Model: "2002", Price: "88001" },
    ];
    cy.get(agGridSelector).agGridColumnFilterCheckboxMenu({
      searchCriteria: {
        columnName: "Model",
        filterValue: "2002",
      },
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.get(agGridSelector).agGridValidateRowsExactOrder(actualTableData, expectedTableData);
      });
  });

  it("able to filter by checkbox - multiple columns", () => {
    const expectedTableData = [
        { Year: "2020", Make: "BMW", Model: "3-series", Price: "45000" },
        { Year: "2020", Make: "BMW", Model: "3-series", Price: "32000" },
        { Year: "2020", Make: "BMW", Model: "2002", Price: "88001" },
    ];
    cy.get(agGridSelector).agGridColumnFilterCheckboxMenu({
      searchCriteria: [{
        columnName: "Model",
        filterValue: "2002",
      },
      {
        columnName: "Model",
        filterValue: "3-series",
      }
    ],
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.get(agGridSelector).agGridValidateRowsExactOrder(actualTableData, expectedTableData, true);
      });
  });

  it("able to filter by text - menu", () => {
    const expectedTableData = [
      { Year: "2020", Make: "BMW", Model: "3-series", Price: "32000" },
      { Year: "2020", Make: "Honda", Model: "Accord", Price: "32000" },
      { Year: "2020", Make: "Ford", Model: "Mondeo", Price: "32000" },
    ];
    cy.get(agGridSelector).agGridSortColumn("Model", sort.ascending);
    cy.get(agGridSelector).agGridColumnFilterTextMenu({
      searchCriteria: {
        columnName: "Price",
        filterValue: "32000",
        operator: filterOperator.equals,
      },
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.get(agGridSelector).agGridValidateRowsExactOrder(actualTableData, expectedTableData);
      });
  });

  it("able to filter by text - menu - multiple columns", () => {
    const expectedTableData = [
      { Year: "2020", Make: "BMW", Model: "3-series", Price: "32000" },
    ];
    cy.get(agGridSelector).agGridSortColumn("Model", sort.ascending);
    cy.get(agGridSelector).agGridColumnFilterTextMenu({
      searchCriteria: [{
        columnName: "Price",
        filterValue: "32000",
        operator: filterOperator.equals,
      },
      {
        columnName: "Make",
        filterValue: "BMW",
        operator: filterOperator.equals,
      }
    ],
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.get(agGridSelector).agGridValidateRowsExactOrder(actualTableData, expectedTableData);
      });
  });

  it("able to filter by text - floating filter", () => {
    const expectedTableData = [
      { Year: "2020", Make: "Ford", Model: "Mondeo", Price: "32000" },
      { Year: "2020", Make: "Ford", Model: "Mondeo", Price: "25000" },
      { Year: "2020", Make: "Ford", Model: "Taurus", Price: "19000" },
      { Year: "1990", Make: "Ford", Model: "Taurus", Price: "900" },
    ];
    cy.get(agGridSelector).agGridSortColumn("Model", sort.ascending);
    cy.get(agGridSelector).agGridColumnFilterTextFloating({
      searchCriteria: {
        columnName: "Make",
        filterValue: "Ford",
      },
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.get(agGridSelector).agGridValidateRowsExactOrder(actualTableData, expectedTableData);
      });
  });

  it("able to filter by text - floating filter - multiple columns", () => {
    const expectedTableData = [
      { Year: "1990", Make: "Ford", Model: "Taurus", Price: "900" },
    ];
    cy.get(agGridSelector).agGridSortColumn("Model", sort.ascending);
    cy.get(agGridSelector).agGridColumnFilterTextFloating({
      searchCriteria: [{
        columnName: "Make",
        filterValue: "Ford",
      },
      {
        columnName: "Year",
        filterValue: "1990",
      }
    ],
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.get(agGridSelector).agGridValidateRowsExactOrder(actualTableData, expectedTableData);
      });
  });  

  it("able to validate empty table", () => {
    //Search for an entry that does not exist
    cy.get(agGridSelector).agGridColumnFilterTextMenu({
      searchCriteria: {
        columnName: "Price",
        filterValue: "0",
        operator: filterOperator.equals,
      },
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.get(agGridSelector).agGridValidateEmptyTable(actualTableData);
      });
  });

  it("able to sort by ascending order", () => {
    cy.get(agGridSelector).agGridSortColumn("Make", sort.ascending);
    cy.fixture("cardata").then((carData) => {
      // This will sort the entirety of our collection by the specified columnName and sort order
      // and will return only the # of records specified. In this example, I include only the first
      // page of data.
      const expectedData_sortedByAscending = sortedCollectionByProperty(
        carData,
        "Make",
        sort.ascending,
        _pageSize
      );
      cy.get(agGridSelector)
        .getAgGridData()
        .then((actualTableData) => {
          cy.get(agGridSelector).agGridValidateRowsExactOrder(
            actualTableData,
            expectedData_sortedByAscending
          );
        });
    });
  });

  it("able to sort by descending order", () => {
    cy.get(agGridSelector).agGridSortColumn("Make", sort.descending);
    cy.fixture("cardata").then((carData) => {
      // This will sort the entirety of our collection by the specified columnName and sort order
      // and will return only the # of records specified. In this example, I include only the first
      // page of data.
      const expectedData_sortedByDescending = sortedCollectionByProperty(
        carData,
        "Make",
        sort.descending,
        _pageSize
      );
      cy.get(agGridSelector)
        .getAgGridData()
        .then((actualTableData) => {
          cy.get(agGridSelector).agGridValidateRowsExactOrder(
            actualTableData,
            expectedData_sortedByDescending
          );
        });
    });
  });

  it("remove column from grid and verify select column data", () => {
    cy.get(agGridSelector).agGridToggleColumnsSideBar("Year", true);
    cy.fixture("cardata").then((expectedTableData) => {
      const expectedData_yearColumnRemoved = removePropertyFromCollection(
        expectedTableData,
        ["Year"]
      );
      cy.get(agGridSelector)
        .getAgGridData()
        .then((actualTableData) => {
          cy.get(agGridSelector).agGridValidateRowsExactOrder(
            actualTableData,
            expectedData_yearColumnRemoved.slice(0, _pageSize)
          );
        });
    });
  });

  it("remove single pinned column from grid and verify select column data", () => {
    cy.get(agGridSelector).agGridToggleColumnsSideBar("Price", true);
    cy.fixture("cardata").then((expectedTableData) => {
      const expectedData_priceColumnRemoved = removePropertyFromCollection(
        expectedTableData,
        ["Price"]
      );

      cy.get(agGridSelector)
        .getAgGridData()
        .then((actualTableData) => {
          cy.get(agGridSelector).agGridValidateRowsExactOrder(
            actualTableData,
            expectedData_priceColumnRemoved.slice(0, _pageSize)
          );
        });
    });
  });

  it("remove multiple columns from grid and verify select column data", () => {
    cy.get(agGridSelector).agGridToggleColumnsSideBar("Price", true);
    cy.get(agGridSelector).agGridToggleColumnsSideBar("Make", true);
    cy.fixture("cardata").then((expectedTableData) => {
      const expectedData_multipleColumnsRemoved = removePropertyFromCollection(
        expectedTableData,
        ["Price", "Make"]
      );
      cy.get(agGridSelector)
        .getAgGridData()
        .then((actualTableData) => {
          cy.get(agGridSelector).agGridValidateRowsExactOrder(
            actualTableData,
            expectedData_multipleColumnsRemoved.slice(0, _pageSize)
          );
        });
    });
  });

  it("only validate select column data", () => {
    const expectedTableData = [
      { Year: "2020", Make: "Toyota", Model: "Celica" },
      { Year: "2020", Make: "Ford", Model: "Mondeo" },
      { Year: "2020", Make: "Porsche", Model: "Boxter" },
      { Year: "2020", Make: "BMW", Model: "3-series" },
      { Year: "2020", Make: "Mercedes", Model: "GLC300" },
    ];
    cy.get(agGridSelector)
      .getAgGridData({ onlyColumns: ["Year", "Make", "Model"] })
      .then((actualTableData) => {
        cy.get(agGridSelector).agGridValidateRowsSubset(actualTableData, expectedTableData);
      });
  });
});

function removePropertyFromCollection(expectedTableData, columnsToExclude) {
  //Exclude any specified columns
  if (columnsToExclude) {
    columnsToExclude.forEach((excludedColumn) => {
      expectedTableData.forEach((obj) => deleteKey(obj, excludedColumn));
    });
  }
  return expectedTableData;
}

// /// THE BELOW METHODS SHOWCASE HOW TO DYNAMICALLY GET THE EXPECTED DATA AND MANIPULATE IT FOR VALIDATION
// /// THIS INCLUDES PAGINATION, FILTERING, and COLUMN EXCLUSION

// export const carColumns = {
//   year: "Year",
//   make: "Make",
//   model: "Model",
//   price: "Price",
// };

// /**
//  * Returns ALL expected table data populated from the expected test data call and does not factor in pagination
//  * @param columnsToExclude Provide an array of string values for columns to not return in the data set
//  * @param filters a "\^" delimited string of all columns and values to search for in the grid (i.e. "Name=John Smith^Rate Plan=Standard"
//  */
// export function getExpectedTableData(columnsToExclude, filters) {
//   let table = [];

//   // Get the expected table data from the cardata fixture file and process it with columns exclusions and filters
//   return cy
//     .fixture("cardata")
//     .then((cars) => {
//       table = cars;
//     })
//     .then(() => {
//       // Iterate over all filter strings and filter table results in the order in which they are provided
//       if (filters) {
//         filters.split("^").forEach((filter) => {
//           const [key, value] = filter.split("=");
//           const getKey = getKeyByValue(carColumns, key);
//           table = table.filter((a) => a[getKey].includes(value));
//         });
//       }
//     })
//     .then(() => {
//       // Update the property key values to match what is represented in the grid for validation purposes
//       // (i.e. in this example, we change make to Make, model to Model, and price to Price to match
//       // what is shown in the grid headers exactly).
//       for (const key in carColumns)
//         table.forEach((obj) => renameKey(obj, key, carColumns[key]));

//       //Exclude any specified columns
//       if (columnsToExclude) {
//         columnsToExclude.forEach((excludedColumn) => {
//           table.forEach((obj) => deleteKey(obj, excludedColumn));
//         });
//       }
//       return table;
//     });
// }

// /**
//  * Returns ALL expected table data and paginates the data based on the pageSize
//  * @param columnsToExclude Provide an array of string values for columns to not return in the data set
//  * @param pageSize If no value is provided, default value of 5 items per page is used
//  */
// function getExpectedPaginatedTableData(columnsToExclude, pageSize = 5) {
//   const paginatedTableData = [];
//   // paginates the expected table data, and removes specified column exclusions
//   return getExpectedTableData(columnsToExclude)
//     .then((tableData) => {
//       const pages = Math.floor(tableData.length / pageSize);
//       const finalPageCount = tableData.length % pageSize;
//       let iterator = 0;
//       for (let i = 0; i < pages; i++) {
//         paginatedTableData.push(tableData.slice(iterator, iterator + pageSize));
//         iterator += pageSize;
//       }
//       paginatedTableData.push(
//         tableData.slice(iterator, iterator + finalPageCount)
//       );
//     })
//     .then(() => {
//       return paginatedTableData;
//     });
// }
