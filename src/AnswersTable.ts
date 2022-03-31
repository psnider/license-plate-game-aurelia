import {bindable, observable} from 'aurelia-framework';
import type { PuzzleAnswer } from "./lib"


export class AnswersTable {
    @bindable @observable puzzle_answers: PuzzleAnswer[]
    data_rows_element: HTMLDivElement
    table_data_rows_height: number


    // The Aurelia life-cycle method called as soon as this component is attached to the DOM. 
    attached() {
        this.table_data_rows_height = this.data_rows_element.offsetHeight
    }

}


