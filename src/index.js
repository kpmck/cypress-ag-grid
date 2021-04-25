/// <reference types="cypress" />

import {getAgGrid, sortColumnBy} from "./agGrid/agGridInteractions"
import {validateTablePages, validateTableExactOrder, validateEmptyTable, validateTableRowSubset} from "./agGrid/agGridValidations"
import {filterByCheckboxColumnMenu, filterBySearchTextColumnFloatingFilter, filterBySearchTextColumnMenu} from "./agGrid/agGridInteractions";

Cypress.Commands.add('getAgGrid', { prevSubject: true }, getAgGrid);
Cypress.Commands.add('agGridSortColumn', {prevSubject: true}, sortColumnBy);
Cypress.Commands.add('agGridColumnFilterCheckboxMenu', {prevSubject: true}, filterByCheckboxColumnMenu)
Cypress.Commands.add('agGridColumnFilterTextMenu', {prevSubject: true}, filterBySearchTextColumnMenu)
Cypress.Commands.add('agGridColumnFilterTextFloating', {prevSubject: true}, filterBySearchTextColumnFloatingFilter)

Cypress.Commands.add('agGridValidatePaginatedTable', {prevSubject: true}, validateTablePages)
Cypress.Commands.add('agGridValidateRowsExactOrder', {prevSubject: false}, validateTableExactOrder)
Cypress.Commands.add('agGridValidateRowsSubset', {prevSubject: false}, validateTableRowSubset)
Cypress.Commands.add('agGridValidateEmptyTable', {prevSubject: false}, validateEmptyTable)
