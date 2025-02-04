"use strict";

var _expect = _interopRequireDefault(require("expect"));

var _draftJs = require("draft-js");

var _stateToHTML = _interopRequireDefault(require("../stateToHTML"));

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _global = global,
    describe = _global.describe,
    it = _global.it;
// This separates the test cases in `data/test-cases.txt`.
var SEP = '\n\n#';

var testCasesRaw = _fs["default"].readFileSync((0, _path.join)(__dirname, '..', '..', 'test', 'test-cases.txt'), 'utf8'); // These test cases specify custom options also.


var testCasesCustomRaw = _fs["default"].readFileSync((0, _path.join)(__dirname, '..', '..', 'test', 'test-cases-custom.txt'), 'utf8');

var testCases = testCasesRaw.slice(1).trim().split(SEP).map(function (text) {
  var lines = text.split('\n');
  var description = lines.shift().trim();
  var state = JSON.parse(lines.shift());
  var html = lines.join('\n');
  return {
    description: description,
    state: state,
    html: html
  };
});
var testCasesCustom = testCasesCustomRaw.slice(1).trim().split(SEP).map(function (text) {
  var lines = text.split('\n');
  var description = lines.shift().trim();
  var options = JSON.parse(lines.shift());
  var state = JSON.parse(lines.shift());
  var html = lines.join('\n');
  return {
    description: description,
    options: options,
    state: state,
    html: html
  };
});
describe('stateToHTML', function () {
  testCases.forEach(function (testCase) {
    var description = testCase.description,
        state = testCase.state,
        html = testCase.html;
    it("should render ".concat(description), function () {
      var contentState = (0, _draftJs.convertFromRaw)(state);
      (0, _expect["default"])((0, _stateToHTML["default"])(contentState)).toBe(html);
    });
  });
  testCasesCustom.forEach(function (testCase) {
    var description = testCase.description,
        options = testCase.options,
        state = testCase.state,
        html = testCase.html;
    it("should render ".concat(description), function () {
      var contentState = (0, _draftJs.convertFromRaw)(state);
      (0, _expect["default"])((0, _stateToHTML["default"])(contentState, options)).toBe(html);
    });
  });
  it('should support custom block renderer', function () {
    var options = {
      blockRenderers: {
        'code-block': function codeBlock(block) {
          return "<div class=\"code\">".concat(block.getText(), "</div>");
        }
      }
    };
    var contentState = (0, _draftJs.convertFromRaw)( // <pre><code>Hello <em>world</em>.</code></pre>
    {
      entityMap: {},
      blocks: [{
        key: 'dn025',
        text: 'Hello world.',
        type: 'code-block',
        depth: 0,
        inlineStyleRanges: [{
          offset: 6,
          length: 5,
          style: 'ITALIC'
        }],
        entityRanges: []
      }]
    } // eslint-disable-line
    );
    (0, _expect["default"])((0, _stateToHTML["default"])(contentState, options)).toBe('<div class="code">Hello world.</div>');
    var contentState2 = (0, _draftJs.convertFromRaw)( // <h1>Hello <em>world</em>.</h1>
    {
      entityMap: {},
      blocks: [{
        key: 'dn025',
        text: 'Hello world.',
        type: 'header-one',
        depth: 0,
        inlineStyleRanges: [{
          offset: 6,
          length: 5,
          style: 'ITALIC'
        }],
        entityRanges: []
      }]
    } // eslint-disable-line
    );
    (0, _expect["default"])((0, _stateToHTML["default"])(contentState2, options)).toBe('<h1>Hello <em>world</em>.</h1>');
  });
  it('should support inline style function', function () {
    var options = {
      inlineStyleFn: function inlineStyleFn(styles) {
        var key = 'color-';
        var color = styles.filter(function (value) {
          return value.startsWith(key);
        }).first();

        if (color) {
          return {
            element: 'span',
            style: {
              color: color.replace(key, '')
            }
          };
        }
      }
    };
    var contentState = (0, _draftJs.convertFromRaw)( //<p>Hello <span style="color: #f8b400">world</span></p>
    {
      entityMap: {},
      blocks: [{
        key: '7h6g0',
        text: 'Hello world',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [{
          offset: 6,
          length: 5,
          style: 'color-#f8b400'
        }],
        entityRanges: [],
        data: {}
      }]
    });
    (0, _expect["default"])((0, _stateToHTML["default"])(contentState, options)).toBe('<p>Hello <span style="color: #f8b400">world</span></p>');
  });
  it('should support custom block styles', function () {
    var options = {
      blockStyleFn: function blockStyleFn(block) {
        var alignment = block.getData ? block.getData().get('alignment') : null;

        if (alignment) {
          return {
            style: {
              textAlign: alignment
            }
          };
        }
      }
    };
    var contentState1 = (0, _draftJs.convertFromRaw)( // <h1 style="text-align: left;">Hello <em>world</em>.</h1>
    {
      entityMap: {},
      blocks: [{
        data: {
          alignment: 'left'
        },
        key: 'dn025',
        text: 'Hello world.',
        type: 'header-one',
        depth: 0,
        inlineStyleRanges: [{
          offset: 6,
          length: 5,
          style: 'ITALIC'
        }],
        entityRanges: []
      }]
    } // eslint-disable-line
    );

    if (contentState1.getFirstBlock().getData == null) {
      // Older DraftJS does not support block.getData()
      return;
    }

    (0, _expect["default"])((0, _stateToHTML["default"])(contentState1, options)).toBe('<h1 style="text-align: left">Hello <em>world</em>.</h1>');
    var contentState2 = (0, _draftJs.convertFromRaw)( // <h1>Hello <em>world</em>.</h1>
    {
      entityMap: {},
      blocks: [{
        key: 'dn025',
        text: 'Hello world.',
        type: 'header-one',
        depth: 0,
        inlineStyleRanges: [{
          offset: 6,
          length: 5,
          style: 'ITALIC'
        }],
        entityRanges: []
      }]
    } // eslint-disable-line
    );
    (0, _expect["default"])((0, _stateToHTML["default"])(contentState2, options)).toBe('<h1>Hello <em>world</em>.</h1>');
  });
  it('should support custom entity styles', function () {
    var options = {
      entityStyleFn: function entityStyleFn(entity) {
        var entityType = entity.getType().toUpperCase();

        if (entityType === 'MENTION') {
          return {
            element: 'a',
            attributes: {
              href: "/users/".concat(entity.getData()['userId']),
              "class": 'mention'
            }
          };
        }
      }
    };
    var contentState1 = (0, _draftJs.convertFromRaw)( // <p><em>a</em></p>
    {
      entityMap: _defineProperty({}, 0, {
        type: 'MENTION',
        mutability: 'MUTABLE',
        data: {
          userId: 'mikaelwaltersson'
        }
      }),
      blocks: [{
        key: '8r91j',
        text: 'a',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [{
          offset: 0,
          length: 1,
          style: 'ITALIC'
        }],
        entityRanges: [{
          offset: 0,
          length: 1,
          key: 0
        }]
      }]
    } // eslint-disable-line
    );

    if (contentState1.getFirstBlock().getData == null) {
      // Older DraftJS does not support block.getData()
      return;
    }

    (0, _expect["default"])((0, _stateToHTML["default"])(contentState1, options)).toBe('<p><a href="/users/mikaelwaltersson" class="mention"><em>a</em></a></p>');
  });
  it('should support custom block tag', function () {
    var contentState = (0, _draftJs.convertFromRaw)({
      entityMap: {},
      blocks: [{
        key: '33nh8',
        text: 'a',
        type: 'unstyled',
        depth: 0,
        inlineStyleRange: [],
        entityRanges: []
      }]
    });
    (0, _expect["default"])((0, _stateToHTML["default"])(contentState)).toBe('<p>a</p>');
    (0, _expect["default"])((0, _stateToHTML["default"])(contentState, {
      defaultBlockTag: 'h1'
    })).toBe('<h1>a</h1>');
    (0, _expect["default"])((0, _stateToHTML["default"])(contentState, {
      defaultBlockTag: null
    })).toBe('a');
  });
});