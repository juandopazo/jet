var combo = require('combohandler'),
    express = require('express'),
    
    app = express.createServer();
    
app.get('/jet', combo.combine({rootPath: 'build/'}), function (req, res) {
  res.send(res.body, 200);
});

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.listen(process.env.PORT || 3000);
