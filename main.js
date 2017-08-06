"use strict";
function rgx(tmplObj) {
    var subst = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        subst[_i - 1] = arguments[_i];
    }
    var regexText = tmplObj.raw[0];
    var wsrgx = /^\s+|\s+\n|\s+#[\s\S]+?\n/gm;
    var txt2 = regexText.replace(wsrgx, '');
    return new RegExp(txt2, 'm');
}
var AnsiUp = (function () {
    function AnsiUp() {
        this.VERSION = "2.0.1";
        this.ansi_colors = [
            [
                { rgb: [0, 0, 0], class_name: "ansi-black" },
                { rgb: [187, 0, 0], class_name: "ansi-red" },
                { rgb: [0, 187, 0], class_name: "ansi-green" },
                { rgb: [187, 187, 0], class_name: "ansi-yellow" },
                { rgb: [0, 0, 187], class_name: "ansi-blue" },
                { rgb: [187, 0, 187], class_name: "ansi-magenta" },
                { rgb: [0, 187, 187], class_name: "ansi-cyan" },
                { rgb: [255, 255, 255], class_name: "ansi-white" }
            ],
            [
                { rgb: [85, 85, 85], class_name: "ansi-bright-black" },
                { rgb: [255, 85, 85], class_name: "ansi-bright-red" },
                { rgb: [0, 255, 0], class_name: "ansi-bright-green" },
                { rgb: [255, 255, 85], class_name: "ansi-bright-yellow" },
                { rgb: [85, 85, 255], class_name: "ansi-bright-blue" },
                { rgb: [255, 85, 255], class_name: "ansi-bright-magenta" },
                { rgb: [85, 255, 255], class_name: "ansi-bright-cyan" },
                { rgb: [255, 255, 255], class_name: "ansi-bright-white" }
            ]
        ];
        this.htmlFormatter = {
            transform: function (fragment, instance) {
                var txt = fragment.text;
                if (txt.length === 0)
                    return txt;
                if (instance._escape_for_html)
                    txt = instance.old_escape_for_html(txt);
                if (!fragment.bright && fragment.fg === null && fragment.bg === null)
                    return txt;
                var styles = [];
                var classes = [];
                var fg = fragment.fg;
                var bg = fragment.bg;
                if (fg === null && fragment.bright)
                    fg = instance.ansi_colors[1][7];
                if (!instance._use_classes) {
                    if (fg)
                        styles.push("color:rgb(" + fg.rgb.join(',') + ")");
                    if (bg)
                        styles.push("background-color:rgb(" + bg.rgb + ")");
                }
                else {
                    if (fg) {
                        if (fg.class_name !== 'truecolor') {
                            classes.push(fg.class_name + "-fg");
                        }
                        else {
                            styles.push("color:rgb(" + fg.rgb.join(',') + ")");
                        }
                    }
                    if (bg) {
                        if (bg.class_name !== 'truecolor') {
                            classes.push(bg.class_name + "-bg");
                        }
                        else {
                            styles.push("background-color:rgb(" + bg.rgb.join(',') + ")");
                        }
                    }
                }
                var class_string = '';
                var style_string = '';
                if (classes.length)
                    class_string = " class=\"" + classes.join(' ') + "\"";
                if (styles.length)
                    style_string = " style=\"" + styles.join(';') + "\"";
                return "<span" + class_string + style_string + ">" + txt + "</span>";
            },
            compose: function (segments, instance) {
                return segments.join("");
            }
        };
        this.textFormatter = {
            transform: function (fragment, instance) {
                return fragment.text;
            },
            compose: function (segments, instance) {
                return segments.join("");
            }
        };
        this.setup_256_palette();
        this._use_classes = false;
        this._escape_for_html = true;
        this.bright = false;
        this.fg = this.bg = null;
        this._buffer = '';
    }
    Object.defineProperty(AnsiUp.prototype, "use_classes", {
        get: function () {
            return this._use_classes;
        },
        set: function (arg) {
            this._use_classes = arg;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnsiUp.prototype, "escape_for_html", {
        get: function () {
            return this._escape_for_html;
        },
        set: function (arg) {
            this._escape_for_html = arg;
        },
        enumerable: true,
        configurable: true
    });
    AnsiUp.prototype.setup_256_palette = function () {
        var _this = this;
        this.palette_256 = [];
        this.ansi_colors.forEach(function (palette) {
            palette.forEach(function (rec) {
                _this.palette_256.push(rec);
            });
        });
        var levels = [0, 95, 135, 175, 215, 255];
        for (var r = 0; r < 6; ++r) {
            for (var g = 0; g < 6; ++g) {
                for (var b = 0; b < 6; ++b) {
                    var col = { rgb: [levels[r], levels[g], levels[b]], class_name: 'truecolor' };
                    this.palette_256.push(col);
                }
            }
        }
        var grey_level = 8;
        for (var i = 0; i < 24; ++i, grey_level += 10) {
            var gry = { rgb: [grey_level, grey_level, grey_level], class_name: 'truecolor' };
            this.palette_256.push(gry);
        }
    };
    AnsiUp.prototype.old_escape_for_html = function (txt) {
        return txt.replace(/[&<>]/gm, function (str) {
            if (str === "&")
                return "&amp;";
            if (str === "<")
                return "&lt;";
            if (str === ">")
                return "&gt;";
        });
    };
    AnsiUp.prototype.old_linkify = function (txt) {
        return txt.replace(/(https?:\/\/[^\s]+)/gm, function (str) {
            return "<a href=\"" + str + "\">" + str + "</a>";
        });
    };
    AnsiUp.prototype.detect_incomplete_ansi = function (txt) {
        return !(/.*?[\x40-\x7e]/.test(txt));
    };
    AnsiUp.prototype.detect_incomplete_link = function (txt) {
        var found = false;
        for (var i = txt.length - 1; i > 0; i--) {
            if (/\s|\x1B/.test(txt[i])) {
                found = true;
                break;
            }
        }
        if (!found) {
            if (/(https?:\/\/[^\s]+)/.test(txt))
                return 0;
            else
                return -1;
        }
        var prefix = txt.substr(i + 1, 4);
        if (prefix.length === 0)
            return -1;
        if ("http".indexOf(prefix) === 0)
            return (i + 1);
    };
    AnsiUp.prototype.ansi_to = function (txt, formatter) {
        var pkt = this._buffer + txt;
        this._buffer = '';
        var raw_text_pkts = pkt.split(/\x1B\[/);
        if (raw_text_pkts.length === 1)
            raw_text_pkts.push('');
        this.handle_incomplete_sequences(raw_text_pkts);
        var first_chunk = this.with_state(raw_text_pkts.shift());
        var blocks = new Array(raw_text_pkts.length);
        for (var i = 0, len = raw_text_pkts.length; i < len; ++i) {
            blocks[i] = (formatter.transform(this.process_ansi(raw_text_pkts[i]), this));
        }
        if (first_chunk.text.length > 0)
            blocks.unshift(formatter.transform(first_chunk, this));
        return formatter.compose(blocks, this);
    };
    AnsiUp.prototype.ansi_to_html = function (txt) {
        return this.ansi_to(txt, this.htmlFormatter);
    };
    AnsiUp.prototype.ansi_to_text = function (txt) {
        return this.ansi_to(txt, this.textFormatter);
    };
    AnsiUp.prototype.with_state = function (text) {
        return { bright: this.bright, fg: this.fg, bg: this.bg, text: text };
    };
    AnsiUp.prototype.handle_incomplete_sequences = function (chunks) {
        var last_chunk = chunks[chunks.length - 1];
        if ((last_chunk.length > 0) && this.detect_incomplete_ansi(last_chunk)) {
            this._buffer = "\x1B[" + last_chunk;
            chunks.pop();
            chunks.push('');
        }
        else {
            if (last_chunk.slice(-1) === "\x1B") {
                this._buffer = "\x1B";
                console.log("raw", chunks);
                chunks.pop();
                chunks.push(last_chunk.substr(0, last_chunk.length - 1));
                console.log(chunks);
                console.log(last_chunk);
            }
            if (chunks.length === 2 &&
                chunks[1] === "" &&
                chunks[0].slice(-1) === "\x1B") {
                this._buffer = "\x1B";
                last_chunk = chunks.shift();
                chunks.unshift(last_chunk.substr(0, last_chunk.length - 1));
            }
        }
    };
    AnsiUp.prototype.process_ansi = function (block) {
        if (!this._sgr_regex) {
            this._sgr_regex = (_a = ["\n            ^                           # beginning of line\n            ([!<-?]?)             # a private-mode char (!, <, =, >, ?)\n            ([d;]*)                    # any digits or semicolons\n            ([ -/]?               # an intermediate modifier\n            [@-~])                # the command\n            ([sS]*)                   # any text following this CSI sequence\n          "], _a.raw = ["\n            ^                           # beginning of line\n            ([!\\x3c-\\x3f]?)             # a private-mode char (!, <, =, >, ?)\n            ([\\d;]*)                    # any digits or semicolons\n            ([\\x20-\\x2f]?               # an intermediate modifier\n            [\\x40-\\x7e])                # the command\n            ([\\s\\S]*)                   # any text following this CSI sequence\n          "], rgx(_a));
        }
        var matches = block.match(this._sgr_regex);
        if (!matches) {
            return this.with_state(block);
        }
        var orig_txt = matches[4];
        if (matches[1] !== '' || matches[3] !== 'm') {
            return this.with_state(orig_txt);
        }
        var sgr_cmds = matches[2].split(';');
        while (sgr_cmds.length > 0) {
            var sgr_cmd_str = sgr_cmds.shift();
            var num = parseInt(sgr_cmd_str, 10);
            if (isNaN(num) || num === 0) {
                this.fg = this.bg = null;
                this.bright = false;
            }
            else if (num === 1) {
                this.bright = true;
            }
            else if (num === 22) {
                this.bright = false;
            }
            else if (num === 39) {
                this.fg = null;
            }
            else if (num === 49) {
                this.bg = null;
            }
            else if ((num >= 30) && (num < 38)) {
                var bidx = this.bright ? 1 : 0;
                this.fg = this.ansi_colors[bidx][(num - 30)];
            }
            else if ((num >= 90) && (num < 98)) {
                this.fg = this.ansi_colors[1][(num - 90)];
            }
            else if ((num >= 40) && (num < 48)) {
                this.bg = this.ansi_colors[0][(num - 40)];
            }
            else if ((num >= 100) && (num < 108)) {
                this.bg = this.ansi_colors[1][(num - 100)];
            }
            else if (num === 38 || num === 48) {
                if (sgr_cmds.length > 0) {
                    var is_foreground = (num === 38);
                    var mode_cmd = sgr_cmds.shift();
                    if (mode_cmd === '5' && sgr_cmds.length > 0) {
                        var palette_index = parseInt(sgr_cmds.shift(), 10);
                        if (palette_index >= 0 && palette_index <= 255) {
                            if (is_foreground)
                                this.fg = this.palette_256[palette_index];
                            else
                                this.bg = this.palette_256[palette_index];
                        }
                    }
                    if (mode_cmd === '2' && sgr_cmds.length > 2) {
                        var r = parseInt(sgr_cmds.shift(), 10);
                        var g = parseInt(sgr_cmds.shift(), 10);
                        var b = parseInt(sgr_cmds.shift(), 10);
                        if ((r >= 0 && r <= 255) && (g >= 0 && g <= 255) && (b >= 0 && b <= 255)) {
                            var c = { rgb: [r, g, b], class_name: 'truecolor' };
                            if (is_foreground)
                                this.fg = c;
                            else
                                this.bg = c;
                        }
                    }
                }
            }
        }
        return this.with_state(orig_txt);
        var _a;
    };
    return AnsiUp;
}());

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

_ready(function(){
  var $input = document.getElementById('isogram-input');
  var $output = document.getElementById('output-bottom');
  var $warning = document.getElementById('warning');
  var $body = document.body;

  _addEventListener($input, 'input', function(e) {
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
  if (search && isAlpha(search) && isIsogram(search) && search.length > 2) {
    $input.value = search;
    _triggerEvent($input, 'input');
  } else {
    $output.innerHTML = getTemplate();
  }
});

function updateHash(hash) {
  history.replaceState(null, document.title, document.location.pathname + (hash ? '#' + hash : ''));
}

function _ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function _addEventListener(el, eventName, handler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, handler);
  } else {
    el.attachEvent('on' + eventName, function() {
      handler.call(el);
    });
  }
}

function _triggerEvent(el, eventName, options) {
  var event;
  if (window.CustomEvent) {
    event = new CustomEvent(eventName, options);
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(eventName, true, true, options);
  }
  el.dispatchEvent(event);
}

/*!
 * array-duplicated | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/array-duplicated
*/
window.arrayDuplicated = function arrayDuplicated(arr) {
  'use strict';

  if (!Array.isArray(arr)) {
    throw new TypeError(
      arr +
      ' is not an array. Argument to array-duplicated  must be an array.'
    );
  }

  var result = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr.indexOf(arr[i]) !== i && result.indexOf(arr[i]) === -1) {
      result.push(arr[i]);
    }
  }

  return result;
};

/*!
 * assert-unique | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/assert-unique
*/

window.assertUnique = function assertUnique() {
  'use strict';

  if (arguments.length === 0) {
    return;
  }

  var duplicates = window.arrayDuplicated([].slice.call(arguments));

  if (duplicates.length === 0) {
    return;
  }

  var len = duplicates.length;
  while (len--) {
    if (typeof duplicates[len] === 'function') {
      var fnName = '';
      if (duplicates[len].name) {
        fnName = ': ' + duplicates[len].name;
      }

      duplicates[len] = '[Function' + fnName + ']';
    } else {
      duplicates[len] = JSON.stringify(duplicates[len]);
    }
  }

  var aux;
  if (duplicates.length === 1) {
    aux = 'is';
  } else {
    aux = 'are';
  }

  throw new Error(window.arrayToSentence(duplicates) + ' ' + aux + ' duplicated.');
};

/*!
 * array-to-sentence | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/array-to-sentence
*/
window.arrayToSentence = function arrayToSentence(arr, options) {
  'use strict';

  if (!Array.isArray(arr)) {
    throw new TypeError(String(arr) + ' is not an array. Expected an array.');
  }

  options = options || {};

  function validateOption(optionName) {
    if (typeof options[optionName] !== 'string') {
      throw new TypeError(
        String(options[optionName]) +
        ' is not a string. ' +
        '`' + optionName + '` option must be a string.'
      );
    }
  }

  if (options.separator === undefined) {
    options.separator = ', ';
  } else {
    validateOption('separator');
  }

  if (options.lastSeparator === undefined) {
    options.lastSeparator = ' and ';
  } else {
    validateOption('lastSeparator');
  }

  if (arr.length === 0) {
    return '';
  }

  if (arr.length === 1) {
    return arr[0];
  }

  return arr.slice(0, -1).join(options.separator) + options.lastSeparator + arr[arr.length - 1];
};

/*!
 * is-var-name | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/is-var-name
*/

window.isVarName = function isVarName(str) {
  'use strict';

  if (typeof str !== 'string') {
    return false;
  }

  try {
    new Function('var ' + str)();
  } catch (e) {
    return false;
  }
  return true;
};

/*!
 * HTML5 Boilerplate | MIT (c) HTML5 Boilerplate
 * https://github.com/h5bp/html5-boilerplate
 *
 * ga-loader-snippets | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/ga-loader-snippets
*/
!function() {

var parts = [
  '!function(A,B,C',
  '){A.GoogleAnalyticsObject=C;A[C]||(A[C]=function(){\n(A[C].q=A[C].q||[]).push(arguments)});A[C].l=+new Date',
  '=B.createElement(',
  '"//www.google-analytics.com/analytics.js"',
  '.parentNode.insertBefore(',
  '=B.getElementsByTagName(D)[0];',
  '(window,document,"ga"'
];

window.gaLoaderSnippets = {
  with3params: parts[0] + parts[1] + ';var s' + parts[2] + '"script"),\ne=B.scripts[0];s.src=' + parts[3] + ';\ne' + parts[4] + 's,e)}' + parts[6] + ');',
  with4params: parts[0] + ',D' + parts[1] + ';D' + parts[2] + '"script");\nvar e=B.scripts[0];D.src=' + parts[3] + ';\ne' + parts[4] + 'D,e)}' + parts[6] + ');',
  with5params: parts[0] + ',D,E' + parts[1] + ';D' + parts[2] + '"script");\nE=B.scripts[0];D.src=' + parts[3] + ';\nE' + parts[4] + 'D,E)}' + parts[6] + ');',
  with6params: parts[0] + ',D,E,F' + parts[1] + ';E' + parts[2] + 'D);\nF' + parts[5] + 'E.src=' + parts[3] + ';\nF' + parts[4] + 'E,F)}' + parts[6] + ',"script");',
  with7params: parts[0] + ',D,E,F,G' + parts[1] + ';F' + parts[2] + 'D);\nG' + parts[5] + 'F.src=E;G' + parts[4] + 'F,G)}\n' + parts[6] + ',"script",' + parts[3] + ');'
};

}();

/*!
 * ga-tracker-snippet | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/ga-tracker-snippet
*/
!function() {
'use strict';

window.gaTrackerSnippet = function gaTrackerSnippet(options) {
  if (typeof options === 'string') {
    options = {id: arguments[0], domain: arguments[1]};
  } else {
    options = options || {};
  }

  var templateData = {};

  var defultValues = {
    id: 'XXXXX-X',
    domain: 'auto',
    globalName: 'ga'
  };

  Object.keys(defultValues).forEach(function(key) {
    var prop = options[key];
    if (prop) {
      if (typeof prop !== 'string') {
        throw new TypeError(prop + ' is not a string. ' + key + ' property must be a string.');
      }
      templateData[key] = prop;
    } else {
      templateData[key] = defultValues[key];
    }
  });

  if (!window.isVarName(templateData.globalName)) {
    throw new Error(templateData.globalName + ' cannot be used as a global variable name.');
  }

  if (templateData.id.indexOf('UA-') === 0) {
    templateData.id = templateData.id.substring(3);
  }

  var space;
  if (options.minify) {
    space = '';
  } else {
    space = ' ';
  }

  var code = templateData.globalName +
             '(\'create\',' + space +
             '\'UA-' + templateData.id + '\',' + space +
             '\'' + templateData.domain + '\');' +
             (options.minify ? '' : '\n') +
             templateData.globalName +
             '(\'send\',' + space + '\'pageview\');';

  if (options.singleQuotes === false) {
    code = code.replace(/'/g, '"');
  }

  return code;
};

}();

/*!
 * isogram | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/isogram
*/

window.isogram = function isogram(characters, options) {
  'use strict';

  if (arguments.length === 0) {
    characters = 'GoOgle';
  } else if (typeof characters !== 'string') {
    if (arguments.length !== 1 || typeof characters !== 'object') {
      throw new TypeError('First argument must be a string or an object.');
    }

    options = characters;
    characters = 'GoOgle';
  }

  if (options) {
    if (typeof options !== 'object') {
      throw new TypeError(
        options +
        ' is not an object. Second argument must be an object.'
      );
    }
  } else {
    options = {};
  }

  var len = characters.length;

  var invalidChars = [];
  for (var i = 0; i < len; i++) {
    var char = characters.charAt(i);
    if (!window.isVarName(char) && i === characters.indexOf(char)) {
      invalidChars.push('"' + char + '"');
    }
  }
  if (invalidChars.length > 0) {
    var isPlural = invalidChars.length !== 1;
    throw new Error(
      window.arrayToSentence(invalidChars) + ' cannot be used as ' +
      (isPlural ? '' : 'a ') + 'JavaScript parameter name' + (isPlural ? 's' : '') + '.'
    );
  }

  if (len < 3 || 7 < len) {
    throw new RangeError('Number of characters must be no fewer than 3 and no greater than 7.');
  }

  window.assertUnique.apply(null, characters.split(''));

  var gaTracker = window.gaTrackerSnippet(options);

  var gaLoader = window.gaLoaderSnippets['with' + len + 'params']
  .replace(
    new RegExp('([A-' + String.fromCharCode(65 + len - 1) + '])(?=[^a-z])', 'g'),
    function(str) {
      var char = characters.charAt(str.charCodeAt(0) - 65);
      if (options.color) {
        // Colorize with ANSI green color
        char = '\u001b[32m' + char + '\u001b[39m';
      }
      return char;
    }
  );

  if (options.globalName) {
    gaLoader = gaLoader.replace(/"ga"/g, '"' + options.globalName + '"');
  }

  if (options.singleQuotes === undefined || options.singleQuotes) {
    gaLoader = gaLoader.replace(/"/g, '\'');
  }

  if (options.track === undefined || options.track) {
    gaLoader = gaLoader + '\n\n' + gaTracker;
  }

  if (options.scriptTag) {
    gaLoader = '<script>\n' + gaLoader + '\n</script>';
  }

  if (options.minify) {
    gaLoader = gaLoader.replace(/\n/g, '');
  }

  return gaLoader;
};
