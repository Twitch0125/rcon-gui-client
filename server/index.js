'use strict'
const path = require('path')
const consola = require('consola')
const feathers = require('@feathersjs/feathers')
const express = require('@feathersjs/express')
const Rcon = require('rcon-client').Rcon
process.env.NODE_CONFIG_DIR = path.join(__dirname, 'config/')

async function start () {
  const app = express(feathers())

  const { Nuxt, Builder } = require('nuxt')

  // Setup nuxt.js
  const config = require('../nuxt.config.js')
  config.rootDir = path.resolve(__dirname, '..')
  config.dev = process.env.NODE_ENV !== 'production'

  const nuxt = new Nuxt(config)
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  const configuration = require('@feathersjs/configuration')
  app.configure(configuration()).use(nuxt.render)

  const host = app.get('host')
  const port = app.get('port')
  const rconConnection = await Rcon.connect({host: process.env.RCON_HOST, port: process.env.RCON_PORT, password: process.env.RCON_PASSWORD})

  app.listen(port)

  consola.ready({
    message: `Feathers application started on ${host}:${port}`,
    badge: true
  })
}

start()
