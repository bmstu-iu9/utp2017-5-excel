var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

var home = path.dirname(require.main.filename); 

http.createServer(function(req, res) {
    var filePath = url.parse(req.url).pathname;

    if (filePath == '/index.html' || filePath == '/') {
        send('/index.html', 'text/html', res);
    } else if (filePath.indexOf('/app') == 0) {
        send(filePath, 'text/javascript', res);
    } else if (filePath.indexOf('/style') == 0) {
        send(filePath, 'text/css', res);
    } else if (filePath.indexOf('/assets') == 0) {
        if (filePath.endsWith('.png')){
            send(filePath, 'image/png', res);
        } else if (filePath.endsWith('.svg')) {
            send(filePath, 'image/svg+xml', res)
        }
    } else {
        bad(404,res);
    }
}).listen(8080);

function send(filePath, type, res){
    fs.readFile(home + filePath, function(err, data) {
        if (err) {
            return bad(404, res);
        } else {
            res.writeHead(200, {'Content-Type': type});
            res.write(data);
            return res.end();
        }
    });
}

function bad(code, res){
    res.writeHead(code, {'Content-Type': 'text/html'});
    return res.end("Error " + code.toString());
}
