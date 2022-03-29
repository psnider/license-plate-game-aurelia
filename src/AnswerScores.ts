import {bindable} from 'aurelia-framework';


export class AnswerScores {
    @bindable boggle_score: number
    @bindable scrabble_score: number
    
    is_valid_word: boolean


    // The Aurelia life-cycle method called as soon as the data from the containing component is bound to this component. 
    bind() {
        this.is_valid_word = (this.scrabble_score > 0)
    }
}



