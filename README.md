# crx3-utils

https://sigwait.org/~alex/blog/2019/04/01/crx3.html

Starting with Chrome 73, Chrome changed the package format for
extensions to the CRX3 file format.

    $ npm -g i crx3-utils

Usage:

    $ crx3-new private.pem < file.zip

The util is intentionally bare bone: it doesn't generate a private key
for you (use openssl for that) & it doesn't compress your directory
(use zip for that).

Print info for a .crx downloaded from the Chome Web Store:

~~~
$ crx3-info < file.crx
id                   ckbpebiaofifhmkecjijobfafcfngfkj
header               1322
payload              8233
sha256_with_rsa      2 main_idx=1
sha256_with_ecdsa    1
~~~

(`main_idx` is the index of AsymmetricKeyProof that contains a public
key from which the id was derived during the .crx creation.)

Extract zip:

~~~
$ crx3-info < file.crx | awk '/^header/ {print $2}' \
    | xargs -I% dd if=file.crx iflag=skip_bytes skip=% > file.zip
~~~

Extract the 1st rsa public key:

~~~
$ crx3-info rsa 0 < file.crx
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAj/u/XDdjlDyw7gHEtaaa
sZ9GdG8WOKAyJzXd8HFrDtz2Jcuy7er7MtWvHgNDA0bwpznbI5YdZeV4UfCEsA4S
rA5b3MnWTHwA1bgbiDM+L9rrqvcadcKuOlTeN48Q0ijmhHlNFbTzvT9W0zw/GKv8
LgXAHggxtmHQ/Z9PP2QNF5O8rUHHSL4AJ6hNcEKSBVSmbbjeVm4gSXDuED5r0nwx
vRtupDxGYp8IZpP5KlExqNu1nbkPc+igCTIB6XsqijagzxewUHCdovmkb2JNtskx
/PMIEv+TvWIx2BzqGp71gSh/dV7SJ3rClvWd2xj8dtxG8FfAWDTIIi0qZXWn2Qhi
zQIDAQAB
-----END PUBLIC KEY-----
~~~

Validate (returns 0 on success):

    $ crx3-verify rsa 0 public.pem < file.crx

## License

MIT.
