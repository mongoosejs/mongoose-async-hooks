'use strict';

const asyncHooks = require('async_hooks');

module.exports = (schema, options) => {
  schema.statics.$wrapCallback = function(callback) {
    var _this = this;
    const resourceName = `mongoose.${this.modelName}`;
    const resource = new asyncHooks.AsyncResource(resourceName);
    return function() {
      let emittedAfter = false;
      const args = Array.prototype.slice.call(arguments, 0);
      try {
        args.unshift(callback, null);
        if (resource.runInAsyncScope) {
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
