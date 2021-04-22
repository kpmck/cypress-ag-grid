/// <reference types="cypress" />

import {getTable} from "./src/agGridInteractions"

Cypress.Commands.add('getTable', { prevSubject: true }, getTable);