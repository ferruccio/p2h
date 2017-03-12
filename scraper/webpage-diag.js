var webpage = require('webpage');
var system = require('system');

module.exports.create = function(params) {

	var page = webpage.create();

	if (typeof(params.resources) === 'undefined') params.resources = false;
	if (typeof(params.verbose) === 'undefined') params.verbose = false;

	function err(msg) {
		system.stderr.writeLine(msg);
	}

	page.onConsoleMessage = function(msg, lineNum, sourceId) {
	    if (typeof lineNum === 'undefined') {
	        console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
	    } else {
	        console.log('CONSOLE: ' + msg);
	    }
	};

	page.onResourceRequested = function (request) {
		if (params.resources) {
	    	err('= onResourceRequested()');
	    	err('  request: ' + JSON.stringify(request, undefined, 4));
		}
	};

	page.onResourceReceived = function(response) {
		if (params.resources) {
	    	err('= onResourceReceived()' );
	    	err('  id: ' + response.id + ', stage: "' + response.stage + '", response: ' + JSON.stringify(response));
		}
	};

	page.onLoadStarted = function() {
		if (params.verbose) {
		    err('= onLoadStarted()');
		    var currentUrl = page.evaluate(function() {
		        return window.location.href;
		    });
		    err('  leaving url: ' + currentUrl);
		}
	};

	page.onLoadFinished = function(status) {
		if (params.verbose) {
		    err('= onLoadFinished()');
		    err('  status: ' + status);
		}
	    if (typeof(params.load) === 'function') params.load(status === 'success');
	};

	page.onNavigationRequested = function(url, type, willNavigate, main) {
		if (params.verbose) {
		    err('= onNavigationRequested');
		    err('  destination_url: ' + url);
		    err('  type (cause): ' + type);
		    err('  will navigate: ' + willNavigate);
		    err('  from page\'s main frame: ' + main);
		}
	};

	page.onResourceError = function(resourceError) {
	    err('= onResourceError()');
	    err('  - unable to load url: "' + resourceError.url + '"');
	    err('  - error code: ' + resourceError.errorCode + ', description: ' + resourceError.errorString );
	};

	page.onError = function(msg, trace) {
	    err('= onError()');
	    var msgStack = ['  ERROR: ' + msg];
	    if (trace) {
	        msgStack.push('  TRACE:');
	        trace.forEach(function(t) {
	            msgStack.push('    -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
	        });
	    }
	    err(msgStack.join('\n'));
	};

	return page;
};