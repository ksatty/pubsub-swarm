var Pubsub = require('./index')

var swarm = new Pubsub('foobar')

swarm.on('message', function (msg) {
  console.log('message', msg)
  setTimeout(function() { process.exit(0) }, 1000)
})

swarm.on('connected', function () {
  swarm.publish({ data: 'hello warld from ' + this.id + '!'})
})
