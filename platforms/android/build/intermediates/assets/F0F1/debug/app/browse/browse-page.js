const frameModule = require("ui/frame");
const BrowseViewModel = require("./browse-view-model");
var appSettings = require("application-settings");
var Toast = require("nativescript-toast");
var view = require("ui/core/view");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;

var page;
var listItems = new ObservableArray([]);
var pageData = new Observable();

function getAlbumsFromServer(){
    
    var odata_URL = appSettings.getString("odataEndpoint");
    var basicAuthToken = appSettings.getString("basicAuthToken");

    if(!odata_URL.endsWith("/"))
    {
        odata_URL = odata_URL + "/Albums?$expand=Artist&$top=10"
    } else
    {
        odata_URL = odata_URL + "Albums?$expand=Artist&$top=10"
    }

    var odata_headers = new Headers();
    odata_headers.append("Authorization", "Basic " + basicAuthToken);

    var init = {
        method: 'GET',
        headers: odata_headers
    }

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
            appSettings.setString("albumData", JSON.stringify(listItems._array));
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
    page.bindingContext = pageData;

    if(!appSettings.hasKey("albumData"))
    {
        getAlbumsFromServer()
    }else{
        var listItems = JSON.parse(appSettings.getString("albumData"))
        pageData.set("items", listItems);
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


/*function pullToRefreshInitiated()
{
    setTimeout(function() {
		listItems.push(
				{
					AlbumId: "-1",
					Title: "This is Happening",
					Name: "Dmitri"
				}
		);
		page.getViewById("listview").notifyPullToRefreshFinished();
    }, 2000);
}*/


function onItemSelected(args) {
    const component = args.object;
    const componentRoute = component.route;

    var listview = page.getViewById("listview");
    var selectedItems = listview.getSelectedItems();

    frameModule.topmost().navigate({
        moduleName:"featured/featured-page",
        transition: {
            name: "fade"
        },
        context:{
           AlbumId: selectedItems[0].AlbumId,
           AlbumName: selectedItems[0].Title,
           Artist: selectedItems[0].Name
        }
    });
}

exports.onItemSelected = onItemSelected;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
//exports.pullToRefreshInitiated  = pullToRefreshInitiated;
