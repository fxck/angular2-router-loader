var should = require('should');
var loader = require('../src/index');

function checkResult(loaded, result) {
  return loaded.should.eql(result.join(''));
}

describe('Loader', function() {
  var resourcePath = 'path/to/routes.ts';
  var modulePath = './path/to/file.module#FileModule';
  var query = '';

  it('should return a loadChildren async require statement', function() {
    var result = [
      'loadChildren: () => new Promise(function (resolve) {',
      '  (require as any).ensure([], function (require: any) {',
      '    resolve(require(\'./path/to/file.module\')[\'FileModule\']);',
      '  });',
      '})'
    ];

    var loadedString = loader.call({
      resourcePath: resourcePath,
      query: query
    }, `loadChildren: '${modulePath}'`);

    checkResult(loadedString, result);
  });

  it('should return a loadChildren sync require statement', function() {
    var result = [
      'loadChildren: function() {',
      '  return require(\'./path/to/file.module\')[\'FileModule\'];',
      '}'
    ];

    var loadedString = loader.call({
      resourcePath: resourcePath,
      query: query
    }, `loadChildren: '${modulePath}?sync=true'`);

    checkResult(loadedString, result);
  });

  it ('should return a loadChildren System.import statement', function() {
    var result = [
      'loadChildren: () => System.import(\'./path/to/file.module\')',
      '  .then(function(module) {',
      '    return module[\'FileModule\'];',
      '  })'
    ];

    var loadedString = loader.call({
      resourcePath: resourcePath,
      query: '?loader=system'
    }, `loadChildren: '${modulePath}'`);

    checkResult(loadedString, result);
  });

  it('should return a loadChildren async require statement with default', function() {
    var modulePath = './path/to/file.module';

    var result = [
      'loadChildren: () => new Promise(function (resolve) {',
      '  (require as any).ensure([], function (require: any) {',
      '    resolve(require(\'./path/to/file.module\')[\'default\']);',
      '  });',
      '})'
    ];

    var loadedString = loader.call({
      resourcePath: resourcePath,
      query: query
    }, `loadChildren: '${modulePath}'`);

    checkResult(loadedString, result);
  });

  it('should support a custom delimiter', function() {
    var result = [
      'loadChildren: () => new Promise(function (resolve) {',
      '  (require as any).ensure([], function (require: any) {',
      '    resolve(require(\'./path/to/file.module\')[\'FileModule\']);',
      '  });',
      '})'
    ];

    var loadedString = loader.call({
      resourcePath: resourcePath,
      query: '?delimiter=*'
    }, `loadChildren: '${modulePath.replace('#', '*')}'`);

    checkResult(loadedString, result);
  });

  it('should support windows file paths', function() {
    var pmock = require('pmock');
    var env = pmock.platform('win32');

    var result = [
      'loadChildren: () => new Promise(function (resolve) {',
      '  (require as any).ensure([], function (require: any) {',
      '    resolve(require(\'.\\\\path\\\\to\\\\file.module\')[\'FileModule\']);',
      '  });',
      '})'
    ];

    var loadedString = loader.call({
      resourcePath: resourcePath,
      query: query
    }, `loadChildren: '${modulePath}'`);

    checkResult(loadedString, result);

    env.reset();
  });

  describe('AoT', function() {
    beforeEach(function() {
      query = '?aot=true&genDir=.'
    });

    it('should return a loadChildren async require statement', function() {
      var result = [
        'loadChildren: () => new Promise(function (resolve) {',
        '  (require as any).ensure([], function (require: any) {',
        '    resolve(require(\'../../path/to/file.module.ngfactory\')[\'FileModuleNgFactory\']);',
        '  });',
        '})'
      ];

      var loadedString = loader.call({
        resourcePath: resourcePath,
        query: query
      }, `loadChildren: '${modulePath}'`);

      checkResult(loadedString, result);
    });

    it('should return a loadChildren sync require statement', function() {
      var result = [
        'loadChildren: function() {',
        '  return require(\'../../path/to/file.module.ngfactory\')[\'FileModuleNgFactory\'];',
        '}'
      ];

      var loadedString = loader.call({
        resourcePath: resourcePath,
        query: query
      }, `loadChildren: '${modulePath}?sync=true'`);

      checkResult(loadedString, result);
    });

    it ('should return a loadChildren System.import statement', function() {
      var result = [
        'loadChildren: () => System.import(\'../../path/to/file.module.ngfactory\')',
        '  .then(function(module) {',
        '    return module[\'FileModuleNgFactory\'];',
        '  })'
      ];

      var loadedString = loader.call({
        resourcePath: resourcePath,
        query: query + '&loader=system'
      }, `loadChildren: '${modulePath}'`);

      checkResult(loadedString, result);
    });

    it('should support a custom moduleSuffix', function() {
      var moduleSuffix = '.ngfile';

      var result = [
        'loadChildren: () => new Promise(function (resolve) {',
        '  (require as any).ensure([], function (require: any) {',
        '    resolve(require(\'../../path/to/file.module' + moduleSuffix + '\')[\'FileModuleNgFactory\']);',
        '  });',
        '})'
      ];

      var loadedString = loader.call({
        resourcePath: resourcePath,
        query: query + '&moduleSuffix=' + moduleSuffix
      }, `loadChildren: '${modulePath}'`);

      checkResult(loadedString, result);
    });

    it('should support a custom factorySuffix', function() {
      var factorySuffix = 'NgFact';

      var result = [
        'loadChildren: () => new Promise(function (resolve) {',
        '  (require as any).ensure([], function (require: any) {',
        '    resolve(require(\'../../path/to/file.module.ngfactory\')[\'FileModule' + factorySuffix + '\']);',
        '  });',
        '})'
      ];

      var loadedString = loader.call({
        resourcePath: resourcePath,
        query: query + '&factorySuffix=' + factorySuffix
      }, `loadChildren: '${modulePath}'`);

      checkResult(loadedString, result);
    });
  });
});
