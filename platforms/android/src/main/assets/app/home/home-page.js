const frameModule = require("ui/frame");
const HomeViewModel = require("./home-view-model");

var appSettings = require("application-settings");
var Toast = require("nativescript-toast");

var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;

var logger = require("../logger");

var pageData = new Observable();
var listItems;


function fetchPurchasedTracks()
{
    var odata_URL = appSettings.getString("odataEndpoint");
    var basicAuthToken = appSettings.getString("basicAuthToken");
    var cust_id = appSettings.getString("selected_customerid");
    var trackids = [];

    listItems = new ObservableArray([]);

    odata_URL = odata_URL + "InvoiceLines?$expand=Invoice($filter=CustomerId eq "+ cust_id +"),Track";
    
    var odata_headers = new Headers();
    odata_headers.append("Authorization", "Basic " + basicAuthToken);

    var init = {
        method: 'GET',
        headers: odata_headers
    }

    logger.logRequest(odata_URL, init.method, "Not Applicable");

    fetch(odata_URL, init).then(function (response) {
        if (!response.ok) {
            var toast = Toast.makeText(response.status);
            toast.show();
        }
        return response.json().then(function(json){
           
            var invoiceData = json.value;

            for(var i = 0; i < invoiceData.length; i++)
            {
                if(invoiceData[i].Invoice == null)
                {
                    continue;
                }

                var trackData = invoiceData[i].Track;
                
                if(trackids.indexOf(trackData.TrackId) == -1)
                {
                    listItems.push({
                        AlbumId: trackData.AlbumId,
                        Name: trackData.Name,
                        Composer: trackData.Composer
                    });
                    trackids.push(trackData.TrackId);
                }
            }
            
            
            pageData.set("items", listItems);
            //appSettings.setString("albumData", JSON.stringify(listItems._array));
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

    const page = args.object;
    page.bindingContext = pageData;

    if(appSettings.hasKey("odataEndpoint") && appSettings.hasKey("basicAuthToken") && appSettings.hasKey("selected_customerid"))
    {
        fetchPurchasedTracks();
    } else
    {
        frameModule.topmost().navigate({
            moduleName:"settings/settings-page",
            transition: {
                name: "fade"
            }
        });
    }

    
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

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
