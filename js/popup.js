var popup = (function() {
  'use strict';

  var addHandle, getHandles, removeHandle, renderHandles, setupElements,
    setupListeners, syncHandles;

  var handles = [], inputEl, listEl, newRowEl;

  addHandle = function() {
    console.log('addHandle');
    var handle;

    handle = inputEl.value;
    inputEl.value = '';
    
    // @oiva -> oiva
    if (handle.substring(0, 1) === '@') {
      handle = handle.substring(1);
    }

    console.log('addHandle '+handle);
    if (_.contains(handles, handle)) {
      console.log('old');
      return;
    }
    handles.push(handle);
    syncHandles();

    renderHandles();
  };

  getHandles = function() {
    console.log('get handles');
    chrome.storage.sync.get('handles', function (result) {
      if (chrome.runtime.lastError) {
        return;
      }
      if (result.handles !== undefined) {
        console.log('got handles', result.handles);
        console.log(this);
        console.log(renderHandles);
        handles = result.handles;
        renderHandles();
      }
    });
  };

  removeHandle = function() {
    renderHandles();
  };

  renderHandles = function() {
    var html = '', prevHandles = listEl.querySelectorAll('.handle');
    _.invoke(prevHandles, 'remove');
    
    _.each(handles, function(handle) {
      html += '<li class="handle">@' + handle + '</li>';
    });
    newRowEl.insertAdjacentHTML('beforebegin', html);
  };

  setupElements = function() {
    inputEl = document.querySelector('#handle');
    listEl = document.querySelector('#handles');
    newRowEl = document.querySelector('#new-row');
  };

  setupListeners = function() {
    document.querySelector('#add').addEventListener('click', addHandle);
  };

  syncHandles = function() {
    chrome.storage.sync.set({'handles': handles}, function() {
      if (chrome.runtime.lastError) {
        // handle error?
        return;
      }
      console.log('Settings saved');
    });
  };

  return {
    init: function() {
      console.log('popup init');
      getHandles();
      setupElements();
      setupListeners();
    }
  };
})();

document.addEventListener('DOMContentLoaded', popup.init, false);