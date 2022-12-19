/// <reference types="cypress" />
import { sort } from "./sort.enum";
import { filterTab } from "./menuTab.enum";

/**
 * Uses the attribute value's index and sorts the data accordingly.
 * For our purposes, we are getting the attribute with the items' indices and sorting accordingly.
 *
 * @param {*} index
 * @returns
 */
function sortElementsByAttributeValue(attribute) {
  return (a, b) => {
    const contentA = parseInt(a.attributes[attribute].nodeValue, 10).valueOf();
    const contentB = parseInt(b.attributes[attribute].nodeValue, 10).valueOf();
    return contentA < contentB ? -1 : contentA > contentB ? 1 : 0;
  };
}

/**
 * Retrieves the values from the *displayed* page in ag grid and assigns each value to its respective column name.
 * @param agGridElement The get() selector for which ag grid table you wish to retrieve.
 * @param options Provide an array of columns you wish to exclude from the table retrieval.
 */
export const getAgGridData = (agGridElement, options = {}) => {
  return _getAgGrid(agGridElement, options, false);
};

/**
 * Retrieves the values from the *displayed* page in ag grid and assigns each value to its respective column name.
 * @param agGridElement The get() selector for which ag grid table you wish to retrieve.
 * @param options Provide an array of columns you wish to exclude from the table retrieval.
 */
export const getAgGridElements = (agGridElement, options = {}) => {
  return _getAgGrid(agGridElement, options, true);
};

function _getAgGrid(agGridElement, options = {}, returnElements) {
  const agGridColumnSelectors =
    ".ag-pinned-left-cols-container^.ag-center-cols-clipper^.ag-pinned-right-cols-container";
  if (agGridElement.get().length > 1)
    throw new Error(
      `Selector "${agGridElement.selector}" returned more than 1 element.`
    );

  const tableElement = agGridElement.get()[0].querySelectorAll(".ag-root")[0];
  const agGridSelectors = agGridColumnSelectors.split("^");
  const headers = [
    ...tableElement.querySelectorAll(".ag-header-row-column [aria-colindex]"),
  ]
    .sort(sortElementsByAttributeValue("aria-colindex"))
    .map((headerElement) => {
      // Check if the elements returned are already .ag-header-cell-text elements
      // If not, query for that element and return the text content
      let headerCells = [
        ...headerElement.querySelectorAll(".ag-header-cell-text"),
      ];
      if (headerCells.length === 0) {
        return [headerElement].map((e) => e.textContent.trim());
      } else {
        return [...headerElement.querySelectorAll(".ag-header-cell-text")].map(
          (e) => e.textContent.trim()
        );
      }
    })
    .flat();

  let allRows = [];
  let rows = [];

  agGridSelectors.forEach((selector) => {
    const _rows = [
      ...tableElement.querySelectorAll(`${selector}:not(.ag-hidden) .ag-row`),
    ]
      // Sort rows by their row-index attribute value
      .sort(sortElementsByAttributeValue("row-index"))
      .map((row) => {
        // Sort row cells by their aria-colindex attribute value
        // First check if elements returned already contain the aria-colindex
        // If not, just query for the .ag-cell
        let rowCells = [...row.querySelectorAll(".ag-cell [aria-colindex]")];
        if (rowCells.length === 0) {
          rowCells = [...row.querySelectorAll(".ag-cell")];
        }
        return rowCells
          .sort(sortElementsByAttributeValue("aria-colindex"))
          .map((e) => {
            if (returnElements) {
              return e;
            } else {
              return e.textContent.trim();
            }
          });
      });
    allRows.push(_rows);
  });

  // Remove any empty arrays before merging
  allRows = allRows.filter(function (ele) {
    return ele.length;
  });

  if (!allRows.length) rows = [];
  else {
    // Combine results from all specified tables (either single table, or all pinned columns) by index
    rows = allRows.reduce(function (a, b) {
      return a.map(function (v, i) {
        return v.concat(b[i]);
      });
    });
  }

  // if options.rawValues = true, return headers & rows values as arrays instead of mapping as objects
  if (options.valuesArray) {
    return { headers, rows };
  }

  // return structured object from headers and rows variables
  return rows.map((row) =>
    row.reduce((acc, curr, idx) => {
      if (
        //@ts-ignore
        (options.onlyColumns && !options.onlyColumns.includes(headers[idx])) ||
        headers[idx] === undefined
      ) {
        // dont include columns that are not present in onlyColumns, or if the header is undefined
        return { ...acc };
      }
      return { ...acc, [headers[idx]]: curr };
    }, {})
  );
}

/**
 * Retrieve the ag grid column header element based on its column name value
 * @param columnName The name of the column's header to retrieve.
 */
