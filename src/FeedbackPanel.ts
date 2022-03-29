import {bindable, autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {AuMsgFeedbackPanelState, AuMsgRemoteCallState} from './messages';
import type {ExpiringMessage} from "./lib"
import type {LicensePlatePuzzle} from "./lib/license-plate-puzzle"
import type {LicensePlateGameAPI} from "license-plate-game-api"
import {LicensePlateGameClient} from "license-plate-game-api"



@autoinject
export class FeedbackPanel {
    @bindable feedback_panel_is_open: boolean
    @bindable current_game?: LicensePlatePuzzle
    rating: LicensePlateGameAPI.FeedBackPost["rating"]
    comments: string
    static remote_request_id: number = 0


    constructor(private ea: EventAggregator) {
        this.rating = "good"
        this.comments = ""
    }
    
    
    openPanel() {
        this.ea.publish(new AuMsgFeedbackPanelState(true));
    }
    
    
    closePanel() {
        this.ea.publish(new AuMsgFeedbackPanelState(false));
    }


    // Post feedback to the server.
    // Send an ExpiringMessage via the Aurelia EventAggregator so it can be displayed.
    sendFeedback() {
        const feedback: LicensePlateGameAPI.FeedBackPost = {
            game_id: this.current_game?.game_id,
            puzzle_seed: this.current_game?.puzzle_seed,
            rating: this.rating,
            comments: this.comments
        }
        const remote_request_id = `feedback-${FeedbackPanel.remote_request_id++}`
        const message: ExpiringMessage = {text: "sending feedback", expiration_secs: 30, message_type: "feedback-remote-request", remote_request_status: "request", remote_request_id}
        this.ea.publish(new AuMsgRemoteCallState(message));
        LicensePlateGameClient.postFeedback(feedback).then((response) => {
            this.comments = ""
            this.closePanel()
            const message: ExpiringMessage = {text: "feedback received!", expiration_secs: 5, message_type: "feedback-remote-request", remote_request_status: "ok", remote_request_id}
            this.ea.publish(new AuMsgRemoteCallState(message));
            return null
        }, (error) => {
            const message: ExpiringMessage = {text: "Could not send feedback... try again later.", expiration_secs: 10, message_type: "feedback-remote-request", remote_request_status: "error", remote_request_id}
            this.ea.publish(new AuMsgRemoteCallState(message));
            return null
        })
    }

}
