import {bindable, autoinject} from 'aurelia-framework';


@autoinject
export class AnswerScores {
    @bindable boggle_score: number
    @bindable scrabble_score: number
    
    is_valid_word: boolean

    constructor() {}

    bind() {
        this.is_valid_word = (this.scrabble_score > 0)
    }
}



