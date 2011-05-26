var comboServer = require('combohandler/lib/server'),
    app;

app = comboServer({
  roots: {
    '/jet': './build'
  }
});

app.listen(9806);
