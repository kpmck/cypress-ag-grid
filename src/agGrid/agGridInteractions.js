/// <reference types="cypress" />
import {sort} from "./sort.enum";
import {filterTab} from "./menuTab.enum";

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
 * @param options Provide an array of columns you wish to exclude from the table retrieval.
 */
export const getAgGrid = (subject, options = {}) => {
    const agGridColumnSelectors = ".ag-pinned-left-cols-container^.ag-center-cols-clipper^.ag-pinned-right-cols-container";
    if (subject.get().length > 1)
        throw new Error(
            `Selector "${subject.selector}" returned more than 1 element.`
        );

    const tableElement = subject.get()[0].querySelectorAll('.ag-root')[0];
    const agGridSelectors = agGridColumnSelectors.split("^");
    let headers = [
        ...tableElement.querySelectorAll(".ag-header-cell-text"),
    ].map((e) => e.textContent.trim());
    let allRows = [];
    let rows = [];

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

    // Combine results from all specified tables (either single table, or all pinned columns) by index
    rows = allRows.reduce(function (a, b) {
        return a.map(function (v, i) {
            return (v + "," + b[i]).split(",");
        })
    })

    // return structured object from headers and rows variables
    return rows.map((row) =>
        row.reduce((acc, curr, idx) => {
            if ((options.onlyColumns && !options.onlyColumns.includes(headers[idx])) || headers[idx] === undefined) {
                // dont include columns that are not present in onlyColumns, or if the header is undefined
                return {...acc};
            }
            return {...acc, [headers[idx]]: curr};
        }, {})
    );
};

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
 * @param {*} subject The get() selector for which ag grid table you wish to retrieve.
 * @param columnName The name of the column you wish to sort
 * @param sortDirection sort enum value
 * @returns 
 */
export function sortColumnBy(subject, columnName, sortDirection) {
    if (sortDirection === sort.ascending || sortDirection === sort.descending) {
        return getColumnHeaderElement(subject, columnName)
            .parents(".ag-header-cell")
            .invoke("attr", "aria-sort")
            .then((value) => {
                cy.log(`sort: ${sortDirection}`);
                if (value !== sortDirection) {
                    getColumnHeaderElement(subject, columnName).click().wait(250);
                    sortColumnBy(subject, columnName, sortDirection);
                }
            });
    } else {
        throw new Error("sortDirection must be either 'ascending' or 'descending'. Please import and use sort.enum.")
    }
}

