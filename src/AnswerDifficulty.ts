import {bindable, autoinject, observable} from 'aurelia-framework';
import type { PuzzleAnswer } from "./lib/index.d"


@autoinject
export class AnswerDifficulty {
    @bindable grade_level?: number
    @bindable word_set_size?: number
    grade_level_text: string
    word_set_size_text: string


    constructor() {}

    bind() {
        this.grade_level_text = (this.grade_level != null) ? `grade ${this.grade_level || "K"}` : undefined
        this.word_set_size_text = this.word_set_size ? `once each ${this.word_set_size.toLocaleString("en-US")} words` : "very rare"
    }
}

