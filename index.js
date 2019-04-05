'use strict';

let fs = require('fs')
let path = require('path')
let log = require('util').debuglog(progname())

function read(file) {
    let stream = file ? fs.createReadStream(file) : process.stdin
    let data = []
    return new Promise( (resolve, reject) => {
	stream.on('error', reject)
	stream.on('data', chunk => data.push(chunk))
	stream.on('end', () => resolve(Buffer.concat(data)))
    })
}

function err(s) {
    console.error(progname(), 'error:', s instanceof Error ? s.message : s)
    if (s instanceof Error) log(s.stack)
    process.exit(1)
}

function progname() { return path.basename(process.argv[1]) }

exports.u = { read, err, progname }
