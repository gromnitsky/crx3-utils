# crx3-utils

Starting with Chrome 73, Chrome changed the package format for
extensions to the CRX3 file format.

    $ npm -g i crx3-utils

Usage:

    $ crx3-new private.pem < file.zip

The util is intentionally bare bone: it doesn't generate a private key
for you (use openssl for that) & it doesn't compress your directory
(use zip for that).

## License

MIT.
