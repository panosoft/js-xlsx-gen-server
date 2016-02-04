const co = require('co');
const expect = require('chai').expect;
const HttpsServer = require('@panosoft/https-server');
const mime = require('mime-types');
const path = require('path');
const xlsx = require('xlsx-style');

const bin = path.resolve(__dirname, '../bin/index.js');
const startServer = HttpsServer.test.startServer;
const request = HttpsServer.test.request;

const expectError = (response, message) => {
  const body = JSON.parse(response.body.toString('utf8'));
  expect(response.statusCode).to.equal(500);
  expect(body).to.be.an('object')
    .and.to.have.property('error')
    .that.equals(message);
};

describe('server', () => {
  var server;
  const port = 8443;
  const host = `https://localhost:${port}`;
  before(co.wrap(function * () {
    server = yield startServer(bin);
  }));
  after(() => server.kill());
  describe('jsXlsxGen', () => {
    const path = '/';
    const url = `${host}${path}`;
    const method = 'POST';
    const headers = { 'content-type': mime.lookup('json') };
    const sheetName = 'sheetA';
    const columnName = 'colA';
    const rowData = ['data'];
    const spreadsheet = {
      [sheetName]: {
        header: { columns: [ { v: columnName } ] },
        data: { rows: [ rowData ] }
      }
    };
    const defaultStyle = {
    	header: { fill: { fgColor: { rgb: "aa00ff" } } },
    	data: { fill: { fgColor: { rgb: "ffaa00" } } }
    };
    it('reject request with invalid content-type header', co.wrap(function * () {
      const headers = { 'content-type': mime.lookup('txt') };
      const response = yield request(url, method, headers);
      expectError(response, 'Invalid request: headers: content-type must be application/json.');
    }));
    it('reject request without spreadsheet field', co.wrap(function * () {
      const data = JSON.stringify({});
      const response = yield request(url, method, headers, data);
      expectError(response, 'Invalid request: body: spreadsheet: must be defined.');
    }));
    it('reject request with invalid spreadsheet field', co.wrap(function * () {
      const data = JSON.stringify({ spreadsheet: 'invalid' });
      const response = yield request(url, method, headers, data);
      expectError(response, 'Invalid request: body: spreadsheet: must be an object.');
    }));
    it('reject request with invalid defaultStyle field', co.wrap(function * () {
      const data = JSON.stringify({ spreadsheet, defaultStyle: 'invalid' });
      const response = yield request(url, method, headers, data);
      expectError(response, 'Invalid request: body: defaultStyle: must be an object.');
    }));
    it('reject request with invalid defaultStyle.header field', co.wrap(function * () {
      const data = JSON.stringify({ spreadsheet, defaultStyle: { header: 'invalid' } });
      const response = yield request(url, method, headers, data);
      expectError(response, 'Invalid request: body: defaultStyle: header: must be an object.');
    }));
    it('reject request with invalid defaultStyle.data field', co.wrap(function * () {
      const data = JSON.stringify({ spreadsheet, defaultStyle: { data: 'invalid' } });
      const response = yield request(url, method, headers, data);
      expectError(response, 'Invalid request: body: defaultStyle: data: must be an object.');
    }));
    it('render spreadsheet', co.wrap(function * () {
      const data = JSON.stringify({ spreadsheet, defaultStyle });
      const response = yield request(url, method, headers, data);
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.have.length.greaterThan(0);
      const workbook = xlsx.read(response.body, { type: 'buffer' });
      expect(workbook.Sheets).to.contain.key(sheetName);
      const worksheet = workbook.Sheets[sheetName];
      expect(worksheet).to.contain.keys('A1', 'A2');
      expect(worksheet.A1.v).to.equal(columnName);
      expect(worksheet.A2.v).to.equal(rowData[0]);
    }));
  });
});
