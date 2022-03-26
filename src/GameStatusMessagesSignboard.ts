import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ExpiringMessages} from "./expiring-messages"
import {AuMsgGameStatusMessage, AuMsgRemoteCallState} from './messages';


const status_colors = {
    sending: "blue",
    ok: "green",
    error: "red"
}


type MessageCSSClasses = {[message_type:string]: string[]}

const classes_by_message_type: MessageCSSClasses = {
    hint: ["hint-message"],
    checked_answer: ["checked-answer-message"]
}


@autoinject
export class GameStatusMessagesSignboard {
    game_status_messages: ExpiringMessages
    // Set to empty string when there are no styles
    current_css_classes: string
    colorstyle: Object
    message_text_lines: string[]


    constructor(private ea: EventAggregator) {
        this.game_status_messages = new ExpiringMessages(() => {
            this.updated() 
        })
        this.current_css_classes = ""
        this.ea.subscribe(AuMsgGameStatusMessage, (msg: AuMsgGameStatusMessage) => {
            const {message} = msg
            if (message) {
                if ((message.message_type === "checked_answer") && (message.remote_request_status === "ok")) {
                    const {message_type} = message
                    this.game_status_messages.removeMatchingMessages({message_type})
                }
                this.game_status_messages.addExpiringMessage(message)
                this.updated()
            }
        })
        this.ea.subscribe(AuMsgRemoteCallState, (msg: AuMsgRemoteCallState) => {
            const {message} = msg
            if ((message.message_type === "new-game-remote-request") && (message.remote_request_status === "sending")) {
                this.game_status_messages.clearAllMessages()
            }
        })
        this.updated()
    }
    

    bind(bindingContext: Object, overrideContext: Object) {
        this.updated()
    }
    

    updated() {
        this.message_text_lines = this._getDisplayTextLines()
        this.colorstyle = this._getColorStyle()
        this.current_css_classes = this._getCSSClasses()
    }


    private _getDisplayTextLines() {
        let text_lines = []
        if (this.game_status_messages.current_message?.text) {
            if (Array.isArray(this.game_status_messages.current_message.text)) {
                text_lines.push(...this.game_status_messages.current_message.text) 
            } else {
                text_lines.push(this.game_status_messages.current_message.text) 
            }
        }
        return text_lines
    }

    private _getColorStyle() {
        const remote_request_status = this.game_status_messages.current_message?.remote_request_status
        const color = remote_request_status ? status_colors[remote_request_status] : "black"
        return {color}
    }


    private _getCSSClasses() {
        const type = this.game_status_messages.current_message?.message_type
        const classes = (type in classes_by_message_type) ? classes_by_message_type[type] : []
        const current_css_classes = classes.join(" ")
        return current_css_classes
    }

}
