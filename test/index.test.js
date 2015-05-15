var chai = require('chai');
var sinon = require('sinon');

chai.config.includeStack = true;
chai.config.showDiff = false;
chai.use(require('sinon-chai'));

var expect = chai.expect;

describe('Superagent JSONP library', function() {
  var _ = require('lodash');
  var document;
  var request;
  var window;

  beforeEach(function() {
    var MockRequest = function(method, url) {
      this.method = method;
      this.url = url;
      this._query = [];
    };
    request = {};
    request.get = sinon.spy(function(url) {
      return new MockRequest('GET', url);
    });
    request.Request = MockRequest;

    document = global.document = {};
    window = global.window = {};
  });

  function install() {
    require('../index')(request);
  }

  describe('during import', function() {
    it('provides jsonp but does not override end', function() {
      install();
      expect(request.Request.prototype.jsonp).to.be.ok;
      expect(request.Request.prototype.end).to.not.be.ok;
    });
  });

  describe('jsonp function', function() {
    function verify(thisRequest) {
      expect(thisRequest.callbackName).to.match(/^superagentCallback/);
      expect(thisRequest.end).not.to.equal(request.end);
      expect(window[thisRequest.callbackName]).to.be.ok;
    }

    it('installs a new callback function into the global context', function() {
      install();
      request.end = sinon.spy(function(callback) {
        return callback(false, {});
      });

      var currentRequest = request.get("/foo").jsonp();
      verify(currentRequest);

      var otherRequest = request.get("/foo").jsonp();
      verify(otherRequest);
      expect(otherRequest.callbackName).to.not.equal(currentRequest.callbackName);
    });
  });

  describe('end function', function() {
    it('returns result data as 2nd argument to user-provided callback', function() {
      install();

      var mockResult = { 'it': 'works' };

      var completed = sinon.spy(function(err, res) {
        expect(err).to.not.be.ok;
        expect(res).to.deep.equal({ body: mockResult });
      });

      request.end = sinon.spy(function(callback) {
        return callback(true, {});
      });

      var inScriptTag = {};
      document.createElement = sinon.spy(function() {
        return inScriptTag;
      });

      var outScriptTag;
      var appendChild = sinon.spy(function(tag) {
        outScriptTag = tag;
      });
      document.getElementsByTagName = sinon.spy(function() {
        return [{ appendChild: appendChild }];
      });

      var currentRequest = request.get('/foo').jsonp();
      expect(currentRequest.url).to.equal('/foo');
      currentRequest.end(completed);

      var expectedQueryString = 'callback=' + currentRequest.callbackName;
      expect(_.contains(currentRequest._query, expectedQueryString)).to.be.ok;

      expect(completed).not.to.be.called;
      expect(document.createElement).to.be.calledOnce;
      expect(document.getElementsByTagName).to.be.calledOnce;
      expect(appendChild).to.be.calledOnce;
      expect(outScriptTag.src).to.equal('/foo?' + expectedQueryString);

      window[currentRequest.callbackName](mockResult);
      expect(completed).to.be.calledOnce;
    });
  });

});
