

/**
 * Get searches list in localStorage and prints in popup
 */
function showSearches() {
    
    var getLastUpdate = localStorage.getItem('last_update');
    if (getLastUpdate && getLastUpdate != '') {
        var dateFormatee = formatDate(new Date(getLastUpdate));

        document.querySelector('.lbc-saved-searches__last-update').innerHTML = `Dernière mise à jour le ${dateFormatee}`;
    }

    var getSavedSearches = JSON.parse(localStorage.getItem('searches'));
    if (!getSavedSearches || getSavedSearches.length == 0) {
        render('<div class="alert alert-info">Vous n\'avez récupéré aucune recherche sauvegardée Leboncoin</div>');
    } else {

        var html = '';

        if (getSavedSearches.length > 5)
            html += '<div class="filter-container"><input type="search" id="filter" placeholder="Filtrer..."></div>'

        html += '<ul>';

        getSavedSearches.forEach((search) => {

            html += '<li><span class="saved-search-title"><a href="https://www.leboncoin.fr'+search.url+'" target="_newtab">'+search.title+'</a></span></li>';

        });

        html += '</ul>';

        render(html);
    }

}


/**
 * Insert HTML to div
 */
function render(content) {
    document.getElementById('saved-searches').innerHTML = content;
}


/**
 * Filter on search name
 */
function filterList() {
    let list_items = document.querySelector('#saved-searches ul').getElementsByTagName('li');

    for (var i = 0; i < list_items.length; i++) {
        let item_text = list_items[i].textContent || list_items[i].innerText;

        if (item_text.toUpperCase().indexOf(document.querySelector('input#filter').value.toUpperCase()) > -1) {
            list_items[i].style.display = '';
        }
        else {
            list_items[i].style.display = 'none';
        }
    }
}


/**
 * Format date to dd/mm/aaaa à hh:ii
 */
function formatDate(date) {
    var day = date.getDate().toString().padStart(2, '0');
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var year = date.getFullYear();
    var hours = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
  
    var dateFormat = `${day}/${month}/${year} à ${hours}:${minutes}`;
    return dateFormat;
}


/**
 * Store items in localStorage
 */
function store(searches) {
    localStorage.setItem('searches', searches);
    localStorage.setItem('last_update', new Date());
}

/**
 * Execute notification
 */
function notif(id, type, title, msg) {
    chrome.notifications.create(id, {
        type: "basic",
        title: title,
        message: msg,
        iconUrl: "img/notif_"+type+".png"
    });
}

/*
 * Parse an URL to return host, protocol, ...
 */
function parseUrl(url) {
    return new URL(url);
}