# Node.js fork communicator (messages between processes)

Small library for communication between forks. This library is created for small projects that do not need to store queues and no guarantee of receipt. For more complex tasks, use [rabbitmq](https://www.rabbitmq.com/) or [another message-broker](https://stackshare.io/rabbitmq/alternatives).

### Install

```bash
npm install forks-communicator --save
```

### Usage examples

[Examples available here!](https://github.com/hinex/node-forks-communicator/blob/master/example)

Just clone, go to the example directory and run `fork.js` or `worker.js`.

#### fork.js - Fork example

Create master and forks then wrap forks to the communicator. For master use `forks-communicator` and for forks `forks-communicator/fork`.

```js
const { setup, subscribe, emit } = require("forks-communicator");
const { fork } = require("child_process");
const { join } = require("path");

// Wrap forks in the communicator
setup(fork(join(__dirname, "/child/worker.js")));
setup(fork(join(__dirname, "/child/another_worker.js")));

// Subscribe to channels from master process
subscribe("say", ({ message }) => console.log(`[master] recived: ${message}`));
subscribe("requestYeah", () => {
  // Send message from master to all subscribtions
  emit("all", "yeah");
});
```

#### worker.js - Worker example

Create master and forks then wrap forks to the communicator. For master use `forks-communicator` and for forks `forks-communicator/fork`.

```js
const { setup, subscribe, emit } = require("../index");
const { Worker } = require("worker_threads");
const { join } = require("path");

// Wrap forks in the communicator
setup(new Worker(join(__dirname, "/child/fork.js")));
setup(new Worker(join(__dirname, "/child/another_fork.js")));

// Subscribe to channels from master process
subscribe("say", ({ message }) => console.log(`[master] recived: ${message}`));
subscribe("requestYeah", () => {
  // Send message from master to all subscribtions
  emit("all", "yeah");
});

```

#### child/worker.js

```js
const { emit, subscribe } = require("forks-communicator/fork");

// Subscribe to channel from fork process
subscribe("all", ({ message }) => {
  console.log(`[fork] Message for all ${message}`);
});

// Emit message to "say" channel from fork process
emit("say", "[fork] Meow from fork");

// Emit message to "meow" channel after second from fork process
setTimeout(() => {
  emit("meow", "[fork] Meow to another fork");
}, 1000);
```

#### child/another_worker.js

```js
const { emit, subscribe } = require("forks-communicator/fork");

const all = subscribe("all", ({ message }) => {
  console.log(`[another fork] Message for all ${message}`);
});

subscribe("meow", ({ message }) => {
  console.log(`[another fork] Meow recived: ${message}`);
  emit("requestYeah");

  // Unsubscribe fork :)
  all.unsubscribe();
});

emit("say", "[another fork] Meow from another fork");
```

#### Work result

```bash
[master] recived: [fork] Meow from fork
[master] recived: [another fork] Meow from another fork
[another fork] Meow recived: [fork] Meow to another fork
[fork] Message for all yeah
```
