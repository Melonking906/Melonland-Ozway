const settings = require('./settings.json');

const fs = require('fs'); // File System

var mk = {}; //Melonking.Net Master object
mk.metrics = {};
mk.metrics.hits = 0;
mk.metrics.pages = [];

//Read in JSON Metrics
fs.readFile('./metrics.json', (err, data) => {
    if(err)
    { 
        console.log(err);
        return; 
    }
    mk.metrics = JSON.parse(data);
});

function getMetricsHTML()
{
    var txt = '<html><head><title>Melo-Tek Brain</title></head><body>'

    txt += '<h1>Melo-Tek Brain - ONLINE</h1>'
    txt += '<table><tr><th>Page</th><th>Hits</th></tr>'

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
    if(page == "RESET")
    {
        mk.metrics = {};
        mk.metrics.hits = 0;
        mk.metrics.pages = [];
        var jsonMetrics = JSON.stringify(mk.metrics); 
        fs.writeFile("../metrics.json", jsonMetrics, function (err) {});
        return "RESET DONE";
    }

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
    fs.writeFile("./metrics.json", jsonMetrics, function (err) {});

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