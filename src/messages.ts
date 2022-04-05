import type {ExpiringMessage} from "./lib/index.d"
import type {LicensePlateGameAPI} from "license-plate-game-api"


export class AuMsgWindowResized {
    constructor(public size: {height: number, width: number}) { }
}


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
    constructor(public request: LicensePlateGameAPI.NewGameRequest) { }
}


export class AuMsgCheckAnswer {
    constructor(public callback: LicensePlateGameAPI.ClientCompletionCallback) { }
}


export class AuMsgCheckAnswerTriggeredByEnter {
    constructor() { }
}


export class AuMsgHintRequest {
    constructor(public callback: LicensePlateGameAPI.ClientCompletionCallback) { }
}


export class AuMsgResetPuzzleText {
    constructor() { }
}
