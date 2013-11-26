
var xcprofile = require('./index');

var profilePath = '/Users/dallinl/Desktop/0AB2F10B-8F44-4D7E-9F95-78F05D9B1E0D.mobileprovision';
// var profilePath = '/Users/dallinl/Downloads/profiles/iOS_Team_Provisioning_Profile_netparentlinkwestgenesee.mobileprovision';

xcprofile.load(profilePath, function(err) {
	if (err) console.log(err);
});
