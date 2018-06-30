var path = require("path");
var glob = require("glob")

var options = {
	cwd: path.join(process.cwd(), 'src'),
};

// options is optional
glob("**/*.js", options, function (er, files) {
  // files is an array of filenames.
  // If the `nonull` option is set, and nothing
  // was found, then files is ["**/*.js"]
  // er is an error object or null.

	if (er) {
		console.log('no file found');
		return false;
	}

	console.log('files', files);
})

