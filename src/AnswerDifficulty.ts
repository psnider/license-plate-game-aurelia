import {bindable} from 'aurelia-framework';
import {GradeLevel} from "license-plate-game-api"


export class AnswerDifficulty {
    @bindable grade_level?: GradeLevel
    @bindable word_set_size?: number
    grade_level_text: string
    word_set_size_text: string


    // The Aurelia life-cycle method called as soon as the data from the containing component is bound to this component. 
    bind() {
        this.grade_level_text = (this.grade_level != null) ? `grade ${this.grade_level || "K"}` : undefined
        this.word_set_size_text = this.word_set_size ? `once each ${this.word_set_size.toLocaleString("en-US")} words` : "very rare"
    }
}

