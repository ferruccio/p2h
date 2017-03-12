var page = require('webpage').create();
var fs = require('fs');
var system = require('system');

function finishLoad(status) {
    if (status === "success") {
        page.evaluate(function() {
            var $ = $ || function() { window.callPhantom({ action: 'panic' }); };
            $('html')
                .on('pdf:docloaded', function(event) {
                    window.callPhantom({ action: 'finished' });
                })
                .on('pdf:pageloaded', function(event, pageIndex) {
                    window.callPhantom({
                        action: 'page',
                        pageIndex: pageIndex,
                        html: $('#page-index-' + pageIndex).html().replace('\\','')
                    });
                })

        });
    }
}

function writePage(pageIndex, html) {
    var css = '<link href="viewer.css" rel="stylesheet" />';
    var head = '<head>' + css + '</head>\n';
    var content = '<doctype html>\n<html>\n' + head + '<body>\n' + html + '\n</body>\n</html>\n';
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

page.onConsoleMessage = function(msg, lineNum, sourceId) {
    if (typeof lineNum === 'undefined') {
        console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
    } else {
        console.log('CONSOLE: ' + msg);
    }
};

page.onResourceRequested = function (request) {
    system.stderr.writeLine('= onResourceRequested()');
    system.stderr.writeLine('  request: ' + JSON.stringify(request, undefined, 4));
};
 
page.onResourceReceived = function(response) {
    system.stderr.writeLine('= onResourceReceived()' );
    system.stderr.writeLine('  id: ' + response.id + ', stage: "' + response.stage + '", response: ' + JSON.stringify(response));
};
 
page.onLoadStarted = function() {
    system.stderr.writeLine('= onLoadStarted()');
    var currentUrl = page.evaluate(function() {
        return window.location.href;
    });
    system.stderr.writeLine('  leaving url: ' + currentUrl);
};
 
page.onLoadFinished = function(status) {
    system.stderr.writeLine('= onLoadFinished()');
    system.stderr.writeLine('  status: ' + status);
    finishLoad(status);
};
 
page.onNavigationRequested = function(url, type, willNavigate, main) {
    system.stderr.writeLine('= onNavigationRequested');
    system.stderr.writeLine('  destination_url: ' + url);
    system.stderr.writeLine('  type (cause): ' + type);
    system.stderr.writeLine('  will navigate: ' + willNavigate);
    system.stderr.writeLine('  from page\'s main frame: ' + main);
};
 
page.onResourceError = function(resourceError) {
    system.stderr.writeLine('= onResourceError()');
    system.stderr.writeLine('  - unable to load url: "' + resourceError.url + '"');
    system.stderr.writeLine('  - error code: ' + resourceError.errorCode + ', description: ' + resourceError.errorString );
};
 
page.onError = function(msg, trace) {
    system.stderr.writeLine('= onError()');
    var msgStack = ['  ERROR: ' + msg];
    if (trace) {
        msgStack.push('  TRACE:');
        trace.forEach(function(t) {
            msgStack.push('    -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    system.stderr.writeLine(msgStack.join('\n'));
};

page.open('http://localhost:8080/pdf/tracemonkey.pdf');