function getColumnHeaderElement(agGridElement, columnName) {
  return cy
    .get(agGridElement)
    .find(".ag-header-cell-text")
    .contains(new RegExp("^" + columnName + "$", "g"));
}

/**
 *  * Performs sorting operation on the specified column
 * @param {*} agGridElement The get() selector for which ag grid table you wish to retrieve.
 * @param columnName The name of the column you wish to sort
 * @param sortDirection sort enum value
 * @returns
 */
export function sortColumnBy(agGridElement, columnName, sortDirection) {
  if (sortDirection === sort.ascending || sortDirection === sort.descending) {
    return getColumnHeaderElement(agGridElement, columnName)
      .parents(".ag-header-cell")
      .invoke("attr", "aria-sort")
      .then((value) => {
        cy.log(`sort: ${sortDirection}`);
        if (value !== sortDirection) {
          getColumnHeaderElement(agGridElement, columnName).click().wait(250);
          sortColumnBy(agGridElement, columnName, sortDirection);
        }
      });
  } else {
    throw new Error(
      "sortDirection must be either 'ascending' or 'descending'."
    );
  }
}

function getMenuTabElement(agGridElement, tab) {
  return cy
    .get(agGridElement)
    .find(".ag-tab")
    .find(`.ag-icon-${tab}`)
    .filter(":visible");
}

/**
 * Will select the specified filter tab if it is not already selected
 * @param tab
 */
function selectMenuTab(agGridElement, tab) {
  getMenuTabElement(agGridElement, tab).then(($ele) => {
    cy.wrap($ele)
      .parent("span")
      .invoke("attr", "class")
      .then(($attr) => {
        if (!$attr.includes("selected")) {
          cy.wrap($ele).click();
        }
      });
  });
}

/**
 * Returns the filter button element for a specified column
 * @param columnName
 */
function getFilterColumnButtonElement(
  agGridElement,
  columnName,
  isFloatingFilter = false
) {
  let columnIndex;
  if (isFloatingFilter)
    return getColumnHeaderElement(agGridElement, columnName)
      .parents(".ag-header-cell")
      .then(($ele) => {
        cy.wrap($ele)
          .invoke("attr", "aria-colindex")
          .then((colIndex) => {
            columnIndex = colIndex;
          })
          .then(() => {
            cy.wrap($ele)
              .parents(".ag-header-row-column")
              .siblings(".ag-header-row-column-filter")
              .find(`.ag-header-cell[aria-colindex=${columnIndex}]`)
              .find(".ag-floating-filter-button");
          });
      });
  else
    return getColumnHeaderElement(agGridElement, columnName)
      .parent()
      .siblings(".ag-header-cell-menu-button");
}

/**
 *
 * @param filterValue value to input into the filter textbox
 * @param operator (optional) use if using a search operator (i.e. Less Than, Equals, etc...use filterOperator.enum values)
 * @param noMenuTabs (optional) boolean indicating if the menu has tabs.
 */
 function filterBySearchTerm(agGridElement, options) {
  const filterValue = options.searchCriteria.filterValue;
  const operator = options.searchCriteria.operator;
  const searchInputIndex = options.searchCriteria.searchInputIndex || 0;
  const isMultiFilter = options.searchCriteria.isMultiFilter;
  const noMenuTabs = options.noMenuTabs;
  
  // Navigate to the filter tab
  if (!noMenuTabs) {
    selectMenuTab(agGridElement, filterTab.filter);
  }
  if (operator) {
    cy.get(agGridElement)
      .find(".ag-picker-field-wrapper")
      .filter(":visible")
      .click();
    cy.get(agGridElement)
      .find(".ag-popup")
      .find("span")
      .contains(operator)
      .then(($ele) => {
        //Have to use the unwrapped element, since Cypress .click() event does not appropriately select the operator
        $ele.trigger("click");
      });
  }
  // Input filter term and allow grid a moment to render the results
  cy.get(agGridElement)
    .find(".ag-popup-child")
    .find("input")
    .filter(":visible")
    .as("filterInput")

    // If it's a multi filter, de-select the 'select-all' checkbox
    if(isMultiFilter){
      const selectAllText = options.selectAllLocaleText || "Select All";
      toggleColumnCheckboxFilter(
        agGridElement,
        selectAllText,
        false,
        true
      );
    }

    // Get the saved filter input and enter the search term
    cy.get("@filterInput").then(($ele)=>{
      cy.wrap($ele)
      .eq(searchInputIndex)
      .clear()
      .type(filterValue)
      .wait(500);  
    })

    // Finally, if a multi-filter, select the filter value's checkbox
    if(isMultiFilter){
      toggleColumnCheckboxFilter(agGridElement, filterValue, true, true)
    }
}

