const frameModule = require("ui/frame");
const SettingsViewModel = require("./settings-view-model");
var base64 = require('base-64');
var utf8 = require('utf8');
var appSettings = require("application-settings");
var Toast = require("nativescript-toast");

var page;

var odataEndpoint;
var basicAuthToken;
var username;
var password;
/* ***********************************************************
 * Use the "onNavigatingTo" handler to initialize the page binding context.
 *************************************************************/
function onNavigatingTo(args) {
    /* ***********************************************************
     * The "onNavigatingTo" event handler lets you detect if the user navigated with a back button.
     * Skipping the re-initialization on back navigation means the user will see the
     * page in the same data state that he left it in before navigating.
     *************************************************************/
    if (args.isBackNavigation) {
        return;
    }

    page = args.object;

    if (appSettings.hasKey("odataEndpoint") && appSettings.hasKey("basicAuthToken")) {
        var odata_textField = page.getViewById("url");
        odata_textField.text = appSettings.getString("odataEndpoint");

        var user_textField = page.getViewById("username");
        user_textField.text = appSettings.getString("username");

        var password_textField = page.getViewById("password");
        password_textField.text = appSettings.getString("password");

    }

    page.bindingContext = new SettingsViewModel();
}

/* ***********************************************************
 * According to guidelines, if you have a drawer on your page, you should always
 * have a button that opens it. Get a reference to the RadSideDrawer view and
 * use the showDrawer() function to open the app drawer section.
 *************************************************************/
function onDrawerButtonTap(args) {
    const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

function testConnect() {
    var odata_headers = new Headers();
    odata_headers.append("Authorization", "Basic " + basicAuthToken);

    var init = {
        method: 'GET',
        headers: odata_headers
    }

    fetch(odataEndpoint, init).then(function (response) {
        if (!response.ok) {
            return false;
        }
        return true;

    }).then(function (result) {

        if (result == true) {
            appSettings.setString("basicAuthToken", basicAuthToken);
            appSettings.setString("odataEndpoint", odataEndpoint);
            appSettings.setString("username", username);
            appSettings.setString("password", password);

            var toast = Toast.makeText("Connected Successfully. Saved the Configuration");
            toast.show();
        }
        else {
            var toast = Toast.makeText("Connection Failed. Check your credentials.");
            toast.show();
        }
    }).catch(function (error) {
        var toast = Toast.makeText("Something bad happened: " + error);
        toast.show();
    });
}

function saveConfiguration() {
    odataEndpoint = page.getViewById("url").text;
    username = page.getViewById("username").text;
    password = page.getViewById("password").text;
    var basicAuthStr = username + ":" + password;
    var bytes = utf8.encode(basicAuthStr);
    basicAuthToken = base64.encode(bytes);

    var result = testConnect();

}

exports.saveConfiguration = saveConfiguration;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;

