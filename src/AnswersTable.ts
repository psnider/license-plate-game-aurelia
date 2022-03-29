import {bindable, observable} from 'aurelia-framework';
import type { PuzzleAnswer } from "./lib"


export class AnswersTable {
    @bindable @observable puzzle_answers: PuzzleAnswer[]
    table_data_rows_height: number


    attached() {
        this.table_data_rows_height = document.getElementById("table-data-rows").offsetHeight
    }

}


