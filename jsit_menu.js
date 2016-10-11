  var utilitiesLink;
  
  var allLinks = document.getElementsByTagName('a');
  for (var key in allLinks)
  {
    if (!isNaN(parseInt(key)) && allLinks[key].getAttribute("href") === "/utilities/index.csp")
    {
	utilitiesLink = allLinks[key];
    }
  }
  
  if(utilitiesLink) {
		var newLink = document.createElement('a');
		newLink.href=chrome.extension.getURL("options.html");
		newLink.target="_blank"
		newLink.innerHTML="Uploader"
		utilitiesLink.parentNode.insertBefore(newLink, utilitiesLink);

		var newBreak = document.createElement('br');
		utilitiesLink.parentNode.insertBefore(newBreak, utilitiesLink);
	}
