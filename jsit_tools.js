
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

http://torcache.net/torrent/04A8C73349E0FE148557C3A9BA8482E0AA67AD49.torrent?title=[kickass.to]captain.america.the.winter.soldier.2014.1080p.brrip.x264.yify

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
                        "/forum/dl\.php\?t=[0-9]+" 
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
