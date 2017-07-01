const fs = require('fs');
const dns = require('dns');
const request = require('request');
const jsonfile = require('jsonfile');
const Promise = require('promise');
const databaseFile = 'data.json';

var resolveIp = function (obj) {
    var promise = new Promise(function (fulfill, reject) {
        dns.lookup(obj.url, function (error, address, family) {
            if (error) {
                console.log('IP resolving failed ' + error);
            } else {
                obj.ip = address;
                fulfill(obj);
            }
        });
    });
    return promise;
};

var resolveCountry = function (obj) {
    var promise = new Promise(function (fulfill, reject) {
        request('http://ipinfo.io/' + obj.ip, function (error, res, body) {
            if (error) {
                console.log('Country resolving failed ' + error);
            } else {
                obj.country = JSON.parse(body).country;
                fulfill(obj);
            }
        });
    });
    return promise;
};

var readDataBase = function (obj) {
    var promise = new Promise(function (fulfill, reject) {
        jsonfile.readFile(databaseFile, function (error, data) {
            if (error) {
                console.log('Database reading failed ' + error);
            } else {
                data.push(obj);
                fulfill(data);
            }
        });
    });
    return promise;
};

var updateDataBase = function (obj) {
    var promise = new Promise(function (fulfill, reject) {
        jsonfile.writeFile(databaseFile, obj, function (error) {
            if (error) {
                console.log('Database writing failed ' + error);
            } else {
                fulfill('Database updated!');
            }
        });
    });
    return promise;
};

var checkDomain = function (obj) {
    // TODO: regex check to obj.url
    obj.logo = 'http://logo.clearbit.com/' + obj.url;
}

// using command line argument for now
var cliArgument = process.argv.slice(2)[0];
var seachRequest = { url: cliArgument };

checkDomain(seachRequest);

resolveIp(seachRequest)
    .then(resolveCountry)
    .then(readDataBase)
    .then(updateDataBase)
    .then(console.log);

console.log('script ended');

