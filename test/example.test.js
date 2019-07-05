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

  describe('integrates with Node.js async hooks', function () {
    const getAssertFn = (mode, myModelName) => {
      return done => {
        const types = [];
        const hooks = {
          init: (asyncId, type) => {
            types.push(type);
          }
        };

        const asyncHook = require('async_hooks').createHook(hooks);

        const schema = new Schema({ name: String });

        // Add this plugin
        schema.plugin(mongooseAsyncHooks, { mode });

        const MyModel = mongoose.model(myModelName, schema);

        asyncHook.enable();

        const doc = new MyModel({ name: 'test' });
        doc.save(function(error, doc) {
          asyncHook.disable();

          assert.ok(types.includes('mongoose.' + myModelName));
          // acquit:ignore:start
          done();
          // acquit:ignore:end
        });
      };
    };

    // node>=9.6.0
    it('scope mode', getAssertFn('scope', 'MyModel'));

    // node<9.6.0
    it('emit mode', getAssertFn('emit', 'MyAnotherModel'));
  });
});
