var finalhandler = require('finalhandler')
var http = require('http')
var httpProxy = require('http-proxy')
var serveStatic = require('serve-static')

const fs = require('fs')
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});

let port = (process.argv.length >= 3) ? process.argv[2] : 4400;
let portBackend = (process.argv.length >= 4) ? process.argv[3] : 5000;

console.log = function(d) { //
  log_file.write(d + '\n');
};

// Serve up public/ftp folder
var serve = serveStatic('.', { 'index': ['index.html'] });
var proxyServer = httpProxy.createProxyServer({});
proxyServer.on('error', function (err, req, res) {
	res.end('Proxy Server error : '+ err);
});
// Create server
var httpServer = http.createServer(function (req, res) {
	if(req.url.toString().startsWith('/api')){
		proxyServer.web(req, res, {target: 'http://localhost:'+portBackend, changeOrigin: true});
	}
	else{
		serve(req, res, finalhandler(req, res));
	}
});

if(httpServer !== undefined){
	httpServer.on('error', (err) => {
		console.log('Server error : '+err);
	});

	// Listen
	httpServer.listen(port)
}
