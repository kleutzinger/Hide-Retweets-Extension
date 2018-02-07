var NoRetweet = (function() {
  'use strict';

  var getHandles, init, onDomNodeInserted, onStorageChanged, queue, run,
    setupListeners;
  
  var handles = [], throttleTimeout = null, blockCount = {}, ranOnce = 0;;

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
    ranOnce = 1;
    console.log("RUNNIN");
    //console.log('run');
    var count = 0, lowercaseHandles = _.invoke(handles, 'toLowerCase');
    var wildcard = _.contains(handles, "***")
    _.each(document.querySelectorAll('[data-retweeter]'), function(element) {
      var retweeter = element.getAttribute('data-retweeter').toLowerCase();
      if (_.contains(lowercaseHandles, retweeter) || wildcard) {
        console.log(retweeter)
        // element.remove();
        // return;
        var replacer = document.createElement("div");
        replacer.setAttribute("style", "color:gray; position:absolute; top:50%; transform:translateY(-50%);");
        // replacer.className = "js-stream-item stream-item stream-item";
        replacer.appendChild(document.createTextNode(`hidden @${retweeter} retweet`));
        if(element.querySelector("div.content"))element.querySelector("div.content").remove();
        // element.querySelector("span.js-retweet-text").replaceWith(replacer);
        if(element.querySelector("div.context"))element.querySelector("div.context").replaceWith(replacer);
        count += 1;
        blockCount[retweeter] = (blockCount[retweeter] || 0) + 1;
        blockCount['total'] = (blockCount['total'] || 0) + 1;
      }
    });
    console.log(blockCount);
    throttleTimeout = null;
  };

  setupListeners = function() {
    // tweet list: listen to new tweets appearing
    document.addEventListener('DOMNodeInserted', onDomNodeInserted);

    // storage listener: listen to changes to list of handles
    chrome.storage.onChanged.addListener(onStorageChanged);

    // run when a page is loaded or URL changes.
    window.onpopstate = queue;
    setTimeout(()=> {if (!ranOnce) run()}, 4000); // sketchy race condition for profile pages
  };

  return {
    run: run,
    init: init
  };
})();

NoRetweet.init();