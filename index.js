const UUID = require("uuid/v4");

let pool = [];

const messageProcess = (fork, m) => {
  try {
    if (m.type === "message") {
      emitList(m);
      return;
    }

    if (m.type === "unsubscribe") {
      unsubscribe(m.id);
      return;
    }

    pool.push({
      id: m.id,
      type: "message",
      channel: m.channel,
      callback: msg => fork.send(msg)
    });
  } catch (e) {
    console.error(e);
  }
};

const emitList = msg => {
  const filtered = pool.filter(p => p.channel === msg.channel);

  for (const item of filtered) {
    try {
      item.callback(msg);
    } catch (e) {
      console.error(e);
    }
  }
};

const emit = (channel, msg) => {
  emitList({
    type: "message",
    channel,
    message: msg
  });
};

const unsubscribe = id => {
  pool = pool.filter(p => p.id !== id);
};

const subscribe = (channel, callback) => {
  if (typeof callback !== "function") {
    throw new Error("Callback must be a function");
  }

  const id = UUID();

  pool.push({ id, channel, callback });

  return {
    unsubscribe: unsubscribe.bind(null, id)
  };
};

const setup = fork => {
  try {
    fork.on("message", messageProcess.bind(null, fork));
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  setup,
  subscribe,
  emit
};
