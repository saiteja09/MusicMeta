const frameModule = require("ui/frame");
const LogsViewModel = require("./logs-view-model");

var appSettings = require("application-settings");
var Toast = require("nativescript-toast");

var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;


var pageData = new Observable();
var listItems;

function onNavigatingTo(args) {
    /* ***********************************************************
    * The "onNavigatingTo" event handler lets you detect if the user navigated with a back button.
    * Skipping the re-initialization on back navigation means the user will see the
    * page in the same data state that he left it in before navigating.
    *************************************************************/
    if (args.isBackNavigation) {
        return;
    }

    const page = args.object;
    page.bindingContext = pageData;

    
    if(appSettings.hasKey("log"))
    {
        var logs = JSON.parse(appSettings.getString("log"));
    }

    pageData.set("items", logs);

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


function clearLog(args) {
    var log = [];
    appSettings.setString("log", JSON.stringify(log));
    pageData.set("items", log);
}

exports.clearLog = clearLog;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
