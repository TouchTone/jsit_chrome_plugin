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
		newLink.innerHTML="Plugin"
		utilitiesLink.parentNode.insertBefore(newLink, utilitiesLink);
		utilitiesLink.parentNode.insertBefore(document.createElement('br'), utilitiesLink);
	}