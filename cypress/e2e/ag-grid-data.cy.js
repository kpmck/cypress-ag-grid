/// <reference types="cypress" />

import { sort } from "../../src/agGrid/sort.enum";
import {
  deleteKey,
  sortedCollectionByProperty,
} from "../../src/helpers/arrayHelpers";
import { filterOperator } from "../../src/agGrid/filterOperator.enum";

const _pageSize = 5;
const agGridSelector = "#myGrid";
const expectedPaginatedTableData = [
  [
    { Year: "2020", Make: "Toyota", Model: "Celica", Condition: "fair", "Purchase Date": "1/15/2020", Price: "35000" },
    { Year: "2020", Make: "Ford", Model: "Mondeo", Condition: "excellent", "Purchase Date": "2/20/2020", Price: "32000" },
    { Year: "2020", Make: "Porsche", Model: "Boxter", Condition: "good", "Purchase Date": "3/10/2020", Price: "72000" },
    { Year: "2020", Make: "BMW", Model: "3-series", Condition: "fair", "Purchase Date": "4/5/2020", Price: "45000" },
    { Year: "2020", Make: "Mercedes", Model: "GLC300", Condition: "good", "Purchase Date": "5/22/2020", Price: "53000" },
  ],
  [
    { Year: "2020", Make: "Honda", Model: "Civic", Condition: "poor", "Purchase Date": "6/18/2020", Price: "22000" },
    { Year: "2020", Make: "Honda", Model: "Accord", Condition: "poor", "Purchase Date": "7/12/2020", Price: "32000" },
    { Year: "2020", Make: "Ford", Model: "Taurus", Condition: "excellent", "Purchase Date": "8/30/2020", Price: "19000" },
    { Year: "2020", Make: "Hyundai", Model: "Elantra", Condition: "good", "Purchase Date": "9/14/2020", Price: "22000" },
    { Year: "2020", Make: "Toyota", Model: "Celica", Condition: "poor", "Purchase Date": "10/8/2020", Price: "5000" },
  ],
  [
    { Year: "2020", Make: "Ford", Model: "Mondeo", Condition: "good", "Purchase Date": "11/25/2020", Price: "25000" },
    { Year: "2020", Make: "Porsche", Model: "Boxter", Condition: "good", "Purchase Date": "12/3/2020", Price: "99000" },
    { Year: "2020", Make: "BMW", Model: "3-series", Condition: "poor", "Purchase Date": "1/19/2021", Price: "32000" },
    { Year: "2020", Make: "Mercedes", Model: "GLC300", Condition: "excellent", "Purchase Date": "2/11/2021", Price: "35000" },
    { Year: "2011", Make: "Honda", Model: "Civic", Condition: "good", "Purchase Date": "6/5/2011", Price: "9000" },
  ],
  [
    { Year: "2020", Make: "Honda", Model: "Accord", Condition: "good", "Purchase Date": "3/28/2021", Price: "34000" },
    { Year: "1990", Make: "Ford", Model: "Taurus", Condition: "excellent", "Purchase Date": "9/15/1990", Price: "900" },
    { Year: "2020", Make: "Hyundai", Model: "Elantra", Condition: "fair", "Purchase Date": "4/16/2021", Price: "3000" },
    { Year: "2020", Make: "BMW", Model: "2002", Condition: "excellent", "Purchase Date": "5/7/2021", Price: "88001" },
    { Year: "2023", Make: "Hyundai", Model: "Santa Fe", Condition: "excellent", "Purchase Date": "8/20/2023", Price: "" },
  ],
];

