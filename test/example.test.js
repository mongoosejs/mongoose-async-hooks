'use strict';

const assert = require('assert');
const fs = require('fs');
const mongoose = require('mongoose');
const mongooseAsyncHooks = require('../');

const { Schema } = mongoose;

describe('Examples', function() {
  before(function() {
    mongoose.connect('mongodb://localhost:27017/asynchooks');
  });

  after(function() {
    return mongoose.disconnect();
  });

  it('integrates with Node.js async hooks', function(done) {
    const types = [];
    const hooks = {
      init: (asyncId, type) => {
        types.push(type);
      }
    };

    const asyncHook = require('async_hooks').createHook(hooks);

    const schema = new Schema({ name: String });

    // Add this plugin
    schema.plugin(mongooseAsyncHooks);

    const MyModel = mongoose.model('MyModel', schema);

    asyncHook.enable();

    const doc = new MyModel({ name: 'test' });
    doc.save(function(error, doc) {
      asyncHook.disable();

      assert.ok(types.includes('mongoose.MyModel'));
      // acquit:ignore:start
      done();
      // acquit:ignore:end
    });
  });
});
