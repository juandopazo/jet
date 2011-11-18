var combo = require('combohandler'),
    express = require('express'),
    
    app = express.createServer();
    
app.get('/combo', combo.combine({rootPath: 'build/'}), function (req, res) {
  res.send(res.body, 200);
});

app.get('/', function(request, response) {
  response.send('Hello World!', 200);
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
