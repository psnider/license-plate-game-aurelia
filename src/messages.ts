import type {ExpiringMessage} from "./lib/index.d"
import type {LicencePlateGameAPI} from "license-plate-game-api"


export class AuMsgAboutPanelState {
    constructor(public is_open: boolean) { }
}


export class AuMsgFeedbackPanelState {
    constructor(public is_open: boolean) { }
}


export class AuMsgAnswersPanelState {
    constructor(public is_open: boolean) { }
}



export class AuMsgRemoteCallState {
    constructor(public message: ExpiringMessage) { }
}


export class AuMsgGameStatusMessage {
    constructor(public message: ExpiringMessage) { }
}


export class AuMsgNewGameRequest {
    constructor(public request: LicencePlateGameAPI.NewGameRequest) { }
}


export class AuMsgCheckAnswer {
    constructor(public callback: LicencePlateGameAPI.ClientCompletionCallback) { }
}


export class AuMsgCheckAnswerTriggeredByEnter {
    constructor() { }
}


export class AuMsgHintRequest {
    constructor(public callback: LicencePlateGameAPI.ClientCompletionCallback) { }
}


export class AuMsgResetPuzzleText {
    constructor() { }
}
