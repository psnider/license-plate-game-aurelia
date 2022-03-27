import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {AuMsgNewGameRequest, AuMsgAnswersPanelState} from './messages';
import type {LicensePlateGameAPI} from "license-plate-game-api"



type NewGameSpecificationStep = "not active" | "choose type" | "start random game" | "get user selection" | "start user selected game" | "awaiting response"
type NewGameType = "random" | "user-specified"

@autoinject
export class StartNewGameControls {
    step: NewGameSpecificationStep
    user_selected_puzzle_text: string
    user_puzzle_input_element: HTMLInputElement



    constructor(private ea: EventAggregator) {
        this.step = "not active"
        this.user_selected_puzzle_text = ""
    }


//    type NewGameSpecificationStep = "not active" | "choose type" | "start random game" | "get user selection" | "start user selected game" | "awaiting response"
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


    startNewGameRandom() {
        this.ea.publish(new AuMsgNewGameRequest({completion_callback: () => {
            this.step = "not active"
        }}))
        this.ea.publish(new AuMsgAnswersPanelState(false))
    }
    

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


    onAnyInput(event: Event) {
        const {selectionStart, selectionEnd} = this.user_puzzle_input_element
        const cleaned_text = filterInput((<any> event.target).value)
        this.user_selected_puzzle_text = cleaned_text
        setTimeout(() => {
            this.updateCursor(selectionStart, selectionEnd)
        }, 1)
    }


    updateCursor(selectionStart: number, selectionEnd: number) {
        this.user_puzzle_input_element.setSelectionRange(selectionStart, selectionEnd);
    }

}



function filterInput(text: string) {
    text = text.trim().toUpperCase()
    return text
}

