import type {LicensePlateGameAPI} from "license-plate-game-api"


export interface Settings {
    check_answer_on_enter_key: boolean
}


export interface PuzzleAnswer extends LicensePlateGameAPI.CheckAnswerResponse {
    attempt_number: number
    answer_text: string
}


export type ExpiringMessageStatus = "sending" | "error" | "ok"
export type MessageType = "info" | "hint" | "checked_answer" |
        "new-game-remote-request" | "check-answer-remote-request" | "hint-remote-request" | "feedback-remote-request"



export interface ExpiringMessage {
    // A unique id for this message (unique only for a single program run).
    // This is added by the message system
    _message_id?: number
    // The time at which this message was added, in epoch milliseconds.
    // This is added by the message system.
    _date?: number
    // The message type.
    // This is used to select styling.  If no type is specified, the "default" styling is used.
    // This may be used to limit or clear messages of this type.
    message_type: MessageType
    // Each string appear on its own line.
    text: string | string[]
    // If unset, this message doesn't expire.
    // Set to MAX_EXPIRATION_SECONDS or greater to prevent the message from expiring.
    expiration_secs: number
    // Used only for remote-requests: This is added by the caller for the paired completedRemoteRequest()
    remote_request_id?: string
    remote_request_status?: ExpiringMessageStatus
}