function applyColumnFilter(agGridElement, hasApplyButton, noMenuTabs) {
  if (hasApplyButton) {
    cy.get(agGridElement)
      .find(".ag-filter-apply-panel-button")
      .contains("Apply")
      .click();
  }
  if (!noMenuTabs) {
    getMenuTabElement(agGridElement, filterTab.filter).click();
  }
}

/**
 * Either toggle
 * @param filterValue
 * @param doSelect
 * @param hasTabs
 */
function toggleColumnCheckboxFilter(
  agGridElement,
  filterValue,
  doSelect,
  noMenuTabs = false
) {
  if (!noMenuTabs) {
    selectMenuTab(agGridElement, filterTab.filter);
  }
  cy.get(agGridElement)
    .find(".ag-input-field-label")
    .contains(filterValue)
    .siblings("div")
    .find("input")
    .then(($ele) => {
      if (doSelect) cy.wrap($ele).check();
      else cy.wrap($ele).uncheck();
    });
}

function populateSearchCriteria(
  searchCriteria,
  hasApplyButton = false,
  noMenuTabs = false,
  selectAllLocaleText = 'Select All'
  ) {
  const options = {};
  //@ts-ignore
  options.searchCriteria = {};
  //@ts-ignore
  options.searchCriteria.columnName = searchCriteria.columnName;
  //@ts-ignore
  options.searchCriteria.filterValue = searchCriteria.filterValue;
  //@ts-ignore
  options.searchCriteria.isMultiFilter = searchCriteria.isMultiFilter;
  //@ts-ignore
  options.selectAllLocaleText = selectAllLocaleText;
  //@ts-ignore
  options.hasApplyButton = hasApplyButton;
  //@ts-ignore
  options.noMenuTabs = noMenuTabs;
  return options;
}

/**
 *  * Performs a filter operation on the specified column via the context menu using plain text search
 * @param agGridElement The get() selector for which ag grid table you wish to retrieve.
 * @param {{searchCriteria:[{columnName:string,filterValue:string,operator?:string}], hasApplyButton?:boolean}} options JSON with search properties
 * @param options.searchCriteria JSON with search properties
 * @param options.searchCriteria.columnName [REQUIRED] name of the column to filter
 * @param options.searchCriteria.filterValue [REQUIRED] value to input into the filter textbox
 * @param options.searchCriteria.operator [Optional] Use if using a search operator (i.e. Less Than, Equals, etc...use filterOperator.enum values).
 * @param options.hasApplyButton [Optional] True if "Apply" button is used, false if filters by text input automatically.
 * @param options.noMenuTabs [Optional] True if you use for example the community edition of ag-grid, which has no menu tabs
 */
export function filterBySearchTextColumnMenu(agGridElement, options) {
  // Check if there are multiple search criteria provided by attempting to access the columnName
  if (!options.searchCriteria.columnName) {
    options.searchCriteria.forEach((_searchCriteria) => {
      const _options = populateSearchCriteria(
        _searchCriteria,
        options.hasApplyButton,
        options.noMenuTabs,
        options.isMultiFilter
      );
      _filterBySearchTextColumnMenu(agGridElement, _options);
    });
  } else {
    _filterBySearchTextColumnMenu(agGridElement, options);
  }
}

function _filterBySearchTextColumnMenu(agGridElement, options) {
  // Get the header's menu element
  getFilterColumnButtonElement(
    agGridElement,
    options.searchCriteria.columnName
  ).click();
  filterBySearchTerm(
    agGridElement,
    options
  );
  applyColumnFilter(agGridElement, options.hasApplyButton, options.noMenuTabs);
}

/**
 *  * Performs a filter operation on the specified column via the column's floating filter field using plain text search
 * @param agGridElement The get() selector for which ag grid table you wish to retrieve.
 * @param {{searchCriteria:[{columnName:string,filterValue:string,operator?:string}], hasApplyButton?:boolean, noMenuTab?:boolean, selectAllLocaleText:string}} options JSON with search properties
 * @param options.searchCriteria JSON with search properties and options
 * @param options.searchCriteria.columnName name of the column to filter
 * @param options.searchCriteria.filterValue value to input into the filter textbox
 * @param options.searchCriteria.searchInputIndex [Optional] Uses 0 by default. Index of which filter box to use in event of having multiple search conditionals
 * @param options.searchCriteria.operator [Optional] Use if using a search operator (i.e. Less Than, Equals, etc...use filterOperator.enum values).
 * @param options.hasApplyButton [Optional] True if "Apply" button is used, false if filters by text input automatically.
 * @param options.noMenuTabs [Optional] True if you use, for example, the community edition of ag-grid, which has no menu tabs
 * @param options.selectAllLocaleText [Optional] Pass in the locale text value of "Select All" for when you are filtering by checkbox - this wil first deselect the "Select All" option before selecting your filter value
 */
