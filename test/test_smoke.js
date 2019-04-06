#!/opt/bin/mocha --ui=tdd
'use strict';

let assert = require('assert')
let sh = require('child_process').spawnSync
let fs = require('fs')

let tmpdir = 'tmp.' + Math.random()
let tmp = f => tmpdir + '/' + f

process.chdir(__dirname)

suite('cli', function() {
    setup(function() {
	sh('mkdir', [tmpdir])
	assert(sh('zip', [tmp('foo.zip'), 'manifest.json']).status === 0)
	let r = sh('../crx3-new', ['private.pem'], {input: fs.readFileSync(tmp('foo.zip'))})
	assert(r.status === 0)
	fs.writeFileSync(tmp('foo.crx'), r.stdout)
    })

    teardown(function() {
	sh('rm', ['-rf', tmpdir])
    })

    test('info', function() {
	let r = sh('../crx3-info', {input: fs.readFileSync(tmp('foo.crx'))})
	assert.equal(r.status, 0)
	assert.equal(r.stdout.toString(),
		     `id                   efhdamkdoffheefhloplkcfimcfkjgip
header               593
payload              231
sha256_with_rsa      1
sha256_with_ecdsa    0
`)
    })

    test('public key extraction', function() {
	let r = sh('../crx3-info', ['rsa', '0'],
		   {input: fs.readFileSync(tmp('foo.crx'))})
	assert.equal(r.stdout.toString(), `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtaMIFViDA/RgyGW2Rdqm
5DaLkVdyxJepv0R5SV/C+gklQCYkPCLTFWok+a6or28VvjLrNTaD/WGUGtrFpXLe
hRHU8zdsySTeg9kV+XCiRiAMUVhrYhnegauzdKdcRtxLxwz2DS5gWRib2cFHS/VQ
n6hotNB4m3k6cQCIAXGI6EXKYAjXNKgONAnEicYuAjlIjZfm1kczOZSm0nr3I4vM
FztROrFKdtXioJSq315CTk3TNr3j+HjWSufWx/onfZf1hrw77sAJsSUFFnSkJLTr
5yR0OVW4ksyU47AfqmWyXDAOHFXNxBhl6yrEQLWm7QzNqmVrU3DdRnmkV+rdewcY
bQIDAQAB
-----END PUBLIC KEY-----
`)
    })

    test('validate', function() {
	let r = sh('../crx3-info', ['rsa', '0'],
		   {input: fs.readFileSync(tmp('foo.crx'))})
	fs.writeFileSync(tmp('foo.public_key.pem'), r.stdout)

	r = sh('../crx3-validate', ['rsa', tmp('foo.public_key.pem')],
	       {input: fs.readFileSync(tmp('foo.crx'))})
	assert(r.status === 0)

	r = sh('../crx3-validate', ['rsa', 'alien_public.pem'],
	       {input: fs.readFileSync(tmp('foo.crx'))})
	assert(r.status !== 0)
    })
})
