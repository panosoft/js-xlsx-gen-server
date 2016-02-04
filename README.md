# JS Xlsx Gen server

> An excel spreadsheet rendering server.

[![npm version](https://img.shields.io/npm/v/@panosoft/js-xlsx-gen-server.svg)](https://www.npmjs.com/package/@panosoft/js-xlsx-gen-server)
[![Travis](https://img.shields.io/travis/panosoft/js-xlsx-gen-server.svg)](https://travis-ci.org/panosoft/js-xlsx-gen-server)


# Installation

```sh
npm install -g @panosoft/js-xlsx-gen-server
```

# Usage

```sh
Usage: js-xlsx-gen-server --key <path> --cert <path> [options]

An excel spreadsheet rendering server.

Options:

  -h, --help                    output usage information
  -V, --version                 output the version number
  -k, --key   <path>            Path to the private key of the server in PEM format.
  -c, --cert  <path>            Path to the certificate key of the server in PEM format.
  -p, --port  <port>            The port to accept connections on. Default: 8443.
  -i, --interface  <interface>  The interface to accept connections on. Default: 0.0.0.0.
```

# HTTPS API

## Request

- Path: `/`
- Method: `POST`
- Headers:
	- `Content-Type` - `'application/json'`
- Body:
	- `spreadsheet` - {Object} The spreadsheet definition used to create the excel spreadsheet.
	- `[defaultStyle]` - {Object} The default style definition to apply to the spreadsheet.
      - `[header]` - {Object} The header default style definition.
      - `[data]` - {Object} The data default style definition.

## Responses

__Success__
- Status Code: `200`
- Headers:
	- `Request-Id` - {String} The unique request identifier.
	- `Content-Type` - `'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'`
- Body: {Buffer} The excel spreadsheet binary.

__Error__
- Status Code: `500`
- Headers:
	- `Request-Id` - {String} The unique request identifier.
	- `Content-Type` - `'application/json'`
- Body:
	- `error` - {String} The error message.
