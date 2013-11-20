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
    var children, el = event.target;
    if (el.tagName !== 'LI') {
      return;
    }
    children = el.getElementsByTagName('div');
    if (children.length && children[0].hasAttribute('data-retweeter')) {
      queue();
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
    _.each(document.querySelectorAll('[data-retweeter]'), function(element) {
      var retweeter = element.getAttribute('data-retweeter');
      if (_.contains(handles, retweeter)) {
        element.remove();
      }
    });
    throttleTimeout = null;
  };

  setupListeners = function() {
    // tweet list: listen to new tweets appearing
    var list = document.getElementById('stream-items-id');
    list.addEventListener('DOMNodeInserted', onDomNodeInserted);

    // storage listener: listen to changes to list of handles
    chrome.storage.onChanged.addListener(onStorageChanged);

    // run when a page is loaded
    window.onpopstate = run;
  };

  return {
    run: run,
    init: init
  };
})();

NoRetweet.init();