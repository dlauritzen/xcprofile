
var _ = require('underscore');
var stringTable = require('string-table');
var util = require('util');

var xcprofile = require('./index');

xcprofile.loadDirectory('.', function(err, plists) {
	if (err) console.log(err);
	var data = [];
	_.each(plists, function(plist) {
		var obj = {};
		obj.app_id_name = plist.value.AppIDName.value;
		obj.app_id = plist.value.Entitlements.value["application-identifier"].value;
		obj.profile_name = plist.value.Name.value;
		obj.UUID = plist.value.UUID.value;
		obj.team_id = plist.value.TeamIdentifier.value[0].value;
		data.push(obj);
	});
	console.log(stringTable.create(data))
});
