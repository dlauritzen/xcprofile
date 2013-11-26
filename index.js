
var fs = require('fs');
var plistlib = require('plistlib');

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
	console.log('Loading file %s.', filename);
	fs.readFile(filename, function(err, data) {
		if (err) return done(err);
		// console.log('File loaded. Length: %d bytes.', data.length);

		var startIndex = indexOfBuffer(data, startBuffer);
		if (startIndex == -1) return done(new Error('Plist not found in provisioning profile.'));
		// console.log('Plist found at index %d', startIndex);
		var endIndex = indexOfBuffer(data, endBuffer);
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
