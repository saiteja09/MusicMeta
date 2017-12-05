const frameModule = require("ui/frame");
const SettingsViewModel = require("./settings-view-model");
var base64 = require('base-64');
var utf8 = require('utf8');
var appSettings = require("application-settings");
var Toast = require("nativescript-toast");
var logger = require("../logger");

var page;

var odataEndpoint;
var basicAuthToken;
var username;
var password;


function getCustomers(page)
{
    var dd_customers = page.getViewById("dd_customers");

    var odata_headers = new Headers();
    var odataEndpoint = appSettings.getString("odataEndpoint");

    var basicAuthToken = appSettings.getString("basicAuthToken");
    odata_headers.append("Authorization", "Basic " + basicAuthToken);
    
    var odataQuery = odataEndpoint + "Customers?$select=CustomerId,FirstName,LastName";

    var init = {
        method: 'GET',
        headers: odata_headers
    }

    logger.logRequest(odataQuery, init.method, "Not Applicable");

    fetch(odataQuery, init).then(function (response) {
        if (!response.ok) {
            var toast = Toast.makeText(response.status);
            toast.show();
        }
        return response.json().then(function(json){
            var customers_raw = json.value;
            var customers_list = [];
    
            for(var i = 0; i < customers_raw.length; i++)
            {
                customers_list.push(customers_raw[i].FirstName + " " + customers_raw[i].LastName);
            }
            
            dd_customers.items = customers_list;

            if( appSettings.hasKey("selected_customerid"))
            {
                dd_customers.selectedIndex = (parseInt(appSettings.getString("selected_customerid")) - 1);
                
            }
            
        });
    }).catch(function (error) {
        var toast = Toast.makeText("Something bad happened: " + error);
        toast.show();
    });
    
}

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

        getCustomers(page);

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

function testConnect(page) {
    var odata_headers = new Headers();
    odata_headers.append("Authorization", "Basic " + basicAuthToken);

    var init = {
        method: 'GET',
        headers: odata_headers
    }

    logger.logRequest(odataEndpoint, init.method, "Not Applicable");

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
            getCustomers(page);
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

function startTestConnect() {
    odataEndpoint = page.getViewById("url").text;
    if(!odataEndpoint.endsWith("/"))
    {
        odataEndpoint = odataEndpoint + "/";
    }

    username = page.getViewById("username").text;
    password = page.getViewById("password").text;
    var basicAuthStr = username + ":" + password;
    var bytes = utf8.encode(basicAuthStr);
    basicAuthToken = base64.encode(bytes);

    var result = testConnect(page);

}

function saveConfig()
{
    var dd_customers = page.getViewById("dd_customers");
    var selected_CustomerId = dd_customers.selectedIndex;
    selected_CustomerId = selected_CustomerId + 1;

    if(selected_CustomerId == null)
    {
        var toast = Toast.makeText("Please choose a customer. Failed to save the configuration!");
        toast.show();
    }
    else
    {
        appSettings.setString("selected_customerid", selected_CustomerId.toString());
        var toast = Toast.makeText("Configuration Saved Successfully!");
        toast.show();
    }
}

exports.saveConfig = saveConfig;
exports.startTestConnect = startTestConnect;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;


