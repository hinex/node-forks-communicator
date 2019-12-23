const { emit, subscribe } = require("../../fork");

const all = subscribe("all", ({ message }) => {
  console.log(`[another fork] Message for all ${message}`);
});

subscribe("meow", ({ message }) => {
  console.log(`[another fork] Meow recived: ${message}`);
  emit("requestYeah");

  all.unsubscribe();
});

emit("say", "[another fork] Meow from another fork");
