/// <reference types="cypress" />

describe("test", ()=>{
    it("does something", ()=>{
        cy.visit("cypress/integration/index.html")
        cy.get(".ag-cell").should('be.visible')
        cy.get(".ag-root").getTable(".ag-pinned-left-cols-container^.ag-center-cols-clipper^.ag-pinned-right-cols-container").then((table)=>{
            cy.log(table);
        })
    })
})