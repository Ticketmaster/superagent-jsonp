var _ = require('lodash');

function serialise(obj) {
  if (!_.isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null !== obj[key] && undefined !== obj[key]) {
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

module.exports = function(superagent) {
  var Request = superagent.Request;
  Request.prototype.jsonp = jsonp;

  return superagent;
};

function jsonp(options) {
  options = options || {};
  this.options = _.defaults(options, { callbackName : 'cb' });
  this.callbackName = 'superagentCallback' + new Date().valueOf() + parseInt(Math.random() * 1000);

  window[this.callbackName] = callbackWrapper.bind(this);;

  this.end = end;

  return this;
}

function callbackWrapper(data) {
  var err = null;
  var res = {
    body: data
  };

  this.callback.apply(this, [err, res]);
}

function end(callback) {
  this.callback = callback;

  this._query.push(serialise({ callback : this.callbackName }));
  var queryString = this._query.join('&');

  var s = document.createElement('script');
  var separator = (this.url.indexOf('?') > -1) ? '&': '?';
  var url = this.url + separator + queryString;

  s.src = url;

  document.getElementsByTagName('head')[0].appendChild(s);
}
