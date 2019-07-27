'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashIsEqual = require('lodash/isEqual');

var _lodashIsEqual2 = _interopRequireDefault(_lodashIsEqual);

var _lodashIsFunction = require('lodash/isFunction');

var _lodashIsFunction2 = _interopRequireDefault(_lodashIsFunction);

var _lodashIsObject = require('lodash/isObject');

var _lodashIsObject2 = _interopRequireDefault(_lodashIsObject);

var _lodashKeys = require('lodash/keys');

var _lodashKeys2 = _interopRequireDefault(_lodashKeys);

var _lodashUnion = require('lodash/union');

var _lodashUnion2 = _interopRequireDefault(_lodashUnion);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var isReferenceEntity = function isReferenceEntity(o) {
  return Array.isArray(o) || (0, _lodashIsObject2['default'])(o);
};

var DeepDiff = (function () {
  function DeepDiff(prev, next, name, opts) {
    _classCallCheck(this, DeepDiff);

    this.prev = prev;
    this.next = next;
    this.name = name;
    this.opts = opts;
    this.useImmutable = opts.useImmutable;
  }

  _createClass(DeepDiff, [{
    key: 'run',
    value: function run() {
      if (this.opts.maxdepth <= 0) return;
      var isRefEntity = isReferenceEntity(this.prev) && isReferenceEntity(this.next);

      if (!(0, _lodashIsEqual2['default'])(this.prev, this.next)) {
        var isFunc = (0, _lodashIsFunction2['default'])(this.prev) && (0, _lodashIsFunction2['default'])(this.next);

        if (isFunc) {
          if (this.prev.name === this.next.name) {
            this.notify('Value is a function. Possibly avoidable re-render?', false);
          }
        } else if (isRefEntity) {
          this.refDeepDiff();
        }
      } else if (this.prev !== this.next) {
        this.notify('Value did not change. Avoidable re-render!', true);

        if (isRefEntity) {
          this.refDeepDiff();
        }
      }
    }
  }, {
    key: 'notify',
    value: function notify(status, bold) {
      console.group(this.name);

      if (bold) {
        console.warn('%c%s (depth %d)', 'font-weight: bold', status, this.opts.maxdepth);
      } else {
        console.warn('%s (depth %d)', status, this.opts.maxdepth);
      }

      console.log('%cbefore', 'font-weight: bold', this.prev);
      console.log('%cafter ', 'font-weight: bold', this.next);
      console.groupEnd();
    }
  }, {
    key: 'refDeepDiff',
    value: function refDeepDiff() {
      var _this = this;

      var keys = undefined;
      if (this.useImmutable && this.isImmutable()) {
        // Immutable.List's instance do not have _keys, so forEach do not execute 😎
        keys = (0, _lodashUnion2['default'])(this.prev._keys, this.next._keys);
      } else {
        keys = (0, _lodashUnion2['default'])((0, _lodashKeys2['default'])(this.prev), (0, _lodashKeys2['default'])(this.next));
      }
      var opts = this.opts;
      opts.maxdepth = this.opts.maxdepth - 1;
      keys.forEach(function (key) {
        return new DeepDiff(_this.prev[key], _this.next[key], _this.name + '.' + key, opts).run();
      });
    }
  }, {
    key: 'isImmutable',
    value: function isImmutable() {
      return _immutable2['default'].Iterable.isIterable(this.prev) && _immutable2['default'].Iterable.isIterable(this.next);
    }
  }]);

  return DeepDiff;
})();

exports.DeepDiff = DeepDiff;