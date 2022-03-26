import {bindable, autoinject, observable} from 'aurelia-framework';
import type {LicensePlatePuzzle} from "./lib/license-plate-puzzle"


@autoinject
export class TopOfLicensePlateFrame {
    @bindable @observable current_game: LicensePlatePuzzle | undefined
}

