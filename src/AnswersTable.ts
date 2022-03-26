import {bindable, autoinject, observable} from 'aurelia-framework';
import type { PuzzleAnswer } from "./lib"


@autoinject
export class AnswersTable {
    @bindable @observable puzzle_answers: PuzzleAnswer[]
    table_data_rows_height: number

    constructor() {}


    attached() {
        this.table_data_rows_height = document.getElementById("table-data-rows").offsetHeight
    }

}


