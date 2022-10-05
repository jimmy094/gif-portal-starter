const fs = require('fs')
const anchor = require("@project-serum/anchor")

const account = anchor.web3.Keypair.generate()

fs.writeFileSync('./keypair.json', JSON.stringify(account))

//this will write a keypair directly into our file system, that way anythime people come to our web app they will all load the same keypair