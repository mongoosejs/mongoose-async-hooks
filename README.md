# mongoose-async-hooks

[Mongoose](http://mongoosejs.com/) plugin providing experimental support for [Node.js `async_hooks`](https://nodejs.org/api/async_hooks.html)

# Importing

```javascript
// Using Node.js `require()`
const mongooseAsyncHooks = require('@mongoosejs/async-hooks');

// Using ES6 imports
import mongooseAsyncHooks from '@mongoosejs/async-hooks';
```


# Examples

## It integrates with Node.js async hooks

```javascript
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
});
```
