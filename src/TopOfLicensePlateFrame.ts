import {bindable, observable} from 'aurelia-framework';
import type {LicensePlatePuzzle} from "./lib/license-plate-puzzle"


export class TopOfLicensePlateFrame {
    @bindable @observable current_game: LicensePlatePuzzle | undefined
}

