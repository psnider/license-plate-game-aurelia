import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {AuMsgNewGameRequest, AuMsgAnswersPanelState} from './messages';
import type {LicensePlateGameAPI} from "license-plate-game-api"


type NewGameSpecificationStep = "not active" | "choose type" | "start random game" | "get user selection" | "start user selected game" | "awaiting response"
type NewGameType = "random" | "user-specified"


// The controls for starting a game.
// These activate in sequence in place, to conserve screen space, and support both new game request types:
// - a puzzle seed randomly selected by the server
// - a puzzle seed selected by the user
@autoinject
export class StartNewGameControls {
    step: NewGameSpecificationStep
    user_selected_puzzle_text: string
    user_puzzle_input_element: HTMLInputElement


    constructor(private ea: EventAggregator) {
        this.step = "not active"
        this.user_selected_puzzle_text = ""
    }


    // Moves to the next input step to set which UI control element is displayed.
    advanceStep(next_step: NewGameSpecificationStep) {
        this.step = next_step
        switch (next_step) {
            case "start random game":
                this.startNewGameRandom()
                this.step = "awaiting response"
                break;
            case "start user selected game":
                this.startNewGameFromUserSelection()
                break;
            default:
                break;
        }
    }


    // Called to request a new random game.
    // Sends one message to request the new game,
    // and another to close the answers panel if it is open.
    startNewGameRandom() {
        this.ea.publish(new AuMsgNewGameRequest({completion_callback: () => {
            this.step = "not active"
        }}))
        this.ea.publish(new AuMsgAnswersPanelState(false))
    }
    

    // Called to request a new game with a user specified puzzle_seed.
    // Sends one message to request the new game,
    // and another to close the answers panel if it is open.
    startNewGameFromUserSelection() {
        const options: LicensePlateGameAPI.NewGameRequest = {
            user_selected_puzzle: this.user_selected_puzzle_text,
            completion_callback: () => {
                this.step = "not active"
            }
        }
        this.ea.publish(new AuMsgNewGameRequest(options))
        this.ea.publish(new AuMsgAnswersPanelState(false))
    }


    // The input handler for the user_selected_puzzle_text.
    onAnyInput(event: Event) {
        const {selectionStart, selectionEnd} = this.user_puzzle_input_element
        const cleaned_text = filterInput((<any> event.target).value)
        this.user_selected_puzzle_text = cleaned_text
        setTimeout(() => {
            this.updateCursor(selectionStart, selectionEnd)
        }, 1)
    }

    // Sets the cursor for the user_selected_puzzle_text input.
    updateCursor(selectionStart: number, selectionEnd: number) {
        this.user_puzzle_input_element.setSelectionRange(selectionStart, selectionEnd);
    }

}


// Normalizes text to uppercase and without leading or trailing whitespace.
function filterInput(text: string) {
    text = text.trim().toUpperCase()
    return text
}

