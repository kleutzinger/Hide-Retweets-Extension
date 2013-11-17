var NoRetweet = (function() {
  'use strict';

  var onDomNodeInserted, queue, run, setupListeners, throttleTimeout = null;

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

  queue = function() {
    if (throttleTimeout === null) {
      throttleTimeout = setTimeout(run, 10);
    }
  };

  run = function() {
    console.log('run no-retweet');
    var names = ['marcoarment', 'mikko'];
      
    _.each(document.querySelectorAll('[data-retweeter]'), function(element) {
      var retweeter = element.getAttribute('data-retweeter');
      if (_.contains(names, retweeter)) {
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
  };

  return {
    run: run,
    setupListeners: setupListeners
  };
})();

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {});

NoRetweet.setupListeners();