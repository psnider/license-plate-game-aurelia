import {autoinject} from 'aurelia-framework';
import {AuMsgAboutPanelState, AuMsgFeedbackPanelState} from 'messages';
import {EventAggregator} from 'aurelia-event-aggregator';


@autoinject
export class HamburgerMenu {

    constructor(private ea: EventAggregator) {
    }


    openAboutPanel() {
        this.ea.publish(new AuMsgAboutPanelState(true));
    }


    openFeedbackPanel() {
        this.ea.publish(new AuMsgFeedbackPanelState(true));
    }

}


