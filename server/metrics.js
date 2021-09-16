const settings = require('./settings.json');

const fs = require('fs'); // File System

var mk = {}; //Melonking.Net Master object
mk.metrics = {};
mk.metrics.hits = 0;
mk.metrics.pages = [];
mk.metrics.lastReset = 0;

// Load the saved cache file
fs.readFile(settings.metricsPath, (err, data) => {
    if(err) { console.log(err); return; }
    mk.metrics = JSON.parse(data);
});

function getMetricsHTML()
{
    var txt = '<html><head><title>Melo-Tek Brain</title></head><body>'

    txt += '<h1>Melo-Tek Brain - ONLINE</h1>'
    txt += '<p>Hits since: <strong>' + new Date(mk.metrics.lastReset*1000).toString() + '</strong></p>';
    txt += '<p>Total hits: <strong>' + mk.metrics.hits + '</strong></p>';
    txt += '<table><tr><th>Page</th><th>Hits</th></tr>'
    
    mk.metrics.pages.sort((a, b) => parseFloat(b.hits) - parseFloat(a.hits)); // Sort results
    
    for( var i=0 ; i<mk.metrics.pages.length ; i++ )
    {
        var page = mk.metrics.pages[i];
        txt += '<tr>';
        txt += '<td>' + page.title + '</td>';
        txt += '<td>' + page.hits + '</td>';
        txt += '</tr>';
    }

    txt += '</table>';
    txt += '</body></html>';
    
    return txt;
}

function doAHit( page )
{
    if(page == undefined) { res.send("Melo-Tek Internal Hit Service - ONLINE"); return; }
    if(page == 'RESET-' + settings.adminPassword)
    {
        mk.metrics = {};
        mk.metrics.hits = 0;
        mk.metrics.pages = [];
        mk.metrics.lastReset = Math.floor(Date.now() / 1000); // Unix date code.
        var jsonMetrics = JSON.stringify(mk.metrics); 
        fs.writeFile(settings.metricsPath, jsonMetrics, function (err) {});
        return "RESET DONE";
    }
    
    page = page.replace(/[^\w\s]/gi, ''); // Fix for bored security researchers :P

    var hitDate = new Date(); 
    mk.metrics.hits++;
    var hitTitle = page;

    //Find the page data
    var index = -1;
    for( var i=0 ; i<mk.metrics.pages.length ; i++ )
    {
        if( mk.metrics.pages[i].title == hitTitle ) { index = i; break; }
    }

    //Make new page if none exists
    if( index === -1 ) 
    { 
        var page = {};
        page.title = hitTitle; 
        page.hits = 0; 
        index = mk.metrics.pages.push(page) - 1;
    }

    //Update data
    mk.metrics.pages[index].hits++;
    mk.metrics.pages[index].lastHit = hitDate.getTime();

    var jsonMetrics = JSON.stringify(mk.metrics); 
    fs.writeFile(settings.metricsPath, jsonMetrics, function (err) {});

    return "OK";
}

module.exports = {
    getHTML: function() {
        return getMetricsHTML();
    }, 
    doAHit: function(page) {
        return doAHit(page);
    }
}