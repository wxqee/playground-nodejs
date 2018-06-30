var path = require('path');
var watchman = require('fb-watchman');
var client = new watchman.Client();

client.capabilityCheck({optional:[], required:['relative_root']}, function (error, resp) {
	// ============================================================
	// checking for watchman availability
	// ============================================================
	if (error) {
		// error will be an Error object if the watchman service is not
		// installed, or if any of the names listed in the `required`
		// array are not supported by the server
		console.error(error);
		client.end();
	}
	// resp will be an extended version response:
	// {'version': '3.8.0', 'capabilities': {'relative_root': true}}
	console.log(resp);

	// ============================================================
	// initiating a watch
	// ============================================================
	var dir_of_interest = path.join(process.cwd(), 'src');

	client.command(['watch-project', dir_of_interest], function (error, resp) {
		if (error) {
			console.error('Error initiating watch:', error);
			return;
		}

		// It is considered to be best practice to show any 'warning' or
		// 'error' information to the user, as it may suggest steps
		// for remediation
		if ('warning' in resp) {
			console.log('warning: ', resp.warning);
		}

		// `watch-project` can consolidate the watch for your
		// dir_of_interest with another watch at a higher level in the
		// tree, so it is very important to record the `relative_path`
		// returned in resp

		console.log('watch established on ', resp.watch, ' relative_path', resp.relative_path);

		// ============================================================
		// subscribing to changes
		// ============================================================
		make_subscription(client, resp.watch, resp.relative_path)
	});
});


// `watch` is obtained from `resp.watch` in the `watch-project` response.
// `relative_path` is obtained from `resp.relative_path` in the
// `watch-project` response.
function make_subscription(client, watch, relative_path) {
  sub = {
    // Match any `.js` file in the dir_of_interest
    expression: ["allof", ["match", "*.js"]],
    // Which fields we're interested in
    fields: ["name", "size", "mtime_ms", "exists", "type"]
  };
  if (relative_path) {
    sub.relative_root = relative_path;
  }

	client.command(['subscribe', watch, 'mysubscription', sub], function (error, resp) {
		if (error) {
			// Probably an error in the subscription criteria
			console.error('failed to subscribe: ', error);
			return;
		}
		console.log('subscription ' + resp.subscribe + ' established');
	});

  // Subscription results are emitted via the subscription event.
  // Note that this emits for all subscriptions.  If you have
  // subscriptions with different `fields` you will need to check
  // the subscription name and handle the differing data accordingly.
  // `resp`  looks like this in practice:
  //
  // { root: '/private/tmp/foo',
  //   subscription: 'mysubscription',
  //   files: [ { name: 'node_modules/fb-watchman/index.js',
  //       size: 4768,
  //       exists: true,
  //       type: 'f' } ] }
  client.on('subscription', function (resp) {
    if (resp.subscription !== 'mysubscription') return;

    resp.files.forEach(function (file) {
      // convert Int64 instance to javascript integer
      const mtime_ms = +file.mtime_ms;

      console.log('file changed: ' + file.name, mtime_ms);
    });
  });
}


