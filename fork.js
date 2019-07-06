const UUID = require("uuid/v4");

let pool = [];

process.on("message", message => {
  const filtered = pool.filter(p => p.channel === message.channel);

  for (const item of filtered) {
    try {
      item.callback(message);
    } catch (e) {
      console.error(e);
    }
  }
});

const emit = (channel, msg) => {
  process.send({
    type: "message",
    channel,
    message: msg
  });
};

const unsubscribe = id => {
  process.send({
    type: "unsubscribe",
    id
  });

  pool = pool.filter(p => p.id !== id);
};

const subscribe = (channel, callback) => {
  const id = UUID();

  process.send({
    type: "subscribe",
    channel,
    id
  });

  pool.push({ id, channel, callback });

  return {
    unsubscribe: unsubscribe.bind(null, id)
  };
};

module.exports = {
  subscribe,
  emit
};
