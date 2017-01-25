
// Helpers 

// From http://stackoverflow.com/questions/3431512/javascript-equivalent-to-phps-urldecode
function urldecode (str) {
  return decodeURIComponent((str + '').replace(/\+/g, '%20'));
}

// From http://stackoverflow.com/questions/12168909/blob-from-dataurl
function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;
}


	//from http://snipplr.com/view/14074/
 
 String.prototype.between = function(prefix, suffix) {
  s = this;
  var i = s.indexOf(prefix);
  if (i >= 0) {
    s = s.substring(i + prefix.length);
  }
  else {
    return '';
  }
  if (suffix) {
    i = s.indexOf(suffix);
    if (i >= 0) {
      s = s.substring(0, i);
    }
    else {
      return '';
    }
  }
  return s;
}


// State Vars

var api_key;
var localpatterns = [];

chrome.storage.sync.get('apikey', function (result) { 
    api_key = result.apikey; 
});

chrome.storage.sync.get('localpatterns', function (result) { 
    if (result.localpatterns == undefined)
    {
        return;
    }
    
    localpatterns = result.localpatterns; 
    
    url_patterns = url_patterns.concat(localpatterns);
});

// Actions

function send_form(url, formData, sendResponse)
{
    console.log("Uploading " + formData + " to JSIT...");
    
    var http = new XMLHttpRequest();    
    http.open("POST", url, true);

    http.onreadystatechange = function() {
        if(http.readyState === XMLHttpRequest.DONE)
        {
            if(http.status === 200)
            {
                resp = http.responseXML;
                s = resp.getElementsByTagName("status")[0].innerHTML;
                
                if ( s != "SUCCESS" )
                {
                    m = urldecode(resp.getElementsByTagName("message")[0].innerHTML);
                    alert("Torrent upload failed!\n"+ m);
                    sendResponse("failure");
                }
                else
                {
                    sendResponse("success");          
                }
            }
            else
            {
                alert("Torrent upload failed!\nIssue with connection/server");
                sendResponse("failure");
            }
        }
    };

    http.send(formData);
}

function upload_url(url, torrent, sendResponse)
{
    if (typeof api_key == 'undefined' || api_key == "") //if no key is defined
    {
		var xmlhttp = new XMLHttpRequest(); //We try to autodetect the API key
		xmlhttp.open("GET", "https://justseed.it/options/index.csp", false);
		xmlhttp.send();
		
		if(xmlhttp.responseText.between('name="api_key" value="','" />') && confirm("You didn't set your API key, but we detected you are logged in. Use "+xmlhttp.responseText.between('font-weight: bold;">\n \n ',"&nbsp;<span")+"'s API key ?")){ //if an api key is detected AND  the user wants to use it
			api_key = xmlhttp.responseText.between('name="api_key" value="','" />');
			chrome.storage.sync.set({"apikey" : api_key }); //we set the new API key
	   }
	   else {
					alert("Please set your api_key before trying to upload torrents!\n\nYou will be redirected to the option page.");
					chrome.tabs.create({ url: chrome.extension.getURL("options.html") });
					sendResponse("ignore");
					return;
	   }

    }
        
    var url_type = getURLType(url);

    if (url_type == "No")
    {
        alert(url + " is not a recognized torrent link!");
        sendResponse("ignore");
        return;
    }
    
    var apiurl = "https://api.justseed.it/torrent/add.csp";
    
    var formData = new FormData();
    formData.append("api_key", api_key );
    
    if (url_type == "magnet")
    {
        formData.append("url", url );
    }
    else if (url_type == "hash")
    {
        formData.append("info_hash", url );
    }
    else if (url_type == "torrent")
    {
        // Decode torrent file data
        tblob = dataURItoBlob(torrent);
        formData.append("torrent_file", tblob );
    }   
    
    send_form(apiurl, formData, sendResponse);
}

function dummy(arg)
{
}


function upload(info, tab)
{
    url = info.linkUrl;

    var url_type = getURLType(url);

    if (url_type == "No")
    {
        url = "torrent:" + url;
    }
    
	chrome.tabs.sendMessage(tab.id, {type: "sendURL", url: url}); 
}


// Pattern learning

var learnUrls = [];

var part_types = { NUM : 0, HEX : 1, ALPHA : 2, ALNUM : 3, GENERAL : 4 };
var part_res   = [ "[0-9]+", "[0-9A-Fa-f]+", "[A-Za-z]+", "[0-9A-Za-z]+", ".+" ];

