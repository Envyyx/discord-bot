const express = require("express")

const server = express()

server.all("/", (req, res) => { res.send("Up")})


server.listen(3000, () => { console.log("Server ready")})


module.exports = server;