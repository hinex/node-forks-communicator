const UUID = require("uuid/v4")

let pool = []

const workerCheck = () => {
  try {
    const { isMainThread, parentPort } = require('worker_threads')

    return !isMainThread && parentPort
  } catch (e) {
    return false
  }
}

const parentPort = workerCheck()

const onMessage = message => {
  const filtered = pool.filter(p => p.channel === message.channel)

  for (const item of filtered) {
    try {
      item.callback(message)
    } catch (e) {
      console.error(e)
    }
  }
}

if (parentPort) {
  parentPort.on('message', onMessage)
} else {
  process.on("message", onMessage)
}

const emit = (channel, msg) => {
  const message = {
    type: "message",
    channel,
    message: msg
  }

  if (parentPort) {
    parentPort.postMessage(message)
    return
  }

  process.send(message)
}

const unsubscribe = id => {
  const message = {
    type: "unsubscribe",
    id
  }

  pool = pool.filter(p => p.id !== id)

  if (parentPort) {
    parentPort.postMessage(message)
    return
  }

  process.send(message)
}

const subscribe = (channel, callback) => {
  const id = UUID()

  const message = {
    type: "subscribe",
    channel,
    id
  }

  const unsubscribeHandler = {
    unsubscribe: unsubscribe.bind(null, id)
  }

  pool.push({ id, channel, callback })

  if (parentPort) {
    parentPort.postMessage(message)
    return unsubscribeHandler
  }

  process.send(message)

  return unsubscribeHandler
}

module.exports = {
  subscribe,
  emit
}
