import type {LicensePlateGameAPI} from "license-plate-game-api"


// Web-app settings.
export interface Settings {
    // Controls whether pressing the Enter / Return key submits the current input text as an answer.
    check_answer_on_enter_key: boolean
}


// An answer that the user submits as a answer.
export interface PuzzleAnswer extends LicensePlateGameAPI.CheckAnswerResponse {
    attempt_number: number
    // The text that the user submits.
    answer_text: string
}


// Status
export type ExpiringMessageRemoteRequestStatus = "request" | "error" | "ok"
export type MessageType = "info" | "hint" | "checked_answer" |
        "new-game-remote-request" | "check-answer-remote-request" | "hint-remote-request" | "feedback-remote-request"


// Properties of an ExpiringMessage that are managed by the message system, and not the caller.
interface _ExpiringMessageSystemProperties {
    // A unique id for this message (unique only for a single program run).
    // This is added by the message system.
    _message_id?: number
    // The time at which this message was added, in epoch milliseconds.
    // This is added by the message system.
    _date?: number
}


// A user-facing message, with a type and an expiration time.
export interface ExpiringMessage extends _ExpiringMessageSystemProperties {
    // The message type.
    // This is used to select message display styling.  If no type is specified, the "default" styling is used.
    // This may be used to limit or clear messages of this type.
    message_type: MessageType
    // Each string appears on a separate line.
    text: string | string[]
    // The number of seconds for which to display this message.
    // Set to MAX_EXPIRATION_SECONDS or greater to prevent the message from expiring.
    // A message may be cleared from the message display early in case messages of this same type are cleared.
    expiration_secs: number
    // Used only for remote-requests: This is added by the caller for the paired completedRemoteRequest()
    remote_request_id?: string
    // Indicates the status of the remote request that this message is associated with.
    // Only the latest message for a given remote_request_id is kept in the message display.
    remote_request_status?: ExpiringMessageRemoteRequestStatus
}