describe("ag-grid get data scenarios", () => {
  beforeEach(() => {
    cy.visit("../app/index.html");
    cy.get(".ag-cell", { timeout: 10000 }).should("be.visible");
    cy.get('#floating').click()
  });

  it("verify paginated table data - any order - include all columns", () => {
    cy.get(agGridSelector).agGridValidatePaginatedTable(
      expectedPaginatedTableData
    );
  });

  it("verify paginated table data - exact order - include all columns", () => {
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.agGridValidateRowsExactOrder(actualTableData, expectedPaginatedTableData[0]);
      });
  });

  it("verify exact order table data when columns are not in order - include all columns", () => {
    cy.get(agGridSelector).agGridPinColumn('Price', 'left');

    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.agGridValidateRowsExactOrder(actualTableData, expectedPaginatedTableData[0]);
      });
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
        { Year: "2023", Make: "Hyundai", Model: "Santa Fe" },
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
      { Year: "2020", Make: "BMW", Model: "2002", Condition: "excellent", "Purchase Date": "5/7/2021", Price: "88001" },
    ];
    cy.get(agGridSelector).agGridColumnFilterTextFloating({
      searchCriteria: {
        columnName: "Model",
        filterValue: "2002",
      },
      selectAllLocaleText: "(Select All)", // This is optional if you are using localText for ag grid
      hasApplyButton: true,

    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.agGridValidateRowsExactOrder(actualTableData, expectedTableData);
      });
  });

  it("able to filter by checkbox - multiple columns", () => {
    cy.get('#nonFloating').click()
    const expectedTableData = [
      { Year: "2020", Make: "BMW", Model: "3-series", Condition: "fair", "Purchase Date": "4/5/2020", Price: "45000" },
      { Year: "2020", Make: "BMW", Model: "3-series", Condition: "poor", "Purchase Date": "1/19/2021", Price: "32000" },
      { Year: "2020", Make: "BMW", Model: "2002", Condition: "excellent", "Purchase Date": "5/7/2021", Price: "88001" },
    ];

    cy.get(agGridSelector).agGridColumnFilterCheckboxMenu({
      searchCriteria: [
        {
          columnName: "Model",
          filterValue: "2002",
        },
        {
          columnName: "Model",
          filterValue: "3-series",
        },
      ],
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.agGridValidateRowsExactOrder(
          actualTableData,
          expectedTableData,
          true
        );
      });
  });

  it("able to filter by text - menu", () => {
    const expectedTableData = [
      { Year: "2020", Make: "BMW", Model: "3-series", Condition: "poor", "Purchase Date": "1/19/2021", Price: "32000" },
      { Year: "2020", Make: "Honda", Model: "Accord", Condition: "poor", "Purchase Date": "7/12/2020", Price: "32000" },
      { Year: "2020", Make: "Ford", Model: "Mondeo", Condition: "excellent", "Purchase Date": "2/20/2020", Price: "32000" },
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
        cy.agGridValidateRowsExactOrder(actualTableData, expectedTableData);
      });
  });

  it("able to filter by text - menu - multiple columns", () => {
    cy.get('#nonFloating').click()
    const expectedTableData = [
      { Year: "2020", Make: "BMW", Model: "3-series", Condition: "poor", "Purchase Date": "1/19/2021", Price: "32000" },
    ];
    cy.get(agGridSelector).agGridSortColumn("Model", sort.ascending);
    cy.get(agGridSelector).agGridColumnFilterTextMenu({
      searchCriteria: [
        {
          columnName: "Price",
          filterValue: "32000",
          operator: filterOperator.equals,
        },
        {
          columnName: "Make",
          filterValue: "BMW",
          operator: filterOperator.equals,
        },
      ],
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.agGridValidateRowsExactOrder(actualTableData, expectedTableData);
      });
  });

  it("able to filter by text - floating filter", () => {
    const expectedTableData = [
      { Year: "2020", Make: "Ford", Model: "Mondeo", Condition: "excellent", "Purchase Date": "2/20/2020", Price: "32000" },
      { Year: "2020", Make: "Ford", Model: "Mondeo", Condition: "good", "Purchase Date": "11/25/2020", Price: "25000" },
      { Year: "2020", Make: "Ford", Model: "Taurus", Condition: "excellent", "Purchase Date": "8/30/2020", Price: "19000" },
      { Year: "1990", Make: "Ford", Model: "Taurus", Condition: "excellent", "Purchase Date": "9/15/1990", Price: "900" },
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
        cy.agGridValidateRowsExactOrder(actualTableData, expectedTableData);
      });
  });

  it("able to filter by text - floating filter - multiple conditions", () => {
    const expectedTableData = [
      { Year: "2020", Make: "BMW", Model: "2002", Condition: "excellent", "Purchase Date": "5/7/2021", Price: "88001" },
      { Year: "2020", Make: "BMW", Model: "3-series", Condition: "fair", "Purchase Date": "4/5/2020", Price: "45000" },
      { Year: "2020", Make: "BMW", Model: "3-series", Condition: "poor", "Purchase Date": "1/19/2021", Price: "32000" },
    ];

    cy.get(agGridSelector).agGridSortColumn("Model", sort.ascending);
    cy.get(agGridSelector).agGridColumnFilterTextFloating({
      searchCriteria: {
        columnName: "Make",
        filterValue: "B",
        searchInputIndex: 0,
      },
      hasApplyButton: true,
    });
    cy.get(agGridSelector).agGridColumnFilterTextFloating({
      searchCriteria: {
        columnName: "Make",
        filterValue: "MW",
        searchInputIndex: 1,
      },
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.agGridValidateRowsExactOrder(actualTableData, expectedTableData);
      });
  });

  it("able to filter by text - floating filter - multiple columns", () => {
    const expectedTableData = [
      { Year: "1990", Make: "Ford", Model: "Taurus", Condition: "excellent", "Purchase Date": "9/15/1990", Price: "900" },
    ];
    cy.get(agGridSelector).agGridSortColumn("Model", sort.ascending);
    cy.get(agGridSelector).agGridColumnFilterTextFloating({
      searchCriteria: [
        {
          columnName: "Make",
          filterValue: "Ford",
        },
        {
          columnName: "Year",
          filterValue: "1990",
        },
      ],
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.get(agGridSelector).agGridValidateRowsExactOrder(
          actualTableData,
          expectedTableData
        );
      });
  });

  it("able to filter by text - floating filter - multi filter", () => {
    const expectedTableData = [
      { Year: "2020", Make: "Ford", Model: "Taurus", Condition: "excellent", "Purchase Date": "8/30/2020", Price: "19000" },
      { Year: "1990", Make: "Ford", Model: "Taurus", Condition: "excellent", "Purchase Date": "9/15/1990", Price: "900" },
    ];
    cy.get(agGridSelector).agGridSortColumn("Model", sort.ascending);
    cy.get(agGridSelector).agGridColumnFilterTextFloating({
      searchCriteria: [
        {
          columnName: "Model",
          filterValue: "Taurus",
          isMultiFilter: true,
        },
      ],
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.get(agGridSelector).agGridValidateRowsExactOrder(
          actualTableData,
          expectedTableData
        );
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
        cy.agGridValidateEmptyTable(actualTableData);
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
          cy.agGridValidateRowsExactOrder(
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
          cy.agGridValidateRowsExactOrder(
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
          cy.agGridValidateRowsExactOrder(
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
          cy.agGridValidateRowsExactOrder(
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
          cy.agGridValidateRowsExactOrder(
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
        cy.agGridValidateRowsSubset(actualTableData, expectedTableData);
      });
  });

  it("able to filter by 'Blank'", () => {
    const expectedTableData = [
      { Year: "2023", Make: "Hyundai", Model: "Santa Fe", Condition: "excellent", "Purchase Date": "8/20/2023", Price: "" },
    ];

    cy.get(agGridSelector).agGridColumnFilterTextMenu({
      searchCriteria: {
        columnName: "Price",
        operator: filterOperator.blank,
      },
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.agGridValidateRowsSubset(actualTableData, expectedTableData);
      });

  });

  it("able to filter by 'Not blank'", () => {
    const expectedTableData = [
      { Year: "2020", Make: "Toyota", Model: "Celica", Condition: "fair", "Purchase Date": "1/15/2020", Price: "35000" },
      { Year: "2020", Make: "Ford", Model: "Mondeo", Condition: "excellent", "Purchase Date": "2/20/2020", Price: "32000" },
      { Year: "2020", Make: "Porsche", Model: "Boxter", Condition: "good", "Purchase Date": "3/10/2020", Price: "72000" },
      { Year: "2020", Make: "BMW", Model: "3-series", Condition: "fair", "Purchase Date": "4/5/2020", Price: "45000" },
      { Year: "2020", Make: "Mercedes", Model: "GLC300", Condition: "good", "Purchase Date": "5/22/2020", Price: "53000" },
      { Year: "2020", Make: "Honda", Model: "Civic", Condition: "poor", "Purchase Date": "6/18/2020", Price: "22000" },
      { Year: "2020", Make: "Honda", Model: "Accord", Condition: "poor", "Purchase Date": "7/12/2020", Price: "32000" },
      { Year: "2020", Make: "Ford", Model: "Taurus", Condition: "excellent", "Purchase Date": "8/30/2020", Price: "19000" },
      { Year: "2020", Make: "Hyundai", Model: "Elantra", Condition: "good", "Purchase Date": "9/14/2020", Price: "22000" },
      { Year: "2020", Make: "Toyota", Model: "Celica", Condition: "poor", "Purchase Date": "10/8/2020", Price: "5000" },
      { Year: "2020", Make: "Ford", Model: "Mondeo", Condition: "good", "Purchase Date": "11/25/2020", Price: "25000" },
      { Year: "2020", Make: "Porsche", Model: "Boxter", Condition: "good", "Purchase Date": "12/3/2020", Price: "99000" },
      { Year: "2020", Make: "BMW", Model: "3-series", Condition: "poor", "Purchase Date": "1/19/2021", Price: "32000" },
      { Year: "2020", Make: "Mercedes", Model: "GLC300", Condition: "excellent", "Purchase Date": "2/11/2021", Price: "35000" },
      { Year: "2011", Make: "Honda", Model: "Civic", Condition: "good", "Purchase Date": "6/5/2011", Price: "9000" },
      { Year: "2020", Make: "Honda", Model: "Accord", Condition: "good", "Purchase Date": "3/28/2021", Price: "34000" },
      { Year: "1990", Make: "Ford", Model: "Taurus", Condition: "excellent", "Purchase Date": "9/15/1990", Price: "900" },
      { Year: "2020", Make: "Hyundai", Model: "Elantra", Condition: "fair", "Purchase Date": "4/16/2021", Price: "3000" },
      { Year: "2020", Make: "BMW", Model: "2002", Condition: "excellent", "Purchase Date": "5/7/2021", Price: "88001" },
    ];

    cy.get('.ag-picker-field-display').eq(0).type('{downArrow}{downArrow}{downArrow}{enter}')

    cy.get(agGridSelector).agGridColumnFilterTextMenu({
      searchCriteria: {
        columnName: "Price",
        operator: filterOperator.notBlank,
      },
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.agGridValidateRowsSubset(actualTableData, expectedTableData);
      });
  });

  it('able to filter by agTextColumnFilter with join operator', () => {
    const expectedTableData = [
      { Year: "2020", Make: "Toyota", Model: "Celica", Condition: "fair", "Purchase Date": "1/15/2020", Price: "35000" },
      { Year: "2020", Make: "BMW", Model: "3-series", Condition: "fair", "Purchase Date": "4/5/2020", Price: "45000" },
      { Year: "2020", Make: "Hyundai", Model: "Elantra", Condition: "fair", "Purchase Date": "4/16/2021", Price: "3000" },
    ];
    cy.get(agGridSelector).agGridColumnFilterTextFloating({
      searchCriteria:
      {
        columnName: "Condition",
        operator: filterOperator.startsWith,
        filterValue: 'f',
        searchInputIndex: 0,
      },

      multiple: true,
      hasApplyButton: true,
    });

    cy.get(agGridSelector).agGridColumnFilterTextFloating({
      searchCriteria:
      {
        columnName: "Condition",
        operator: filterOperator.endsWith,
        filterValue: "ir",
        searchInputIndex: 1,
      },

      multiple: true,
      hasApplyButton: true,
    });

    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.agGridValidateRowsSubset(actualTableData, expectedTableData);
      });
  });

  it("able to filter by date - floating filter", () => {
    const expectedTableData = [
      {
        Year: "2020",
        Make: "Toyota",
        Model: "Celica",
        Condition: "fair",
        "Purchase Date": "1/15/2020",
        Price: "35000",
      },
    ];
    cy.get(agGridSelector).agGridColumnFilterTextFloating({
      searchCriteria: {
        columnName: "Purchase Date",
        operator: filterOperator.equals,
        filterValue: "2020-01-15",
        searchInputIsDate: true,
      },
      hasApplyButton: true,
    });
    cy.get(agGridSelector)
      .getAgGridData()
      .then((actualTableData) => {
        cy.agGridValidateRowsSubset(actualTableData, expectedTableData);
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
