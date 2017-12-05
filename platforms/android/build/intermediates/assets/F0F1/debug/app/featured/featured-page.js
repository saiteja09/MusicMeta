const frameModule = require("ui/frame");
const FeaturedViewModel = require("./featured-view-model");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var view = require("ui/core/view");
var appSettings = require("application-settings");
var dialogs = require("ui/dialogs");

var page;
var pageData = new Observable();


function getTracksForAlbum(contextData)
{
    var odata_URL = appSettings.getString("odataEndpoint");
    var basicAuthToken = appSettings.getString("basicAuthToken");
    var listItems = new ObservableArray([]);

    if(!odata_URL.endsWith("/"))
    {
        odata_URL = odata_URL + "/Tracks?$filter=AlbumId eq " + contextData.AlbumId;
    } else
    {
        odata_URL = odata_URL + "Tracks?$filter=AlbumId eq " + contextData.AlbumId;
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
           
            var trackData = json.value;
            
            for(var i=0; i< trackData.length; i++)
            {
                var track = trackData[i];
                listItems.push({
                    TrackId: track.TrackId,
                    Name: track.Name,
                    Composer: track.Composer,
                    UnitPrice: track.UnitPrice
                })
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

    page = args.object;
    page.bindingContext = pageData;
    var contextData = page.navigationContext;


    var album_label = page.getViewById("albumname");
    var artist_label = page.getViewById("artistname");

    pageData.set("albumname", contextData.AlbumName);
    pageData.set("artistname", contextData.Artist);


    

    //album_label.text = contextData.AlbumName;
    //artist_label.text = contextData.Artist;

    getTracksForAlbum(contextData);

    


}

/* ***********************************************************
 * According to guidelines, if you have a drawer on your page, you should always
 * have a button that opens it. Get a reference to the RadSideDrawer view and
 * use the showDrawer() function to open the app drawer section.
 *************************************************************/
function onNavBtnTap(args) {
   
    frameModule.topmost().navigate({
        moduleName: "browse/browse-page",
        transition: {
            name: "fade"
        }
    });
}

function postPurchaseInvoiceLine(item, invoiceId)
{
    var odata_URL = appSettings.getString("odataEndpoint");
    var basicAuthToken = appSettings.getString("basicAuthToken");
    
    if(!odata_URL.endsWith("/"))
    {
        odata_URL = odata_URL + "/InvoiceLines?$orderby=InvoiceId desc&$top=1";
    } else
    {
        odata_URL = odata_URL + "InvoiceLines?$orderby=InvoiceId desc&$top=1";
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
           
            var invoiceLine = json.value;
            var max_invoiceLineId = invoiceLine[0].InvoiceLineId;
            
            var postBody = {
                InvoiceLineId: max_invoiceLineId + 1,
                InvoiceId: invoiceId,
                TrackId: item.TrackId,
                UnitPrice: item.UnitPrice,
                Quantity: 1
            };
            
            odata_URL = appSettings.getString("odataEndpoint");

            if(!odata_URL.endsWith("/"))
            {
                odata_URL = odata_URL + "/InvoiceLines";
            } else
            {
                odata_URL = odata_URL + "InvoiceLines";
            }

            var odata_headers = new Headers();
            odata_headers.append("Authorization", "Basic " + basicAuthToken);
            odata_headers.append("Content-Type", "application/json");
        
            var init = {
                method: 'POST',
                headers: odata_headers,
                body: JSON.stringify(postBody)
            }
        
            fetch(odata_URL, init).then(function (response) {
                if (!response.ok) {
                    var toast = Toast.makeText(response.status);
                    toast.show();
                }
                return response.json().then(function(json){
                   
                    var returnData = json;
                
                });
            }).catch(function (error) {
                var toast = Toast.makeText("Something bad happened: " + error);
                toast.show();
            });
            
        });
    }).catch(function (error) {
        var toast = Toast.makeText("Something bad happened: " + error);
        toast.show();
    });
}


function postPurchaseInvoice(customerData, item)
{
    var odata_URL = appSettings.getString("odataEndpoint");
    var basicAuthToken = appSettings.getString("basicAuthToken");
    
    if(!odata_URL.endsWith("/"))
    {
        odata_URL = odata_URL + "/Invoices?$orderby=InvoiceId desc&$top=1";
    } else
    {
        odata_URL = odata_URL + "Invoices?$orderby=InvoiceId desc&$top=1";
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
           
            var invoice = json.value;
            var max_invoiceId = invoice[0].InvoiceId;
            
            var postBody = {
                InvoiceId: max_invoiceId + 1,
                CustomerId: customerData.CustomerId,
                InvoiceDate: "2016-04-30T23:59:59.999+02:00",
                BillingAddress: customerData.Address,
                BillingCity: customerData.City,
                BillingState: customerData.State,
                BillingCountry: customerData.Country,
                BillingPostalCode: customerData.PostalCode,
                Total: item.UnitPrice
            };
            
            odata_URL = appSettings.getString("odataEndpoint");

            if(!odata_URL.endsWith("/"))
            {
                odata_URL = odata_URL + "/Invoices";
            } else
            {
                odata_URL = odata_URL + "Invoices";
            }

            var odata_headers = new Headers();
            odata_headers.append("Authorization", "Basic " + basicAuthToken);
            odata_headers.append("Content-Type", "application/json");
        
            var init = {
                method: 'POST',
                headers: odata_headers,
                body: JSON.stringify(postBody)
            }
        
            fetch(odata_URL, init).then(function (response) {
                if (!response.ok) {
                    var toast = Toast.makeText(response.status);
                    toast.show();
                }
                return response.json().then(function(json){
                   
                    var returnData = json;
                    postPurchaseInvoiceLine(item, returnData.InvoiceId)
                
                });
            }).catch(function (error) {
                var toast = Toast.makeText("Something bad happened: " + error);
                toast.show();
            });
            
        });
    }).catch(function (error) {
        var toast = Toast.makeText("Something bad happened: " + error);
        toast.show();
    });

}


function getCustomerData(item)
{
    var odata_URL = appSettings.getString("odataEndpoint");
    var basicAuthToken = appSettings.getString("basicAuthToken");
    
    if(!odata_URL.endsWith("/"))
    {
        odata_URL = odata_URL + "/Customers(CustomerId=59)";
    } else
    {
        odata_URL = odata_URL + "Customers(CustomerId=59)";
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
           
            var customerData = json;
            postPurchaseInvoice(customerData, item);
            
        });
    }).catch(function (error) {
        var toast = Toast.makeText("Something bad happened: " + error);
        toast.show();
    });
}

function buyTrack(args){

    var btn = args.object;
    var item = btn.bindingContext;
    dialogs.confirm({
        title: "Purchase Track",
        message: "Would you like to purchase the track \"" + item.Name + "\" for $" + item.UnitPrice + " ?",
        okButtonText: "Buy",
        cancelButtonText: "Cancel"
    }).then(function (result) {
        // result argument is boolean
        if(result ==true)
        {
            getCustomerData(item);
        }
    });

}


exports.onNavigatingTo = onNavigatingTo;
exports.onNavBtnTap = onNavBtnTap;
exports.buyTrack = buyTrack;
