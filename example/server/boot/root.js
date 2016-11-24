module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/status', server.loopback.status());
  server.use(router);
  server.models.QBEmployee.create({email: 'root@email.com', password: 'root'})
};
