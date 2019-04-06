'use strict';

let crypto = require('crypto')
let fs = require('fs')
let path = require('path')
let log = require('util').debuglog(progname())
let Pbf = require('pbf')
let crx3_pb = require('./crx3_pb')

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

function progname() { return path.basename(process.argv[1] || 'omglol') }

exports.u = { read, err, progname }

exports.parse = function(buf) {
    let len = buf => buf.readUInt32LE(0)

    if ("Cr24" !== buf.slice(0, 4).toString()) throw new Error('not a crx file')
    if (3 !== len(buf.slice(4, 8))) throw new Error('not a crx3 file')
    let header_size = len(buf.slice(8, 12))
    let meta = 4*3
    let header = buf.slice(12, header_size + meta)

    let crx_file_header = parse_header(header)
    return Object.assign({
	header_total_len: header.length + meta,
	payload_len: buf.length - header.length - meta
    }, crx_file_header)
}

function parse_header(buf) {
    let pbf = new Pbf(buf)
    let hdr = crx3_pb.CrxFileHeader.read(pbf)

    pbf = new Pbf(hdr.signed_header_data)
    hdr.signed_header_data = crx3_pb.SignedData.read(pbf)
    return hdr
}

// the first 128 bits of the sha256 hash of the public key must be == crx id
exports.validate_rsa = function(public_key, id) {
    let a = crypto.createHash('sha256').update(public_key).digest().slice(0, 16)
    return a.equals(id)
}

exports.pem2der = function(buf) {
    return crypto.createPublicKey(buf).export({type: 'spki', format: 'der'})
}

exports.der2pem = function(buf) {
    return crypto.createPublicKey({key: buf, type: 'spki', format: 'der'})
	.export({type: 'spki', format: 'pem'})
}

exports.keypair = function(file) {
    return read(file).then( r => ({
	public_der: exports.pem2der(r),
	private: crypto.createPrivateKey(r)
    }))
}

exports.Maker = class {
    constructor(keypair, payload) {
	this.key = keypair
	this.payload = payload
    }

    id() {
	return crypto.createHash('sha256')
	    .update(this.key.public_der).digest().slice(0, 16)
    }

    signed_data() {
	let pb
	return this._signed_data || ( // memoization
	    pb = new Pbf(),
	    crx3_pb.SignedData.write({crx_id: this.id()}, pb),
	    this._signed_data = pb.finish()
	)
    }

    sign() {
	let magic_str = "CRX3 SignedData\x00"
	return crypto.createSign('sha256')
	    .update(magic_str)
	    .update(len(this.signed_data()))
	    .update(this.signed_data())
	    .update(this.payload)
	    .sign(this.key.private)
    }

    header() {
	let pb = new Pbf()
	crx3_pb.CrxFileHeader.write({
	    sha256_with_rsa: [{	// AsymmetricKeyProof
		public_key: this.key.public_der,
		signature: this.sign()
	    }],
	    signed_header_data: this.signed_data()
	}, pb)
	return pb.finish()
    }

    creat() {
	let magic_str = Buffer.from('Cr24')
	let version = len('xxx')
	let header_size = len(this.header())

	return Buffer.concat([magic_str, version, header_size, this.header(),
			      this.payload])
    }
}

function len(o) {		// 4 bytes, little-endian
    let buf = Buffer.alloc(4)
    buf.writeUInt32LE(o.length, 0)
    return buf
}
