'use strict';

const asyncHooks = require('async_hooks');

module.exports = (schema, options) => {
  schema.statics.$wrapCallback = function(callback) {
    var _this = this;
    const resourceName = `mongoose.${this.modelName}`;
    const resource = new asyncHooks.AsyncResource(resourceName);
    return function() {
      let emittedAfter = false;
      try {
        resource.emitBefore();
        callback.apply(null, arguments);
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