function url_tokenize(url)
{
    var parts = [];
    var types = [];
    var seps = [];

    var a = document.createElement('a');
    a.href = url;
    
    // Initialize with hostname
    parts.push(a.hostname);
    types.push(part_types.ALNUM);
    seps.push('/');
    
    var b = (a.pathname + a.search).substring(1);
    var bi = 0;
    var p = b.split(/[/?=+]/);
    
    for (var i = 0; i < p.length; ++i)
    {
        var pi = p[i];
        parts.push(pi);
        bi += pi.length + 1;
        
        seps.push(b[bi - 1]);
        
        if (pi.match(/^[0-9]+$/))
        {
            types.push(part_types.NUM);
        }
        else if (pi.match(/^[0-9A-Fa-f]+$/))
        {
            types.push(part_types.HEX);
        }
        else if (pi.match(/^[A-Za-z]+$/))
        {
            types.push(part_types.ALPHA);
        }
        else if (pi.match(/^[0-9A-Za-z]+$/))
        {
            types.push(part_types.ALNUM);
        }
        else
        {
            types.push(part_types.GENERAL);
        }
    }
    
    return { "parts" : parts, "types" : types, "seps" : seps };
}

function learn(info, tab)
{
    url = info.linkUrl;
    learnUrls.push(url);
    
    if (learnUrls.length < 2)
    {        
        return
    }
    console.log("Got learn urls:" + learnUrls);
    
    // Got enough, try to find pattern
    var pp = [];
    for (var i = 0; i < learnUrls.length ; i++)
    {
        pp.push(url_tokenize(learnUrls[i]));
    }
     
    // Same host?
    if (pp[0].parts[0] != pp[1].parts[0])
    {
        alert("Can't find pattern for different sites (" + pp[0].parts[0] + " vs. " + pp[1].parts[0] + "!");
        return;
    }
    
    // Same number of parts?
    if (pp[0].parts.length != pp[1].parts.length)
    {
        alert("Found different number of parts (" + learnUrls[0] + "=" + pp[0].parts.length + " vs. " + pp[1].parts[0] + "=" + pp[1].parts.length + "!");
        return;
    }
    
    // Find common prefix
    pref = "/"
    for (var i = 1; i < pp[0].parts.length; i++)
    {
        if (pp[0].parts[i] == pp[1].parts[i])
        {
            pref += pp[0].parts[i];
            
            if (pp[0].seps[i] == pp[1].seps[i])
            {
                pref += pp[0].seps[i];
            }
            else
            {
                alert("Separators after part " + i + "(" + pp[0].parts[i] + ") are different: " + pp[0].seps[i] + " vs. " + pp[1].seps[i] + "!");
                return;
            }
            continue;
        }
    
        // Escape regex-relevant chars
        pref = pref.replace('\\', '\\\\');
        pref = pref.replace('.', '\\.');
        pref = pref.replace('?', '\\?');
       
        // Add RE for first differing part
        pref += part_res[Math.max(pp[0].types[i], pp[1].types[i])];
        
        // and abort, hopefully this is enough
        break;
    }
    
    if (url_patterns.indexOf(pref) > -1)
    {
        alert("Found pattern " + pref + "\nwhich already exists, ignored.");
    }
    else if (confirm("Found pattern " + pref + "\nDo you want to add it?") == true) 
    {
        localpatterns.push(pref);
        chrome.storage.sync.set({"localpatterns" : localpatterns });
        
        url_patterns.push(pref);
        chrome.tabs.sendMessage(tab.id, {type: "addPattern", pattern: pref}); 
    }
    
    learnUrls = [];
    
    return;
}


// Initialization

chrome.contextMenus.removeAll();
cm_upload = chrome.contextMenus.create({
		"id": "jsit_upload",
		"title": "Upload to JSIT", 
		"contexts": ["link"]
});
cm_learn = chrome.contextMenus.create({
		"id": "jsit_learn",
		"title": "Learn pattern", 
		"contexts": ["link"]
});
cm_readd = chrome.contextMenus.create({
		"id": "jsit_readd",
		"title": "Re-add buttons", 
		"contexts": ["page"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	switch(info.menuItemId) {
		case "jsit_readd":
			chrome.tabs.sendMessage(tab.id, {type: "readdButtons"});
			break;
		case "jsit_learn":
			learn(info, tab);
			break;
		case "jsit_upload":
			upload(info, tab);
			break;
	}
});

// Message listener

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //console.log(sender.tab ?
    //            "from a content script:" + sender.tab.url :
    //            "from the extension");
    if (request.type == "getApiKey")
    {
        sendResponse({apikey: api_key});
    }
    else if (request.type == "setApiKey")
    {
        api_key = request.value;
        chrome.storage.sync.set({"apikey" : api_key });
    }
    else if (request.type == "uploadURL")
    {
        var url = request.value;
        var torrent = request.torrent;
        upload_url(url, torrent, sendResponse);
            
        return true;
    }
    else if (request.type == "getLocalPatterns")
    {
        sendResponse({"localpatterns": localpatterns});
    }
 
  });
