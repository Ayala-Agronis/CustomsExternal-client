// Polyfills for legacy signalr — jQuery 3.3+ removed $.isFunction, jQuery 4.x removed $.type
(function ($) {
  if (!$) return;
  if (!$.isFunction) {
    $.isFunction = function (obj) {
      return typeof obj === 'function';
    };
  }
  if (!$.type) {
    $.type = function (obj) {
      if (obj === null) return 'null';
      if (obj === undefined) return 'undefined';
      const str = Object.prototype.toString.call(obj);
      return str.slice(8, -1).toLowerCase();
    };
  }
})(window['jQuery'] || window['$']);
