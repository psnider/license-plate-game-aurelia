import {bindable, observable, autoinject} from 'aurelia-framework';
import type {LicensePlatePuzzle} from "./lib/license-plate-puzzle"



@autoinject
export class PuzzleSummary {
    @bindable @observable current_game: LicensePlatePuzzle | undefined
}
