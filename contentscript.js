
function uploadResponse(target, response)
{
	if (target === undefined)
	{
		return;
	}
	
    if (response == "success")
    {
        logourl = chrome.extension.getURL("logo_16_success.png");
        target.src = logourl;
    }
    else if  (response == "failure")
    {
        logourl = chrome.extension.getURL("logo_16_failure.png");
        target.src = logourl;
    }
    else
    {
        logourl = chrome.extension.getURL("logo_16.png");
        target.src = logourl;
    }
}

function sendURL(e)
{
    l = e.target.parentElement.previousElementSibling;
    url = l.href;

    logourl = chrome.extension.getURL("logo_16_pending.png");
    e.target.src = logourl;
	
	doSendURL(e.target, url);
}

function doSendURL(target, url)
{    
    if (getURLType(url) != "torrent")
    {
        console.log("Sending URL: " + url);
        chrome.runtime.sendMessage({type: "uploadURL", value: url, torrent: undefined}, uploadResponse.bind(undefined, target));
    }
    else 
    {
        // Need to get the torrent file in this context in the contentscript, will probably fail otherwise
        var http = new XMLHttpRequest();
		
		if (url.startsWith("torrent:"))
		{
			url = url.substring(8);
		}
        http.open(getURLMethod(url), url, true);
        http.responseType = 'blob';
        http.onreadystatechange = function() 
        {
            if(http.readyState == 4) 
            {
                if (http.status != 200)
                {
                    alert("Downloading torrent failed: " + http.status + "!");
                }
                else
                {
                    if (http.response.type == "text/html")
                    {
                        var reader = new window.FileReader();
                        reader.onloadend = function() 
                        {
                            if (reader.result.length > 400)
                            {
                                alert("Got unexpected long HTML response (" + reader.result.length + " bytes)!");
                            }
                            else
                            {
                                alert("Got unexpected HTML response: " + reader.result + "!");
                            }
                        };                
                        reader.readAsText(http.response);                            
                    }
                    else
                    {
                        var reader = new window.FileReader();
                        reader.onloadend = function() 
                        {
                            chrome.runtime.sendMessage({type: "uploadURL", value: url, torrent: reader.result}, 
                                                       uploadResponse.bind(undefined, target));
                        };                
                        reader.readAsDataURL(http.response);     
                    }
               }
            };
         };

        http.send();
     }
}


function do_add_buttons()
{
    var links = document.getElementsByTagName('a');

    for(var i=0; i<links.length; i++) 
    {
        l = links[i];
        url = l.href;

        if (getURLType(url) != "No")
        {
            var jsl = document.createElement("span");
            jsl.setAttribute("class", "jsit");
            logourl = chrome.extension.getURL("logo_16.png");
            jsl.innerHTML = "<img src='" + logourl + "' title='Upload to JSIT'/>";

            l.parentNode.insertBefore(jsl, l.nextSibling);

            jsl.addEventListener("click", sendURL, false);
        }
    }
}

var have_localpatterns = false;
if (have_localpatterns)
{
    do_add_buttons();
}

// Get local patterns
chrome.runtime.sendMessage({type: "getLocalPatterns"}, function (response)
    {
        url_patterns = url_patterns.concat(response.localpatterns);
        
        have_localpatterns = true;
        
        do_add_buttons();
    });

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //console.log(sender.tab ?
    //            "from a content script:" + sender.tab.url :
    //            "from the extension");
    if (request.type == "readdButtons")
    {
        do_add_buttons();
    }
    else if (request.type == "addPattern")
    {
        if (request.pattern instanceof Array)
        {
            url_patterns = url_patterns.concat(request.pattern);
        }
        else
        {
            url_patterns.push(request.pattern);
        }
        
        do_add_buttons();
    }
    else if (request.type == "sendURL")
    {        
        doSendURL(undefined, request.url);
    }
});
