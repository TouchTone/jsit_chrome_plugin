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
		newLink.className="navigation"
		newLink.innerHTML="plugin"
		utilitiesLink.parentNode.insertBefore(newLink, utilitiesLink);

		var newDivider = document.createElement('span');
		newDivider.style.color="#6ca5d0";
		newDivider.innerHTML="&nbsp;|&nbsp;";
		utilitiesLink.parentNode.insertBefore(newDivider, utilitiesLink);
	}