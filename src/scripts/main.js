'use strict';

var ansi_up = new AnsiUp;

function getTemplate(input) {

  try {
    return ansi_up.ansi_to_html(window.isogram(input.join(''), {color: true, scriptTag: true}));
  } catch (e) {
    return ansi_up.ansi_to_html(window.isogram('isogram', {scriptTag: true}));
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

$(document).on('ready', function() {
  var $input = $('.isogram-input');
  var $output = $('.output-bottom');
  var $warning = $('.warning');
  var $body = $('body');

  $input.on('input', function(e) {
    var currChars = $input.val().split('');
    var currIndex = currChars.length -1;

    console.log("checking for " + $input.val())

    if ( $input.val() && !isAlpha($input.val()) ) {
      $input.val($input.val().substring(0, $input.val().length-1));
      $warning.text('Can only have alpha characters.');
      $body.removeClass('success');
    }

    else if (!isIsogram($input.val())) {
      $input.val($input.val().substring(0, $input.val().length-1));
      $warning.text('Cannot repeat characters, not an isogram.');
      $body.removeClass('success');
    }

    else if ( $input.val().length < 3 ) {
      $warning.text('Please enter 3 - 7 characters.');
      $output.html(getTemplate());
      $body.removeClass('success');
    }

    else {
      $warning.text('');
      $output.html(getTemplate(currChars));
      $body.addClass('success');
    }
  });

  var search = window.location.search.replace(/^\?/, '');
  if (search && isAlpha(search) && isIsogram(search)) {
    $input.val(search).trigger('input');
  } else {
    $output.html(getTemplate('isogram'.split('')));
  }
});
