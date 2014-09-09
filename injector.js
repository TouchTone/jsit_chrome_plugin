// Site-specific startup

// TVTorrents.com
// Need to run as injected code, needs access to script sources and link.onclick...

function doAddTVTButtons()
{
    var lts    = loadTorrent.toString();
    var hash   = lts.substr(lts.indexOf("hash='") + 6,40);
    var digest = lts.substr(lts.indexOf("digest='") + 8,40);
    
    // Check the links, these are on the list page...
    var links = document.getElementsByTagName('a');
   
    for(var i=0; i<links.length; i++) 
    {
        var l = links[i];
        var url = l.href;

        if (l.onclick != null && l.onclick.toString().indexOf("loadTorrent") > -1)
        {
            infoHash = l.onclick.toString();
            infoHash = infoHash.substr(infoHash.indexOf("('") + 2, 40);
            
            url = 'torrent:http://torrent.tvtorrents.com/FetchTorrentServlet?info_hash='+infoHash+'&digest='+digest+'&hash='+hash;

            var id = "id_" + infoHash;
            l.id = id;
            
            window.postMessage({ type: 'addButton', id: id, url: url}, '*' /* targetOrigin: any */);
        }
    }
    
    // ... while on the individual pages they are buttons.
    var inputs = document.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; ++i) 
    {
        var ii = inputs[i];
        
        if (ii.value.indexOf("GET TORRENT") > -1)
        {
            infoHash = ii.onclick.toString();
            infoHash = infoHash.substr(infoHash.indexOf("('") + 2, 40);
            
            url = 'torrent:http://torrent.tvtorrents.com/FetchTorrentServlet?info_hash='+infoHash+'&digest='+digest+'&hash='+hash;

            var id = "id_" + infoHash;
            ii.id = id;
            
            window.postMessage({ type: 'addButton', id: id, url: url}, '*' /* targetOrigin: any */);          
        }
    }
 }

// TVTorrents.com
// Need to run as injected code, needs access to script sources and link.onclick...
if (document.URL.indexOf("tvtorrents.com") > -1)
{
    doAddTVTButtons();
}

// From injected scripts
window.addEventListener('message', function(request) {
    if (! request.data.hasOwnProperty("type"))
    {
        return;
    }
    
    if (request.data.type == "readdButtons")
    {
        doAddTVTButtons();
    }
    else if (request.data.type == "addButton")
    {
    }
    else
    {
        console.log("Got unknown message " + request.toString());
    }
});

