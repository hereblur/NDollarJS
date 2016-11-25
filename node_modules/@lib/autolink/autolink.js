// This file is part of autolink, copyright (C) 2015 BusFaster Ltd.
// Released under the MIT license. There is NO WARRANTY OF ANY KIND.

var fs = require('fs');
var path = require('path');
var Module = require('module');

/** Read configuration file in JSON format.
  *
  * @param {string} confPath Path of file to read.
  * @return {Object.<string, *>} File contents. */

exports.readConf = function(confPath) {
	try {
		var confData = fs.readFileSync(confPath);
	} catch(err) {
		console.error(err);
		throw('Error reading ' + confPath);
	}

	try {
		var conf = JSON.parse(confData);
	} catch(err) {
		console.error(err);
		throw('Error parsing JSON from ' + confPath);
	}

	return(conf);
}

/** Module entry point returned by require.resolve might be in a subdirectory.
  * Look in parent directories for one of the desired configuration files.
  *
  * @param {string} modulePath Path to some file or directory inside the module.
  * @param {Array.<string>} List of possible configuration file names.
  * @return {{modulePath: string, confPath: string, confName: string}}
  *   Path to module root, and name of found configuration file. */

exports.findModuleConf = function(modulePath, nameList) {
	var nextPath, confPath, confName;
	var nameCount = nameList.length;
	var depth = 0;

	while(1) {
		for(var nameNum = 0; nameNum < nameCount; ++nameNum) {
			confName = nameList[nameNum];
			confPath = path.join(modulePath, confName);

			// If a configuration file for the module is found,
			// this is the desired root directory.

			if(fs.existsSync(confPath)) {
				return({
					modulePath: modulePath,
					confPath: confPath,
					confName: confName
				});
			}
		}

		// This is not the root of the module so move one directory up.
		nextPath = path.resolve(modulePath, '..');

		// Bail out if we cannot go up any more, or already reached a
		// node_modules directory which should be outside the module's
		// directory tree, or we've been stuck going up a number of
		// levels already.

		if(
			nextPath === modulePath
		||	path.basename(nextPath).toLowerCase() === 'node_modules'
		||	++depth > 20
		) {
			return(null);
		}

		modulePath = nextPath;
	}

	return(null);
}

exports.resolve = function(dst, src) {
	try {
		var srcPath = src || '.';
		var paths = Module._nodeModulePaths(path.dirname(src));

		return(Module._resolveFilename(dst, {paths: paths}));
	} catch(e) {
		return(null);
	}
}

function notPathy(name) {
	return(
		// Scoped module names start with an @.
		name.match(/^@/) ||
		// Names containing no slashes are probably module names.
		!name.match(/[/\\]/)
		// Names containing a single slash might be references to packages
		// published on Github but autogypi doesn't support that, so such
		// a condition is omitted here.
	);
}

exports.notPathy = notPathy;

exports.isPathy = function(name) {
	return(!notPathy(name));
}
