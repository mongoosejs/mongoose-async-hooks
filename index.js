'use strict';

const asyncHooks = require('async_hooks');
const SCOPE_MODE = 'scope';
const EMIT_MODE = 'emit';

module.exports = (schema, options) => {
  options = options || {};
  schema.statics.$wrapCallback = function(callback) {
    var _this = this;
    const resourceName = `mongoose.${this.modelName}`;
    const resource = new asyncHooks.AsyncResource(resourceName);
    // add "mode" option for testing
    if (resource.runInAsyncScope) {
      options.mode = options.mode || SCOPE_MODE;
    } else {
      options.mode = EMIT_MODE;
    }

    return function() {
      let emittedAfter = false;
      const args = Array.prototype.slice.call(arguments, 0);
      try {
        if (options.mode === SCOPE_MODE) {
          args.unshift(callback, null);
          emittedAfter = true;
          resource.runInAsyncScope.apply(resource, args);
          return;
        }

        // asyncResource.emitBefore() and asyncResource.emittedAfter() are already deprecated since node v9.6.0
        resource.emitBefore();
        callback.apply(null, args);
        emittedAfter = true;
        resource.emitAfter();
      } catch (error) {
        if (!emittedAfter) {
          resource.emitAfter();
        }
        _this.emit('error', error);
      }
    };
  };
};
