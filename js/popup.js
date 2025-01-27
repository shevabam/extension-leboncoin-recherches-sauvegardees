document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var currentTab = tabs[0];
        var currentTabUrl = currentTab.url;


        // Searches list
        showSearches();

        // Filter on search name
        if (document.querySelector('input#filter'))
            document.querySelector('input#filter').addEventListener("input", filterList);

        
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
                var div_savedSearches = doc.querySelectorAll("#mainContent [data-test-id='saved-search']");
                if (div_savedSearches.length == 0) {
                    notif('lbc-saved-searches-no-result', 'warning', "Mes Recherches Sauvegardées Leboncoin", "Avez-vous des recherches sauvegardées ?");
                    return;
                }

    
                var getElements = doc.querySelectorAll("#mainContent [data-test-id='saved-search']");
    
                var listSavedSearches = [];

                if (getElements.length > 0) {

                    getElements.forEach((element) => {
                        var element_title = null;
                        var element_url = null;
    
                        var element_url = element.querySelector("[data-test-id='saved-search'] a");
                        var element_title = element.querySelector("[data-test-id='saved-search'] a div.flex p.text-headline-2");
                        
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