function getMenuTabElement(agGridElement, tab) {
    return cy.get(agGridElement).find(".ag-tab").find(`.ag-icon-${tab}`).filter(":visible");
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
function getFilterColumnButtonElement(agGridElement, columnName, isFloatingFilter = false) {
    let columnIndex;
    if (isFloatingFilter)
        return getColumnHeaderElement(agGridElement, columnName).parents(".ag-header-cell").then(($ele) => {
            cy.wrap($ele).invoke("attr", "aria-colindex").then((colIndex) => {
                columnIndex = colIndex;
            }).then(() => {
                cy.wrap($ele)
                    .parents(".ag-header-row-column")
                    .siblings(".ag-header-row-floating-filter")
                    .find(".ag-floating-filter-button")
                    .eq(columnIndex - 1)
            })
        })
    else
        return getColumnHeaderElement(agGridElement, columnName).parent().siblings(".ag-header-cell-menu-button");
}

/**
 *
 * @param filterValue value to input into the filter textbox
 * @param operator (optional) use if using a search operator (i.e. Less Than, Equals, etc...use filterOperator.enum values)
 */
function filterBySearchTerm(agGridElement, filterValue, operator) {
    // Navigate to the filter tab
    selectMenuTab(agGridElement, filterTab.filter);
    if (operator) {
        cy.get(agGridElement).find(".ag-picker-field-wrapper").filter(":visible").click();
        cy.get(agGridElement).find(".ag-popup").find("span").contains(operator).then(($ele) => {
            //Have to use the unwrapped element, since Cypress .click() event does not appropriately select the operator
            $ele.click()
        });
    }
    // Input filter term and allow grid a moment to render the results
    cy.get(agGridElement)
        .find(".ag-popup-child")
        .find("input")
        .filter(":visible")
        .type(filterValue)
        .wait(500);
}

function applyColumnFilter(agGridElement, hasApplyButton) {
    if (hasApplyButton) {
        cy.get(agGridElement).find(".ag-filter-apply-panel-button").contains("Apply").click();
        getMenuTabElement(agGridElement, filterTab.filter).click();
    } else
        getMenuTabElement(agGridElement ,filterTab.filter).click();
}

/**
 * Either toggle
 * @param filterValue
 * @param doSelect
 * @param hasApplyButton
 */
function toggleColumnCheckboxFilter(agGridElement, filterValue, doSelect, hasApplyButton = false) {
    selectMenuTab(agGridElement, filterTab.filter);
    cy.get(agGridElement)
        .find(".ag-input-field-label")
        .contains(filterValue)
        .siblings("div")
        .find("input")
        .then(($ele) => {
            if (doSelect)
                cy.wrap($ele).check();
            else
                cy.wrap($ele).uncheck();
        })
}

/**
 *  * Performs a filter operation on the specified column via the context menu using plain text search
 * @param options JSON with search properties
 * @param options.columnName [REQUIRED] name of the column to filter
 * @param options.filterValue [REQUIRED] value to input into the filter textbox
 * @param options.operator [Optional] Use if using a search operator (i.e. Less Than, Equals, etc...use filterOperator.enum values).
 * @param options.hasApplyButton [Optional] True if "Apply" button is used, false if filters by text input automatically.
 */
export function filterBySearchTextColumnMenu(subject, options) {
    // Get the header's menu element
    getFilterColumnButtonElement(subject, options.columnName).click();
    filterBySearchTerm(subject, options.filterValue, options.operator);
    applyColumnFilter(subject, options.hasApplyButton);
}

/**
 *  * Performs a filter operation on the specified column via the column's floating filter field using plain text search
 * @param options JSON with search properties
 * @param options.columnName [REQUIRED] name of the column to filter
 * @param options.filterValue [REQUIRED] value to input into the filter textbox
 * @param options.operator [Optional] Use if using a search operator (i.e. Less Than, Equals, etc...use filterOperator.enum values).
 * @param options.hasApplyButton [Optional] True if "Apply" button is used, false if filters by text input automatically.
 */
export function filterBySearchTextColumnFloatingFilter(subject, options) {
    // Get the header's menu element
    cy.get(subject).then((agGridElement)=>{
        getFilterColumnButtonElement(agGridElement, options.columnName, true).click();
        filterBySearchTerm(agGridElement, options.filterValue, options.operator);
        applyColumnFilter(agGridElement, options.hasApplyButton);
    })
}

/**
 *  * Performs a filter operation on the specified column and selects only the provided filterValue
 * @param options JSON with search properties
 * @param options.columnName [REQUIRED] name of the column to filter
 * @param options.filterValue [REQUIRED] value to input into the filter textbox
 * @param options.operator [Optional] Use if using a search operator (i.e. Less Than, Equals, etc...use filterOperator.enum values).
 * @param options.hasApplyButton [Optional] True if "Apply" button is used, false if filters by text input automatically.
 */
export function filterByCheckboxColumnMenu(subject, options) {
    cy.get(subject).then((agGridElement)=>{
        getFilterColumnButtonElement(agGridElement, options.columnName).click();
        toggleColumnCheckboxFilter(agGridElement, "Select All", false, options.hasApplyButton)
        toggleColumnCheckboxFilter(agGridElement, options.filterValue, true, options.hasApplyButton)
        applyColumnFilter(agGridElement, options.hasApplyButton)
    })
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
export function findGridEntriesByColumnSearch(searchCriteria) {
    searchCriteria.split("^").forEach((searchTerms) => {
        const keyValue = searchTerms.split("=");
        filterBySearchTextColumnMenu(keyValue[0], keyValue[1]);
    });
}

/**
 * Will perform a filter for all search criteria provided, then selects the first found entry in the grid
 * @param searchCriteria a "\^" delimited string of all columns and searchCriteria to search for in the grid (i.e. "Name=John Smith^Rate Plan=Standard"
 */
export function filterAndSelectGridEntryByColumnSearch(searchCriteria) {
    findGridEntriesByColumnSearch(searchCriteria);
    cy.get(".ag-selection-checkbox")
        .filter(":visible")
        .find("input")
        .first()
        .check();
}


export function toggleColumnFromSideBar(columnName, doRemove) {
    cy.get(".ag-column-select-header-filter-wrapper").then(($columnFilterInputField) => {
        if (!$columnFilterInputField.is(":visible")) {
            cy.get(".ag-side-buttons").find("span").contains("Columns").click();
        }
        cy.wrap($columnFilterInputField).type(columnName);
        cy.get(".ag-column-select-column-label")
            .contains(columnName)
            .parent()
            .find("input")
            .then(($columnCheckbox) => {

                if (doRemove)
                    cy.wrap($columnCheckbox).uncheck();
                else
                    cy.wrap($columnCheckbox).check();
            })

    })

}