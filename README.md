# crx3-utils

Starting with Chrome 73, Chrome changed the package format for
extensions to the CRX3 file format.

    $ npm -g i crx3-utils

Usage:

    $ crx3-new private.pem < file.zip

The util is intentionally bare bone: it doesn't generate a private key
for you (use openssl for that) & it doesn't compress your directory
(use zip for that).

Print info:

~~~
$ crx3-info < file.crx
id                   nofnjfackdchgipjnedfdcmhldeejknj
header               593
payload              5581
sha256_with_rsa      1
sha256_with_ecdsa    0
~~~

Extract zip:

~~~
$ crx3-info < file.crx | awk '/^header/ {print $2}' \
    | xargs -I% dd if=file.crx iflag=skip_bytes skip=% > file.zip
~~~

Extract the 1st rsa public key:

~~~
$ crx3-info rsa 0 < file.crx
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmxbf7fCk1V+XL9prvqpx
BrI2JA6P5Y7rqABIC3PB8K2lJwo0NokwKwHxpC6yRQelvnFUsODrRjrEYMPeImgp
skE9Tn36aRzPGFXAPxwRUzcjAPBYzSL6/ieNSmyMxkFXA/1+QS5ofm/IaLlOpe2V
AQF6NRpsGWfkKHy09guMRNzcy7MXDbmPBMynPU+td2GHaql/6E9lN7Zk5KLpRLVJ
WgAcrJsG8XORVMNTaOBpgcrEwGPBBdRG1A+foHNRQLNPE1dMLbgJcPWVbSCJsm1e
I/blb/ULUw+jvgFlSxZblWHiiGoSdI0vLfJpxjAvIeqRnLW2EZuTvJaaKkYtJW8q
9QIDAQAB
-----END PUBLIC KEY-----
~~~

Validate (returns 0 on success):

    $ crx3-validate rsa public.pem < file.crx

## License

MIT.
