var popup = (function() {
  'use strict';
  var handles = [], inputEl, listEl, newRowEl,
    addHandle, getHandles, onKeyDown, onListClick, removeHandle,
    renderHandles, setupElements, setupListeners, syncHandles;

  addHandle = function() {
    var handle;

    handle = inputEl.value;
    inputEl.value = '';
    
    // @oiva -> oiva
    if (handle.substring(0, 1) === '@') {
      handle = handle.substring(1);
    }

    if (_.contains(handles, handle)) {
      return;
    }
    handles.push(handle);
    syncHandles();

    renderHandles();
  };

  getHandles = function() {
    chrome.storage.sync.get('handles', function (result) {
      if (chrome.runtime.lastError) {
        return;
      }
      if (result.handles !== undefined) {
        handles = result.handles;
        renderHandles();
      }
    });
  };

  onKeyDown = function(event) {
    if (event.keyCode === 10) {
      addHandle();
      event.stopPropagation();
      event.preventDefault();
      return false;
    }
  };

  onListClick = function(event) {
    var handle;
    if (event.target.getAttribute('class') !== 'close') {
      return;
    }

    handle = event.target.previousElementSibling.innerHTML;
    removeHandle(handle);
    event.stopPropagation();
  };

  removeHandle = function(handle) {
    handles = _.without(handles, handle);
    renderHandles();
    syncHandles();
  };

  renderHandles = function() {
    var html = '', prevHandles = listEl.querySelectorAll('.handle');
    _.invoke(prevHandles, 'remove');
    
    _.each(handles, function(handle) {
      html += '<li class="handle">@<span>' + handle + '</span>';
      html += '<button type="button" class="close" aria-hidden="true">&times;</button>';
      html += '</li>';
    });
    newRowEl.insertAdjacentHTML('beforebegin', html);
  };

  setupElements = function() {
    inputEl = document.getElementById('handle');
    listEl = document.getElementById('handles');
    newRowEl = document.getElementById('new-row');
  };

  setupListeners = function() {
    document.getElementById('add').addEventListener('click', addHandle);
    listEl.addEventListener('click', onListClick);
    inputEl.addEventListener('keyup', onKeyDown, true);
  };

  syncHandles = function() {
    chrome.storage.sync.set({'handles': handles}, function() {
      if (chrome.runtime.lastError) {
        // handle error?
        return;
      }
    });
  };

  return {
    init: function() {
      getHandles();
      setupElements();
      setupListeners();
    }
  };
})();

document.addEventListener('DOMContentLoaded', popup.init, false);