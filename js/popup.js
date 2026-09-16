/**
 * Exécutée dans le contexte de la page (leboncoin.fr) : lit le token
 * d'authentification stocké par le site lui-même et appelle leur API interne
 * pour récupérer les recherches sauvegardées. L'URL de chaque recherche
 * est retrouvée dans le DOM via un attribut stable, car l'API ne fournit pas
 * d'URL directement utilisable.
 */
async function fetchSavedSearches() {
    try {
        var token = window.localStorage.getItem('luat');
        if (!token) {
            return { error: 'not_logged_in' };
        }

        var response = await fetch('https://api.leboncoin.fr/api/mysearch/v1/searches', {
            headers: {
                'accept': 'application/json',
                'authorization': 'Bearer ' + token
            },
            method: 'GET',
            mode: 'cors',
            credentials: 'include'
        });

        if (response.status === 401 || response.status === 403) {
            return { error: 'not_logged_in' };
        }

        if (!response.ok) {
            return { error: 'http_' + response.status };
        }

        var searches = await response.json();

        var results = searches.map(function(search) {
            var article = document.querySelector('#mainContent ul li article[aria-labelledby="name-' + search.id + '"]');
            var link = article ? article.querySelector('a[href]') : null;

            return {
                title: search.name,
                url: link ? link.getAttribute('href') : '/my-searches'
            };
        });

        return { searches: results };

    } catch (e) {
        return { error: e.message };
    }
}


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

            var tabUrl = parseUrl(currentTabUrl);
            if (!tabUrl.host.includes('leboncoin.fr') || !tabUrl.pathname.includes('my-searches')) {
                notif('lbc-saved-searches-error', 'error', "Mes Recherches Sauvegardées Leboncoin", "Vous devez vous rendre sur la page de vos recherches sur leboncoin.fr !");
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                world: 'MAIN',
                function: fetchSavedSearches
            }, function(injectionResults) {

                var data = injectionResults && injectionResults[0] ? injectionResults[0].result : null;

                if (!data || data.error === 'not_logged_in') {
                    notif('lbc-saved-searches-error', 'error', "Mes Recherches Sauvegardées Leboncoin", "Vous devez être connecté à Leboncoin !");
                    return;
                }

                if (data.error) {
                    notif('lbc-saved-searches-error', 'error', "Mes Recherches Sauvegardées Leboncoin", "Erreur lors de la récupération de vos recherches (" + data.error + ").");
                    return;
                }

                if (data.searches.length == 0) {
                    notif('lbc-saved-searches-no-result', 'warning', "Mes Recherches Sauvegardées Leboncoin", "Avez-vous des recherches sauvegardées ?");
                    return;
                }

                // Insertion des recherches + date maj dans le localStorage
                store(JSON.stringify(data.searches));

                // Notification success
                notif('lbc-saved-searches-update', 'success', "Mes Recherches Sauvegardées Leboncoin", "Recherches mises à jour !");

                // Update searches list
                showSearches();

            });

        });
        


    });
});

