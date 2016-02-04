const co = require('co');
const is = require('is_js');
const Xlsx = require('js-xlsx-gen');
const mime = require('mime-types');
const parse = require('co-body');

const xlsx = Xlsx();

const validateHeaders = headers => {
  const supportedMimeType = mime.lookup('json');
  if (headers['content-type'] !== supportedMimeType) {
    throw new TypeError (`Invalid request: headers: content-type must be ${supportedMimeType}.`);
  }
};
const validateBody = body => {
  const prefix = 'Invalid request: body:';
  if (!is.json(body)) throw new TypeError(`${prefix} must be an object.`);
  if (!body.spreadsheet) throw new TypeError(`${prefix} spreadsheet: must be defined.`);
  if (!is.object(body.spreadsheet)) throw new TypeError(`${prefix} spreadsheet: must be an object.`);
  if (body.defaultStyle) {
    if (!is.object(body.defaultStyle)) throw new TypeError(`${prefix} defaultStyle: must be an object.`);
    if (body.defaultStyle.header && !is.object(body.defaultStyle.header)) {
       throw new TypeError(`${prefix} defaultStyle: header: must be an object.`);
    }
    if (body.defaultStyle.data && !is.object(body.defaultStyle.data)) {
       throw new TypeError(`${prefix} defaultStyle: data: must be an object.`);
    }
  }
};
const handle = co.wrap(function * (request, response, log) {
  validateHeaders(request.headers);
  const body = yield parse(request);
  validateBody(body);
  log('info', 'Rendering.');
  const workbook = xlsx.generate(body.spreadsheet, body.defaultStyle);
  const output = xlsx.write(workbook, { bookType:'xlsx', type:'buffer' });
  log('info', 'Rendered.');
  response.writeHead(200, { 'Content-Type': mime.lookup('pdf') });
  response.end(output);
});
module.exports = handle;
