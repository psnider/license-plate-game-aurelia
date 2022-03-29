import {bindable, observable} from 'aurelia-framework';
import type { PuzzleAnswer } from "./lib/index.d"


export class AnswerRow {
    @bindable @observable puzzle_answer: PuzzleAnswer
    is_valid_word: boolean


    // The Aurelia life-cycle method called as soon as the data from the containing component is bound to this component. 
    bind() {
        const { scrabble_score } = this.puzzle_answer
        this.is_valid_word = (scrabble_score > 0)
    }
}



