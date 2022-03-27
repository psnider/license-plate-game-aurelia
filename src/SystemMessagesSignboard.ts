import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ExpiringMessages} from "./expiring-messages"
import type {ExpiringMessage} from "./lib/index.d"
import {MAX_EXPIRATION_SECONDS} from "./lib/lib"
import {AuMsgRemoteCallState} from './messages';



const status_colors = {
    sending: "blue",
    ok: "green",
    error: "red"
}


type MessageCSSClasses = {[message_type:string]: string[]}

const classes_by_message_type: MessageCSSClasses = {
    info: ["game_description_message"],
    "new-game-remote-request": ["remote_request_message"],
    "check-answer-remote-request": ["remote_request_message"],
    "hint-remote-request": ["remote_request_message"],
    "feedback-remote-request": ["remote_request_message"],
}

const DEFAULT_SYSTEM_MESSAGE_STYLE = {
    // fontSize: "1em",
    margin: "0 auto"
}

const game_description_text = [
    "Find a word that contains all three letters, in the order given on the license plate.",
    "This game allows words of up to 15 characters long."
]

@autoinject
export class SystemMessagesSignboard {
    system_messages: ExpiringMessages
    // Set to empty string when there are no styles
    current_css_classes: string
    color_style: Object
    message_text_lines: string[]
    game_description_message: ExpiringMessage = {text: game_description_text, message_type: "info", expiration_secs: MAX_EXPIRATION_SECONDS}
    

    constructor(private ea: EventAggregator) {
        this.system_messages = new ExpiringMessages(() => {
            this.updated() 
        })
        this.current_css_classes = ""
        this.ea.subscribe(AuMsgRemoteCallState, (msg: AuMsgRemoteCallState) => {
            const message = msg.message
            if (message) {
                const {message_type} = message
                if (message.remote_request_status === "sending") {
                    this.system_messages.removeMatchingMessages({message_type})
                }
                this.system_messages.addExpiringMessage(message)
                this.updated()
            }
        })
        this.system_messages.addExpiringMessage(this.game_description_message)
        this.updated()
    }
    

    bind(bindingContext: Object, overrideContext: Object) {
        this.updated()
    }
    

    updated() {
        this.message_text_lines = this._getDisplayTextLines()
        this.color_style = this._getColorStyle()
        this.current_css_classes = this._getCSSClasses()
    }


    private _getDisplayTextLines() {
        let text_lines = []
        if (this.system_messages.current_message?.text) {
            if (Array.isArray(this.system_messages.current_message.text)) {
                text_lines.push(...this.system_messages.current_message.text) 
            } else {
                text_lines.push(this.system_messages.current_message.text) 
            }
        }
        return text_lines
    }


    private _getColorStyle() {
        const remote_request_status = this.system_messages.current_message?.remote_request_status
        const color = remote_request_status ? status_colors[remote_request_status] : "black"
        return {color}
    }


    private _getCSSClasses() {
        const type = this.system_messages.current_message?.message_type
        const classes = (type in classes_by_message_type) ? classes_by_message_type[type] : []
        const current_css_classes = classes.join(" ")
        return current_css_classes
    }

}
