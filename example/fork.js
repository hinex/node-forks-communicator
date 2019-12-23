const { setup, subscribe, emit } = require("../index");
const { fork } = require("child_process");
const { join } = require("path");

// Wrap forks in the communicator
setup(fork(join(__dirname, "/child/fork.js")));
setup(fork(join(__dirname, "/child/another_fork.js")));

// Subscribe to channels from master process
subscribe("say", ({ message }) => console.log(`[master] recived: ${message}`));
subscribe("requestYeah", () => {
  // Send message from master to all subscribtions
  emit("all", "yeah");
});
