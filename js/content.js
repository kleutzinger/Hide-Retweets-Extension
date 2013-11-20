var NoRetweet = (function() {
  'use strict';

  var getHandles, init, onDomNodeInserted, onStorageChanged, queue, run,
    setupListeners;
  
  var handles = [], throttleTimeout = null;

  getHandles = function() {
    chrome.storage.sync.get('handles', function (result) {
      if (chrome.runtime.lastError) {
        return;
      }
      if (result.handles !== undefined) {
        handles = result.handles;
      }
    });
  };

  init = function() {
    getHandles();
    setupListeners();
  };

  /* see if a new retweet was added to DOM, queue removal */
  onDomNodeInserted = function(event) {
    var children, className, classNameMatch,
      possibleClassNames = ['content-main', 'recent-tweets'];

    // text nodes
    if (!event.target.getAttribute) {
      return;
    }

    className = event.target.getAttribute('class');
    if (className === null) {
      return;
    }

    classNameMatch = _.some(possibleClassNames, function(hit) {
      return className.indexOf(hit) !== -1;
    });

    if (classNameMatch) {
      queue();
      return;
    }

    if (event.target.getAttribute('data-item-type') === 'tweet') {
      children = event.target.getElementsByTagName('div');
      if (children.length && children[0].hasAttribute('data-retweeter')) {
        queue();
      }
    }
  };

  onStorageChanged = function(changes, namespace) {
    if (namespace === 'sync' && changes.handles && changes.handles.newValue) {
      handles = changes.handles.newValue;
      queue();
    }
  };

  queue = function() {
    if (throttleTimeout === null) {
      throttleTimeout = setTimeout(run, 10);
    }
  };

  run = function() {
    console.log('run');
    var count = 0, lowercaseHandles = _.invoke(handles, 'toLowerCase');
    _.each(document.querySelectorAll('[data-retweeter]'), function(element) {
      var retweeter = element.getAttribute('data-retweeter');
      if (_.contains(lowercaseHandles, retweeter.toLowerCase())) {
        element.remove();
        count += 1;
      }
    });
    throttleTimeout = null;
  };

  setupListeners = function() {
    // tweet list: listen to new tweets appearing
    document.addEventListener('DOMNodeInserted', onDomNodeInserted);

    // storage listener: listen to changes to list of handles
    chrome.storage.onChanged.addListener(onStorageChanged);

    // run when a page is loaded or URL changes.
    window.onpopstate = queue;
  };

  return {
    run: run,
    init: init
  };
})();

NoRetweet.init();