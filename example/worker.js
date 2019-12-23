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
