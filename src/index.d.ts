/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable<Subject> {
        getAgGridData(options?: {}): Chainable<Array<Record<string, string>>>;
        getAgGridElements<E extends Node = HTMLElement>(options?: {}): Chainable<JQuery<E>>;
        /**
         *  * Performs sorting operation on the specified column
         * @param {*} subject The get() selector for which ag grid table you wish to retrieve.
         * @param columnName The name of the column you wish to sort
         * @param sortDirection sort enum value
         * @returns
         */
        agGridSortColumn<E extends Node = HTMLElement>(columnName: string, sortDirection: string): Chainable<JQuery<E>>;

        /**
         *  * Performs a filter operation on the specified column and selects only the provided filterValue
         * @param subject The get() selector for which ag grid table you wish to retrieve.
         * @param {{searchCriteria:[{columnName:string,filterValue:string], hasApplyButton?:boolean}} options JSON with search values and options
         * @param options.searchCriteria [REQUIRED] JSON with search properties
         * @param options.searchCriteria.columnName [REQUIRED] name of the column to filter
         * @param options.searchCriteria.filterValue [REQUIRED] value to input into the filter textbox
         * @param options.hasApplyButton [Optional] True if "Apply" button is used, false if filters by text input automatically.
         */
        agGridColumnFilterCheckboxMenu<E extends Node = HTMLElement>(options: {}): Chainable<JQuery<E>>;

        /**
         *  * Performs a filter operation on the specified column via the context menu using plain text search
         * @param subject The get() selector for which ag grid table you wish to retrieve.
         * @param {{searchCriteria:[{columnName:string,filterValue:string,operator?:string}], hasApplyButton?:boolean}} options JSON with search properties
         * @param options.searchCriteria JSON with search properties
         * @param options.searchCriteria.columnName [REQUIRED] name of the column to filter
         * @param options.searchCriteria.filterValue [REQUIRED] value to input into the filter textbox
         * @param options.searchCriteria.operator [Optional] Use if using a search operator (i.e. Less Than, Equals, etc...use filterOperator.enum values).
         * @param options.hasApplyButton [Optional] True if "Apply" button is used, false if filters by text input automatically.
         */
        agGridColumnFilterTextMenu<E extends Node = HTMLElement>(options: {}): Chainable<JQuery<E>>;

        /**
         *  * Performs a filter operation on the specified column via the column's floating filter field using plain text search
         * @param subject The get() selector for which ag grid table you wish to retrieve.
         * @param {{searchCriteria:[{columnName:string,filterValue:string,operator?:string}], hasApplyButton?:boolean}} options JSON with search properties
         * @param options.searchCriteria JSON with search properties and options
         * @param options.searchCriteria.columnName name of the column to filter
         * @param options.searchCriteria.filterValue value to input into the filter textbox
         * @param options.searchCriteria.operator [Optional] Use if using a search operator (i.e. Less Than, Equals, etc...use filterOperator.enum values).
         * @param options.searchCriteria.isMultiFilter [Optional] Use if floating filter is multiselect checkboxes vs free form input.
         * @param options.hasApplyButton [Optional] True if "Apply" button is used, false if filters by text input automatically.
         */
        agGridColumnFilterTextFloating<E extends Node = HTMLElement>(options: {}): Chainable<JQuery<E>>;

        /**
         *  * Validates the grid data across its pages. Performs a validation that he data exists on each page, not accounting for order.
         * @param {*} expectedPaginatedTableData Your paginated array to match the grid data.
         * @param {*} onlyColumns (Optional) If specified, ONLY these columns will be validated. If left blank, all columns are validated.
         */
        agGridValidatePaginatedTable<E extends Node = HTMLElement>(
            expectedPaginatedTableData: any,
            onlyColumns: {}
        ): Chainable<JQuery<E>>;

        /**
         * Performs an exact validation to verify the data exists within the displayed grid page.
         * @param {*} actualTableData The actual page data returned from the getAgGridData() command.
         * @param {*} expectedTableData The expected data to exist within the current grid page. Requires all columns and values exactly as shown in the grid, in the same order as shown in the grid.
         */
        agGridValidateRowsExactOrder<E extends Node = HTMLElement>(
            actualTableData: {},
            expectedTableData: {}
        ): Chainable<JQuery<E>>;

        /**
         * Performs a deep include validation to verify the data exists within the displayed grid page
         * @param {*} actualTableData The actual page data returned from the getAgGridData() command.
         * @param {*} expectedTableData The expected data to exist within the current grid page. Does not need to be in any specific order.
         */
        agGridValidateRowsSubset<E extends Node = HTMLElement>(
            actualTableData: {},
            expectedTableData: {}
        ): Chainable<JQuery<E>>;

        /**
         * Validates the Ag Grid table data is empty.
         * @param {*} actualTableData The actual page data returned from the getAgGridData() command.
         */
        agGridValidateEmptyTable<E extends Node = HTMLElement>(actualTableData: {}): Chainable<JQuery<E>>;

        /**
         * Will add or remove a column from ag grid.
         * @param columnName The column name to add/remove
         * @param doRemove true will remove the column. false will add the column.
         */
        agGridToggleColumnsSideBar<E extends Node = HTMLElement>(
            columnName: string,
            doRemove: boolean
        ): Chainable<JQuery<E>>;
    }
}
