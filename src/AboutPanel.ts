import {bindable, autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {AuMsgAboutPanelState} from './messages';


@autoinject
export class AboutPanel {
    @bindable about_panel_is_open: boolean

    constructor(private ea: EventAggregator) { }


    closePanel() {
        this.ea.publish(new AuMsgAboutPanelState(false));
    }

}
