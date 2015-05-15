# superagent-jsonp
Adds jsonp behaviour to superagent.

## To use with browserify

First install with npm

``` npm i superagent-jsonp --save ```

Then use like so;

```js
var superagent = require('superagent');

require('superagent-jsonp')(superagent);

superagent.get('http://example.com/foo.json').jsonp().end(function(){
  // everything is as normal
});

```

## To use with bower

First install:

``` bower i superagent-jsonp --save```

Include it from your bower components in the usual way

Then use pretty much as you do above

```js
superagentJSONP(superagent);

superagent.get('http://example.com/foo.json').jsonp().end(function(){
  // everything is as normal
});
```

## Changes from upstream

Forked from: https://github.com/lamp/superagent-jsonp

- Dependency on underscore changed to lodash (and added to package.json)
- Conditional write to "window" removed
- Do not override end() function unless we first call jsonp(), and only for current request
- expand "!= null" to "!== null && !== undefined"
- Add mocha unit tests
- [Call callback the same way as superagent](https://github.com/lamp/superagent-jsonp/pull/3)
- [Add jsonp query string with a "&" instead of "?" if url already contains parameters](https://github.com/lamp/superagent-jsonp/pull/2)
