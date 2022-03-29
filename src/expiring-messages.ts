import type {ExpiringMessage} from "./lib/index.d"
import {MAX_EXPIRATION_SECONDS} from "./lib/lib"


const DEFAULT_ROTATION_SECS = 2


// Manage a set of messages that have expiration times.
// Every DEFAULT_ROTATION_SECS number of seconds it switches the current message to be the next one in the set of messages.
//
// This class does not contain any view related data or dependencies.
//
// To use it:
// - Instantiate it in the owning class.
// - Call addExpiringMessage()
export class ExpiringMessages {

    static next_message_id: number = 0
    // New messages are always added to the end, so they are in order of oldest to newest.
    expiring_messages: ExpiringMessage[]
    // The message that is currently selected for display.
    current_message?: ExpiringMessage
    stop_timer: boolean
    current_message_changed: () => void


    constructor(current_message_changed: () => void) {
        this.current_message_changed = current_message_changed
        this.expiring_messages = []
        this.stop_timer = false
        this.rotateMessageAfterDelay()
    }


    destructor() {
        this.stop_timer = true
    }


    // Add an ExpiringMessage to be managed.
    addExpiringMessage(new_message: ExpiringMessage): void {
        const removePreviousMessagesFromSameRequest = () => {
            const messages_w_different_request_id = this.expiring_messages.filter((m) => {
                if (new_message.remote_request_id != null) {
                    return (m.remote_request_id !== new_message.remote_request_id)
                } else {
                    return true
                }
            })
            this.expiring_messages = messages_w_different_request_id
        }
        const message_id = ExpiringMessages.next_message_id++
        const message_text = new_message.text
        // console.log(`addExpiringMessage() message_id=${message_id} message_text=${message_text}`)
        new_message._message_id = message_id
        new_message._date = Date.now()
        // remove any previous messages associated with this request
        removePreviousMessagesFromSameRequest()
        this.expiring_messages.push(new_message)
        this.current_message = new_message
        
        if (new_message.expiration_secs <= MAX_EXPIRATION_SECONDS) {
            setTimeout(() => {
                // console.log(`setTimeout removing message_id=${message_id} message_text=${message_text}`)
                this.removeMessage(message_id)
            }, new_message.expiration_secs * 1000)    
        }
        this.current_message_changed()
    }


    // Get the index of the message with the given id.
    // If it isn't found, return -1.
    findIndexOfMessage(query_message_id: number) {
        const index = this.expiring_messages.findIndex((message, i) => {
            return (message._message_id === query_message_id)
        })
        return index
    }


    // Get the index of the current_message.
    findIndexOfCurrentMessage() {
        if (this.current_message) {
            const index = this.findIndexOfMessage(this.current_message._message_id)
            return index
        } else {
            return -1
        }
    }


    // Update the current_message to be the next one in the set of messages.
    rotateMessageAfterDelay() {
        if (!this.stop_timer) {
            setTimeout(() => { 
                if (this.expiring_messages.length > 0) {
                    let index = this.findIndexOfCurrentMessage()
                    index = (index + 1) % this.expiring_messages.length
                    this.current_message = this.expiring_messages[index]
                    this.current_message_changed()
                }
                this.rotateMessageAfterDelay()
            }, DEFAULT_ROTATION_SECS * 1000)    
        }
    }


    // Remove the message with the given id.
    // If the message isn't found, no action is performed.
    removeMessage(query_message_id: number) {
        const index = this.findIndexOfMessage(query_message_id)
        if (index != -1) {
            const other_messages = this.expiring_messages.filter((m) => {
                return m._message_id !== query_message_id
            })
            this.expiring_messages = other_messages
            if (this.current_message?._message_id == query_message_id) {
                const new_index = index % this.expiring_messages.length
                this.current_message = this.expiring_messages[new_index]
            }
            this.current_message_changed()
        }
    }


    // Remove and messages that match the query.
    // If only one field of the query is specified, then a message is removed if it matches the given query parameter.
    // If both fields of the query are specified, then a message is removed if it matches both given query parameters.
    // If neither field is specified, then no messages are removed.
    removeMatchingMessages(query: {message_type?: string, remote_request_id?: string}) {
        const removeMessagesMatchingQuery = () => {
            const current_message_id = this.current_message?._message_id
            const messages_not_matching = this.expiring_messages.filter((m) => {
                const message_type_matches = (m.message_type === query.message_type)
                const remote_request_id_matches = (m.remote_request_id === query.remote_request_id)
                let should_remove = false
                if ((query.message_type != null) && (query.remote_request_id != null)) {
                    should_remove = message_type_matches && remote_request_id_matches
                } else if (query.message_type != null) {
                    should_remove = message_type_matches
                } else if (query.remote_request_id != null) {
                    should_remove = remote_request_id_matches
                }
                if (should_remove && (m._message_id === current_message_id)) {
                    removed_current_message = true
                }
                return !should_remove
            })
            if (this.expiring_messages.length != messages_not_matching.length) {
                this.expiring_messages = messages_not_matching
            }
        }
        // console.log(`removeMatchingMessages(${JSON.stringify(query)}`)
        let removed_current_message = false
        removeMessagesMatchingQuery()
        if (removed_current_message) {
            this.current_message = undefined
        }
        this.current_message_changed()
    }


    // Removes all messages from the set of messages.
    clearAllMessages() {
        this.expiring_messages = []
        this.current_message = undefined
        this.current_message_changed()
    }

}


