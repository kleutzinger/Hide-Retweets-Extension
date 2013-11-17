var NoRetweet = (function() {
  var run = function() {
    var names = ['marco', 'mikko'];
      
    _.each(document.querySelectorAll('[data-retweeter]'), function(element) {
      var retweeter = element.getAttribute('data-retweeter');
      if (_.contains(names, retweeter)) {
        console.log('remove retweet by '+retweeter);
        element.remove();
      }
    });
  };

  return {
    run: run
  };
})();

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {});

window.onpopstate = function (event) {
  NoRetweet.run();
}