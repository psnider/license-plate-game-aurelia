import {bindable, autoinject, observable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {AuMsgCheckAnswer, AuMsgHintRequest, AuMsgResetPuzzleText, AuMsgGameStatusMessage, AuMsgAnswersPanelState, AuMsgCheckAnswerTriggeredByEnter} from './messages';
import type {LicensePlateGameAPI} from "license-plate-game-api"
import { ExpiringMessage } from './lib';
import { MAX_EXPIRATION_SECONDS } from './lib/lib';


function MINUTES_AS_SECONDS(minutes) {return minutes * 60}


// The period of time for which to display game status messages, depending on type.
const EXPIRATION_SECONDS = {
    REQUEST: 30,
    ERROR: MAX_EXPIRATION_SECONDS,   // errors must be cleared explicitly
    ANSWER: 30,
    HINT: MINUTES_AS_SECONDS(20),
}


// The controls for managing the current game.
// These are: 
// - requesting a check of the current answer
// - requesting a hint
// - resetting the text of the input control to the puzzle_seed
// - switching to the answers display panel
@autoinject
export class CurrentGameControls {
    @bindable @observable elapsed_seconds: number
    @bindable answers_panel_is_open: boolean
    // The elapsed time represented in the format "hh:mm:ss"
    hours_minutes_seconds: string
    // The number of requests that are in progress.
    // The InProcessIndicator is displayed when this is greater than zero.
    request_in_progress_count: number


    constructor(private ea: EventAggregator) {
        this.request_in_progress_count = 0
        this.ea.subscribe(AuMsgCheckAnswerTriggeredByEnter, (msg: AuMsgCheckAnswerTriggeredByEnter) => {
            this.userRequestedCheckAnswer()
        })
    }

    // Called by Aurelia when elapsed_seconds changes.
    elapsed_secondsChanged() {
        this.hours_minutes_seconds = new Date(1000 * this.elapsed_seconds).toISOString().substring(11, 19)
    }


    // Get text describing the difficulty of the given hint.
    getHintDifficultyText(hint: LicensePlateGameAPI.HintResponse) {
        if  (hint.word_set_size != null) {
            return `     Difficulty: once in ${hint.word_set_size.toLocaleString()} words`
        } else {
            return ""
        }
    }
 

    // Get an ExpiringMessage describing the given hint.
    getMessageForHint(hint: LicensePlateGameAPI.HintResponse) : ExpiringMessage {
        const pattern = `Pattern: ${hint.solution_pattern_text}`
        const difficulty = this.getHintDifficultyText(hint)
        const text = pattern + difficulty
        const message: ExpiringMessage = {text, message_type: "hint", remote_request_status: "ok", expiration_secs: EXPIRATION_SECONDS.HINT}
        return message
    }


    // The handler for when the user clicks the "Score Word" button.
    userRequestedCheckAnswer() {
        const getMessageForGradedAnswer = (error: string | null | undefined, graded_answer?: LicensePlateGameAPI.CheckAnswerResponse) => {
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


    // The handler for when the user clicks the "Get a Hint" button.
    userRequestedHint() {
        this.request_in_progress_count++
        this.ea.publish(new AuMsgHintRequest((error, hint) => {
            this.request_in_progress_count--
            const message = this.getMessageForHint(hint)
            this.ea.publish(new AuMsgGameStatusMessage(message))
        }))
    }
 

    // The handler for when the user clicks the 🔄 (reset) button.
    resetText() {
        this.ea.publish(new AuMsgResetPuzzleText())
    }

    // The handler for when the user clicks the "Show Scores..." button.
    showAnswersPanel() {
        this.ea.publish(new AuMsgAnswersPanelState(true))
    }

    
    // The handler for when the user clicks the "Back to word entry..." button.
    hideAnswersPanel() {
        this.ea.publish(new AuMsgAnswersPanelState(false))
    }

}
