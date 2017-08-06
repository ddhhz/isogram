'use strict';

var ansi_up = new AnsiUp;

function getTemplate(input) {

  try {
    return ansi_up.ansi_to_html(window.isogram(input.join(''), {color: true, scriptTag: true, id: 'XXXXX-XX'}));
  } catch (e) {
    return ansi_up.ansi_to_html(window.isogram('isogram', {scriptTag: true, id: 'XXXXX-XX'}));
  }
}

// thanks --> http://jsperf.com/isisogram/2
function isIsogram(word){
  var seen = [];
  var letters = word.split('');
  var is = true;
  var letter;

  for(var i = 0, l = letters.length; i < l; i++){
    letter = letters[i];

    // added to check if number
    if(seen.indexOf(letter) !== -1 || !isNaN(letter) ){
      is = false;
      break;
    }
    else{
      seen.push(letter);
    }
  }
  return is;
}

var isAlpha = function(val) {
  return /^[A-Za-z]+$/.test(val)
}

ready(function(){
  var $input = document.getElementById('isogram-input');
  var $output = document.getElementById('output-bottom');
  var $warning = document.getElementById('warning');
  var $body = document.body;

  addEventListener($input, 'input', function(e) {
    var currChars = $input.value.split('');
    var currIndex = currChars.length -1;

    console.log("Checking for " + $input.value)

    if ( $input.value && !isAlpha($input.value) ) {
      $input.value = $input.value.substring(0, $input.value.length-1);
      $warning.innerHTML = 'Can only have alpha characters.';
      updateHash('');
      $body.classList.remove('success');
    }

    else if (!isIsogram($input.value)) {
      $input.value = $input.value.substring(0, $input.value.length-1);
      $warning.innerHTML = 'Cannot repeat characters, not an isogram.';
      updateHash('');
      $body.classList.remove('success');
    }

    else if ( $input.value.length < 3 ) {
      $warning.innerHTML = 'Please enter 3 - 7 characters.';
      $output.innerHTML = getTemplate();
      updateHash('');
      $body.classList.remove('success');
    }

    else {
      $warning.innerHTML = '';
      $output.innerHTML = getTemplate(currChars);
      updateHash($input.value);
      $body.classList.add('success');
    }
  });

  var search = window.location.hash.replace(/^#/, '');
  if (search && isAlpha(search) && isIsogram(search)) {
    $input.value = search;
    triggerEvent($input, 'input');
  } else {
    $output.innerHTML = getTemplate();
  }
});

function updateHash(hash) {
  history.replaceState(null, document.title, document.location.pathname + (hash ? '#' + hash : ''));
}

function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function addEventListener(el, eventName, handler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, handler);
  } else {
    el.attachEvent('on' + eventName, function() {
      handler.call(el);
    });
  }
}

function triggerEvent(el, eventName, options) {
  var event;
  if (window.CustomEvent) {
    event = new CustomEvent(eventName, options);
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(eventName, true, true, options);
  }
  el.dispatchEvent(event);
}
