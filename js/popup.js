var popup = (function() {
  'use strict';

  var addHandle, getHandles, removeHandle, setupElements, setupListeners, 
    syncHandles;

  var handles = [], inputEl, listEl, newRowEl;

  addHandle = function() {
    var handle, row;

    handle = inputEl.value;

    // @oiva -> oiva
    if (handle.substring(0, 1) == '@') {
      handle = handle.substring(1);
    }

    console.log('addHandle '+handle);
    if (_.contains(handles, handle)) {
      inputEl.value = '';
      return;
    }
    handles.push(handle);
    syncHandles();

    // insert element
    row = '<li>@' + handle + '</li>';
    newRowEl.insertAdjacentHTML('beforebegin', row);
  };

  getHandles = function() {
    chrome.storage.local.get('handles', function (result) {
      if (result.handles !== undefined) {
        handles = result.handles;
        console.log('got handles', handles);
      }
    });
  };

  removeHandle = function() {

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