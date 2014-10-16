
// From http://stackoverflow.com/questions/646628/how-to-check-if-a-string-startswith-another-string
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}
if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(-str.length) == str;
  };
}

// helper to check if a url is a torrent url
var url_patterns = [    "/download/file.php\\?id=",
                        "/download.php\\?torrent=",
                        "/torrents?/download/",
                        "/torrents/[0-9]*/file",
                        "/torrents.php\\?action=download",
                        "/download.php\\?id=",
                        "/download.php/.*torrent",
                        "/\\?page=download&tid=",
                        "/torrent/[0-9a-fA-F]{40}.torrent.*",
                        "/download/[0-9]*/[0-9a-fA-F]{40}$",
                        "/forum/dl\.php\?t=[0-9]+",
                        "/attachments/.*-torrent\.[0-9]+/"
                    ];

// Patterns for urls that match torrent url, but are not torrents (some trackers have funny page names)
var exclude_patterns = [ "extratorrent\.cc/torrent_download/"
                       ];


// Patterns for urls that need to be received via POST instead of GET. Some trackers...
var post_patterns = [  "pornolab\.net"
                    ];
                    

function findInREList(text, list)
{
    var n = list.length;
    for (var i = 0; i < n; i++)
    {
        if (text.search(list[i]) != -1)
        {
            return true;
        }
    }
    return false;
}
                    
function getURLType(url)
{
    type = "No";
	
    if (url.startsWith("magnet:"))
    {
        type = "magnet";
    }
    else if (url.startsWith("torrent:"))
    {
        type = "torrent";
    }
    else if (url.match("/^[0-9a-fA-F]{40}$/"))
    {
        type = "hash";
    }    
    else if (url.endsWith(".torrent") || findInREList(url, url_patterns))
    {
		if (! findInREList(url, exclude_patterns))
		{
			type = "torrent";
		}
    }
     
    return type;
}

function getURLMethod(url)
{
    if (findInREList(url, post_patterns))
    {
        return "POST";
    }
    
    return "GET";
}



function do_add_single_button(l, url)
{
    var jsl = document.createElement("span");
    jsl.setAttribute("class", "jsit");
    logourl = chrome.extension.getURL("logo_16.png");
    jsl.innerHTML = "<img width='16' height='16' src='" + logourl + "' title='Upload to JSIT'/>";

    l.parentNode.insertBefore(jsl, l.nextSibling);
    //l.className = l.className;
    
    // See if icon is outside of visible area, move it then if it is             
    var lrect = l.getBoundingClientRect();
    var prect = l.parentElement.getBoundingClientRect();
    var jrect = jsl.getBoundingClientRect();

    var st = "";
    
    // Is icon is outside of parent's visible area? Move it inside if it is             
    var offset = jrect.left - prect.right + 17;
    if (offset > 0)
    {
        st += "left: -" + offset + "px; ";
    }
   
    var offset = jrect.top - prect.bottom + 17;
    if (offset > 0)
    {
        st += "top: -" + offset + "px; ";
    }

    
    // Are we far away from original link (maybe line break)? Adjust and move us close.
    var maxdist = 10;
    // Disabled for now, not working well.
    if (0==1 && st == "" && (jrect.left > lrect.right + maxdist || jrect.right < lrect.left - maxdist ||
                     jrect.top > lrect.bottom + maxdist || jrect.bottom < lrect.top - maxdist))
    {
        st = "position: absolute; left: " + (lrect.right - 17) + "; top: " + (lrect.bottom - 17) + ";";
    }
    
    
    if (st != "")
    {
        jsl.setAttribute("style", st);
    }
    jsl.addEventListener("click", sendURL, false);
    jsl.url = url;
}
