import {autoinject, bindable} from 'aurelia-framework';
import {AuMsgAboutPanelState, AuMsgFeedbackPanelState} from 'messages';
import {EventAggregator} from 'aurelia-event-aggregator';


@autoinject
export class Banner {
    @bindable in_process_count: number

    constructor(private ea: EventAggregator) {
    }


    openAboutPanel() {
        this.ea.publish(new AuMsgAboutPanelState(true));
    }


    openFeedbackPanel() {
        this.ea.publish(new AuMsgFeedbackPanelState(true));
    }

}


