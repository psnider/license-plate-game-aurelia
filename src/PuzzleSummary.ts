import {bindable, observable} from 'aurelia-framework';
import type {LicensePlatePuzzle} from "./lib/license-plate-puzzle"


export class PuzzleSummary {
    @bindable @observable current_game: LicensePlatePuzzle | undefined
}
