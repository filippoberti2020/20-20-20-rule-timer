import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';


let notificationTimeoutId;

function showNotification() {
    Main.notify('Time to rest your eyes', 'Look 20 feet away for 20 seconds');
    notificationTimeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1200, () => {
        showNotification();
        notificationTimeoutId = null;
        return GLib.SOURCE_REMOVE;
    });
}


const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Eye Care Reminder'));

        this.add_child(new St.Icon({
            icon_name: 'face-smile-symbolic',
            style_class: 'system-status-icon',
        }));

        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1200000, () => {
            showNotification();
            return GLib.SOURCE_CONTINUE;
        });

        let item = new PopupMenu.PopupMenuItem(_('Show Notification'));
        item.connect('activate', () => {
            showNotification();
        });
        this.menu.addMenuItem(item);
    }

    destroy() {
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
        }
        super.destroy();
    }
});

export default class EyeCareReminderExtension extends Extension {
    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        if (notificationTimeoutId) {
            GLib.Source.remove(notificationTimeoutId);
            notificationTimeoutId = null;
        }
    }
}