export function filterBySearchTextColumnFloatingFilter(agGridElement, options) {
  // Check if there are multiple search criteria provided by attempting to access the columnName
  if (!options.searchCriteria.columnName) {
    options.searchCriteria.forEach((_searchCriteria) => {
      const _options = populateSearchCriteria(
        _searchCriteria,
        options.hasApplyButton,
        options.noMenuTabs
      );
      _filterBySearchTextColumnFloatingFilter(agGridElement, _options);
    });
  } else {
    _filterBySearchTextColumnFloatingFilter(agGridElement, options);
  }
}

function _filterBySearchTextColumnFloatingFilter(agGridElement, options) {
  cy.get(agGridElement).then((agGridElement) => {
    getFilterColumnButtonElement(
      agGridElement,
      options.searchCriteria.columnName,
      true
    ).click();
    filterBySearchTerm(
      agGridElement,
      options
    );
    applyColumnFilter(
      agGridElement,
      options.hasApplyButton,
      options.noMenuTabs
    );
  });
}

/**
 *  * Performs a filter operation on the specified column and selects only the provided filterValue
 * @param agGridElement The get() selector for which ag grid table you wish to retrieve.
 * @param {{searchCriteria:[{columnName:string,filterValue:string], hasApplyButton?:boolean}} options JSON with search values and options
 * @param options.searchCriteria [REQUIRED] JSON with search properties
 * @param options.searchCriteria.columnName [REQUIRED] name of the column to filter
 * @param options.searchCriteria.filterValue [REQUIRED] value to input into the filter textbox
 * @param options.hasApplyButton [Optional] True if "Apply" button is used, false if filters by text input automatically.
 * @param options.noMenuTabs [Optional] True if you use for example the community edition of ag-grid, which has no menu tabs
 */
export function filterByCheckboxColumnMenu(agGridElement, options) {
  // Check if there are multiple search criteria provided by attempting to access the columnName
  if (!options.searchCriteria.columnName) {
    options.searchCriteria.forEach((_searchCriteria) => {
      const _options = populateSearchCriteria(
        _searchCriteria,
        options.hasApplyButton,
        options.noMenuTabs,
        options.selectAllLocaleText
      );
      _filterByCheckboxColumnMenu(agGridElement, _options);
    });
  } else {
    _filterByCheckboxColumnMenu(agGridElement, options);
  }
}

function _filterByCheckboxColumnMenu(agGridElement, options) {
  cy.get(agGridElement).then((agGridElement) => {
    getFilterColumnButtonElement(
      agGridElement,
      options.searchCriteria.columnName
    ).click();
    const selectAllText = options.selectAllLocaleText || "Select All";
    toggleColumnCheckboxFilter(
      agGridElement,
      selectAllText,
      false,
      options.noMenuTabs
    );
    toggleColumnCheckboxFilter(
      agGridElement,
      options.searchCriteria.filterValue,
      true,
      options.noMenuTabs
    );
    applyColumnFilter(
      agGridElement,
      options.hasApplyButton,
      options.noMenuTabs
    );
  });
}

/**
 * Will perform a filter for all search criteria provided, then selects all found entries in the grid
 * @param searchCriteria a "\^" delimited string of all columns and searchCriteria to search for in the grid (i.e. "Name=John Smith^Rate Plan=Standard"
 */
export function filterGridEntriesBySearchText(
  agGridElement,
  searchCriteria,
  isFloatingFilter = false
) {
  if (isFloatingFilter) {
    filterBySearchTextColumnFloatingFilter(agGridElement, searchCriteria);
  } else {
    filterBySearchTextColumnMenu(agGridElement, searchCriteria);
  }
}

/**
 * Will add or remove a column from ag grid.
 * @param columnName The column name to add/remove
 * @param doRemove true will remove the column. false will add the column.
 */

export function toggleColumnFromSideBar(agGridElement, columnName, doRemove) {
  cy.get(agGridElement)
    .find(".ag-column-select-header-filter-wrapper")
    .find("input")
    .then(($columnFilterInputField) => {
      if (!$columnFilterInputField.is(":visible")) {
        cy.get(".ag-side-buttons").find("span").contains("Columns").click();
      }
      cy.wrap($columnFilterInputField).clear().wait(250).type(columnName);
      cy.get(".ag-column-select-column-label")
        .contains(columnName)
        .parent()
        .find("input")
        .then(($columnCheckbox) => {
          if (doRemove) cy.wrap($columnCheckbox).uncheck();
          else cy.wrap($columnCheckbox).check();
        });
    });
}
