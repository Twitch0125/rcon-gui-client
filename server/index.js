"use strict";
require("dotenv").config();
const path = require("path");
const consola = require("consola");
const feathers = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
const socketio = require("@feathersjs/socketio");
const Rcon = require("rcon");
process.env.NODE_CONFIG_DIR = path.join(__dirname, "config/");

class CommandService {
  constructor(conn) {
    this.conn = conn;
    conn
      .on("auth", function() {
        console.log("Authed!");
      })
      .on("response", function(str) {
        console.log("Got response: " + str);
      })
      .on("error", function(err) {
        console.log("Got Error", err);
      })
      .on("end", function() {
        console.log("Socket closed!");
        process.exit();
      });

    conn.connect();
  }

  async send(command) {
    this.conn.send(command);
  }
}

async function start() {
  const app = express(feathers());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.configure(express.rest());
  app.configure(socketio());
  app.use(
    "/commands",
    new CommandService(
      new Rcon(
        process.env.RCON_HOST,
        process.env.RCON_PORT,
        process.env.RCON_PASSWORD
      )
    )
  );

  const { Nuxt, Builder } = require("nuxt");

  // Setup nuxt.js
  const config = require("../nuxt.config.js");
  config.rootDir = path.resolve(__dirname, "..");
  config.dev = process.env.NODE_ENV !== "production";

  const nuxt = new Nuxt(config);
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  } else {
    await nuxt.ready();
  }

  const configuration = require("@feathersjs/configuration");
  app.configure(configuration()).use(nuxt.render);

  const host = app.get("host");
  const port = app.get("port");

  app.listen(port);

  app.service('commands').create({
    data: 'this is a response'
  })

  consola.ready({
    message: `Feathers application started on ${host}:${port}`,
    badge: true
  });
}

start();
