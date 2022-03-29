import {autoinject, bindable, observable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import type { PuzzleAnswer } from "./lib"


@autoinject
export class AnswersPanel {
    @bindable @observable puzzle_answers: PuzzleAnswer[]
    correct_answer_count: number
    total_answer_count: number
    total_answers_score: number
    answers_counts_text: string

    constructor(private ea: EventAggregator) {}


    // The Aurelia life-cycle method called as soon as the data from the containing component is bound to this component. 
    bind() {
        this.puzzle_answersChanged()
    }


    // Called by Aurelia when puzzle_answers changes.
    puzzle_answersChanged() {
        this.setAnswerCounts()
        this.setAnswerCountsText()
    }


    setAnswerCounts() {
        this.correct_answer_count = 0
        this.total_answer_count = 0
        this.total_answers_score = 0
        this.puzzle_answers.forEach((puzzle_answer) => {
            this.total_answer_count++
            if (puzzle_answer.scrabble_score) {
                this.correct_answer_count++
                this.total_answers_score += puzzle_answer.scrabble_score
                if (puzzle_answer.boggle_score) {
                    this.total_answers_score += puzzle_answer.boggle_score
                }
            }
        })
    }


    setAnswerCountsText() {
        const count_noun_for_answer = (this.correct_answer_count == 1) ? "answer" : "answers"
        const count_noun_for_try = (this.total_answer_count == 1) ? "try" : "tries"
        this.answers_counts_text = `You have ${this.correct_answer_count} correct ${count_noun_for_answer}, after ${this.total_answer_count} ${count_noun_for_try}.`
    }

}


