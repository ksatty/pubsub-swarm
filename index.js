'use strict';

const   swarm = require('discovery-swarm'),
        gossip = require('secure-gossip'),
        EventEmitter = require('events'),
        util = require('util');

const GOSSIP = Symbol('gossip')
const SWARM = Symbol('swarm')

class Pubsub extends EventEmitter {
    constructor(topic, opts) {
        super()

        if (!topic) { throw new Error('a topic must be set') }
        if (typeof topic !== 'string') { throw new Error('topic must be a string') }

        opts = opts || {}
        opts.port = opts.port || 0

        this[GOSSIP] = gossip()

        this.id = this[GOSSIP].keys.public
        this.port = opts.port

        this[SWARM] = swarm()

        this[SWARM].join(topic)

        let firstConn = false

        this[SWARM].on('connection', (connection) => {
            let g = this[GOSSIP].createPeerStream()
            connection.pipe(g).pipe(connection)

            if (!firstConn && this[SWARM].connections.length === 1) {
                firstConn = true
                this.emit('connected', connection)
            }
        })

        // TODO: fire event when you have no peers left
        // ...

        this[SWARM].listen(opts.port)

        this[GOSSIP].on('message', (msg) => {
            this.emit('message', msg)
        })
    }

    publish(msg) {    
        this[GOSSIP].publish(msg)
    }
}

module.exports = Pubsub
