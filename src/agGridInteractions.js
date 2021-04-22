/// <reference types="cypress" />
import { sort } from "./sort.enum";
import { filterOperator } from "./filterOperator.enum";
import { filterTab } from "./menuTab.enum";

function sortElementsByAttributeIndex(index) {
  return (a, b) => {
    const contentA = parseInt(a.attributes[index].nodeValue, 10).valueOf();
    const contentB = parseInt(b.attributes[index].nodeValue, 10).valueOf();
    return contentA < contentB ? -1 : contentA > contentB ? 1 : 0;
  };
}

/**
 * Retrieves the values from the *displayed* page in ag grid and assigns each value to its respective column name.
 * @param subject The get() selector for which ag grid table you wish to retrieve.
 * @param options Return an array of columns you wish to exclude from the table retrieval.
 */
export const getTable = (subject, agGridSelector, options = {}) => {
  if (subject.get().length > 1)
    throw new Error(
      `Selector "${subject.selector}" returned more than 1 element.`
    );

  const tableElement = subject.get()[0];
  const agGridSelectors = agGridSelector.split("^");
  const headers = [
    ...tableElement.querySelectorAll(".ag-header-cell-text"),
  ].map((e) => e.textContent.trim());
  const allRows = [];
  let rows=[];

  agGridSelectors.forEach((selector) => {
    const _rows = [
      ...tableElement.querySelectorAll(
        `${selector} .ag-row`
      ),
    ]
      // Sort rows by their row-index attribute value
      .sort(sortElementsByAttributeIndex(1))
      .map((row) => {
        // Sort row cells by their aria-colindex attribute value
        return [...row.querySelectorAll(".ag-cell")]
          .sort(sortElementsByAttributeIndex(3))
          .map((e) => e.textContent.trim());
      });
      allRows.push(_rows);
  });

 /*
  // transform rows into array of array of strings for each .ag-cell-value element
  const rowsLeft = [...tableElement.querySelectorAll('.ag-pinned-left-cols-container .ag-row')]
    // Sort rows by their row-index attribute value
    .sort(sortElementsByAttributeIndex(1)).map(row => {
    // Sort row cells by their aria-colindex attribute value
    return [...row.querySelectorAll('.ag-cell')].sort(sortElementsByAttributeIndex(3)).map(e => e.textContent.trim())
  })

  // transform rows into array of array of strings for each .ag-cell-value element
  // sort by the aria-colindex to ensure headers are matched with their correct values - the DOM will sometimes
  // have them in an incorrect order
  const rowsCenter = [...tableElement.querySelectorAll('.ag-body-viewport-wrapper .ag-row')]
    // Sort rows by their row-index attribute value
    .sort(sortElementsByAttributeIndex(1)).map(row => {
    // Sort row cells by their aria-colindex attribute value
    return [...row.querySelectorAll('.ag-cell')].sort(sortElementsByAttributeIndex(3)).map(e=>e.textContent.trim())
  })

  // Combine results from ag-pinned-left-cols-container and ag-center-cols-clipper by index
  const rows = rowsLeft.map((value, i) => {
    return (value + "," + rowsCenter[i]).split(",");
  });
  */
 let i;
 if(allRows.length > 1){
   for(i = 0; i < allRows.length - 1; i++)
   {
     rows.push(allRows[i].map((value, j) => {
      return (value + "," + allRows[i+1][j]).split(",");
    }));
   }
   //rows = rows[0]
 }else{
    rows = allRows[0].map((value, i)=>{
     return (value + ",").replace(/,+$/, "").split(",")
   })
 }

  // return structured object from headers and rows variables
  return rows.map((row) =>
    row.reduce((acc, curr, idx) => {
      if (options.onlyColumns && !options.onlyColumns.includes(headers[idx])) {
        // dont include columns that are not present in onlyColumns
        return { ...acc };
      }
      return { ...acc, [headers[idx]]: curr };
    }, {})
  );
};

/**
 * Retrieve the ag grid column header element based on its column name value
 * @param columnName The name of the column's header to retrieve.
 */
function getColumnHeaderElement(columnName) {
  return cy
    .get(".ag-header-cell-text")
    .contains(new RegExp("^" + columnName + "$", "g"));
}

/**
 * Performs sorting operation on the specified column
 * @param columnName The name of the column you wish to sort
 * @param sortDirection sort enum value
 */
export function sortColumnBy(columnName, sortDirection) {
  return getColumnHeaderElement(columnName)
    .parents(".ag-header-cell")
    .invoke("attr", "aria-sort")
    .then((value) => {
      cy.log(`sort: ${sortDirection}`);
      if (value !== sortDirection) {
        getColumnHeaderElement(columnName).click().wait(250);
        sortColumnBy(columnName, sortDirection);
      }
    });
}

function getMenuTabElement(tab) {
  return cy.get(".ag-tab").eq(tab);
}

/**
 * Will select the specified filter tab if it is not already selected
 * @param tab
 */
function selectMenuTab(tab) {
  getMenuTabElement(tab).then(($ele) => {
    cy.wrap($ele)
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
function getFilterColumnButtonElement(columnName) {
  return getColumnHeaderElement(columnName).parent().siblings("span");
}

/**
 * Performs a filter operation on the specified column
 * @param columnName Name of column to filter
 * @param operator operator enum value
 * @param filterValue value to filter for
 */
export function filterColumnValue(columnName, filterValue, operator = null) {
  // Get the header's menu element
  getFilterColumnButtonElement(columnName).click();
  // Navigate to the filter tab
  selectMenuTab(filterTab.filter);
  if (operator !== null) {
    cy.get(".ag-picker-field-wrapper").filter(":visible").click();
    cy.get(".ag-popup").find("span").contains(operator).click("topRight");
  }
  // Input filter term and allow grid a moment to render the results
  cy.get(".ag-input-field-input")
    .filter(":visible")
    .type(filterValue)
    .wait(500);
  getMenuTabElement(filterTab.filter).click();
}

/**
 * Removes input filter values for a specified column
 * @param columnName
 */
export function removeFilterColumnValues(columnName) {
  getFilterColumnButtonElement(columnName).click();
}

/**
 * Will perform a filter for all search criteria provided
 * @param searchCriteria a "\^" delimited string of all columns and searchCriteria to search for in the grid (i.e. "Name=John Smith^Rate Plan=Standard"
 */
export function findGridEntries(searchCriteria) {
  searchCriteria.split("^").forEach((searchTerms) => {
    const keyValue = searchTerms.split("=");
    filterColumnValue(keyValue[0], keyValue[1]);
  });
}

/**
 * Will perform a filter for all search criteria provided, then selects the first found entry in the grid
 * @param searchCriteria a "\^" delimited string of all columns and searchCriteria to search for in the grid (i.e. "Name=John Smith^Rate Plan=Standard"
 */
export function filterAndSelectGridEntry(searchCriteria) {
  findGridEntries(searchCriteria);
  cy.get(".ag-selection-checkbox")
    .filter(":visible")
    .find("input")
    .first()
    .check();
}
