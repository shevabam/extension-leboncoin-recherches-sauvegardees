document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var currentTab = tabs[0];
        var currentTabUrl = currentTab.url;


        // Searches list
        showSearches();

        // Filter on search name
        if (document.querySelector('input#filter'))
            document.querySelector('input#filter').addEventListener("input", filterList);

        
        // Rate button
        const rateButton = document.getElementById('lbc-saved-searches__rate-button');
        if (rateButton) {
            rateButton.addEventListener('click', () => {
                const isEdge = navigator.userAgent.includes('Edg/');
                const extensionId = chrome.runtime.id;
                const webStoreUrl = isEdge
                    ? `https://microsoftedge.microsoft.com/addons/detail/${extensionId}`
                    : `https://chromewebstore.google.com/detail/${extensionId}/reviews`;

                chrome.tabs.create({ url: webStoreUrl });
            });
        }

        // Update button
        var updateBtn = document.querySelector('button.lbc-saved-searches__maj');
    
        updateBtn.addEventListener("click", function() {

            chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                function: function() {
                    return document.documentElement.outerHTML;
                }
            }, function(result) {

                if (!result || !parseUrl(currentTabUrl).host.includes('leboncoin.fr')) {
                    notif('lbc-saved-searches-error', 'error', "Mes Recherches Sauvegardées Leboncoin", "Vous devez vous rendre sur la page de vos recherches sur leboncoin.fr !");

                    return;
                }

                var pageSource = result[0].result;
    
                var parser = new DOMParser();
                var doc = parser.parseFromString(pageSource, 'text/html');

                // Test si connecté
                var div_savedSearches = doc.querySelectorAll("#mainContent ul[class^='my-searches'] li");
                if (div_savedSearches.length == 0) {
                    notif('lbc-saved-searches-no-result', 'warning', "Mes Recherches Sauvegardées Leboncoin", "Avez-vous des recherches sauvegardées ?");
                    return;
                }

    
                var getElements = doc.querySelectorAll("#mainContent ul[class^='my-searches'] li");
    
                var listSavedSearches = [];

                if (getElements.length > 0) {

                    getElements.forEach((element) => {
                        var element_title = null;
                        var element_url = null;
    
                        var element_url = element.querySelector("article > a");
                        var element_title = element.querySelector("article p.text-headline-2[id^='name-']");
                        
                        if (element_title != null && element_url != null) {
                            listSavedSearches.push({
                                title: element_title.innerHTML, 
                                url: element_url.getAttribute("href")
                            });
                        }
                    });
                    
                }
    
                
                // Insertion des recherches + date maj dans le localStorage
                // console.log(listSavedSearches);
                store(JSON.stringify(listSavedSearches));

    
                // Notification success
                notif('lbc-saved-searches-update', 'success', "Mes Recherches Sauvegardées Leboncoin", "Recherches mises à jour !");

                // Update searches list
                showSearches();
                

            });
    
        });
        


    });
});

