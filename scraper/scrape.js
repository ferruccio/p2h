var page = require('./webpage-diag.js').create({
    load: pageLoaded
});

function pageLoaded(success) {
    if (success) {
        page.evaluate(function() {
            $('html')
                .on('pdf:docloaded', function(event) {
                    window.callPhantom({ action: 'finished' });
                })
                .on('pdf:pageloaded', function(event, pageIndex) {
                    var el = document.getElementById('page-index-' + pageIndex);
                    var style = el.getAttribute('style') || '';
                    var div = '<div class="page" style="' + style + '">\n';
                    window.callPhantom({
                        action: 'page',
                        pageIndex: pageIndex,
                        html: div + el.innerHTML + '</div>\n'
                    });
                })

        });
    }
}

function writePage(pageIndex, html) {
    var fs = require('fs');
    var css = '<link href="viewer.css" rel="stylesheet" />';
    var head = '<head>' + css + '</head>\n';
    var content = '<!DOCTYPE html>\n<html>\n' + head + '<body>\n' + html + '\n</body>\n</html>\n';
    fs.write('data/page-' + (pageIndex + 1) + '.html', content, 'w');
}

page.onCallback = function(cb) {
    switch (cb.action) {
        case 'finished':
            phantom.exit();

        case 'page':
            console.log('page: ' + cb.pageIndex);
            writePage(cb.pageIndex, cb.html);
            break;

        default:
            console.log('page.onCallback: unknown action received (' + cb.action + ')');
            phantom.exit();
    }
};

page.open('http://localhost:8080/pdf/tracemonkey.pdf');
