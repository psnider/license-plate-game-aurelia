import {bindable, autoinject, observable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {AuMsgResetPuzzleText, AuMsgAnswersPanelState, AuMsgCheckAnswerTriggeredByEnter} from './messages';
import type {LicensePlatePuzzle} from "./lib/license-plate-puzzle"
import type {LicencePlateGameAPI} from "license-plate-game-api"
import {ExpiringMessages} from "./expiring-messages"
import {Settings, PuzzleAnswer} from "./lib/index.d"


// This must be tied to NewGameResponse.max_word_length
const MAX_WORD_LENGTH = 15
const PUZZLE_TEXT_FOR_NO_GAME = "???"
const MAX_FONT_SIZE_EM = 10
const MIN_FONT_SIZE_EM = 6
const DIFF_IN_FONT_SIZE_EM = MAX_FONT_SIZE_EM - MIN_FONT_SIZE_EM
const MAX_WORD_LENGTH_AT_MAX_FONT_SIZE = 5
const LENGTH_BTWN_MIN_AND_MAX_FONT_SIZE = MAX_WORD_LENGTH - MAX_WORD_LENGTH_AT_MAX_FONT_SIZE


interface ComputedStyle {
    "font-size": string
    "width": string
}


interface CursorSelection {
    selectionStart: number
    selectionEnd: number
}



const dummy_canvas: HTMLCanvasElement = document.createElement("canvas")
const canvas_context: CanvasRenderingContext2D = dummy_canvas.getContext("2d");
type CSS = Object

function calculatePixelWidth(text: string, element: HTMLElement): number {
    const live_attributes = window.getComputedStyle(element)
    const {font, fontSize, fontFamily, fontStyle, fontWeight} = live_attributes
    const attributes = {font, fontSize, fontFamily, fontStyle, fontWeight}
    Object.assign(canvas_context, attributes)
    const metrics = canvas_context.measureText(text)
    return metrics.width;
}


const DEFAULT_GAME_STATUS_MESSAGE_STYLE = {
    // fontSize: "1em",
    margin: "0 auto"
}


@autoinject
export class LicensePlateSolutionEditorFreeEntry {
    @bindable settings: Settings
    @bindable @observable current_game: LicensePlatePuzzle | undefined
    @bindable @observable elapsed_seconds: number
    @bindable @observable puzzle_answers: PuzzleAnswer[]
    @bindable @observable hint: LicencePlateGameAPI.HintResponse | undefined
    computed_style: ComputedStyle
    puzzle_input_element: HTMLInputElement
    puzzle_chars_in_order_regexp: RegExp
    answer_text: string
    answer_text_before_drag: string
    selection_before_drag?: CursorSelection 
    show_input_error: boolean
    max_length: number
    game_messages: ExpiringMessages
    game_status_message_style: Object
    answers_panel_is_open: boolean


    constructor(private ea: EventAggregator) {
        this.game_status_message_style = DEFAULT_GAME_STATUS_MESSAGE_STYLE
        this.show_input_error = false
        this.max_length = MAX_WORD_LENGTH
        this.game_messages = new ExpiringMessages(() => {
            // No action required
            // TODO: make this function optional
        })
        this.answers_panel_is_open = false
        this.ea.subscribe(AuMsgResetPuzzleText, (msg: AuMsgResetPuzzleText) => {
            this.resetPuzzleText()
        })
        this.ea.subscribe(AuMsgAnswersPanelState, (msg: AuMsgAnswersPanelState) => {
            this.answers_panel_is_open = msg.is_open
        })
    }


    bind() {
        this.current_gameChanged()
    }

    attached() {
        this.updateSizes()
    }


    current_gameChanged() {
        if (this.current_game) {
            this.answer_text = this.current_game.answer_text
            const [char0, char1, char2] = this.answer_text.split("")
            const puzzle_chars_text = `${char0}.*${char1}.*${char2}.*`   
            this.puzzle_chars_in_order_regexp = new RegExp(puzzle_chars_text, "i")    
        } else {
            this.answer_text = PUZZLE_TEXT_FOR_NO_GAME
        }
        this.updateSizes()
    }


    onAnyInput(event: InputEvent) {
        const is_drop_insert = (event.inputType === "insertFromDrop")
        const {selectionStart, selectionEnd} = this.puzzle_input_element
        // console.log(`onAnyInput event.target.value=${(<any> event.target).value} event.inputType=${event.inputType}`)
        const cleaned_text = filterInput((<any> event.target).value)
        this.answer_text = cleaned_text
        if (!is_drop_insert) {
            this.updateSizes()
        }
        setTimeout(() => {
            if (is_drop_insert) {
                let text_after_drop = event.target["value"]
                const drop_allowed = this.dropPreservesOrderOfPuzzleChars(text_after_drop)
                if (!drop_allowed) {
                    this.answer_text = this.answer_text_before_drag
                    event.target["value"] = this.answer_text_before_drag
                    this.updateCursor(this.selection_before_drag.selectionStart, this.selection_before_drag.selectionEnd)
                    this.show_input_error = true
                    setTimeout(() => {this.show_input_error = false}, 500)
                }
                this.answer_text_before_drag = undefined
                this.selection_before_drag = undefined
                this.updateSizes()
            } else {
                this.updateCursor(selectionStart, selectionEnd)
            }
        }, 1)
    }


    updateCursor(selectionStart: number, selectionEnd: number) {
        this.puzzle_input_element.setSelectionRange(selectionStart, selectionEnd);
    }


    deletionPreservesOrderOfPuzzleChars() {
        const {selectionStart, selectionEnd} = this.puzzle_input_element
        const answer_text = this.answer_text
        let match
        if (selectionStart === selectionEnd) {
            if (selectionStart > 0) {
                const text_after_delete = answer_text.slice(0, selectionStart - 1) + answer_text.slice(selectionStart)
                match = text_after_delete.match(this.puzzle_chars_in_order_regexp)
            } else {
                match = answer_text.match(this.puzzle_chars_in_order_regexp)
            }
        } else {
            const text_after_delete = answer_text.slice(0, selectionStart) + answer_text.slice(selectionEnd)
            match = text_after_delete.match(this.puzzle_chars_in_order_regexp)
        }
        const deletion_allowed = (match != null)
        return deletion_allowed
    }


    dropPreservesOrderOfPuzzleChars(text_after_drop: string) {
        let match = text_after_drop.match(this.puzzle_chars_in_order_regexp)
        const drop_allowed = (match != null)
        return drop_allowed
    }


    onkeydown(event: KeyboardEvent) {
        function isCursorMovement() {
            const is_cursor_movement = ((event.key === "ArrowLeft") || (event.key === "ArrowRight") || (event.key === "Left") || (event.key === "Right"))
            return is_cursor_movement
        }
        // console.log("onkeydown")
        if (event.key === "Enter") {
            this.current_game.answer_text = this.answer_text
            if (this.settings.check_answer_on_enter_key) {
                this.ea.publish(new AuMsgCheckAnswerTriggeredByEnter())
            }
            return true
        } else if ((event.key === "Escape") || (event.key === "Esc")) {
            this.answer_text = this.current_game.puzzle_seed
            this.current_game.answer_text = this.current_game.puzzle_seed
            return true
        } else if (isCursorMovement()) {
            return true
        } else {
            const {selectionStart, selectionEnd} = this.puzzle_input_element
            const is_character_selection = (selectionStart !== selectionEnd)
            const is_deletion = (event.key === "Backspace")
            if (is_deletion || is_character_selection) {
                const delete_preserves_order = this.deletionPreservesOrderOfPuzzleChars()
                if (!delete_preserves_order) {
                    this.show_input_error = true
                    setTimeout(() => {this.show_input_error = false}, 500)
                }
                return delete_preserves_order
            } else {
                if (this.answer_text.length === MAX_WORD_LENGTH) {
                    this.show_input_error = true
                    setTimeout(() => {this.show_input_error = false}, 500)
                }
                return true
            }
        }
    }


    onDragStart(event: DragEvent) {
        this.answer_text_before_drag = this.answer_text
        const {selectionStart, selectionEnd} = this.puzzle_input_element
        this.selection_before_drag = {selectionStart, selectionEnd}
        // console.log(`onDragStart selection_before_drag=${this.selection_before_drag.selectionStart}, ${this.selection_before_drag.selectionEnd}`)
        return true
    }


    onDrop(event: DragEvent) {
        // console.log(`onDrop answer_text_before_drag=${this.answer_text}`)
        return true
    }


    onChange() {
        // console.log("onChange")
        this.current_game.answer_text = this.answer_text
    }

    
    updateSizes() {
        const em_size = this.getLicensePlateCharSizeEm()
        const width_px = this.puzzle_input_element ? calculatePixelWidth(this.answer_text + "W", this.puzzle_input_element) : 500
        this.computed_style = {
            "font-size": `${em_size}em`,
            width: `${Math.floor(width_px)}px`
        }
    }


    getLicensePlateCharSizeEm(): number {
        if (this.answer_text) {
            const length = this.answer_text.length
            let size
            if (length <= MAX_WORD_LENGTH_AT_MAX_FONT_SIZE) {
                size = MAX_FONT_SIZE_EM
            } else if (length >= MAX_WORD_LENGTH) {
                size = MIN_FONT_SIZE_EM
            } else {
                const dist_from_min = length - MAX_WORD_LENGTH_AT_MAX_FONT_SIZE
                const size_decrease = (dist_from_min / LENGTH_BTWN_MIN_AND_MAX_FONT_SIZE) * DIFF_IN_FONT_SIZE_EM
                size = MAX_FONT_SIZE_EM - size_decrease
            }
            return size    
        } else {
            return MAX_FONT_SIZE_EM
        }
    }


    resetPuzzleText() {
        this.answer_text = this.current_game.puzzle_seed
        this.current_game.answer_text = this.current_game.puzzle_seed
        this.updateSizes()
    }

}




function filterInput(text: string) {
    text = text.trim().toUpperCase()
    return text
}

