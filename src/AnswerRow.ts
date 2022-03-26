import {bindable, autoinject, observable} from 'aurelia-framework';
import type { PuzzleAnswer } from "./lib/index.d"


@autoinject
export class AnswerRow {
    @bindable @observable puzzle_answer: PuzzleAnswer
    is_valid_word: boolean

    constructor() {}

    bind() {
        const { scrabble_score } = this.puzzle_answer
        this.is_valid_word = (scrabble_score > 0)
    }
}



