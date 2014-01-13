
var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var path = require('path');
var plistlib = require('plistlib');

function buildKmpT(w) {
	var t = new Array();
	t.length = w.length;

	var pos = 2;
	var cnd = 0;
	t[0] = -1;
	t[1] = 0;

	while (pos < w.length) {
		if (w[pos - 1] == w[cnd]) {
			// Substring continues
			cnd++;
			t[pos] = cnd;
			pos++;
		}
		else if (cnd > 0) {
			// Can fall back
			cnd = t[cnd];
		}
		else {
			// No candidates. cnd = 0
			t[pos] = 0;
			pos++;
		}
	}

	return t;
}

function kmp(s, w, t) {
	var m = 0;
	var i = 0;
	var t = t || buildKmpT(w);

	while ((m + i) < s.length) {
		if (w[i] == s[m + i]) {
			if (i == w.length - 1) {
				return m;
			}
			i++;
		}
		else {
			m = m + i - t[i];
			if (t[i] > -1) {
				i = t[i];
			}
			else {
				i = 0;
			}
		}
	}
	return -1;
}

function indexOfBuffer(haystack, needle) {
	var matchedIndex = 0;
	for (var i = 0; i < haystack.length; i++) {
		// console.log('Comparing haystack[%d/%d] (%s) and needle[%d/%d] (%s)', i, haystack.length, haystack[i].toString(16), matchedIndex, needle.length, needle[matchedIndex].toString(16));
		if (haystack[i] == needle[matchedIndex]) {
			if (matchedIndex == needle.length - 1) {
				return i - matchedIndex;
			}
			matchedIndex++;
		}
		else {
			matchedIndex = 0;
		}
	}
	return -1;
}

var startBuffer = new Buffer('<?xml version="1.0"');
var endBuffer = new Buffer('</plist>');

exports.load = function(filename, done) {
	// console.log('Loading file %s.', filename);
	fs.readFile(filename, function(err, data) {
		if (err) return done(err);
		// console.log('File loaded. Length: %d bytes.', data.length);

		// var startIndex = indexOfBuffer(data, startBuffer);
		var startIndex = kmp(data, startBuffer);
		if (startIndex == -1) return done(new Error('Plist not found in provisioning profile.'));
		// console.log('Plist found at index %d', startIndex);

		// var endIndex = indexOfBuffer(data, endBuffer);
		var endIndex = kmp(data, endBuffer);
		if (endIndex == -1) return done(new Error('Programmer\'s error. Could not find end of plist.'));
		endIndex += endBuffer.length; // this originally points at the beginning of the end
		// console.log('Plist ends at index %s', endIndex);

		var plistString = data.toString('utf8', startIndex, endIndex);
		plistlib.loadString(plistString, function(err, plist) {
			if (err) return done(err);
			// console.log(util.inspect(plist, { depth: null }));
			return done(null, plist); // XXX: Don't rely on this return value. I will probably manipulate it instead of returning.
		});
	});
}

exports.loadDirectory = function(folder, done) {
	fs.readdir(folder, function(err, files) {
		if (err) return done(err);

		async.mapLimit(files, 5, function(filename, next) {
			if (path.extname(filename) == '.mobileprovision') {
				exports.load(path.join(folder, filename), next);
			}
			else {
				next(null, null);
			}
		}, function(err, results) {
			if (err) return done(err);
			// remove null elements
			return done(null, _.compact(results));
		});
	});
}
