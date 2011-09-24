var comboServer = require('combohandler/lib/server'),
    app;

app = comboServer({
  roots: {
    '/jet': './build'
  }
});

app.listen(process.env.PORT || 3000);
