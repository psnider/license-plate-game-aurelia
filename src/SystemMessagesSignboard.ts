import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ExpiringMessages} from "./expiring-messages"
import type {ExpiringMessage} from "./lib/index.d"
import {MAX_EXPIRATION_SECONDS} from "./lib/lib"
import {AuMsgRemoteCallState} from './messages';



const status_colors = {
    request: "blue",
    ok: "green",
    error: "red"
}


type MessageCSSClasses = {[message_type:string]: string[]}

const classes_by_message_type: MessageCSSClasses = {
    info: ["game-description-message"],
    "new-game-remote-request": ["remote-request-message"],
    "check-answer-remote-request": ["remote-request-message"],
    "hint-remote-request": ["remote-request-message"],
    "feedback-remote-request": ["remote-request-message"],
}


const DEFAULT_SYSTEM_MESSAGE_STYLE = {
    margin: "0 auto"
}

const game_description_text = [
    "Find a word that contains all three letters, in the order given on the license plate.",
    "This game allows words of up to 15 characters long."
]


// A message display panel for http transactions and for general messages.
// This consists of the status of requests and responses.
// One message is shown at a time.
// They rotate according to the default behavior of ExpiringMessages.
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
                if (message.remote_request_status === "request") {
                    this.system_messages.removeMatchingMessages({message_type})
                }
                this.system_messages.addExpiringMessage(message)
                this.updated()
            }
        })
        this.system_messages.addExpiringMessage(this.game_description_message)
        this.updated()
    }
    

    // The Aurelia life-cycle method called as soon as the data from the containing component is bound to this component. 
    bind(bindingContext: Object, overrideContext: Object) {
        this.updated()
    }
    

    // Called whenever the current_message changes.
    updated() {
        this.message_text_lines = this._getDisplayTextLines()
        this.color_style = this._getColorStyle()
        this.current_css_classes = this._getCSSClasses()
    }


    // Get the text for the current_message.
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


    // Get the style for the color of the current message.
    private _getColorStyle() {
        const remote_request_status = this.system_messages.current_message?.remote_request_status
        const color = remote_request_status ? status_colors[remote_request_status] : "black"
        return {color}
    }


    // Get the CSS classes for the current message.
    private _getCSSClasses() {
        const type = this.system_messages.current_message?.message_type
        const classes = (type in classes_by_message_type) ? classes_by_message_type[type] : []
        const current_css_classes = classes.join(" ")
        return current_css_classes
    }

}
