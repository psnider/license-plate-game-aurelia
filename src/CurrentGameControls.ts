import {bindable, autoinject, observable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {AuMsgCheckAnswer, AuMsgHintRequest, AuMsgResetPuzzleText, AuMsgGameStatusMessage, AuMsgAnswersPanelState, AuMsgCheckAnswerTriggeredByEnter} from './messages';
import type {LicencePlateGameAPI} from "license-plate-game-api"
import { ExpiringMessage } from './lib';
import { MAX_EXPIRATION_SECONDS } from './lib/lib';

function MINUTES_AS_SECONDS(minutes) {return minutes * 60}

const EXPIRATION_SECONDS = {
    REQUEST: 30,
    ERROR: MAX_EXPIRATION_SECONDS,   // errors must be cleared explicitly
    ANSWER: 30,
    HINT: MINUTES_AS_SECONDS(20),
}


@autoinject
export class CurrentGameControls {
    @bindable @observable elapsed_seconds: number
    @bindable answers_panel_is_open: boolean
    hours_minutes_seconds: string
    request_in_progress_count: number


    constructor(private ea: EventAggregator) {
        this.request_in_progress_count = 0
        this.ea.subscribe(AuMsgCheckAnswerTriggeredByEnter, (msg: AuMsgCheckAnswerTriggeredByEnter) => {
            this.userRequestedCheckSolution()
        })
    }

    elapsed_secondsChanged() {
        this.hours_minutes_seconds = this.getElapsedTime()
    }


    getElapsedTime() {
        const hours_minutes_seconds = new Date(1000 * this.elapsed_seconds).toISOString().substring(11, 19)
        return hours_minutes_seconds
    }


    getHintDifficulty(hint: LicencePlateGameAPI.HintResponse) {
        if  (hint.word_set_size != null) {
            return `     Difficulty: once in ${hint.word_set_size.toLocaleString()} words`
        } else {
            return ""
        }
    }
 

    getMessageForHint(hint: LicencePlateGameAPI.HintResponse) {
        const pattern = `Pattern: ${hint.solution_pattern_text}`
        const difficulty = this.getHintDifficulty(hint)
        const text = pattern + difficulty
        const message: ExpiringMessage = {text, message_type: "hint", remote_request_status: "ok", expiration_secs: EXPIRATION_SECONDS.HINT}
        return message
    }

    
    completion_callback?: (error: any | null, result?: any) => void


    userRequestedCheckSolution() {
        const getMessageForGradedAnswer = (error: string | null | undefined, graded_answer?: LicencePlateGameAPI.CheckAnswerResponse) => {
            if (graded_answer) {
                const answer_text_uppercase = graded_answer.answer_text.toLocaleUpperCase()
                if (graded_answer.scrabble_score) {
                    const score = graded_answer.scrabble_score + (graded_answer.scrabble_score || 0)
                    const text = `"${answer_text_uppercase}" scores ${score} points`
                    const message: ExpiringMessage = {text, message_type: "checked_answer", remote_request_status: "ok", expiration_secs: EXPIRATION_SECONDS.ANSWER}
                    return message
                } else {
                    const text = `"${answer_text_uppercase}" is not a known word`
                    const message: ExpiringMessage = {text, message_type: "checked_answer", remote_request_status: "error", expiration_secs: EXPIRATION_SECONDS.ERROR}
                    return message
                }
            } else {
                const message: ExpiringMessage = {text: error, message_type: "checked_answer", remote_request_status: "error", expiration_secs: EXPIRATION_SECONDS.ERROR}
                return message
            }
        }
        this.request_in_progress_count++
        this.ea.publish(new AuMsgCheckAnswer((error, graded_answer) => {
            this.request_in_progress_count--
            const message = getMessageForGradedAnswer(error, graded_answer)
            this.ea.publish(new AuMsgGameStatusMessage(message))
        }));
    }


    userRequestedHint() {
        this.request_in_progress_count++
        this.ea.publish(new AuMsgHintRequest((error, hint) => {
            this.request_in_progress_count--
            const message = this.getMessageForHint(hint)
            this.ea.publish(new AuMsgGameStatusMessage(message))
        }))
    }
 

    resetText() {
        this.ea.publish(new AuMsgResetPuzzleText())
    }

    showAnswersPanel() {
        this.ea.publish(new AuMsgAnswersPanelState(true))
    }

    hideAnswersPanel() {
        this.ea.publish(new AuMsgAnswersPanelState(false))
    }
}
