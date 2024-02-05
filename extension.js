const Mainloop = imports.mainloop;
const { GObject, St } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const _ = ExtensionUtils.gettext;

const GETTEXT_DOMAIN = 'eye-care-extension';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Eye Care Reminder'));

        this.add_child(new St.Icon({
            icon_name: 'face-smile-symbolic',
            style_class: 'system-status-icon',
        }));

      
       
        this.toggleSwitch = new PopupMenu.PopupSwitchMenuItem('Enable Timer', this.enableByDefault);
        this.toggleSwitch.connect('toggled', (item) => {
            if (item.state) {
                // Code to enable the notification/timer
                showNotification();
            } else {
                // Code to disable the notification/timer
                Mainloop.source_remove(notificationTimeoutId);
            }
        });
        this.menu.addMenuItem(this.toggleSwitch);

        let item = new PopupMenu.PopupMenuItem(_('Show Notification'));
        item.connect('activate', () => {
            showNotification();
        });
        this.menu.addMenuItem(item);

    }
});

let notificationTimeoutId;

function showNotification() {
    Main.notify('Time to rest your eyes', 'Look 20 feet away for 20 seconds');
    notificationTimeoutId = Mainloop.timeout_add_seconds(30, () => {
        showNotification();
        return false;
    });
}

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
        Mainloop.source_remove(notificationTimeoutId); // Remove the timeout when disabling the extension
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
