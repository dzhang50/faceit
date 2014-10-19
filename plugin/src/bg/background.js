// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

/*
//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
});
  */


function onWebNav() {
	console.log("Changed!");
	//Inject script again to the current active tab
	chrome.tabs.executeScript({ file: "js/jquery/jquery-2.1.1.min.js" }, function() {
		chrome.tabs.executeScript({
            file: "js/parse/parse-1.3.0.asdfmin.js"
        }, function () {
            
			chrome.tabs.executeScript({
				file: "src/inject/inject.js"
			}, function () {
				console.log("Injection is Completed");
			});
        });
  });
        
}

/*
chrome.runtime.onConnect.addListener(function(port) {
	console.assert(port.name == "Alerts");
	port.onMessage.addListener(function(msg) {
		if (msg.alert == "Wake up!") {
			port.postMessage({ack: "I'm awake!"});
		}
	});
});
*/

var filter = {
    url: [{
        hostSuffix: 'facebook.com'
    }]
};

//chrome.webNavigation.onCommitted.addListener(onWebNav, filter);
//chrome.webNavigation.onHistoryStateUpdated.addListener(onWebNav, filter);  

console.log("Completed!");
