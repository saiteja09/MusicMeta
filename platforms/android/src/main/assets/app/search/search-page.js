const frameModule = require("ui/frame");
const SearchViewModel = require("./search-view-model");
var appSettings = require("application-settings");
var Toast = require("nativescript-toast");

var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var logger = require("../logger");


var pageData = new Observable();
var listItems;

var page;

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

    if(!(appSettings.hasKey("odataEndpoint") && appSettings.hasKey("basicAuthToken") && appSettings.hasKey("selected_customerid")))
    {
        
        frameModule.topmost().navigate({
            moduleName:"settings/settings-page",
            transition: {
                name: "fade"
            }
        });
    }

    page = args.object;
    page.bindingContext = pageData;
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


function onSubmit(){

    listItems = new ObservableArray([]);
    var album_search = page.getViewById("album_search");
    album_search.dismissSoftInput();


    var odata_URL = appSettings.getString("odataEndpoint");
    var basicAuthToken = appSettings.getString("basicAuthToken");

    if(!odata_URL.endsWith("/"))
    {
        odata_URL = odata_URL + "Albums?$search="+ album_search.text +"&$expand=Artist";
    } else
    {
        odata_URL = odata_URL + "Albums?$search="+ album_search.text +"&$expand=Artist";
    }

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
           
            var albumData = json.value;
            
            for(var i=0; i< albumData.length; i++)
            {
                var album = albumData[i];
                listItems.push({
                    AlbumId: album.AlbumId,
                    Title: album.Title,
                    Name: album.Artist.Name
                })
            }
            
            pageData.set("items", listItems);
            
        });
    }).catch(function (error) {
        var toast = Toast.makeText("Something bad happened: " + error);
        toast.show();
    });

}


function onClear(){
    listItems = new ObservableArray([]);
    pageData.set("items", listItems);
    var album_search = page.getViewById("album_search");
    album_search.dismissSoftInput();

}


exports.onClear = onClear;
exports.onSubmit = onSubmit;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
