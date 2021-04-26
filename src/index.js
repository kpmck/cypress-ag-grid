/// <reference types="cypress" />

import {getAgGridData, sortColumnBy} from "./agGrid/agGridInteractions"
import {validateTablePages, validateTableExactOrder, validateEmptyTable, validateTableRowSubset} from "./agGrid/agGridValidations"
import {filterByCheckboxColumnMenu, filterBySearchTextColumnFloatingFilter, filterBySearchTextColumnMenu, toggleColumnFromSideBar} from "./agGrid/agGridInteractions";

Cypress.Commands.add('getAgGridData', { prevSubject: true }, getAgGridData);
Cypress.Commands.add('agGridSortColumn', {prevSubject: true}, sortColumnBy);
Cypress.Commands.add('agGridColumnFilterCheckboxMenu', {prevSubject: true}, filterByCheckboxColumnMenu)
Cypress.Commands.add('agGridColumnFilterTextMenu', {prevSubject: true}, filterBySearchTextColumnMenu)
Cypress.Commands.add('agGridColumnFilterTextFloating', {prevSubject: true}, filterBySearchTextColumnFloatingFilter)

Cypress.Commands.add('agGridValidatePaginatedTable', {prevSubject: true}, validateTablePages)
Cypress.Commands.add('agGridValidateRowsExactOrder', {prevSubject: true}, validateTableExactOrder)
Cypress.Commands.add('agGridValidateRowsSubset', {prevSubject: true}, validateTableRowSubset)
Cypress.Commands.add('agGridValidateEmptyTable', {prevSubject: true}, validateEmptyTable)

Cypress.Commands.add('agGridToggleColumnsSideBar', {prevSubject: true}, toggleColumnFromSideBar)