
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

function getURLType(url)
{
    var patterns = [    "/download/file.php\\?id=",
                        "/download.php\\?torrent=",
                        "/torrents?/download/",
                        "/torrents/[0-9]*/file",
                        "/torrents.php\\?action=download",
                        "/download.php\\?id=",
                        "/download.php/.*torrent",
                        "/\\?page=download&tid="
                    ];
                        

    if (url.startsWith("magnet:"))
    {
        return "magnet";
    }
    else if (url.match("/^[0-9a-fA-F]{40}$/"))
    {
        return "hash";
    }    
    else if (url.endsWith(".torrent"))
    {
        return "torrent";
    }
    
    var n = patterns.length;
    for (var i = 0; i < n; i++)
    {
        if (url.search(patterns[i]) != -1)
        {
            return "torrent";
        }
    }
    
    return "No";
}
