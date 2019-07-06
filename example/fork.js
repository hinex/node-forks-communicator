const { emit, subscribe } = require("../fork");

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
