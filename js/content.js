var NoRetweet = (function() {
  'use strict';

  var getHandles, init, onDomNodeInserted, onStorageChanged, queue, run,
    setupListeners;
  
  var handles = [], throttleTimeout = null;

  getHandles = function() {
    chrome.storage.local.get('handles', function (result) {
      if (result.handles !== undefined) {
        handles = result.handles;
        console.log('got handles', handles);
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
    if (el.tagName === 'LI') {
      children = el.getElementsByTagName('div');
      if (children.length && children[0].hasAttribute('data-retweeter')) {
        console.log('retweet inserted');
        queue();
      }
    }
  };

  onStorageChanged = function(changes, namespace) {
    console.log(changes, namespace);
  };

  queue = function() {
    if (throttleTimeout === null) {
      throttleTimeout = setTimeout(run, 10);
    }
  };

  run = function() {
    console.log('run no-retweet');
    _.each(document.querySelectorAll('[data-retweeter]'), function(element) {
      var retweeter = element.getAttribute('data-retweeter');
      if (_.contains(handles, retweeter)) {
        console.log('remove retweet by '+retweeter);
        element.remove();
      }
    });
    throttleTimeout = null;
  };

  setupListeners = function() {
    console.log('setup event listeners');
    window.onpopstate = run;

    // tweet list
    var list = document.querySelector('#stream-items-id');
    list.addEventListener('DOMNodeInserted', onDomNodeInserted);

    // storage listener
    chrome.storage.onChanged.addListener(onStorageChanged);
  };

  return {
    run: run,
    init: init
  };
})();

NoRetweet.init();