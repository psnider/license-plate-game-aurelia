import {bindable, autoinject, observable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {AuMsgAnswersPanelState} from './messages';
import type {LicensePlatePuzzle} from "./lib/license-plate-puzzle"
import type {LicensePlateGameAPI} from "license-plate-game-api"
import {Settings, PuzzleAnswer} from "./lib"


// The container for the interior of the license plate frame.
// It displays either:
// - the input component and the game status messages component
// - the scored answers
@autoinject
export class FramedLicensePlate {
    @bindable settings: Settings
    @bindable @observable current_game: LicensePlatePuzzle | undefined
    @bindable @observable elapsed_seconds: number
    @bindable @observable puzzle_answers: PuzzleAnswer[]
    @bindable @observable hint: LicensePlateGameAPI.HintResponse | undefined
    answers_panel_is_open: boolean


    constructor(private ea: EventAggregator) {
        this.answers_panel_is_open = false
        this.ea.subscribe(AuMsgAnswersPanelState, (msg: AuMsgAnswersPanelState) => {
            this.answers_panel_is_open = msg.is_open
        })
    }

}
