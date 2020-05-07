const clients = [];
const WebSocket = require('ws');
const s = new WebSocket.Server({
  port: 8080,
  noServer: true,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024*10 // Size (in bytes) below which messages
    // should not be compressed.
  }
});

s.on('connection', function (ws, request) {
  const connect = parsujNaJson(request.url);
  ws.name = connect.name ? connect.name : null;
  ws.order_id = connect.order_id ? connect.order_id : null;
  ws.customer_id = connect.customer_id ? connect.customer_id : null;
  ws.leading_person_id = connect.leading_person_id ? connect.leading_person_id : null;
  ws.type = connect.type ? connect.type : null;
  ws.isAlive = true;

  console.log(`Połączono #${ws.name} ${ws.order_id}`)

  ws.on('message', function incoming(data) {
    const message = data;
    s.clients.forEach(function each(client) {
      if(client != ws){
        if (client.name === ws.name) {
          if (ws.order_id == null) {
            if (ws.leading_person_id == client.leading_person_id) {
              client.send(message);
            } else if (ws.customer_id == client.customer_id) {
              client.send(message);
            }
          }
          else if (ws.order_id != null && client.type == 'communicator') {
            if (ws.leading_person_id == client.leading_person_id) {
              client.send(message);
            } else if (ws.customer_id == client.customer_id) {
              client.send(message);
            }
          }
        }
      }
    });
  });


  ws.on('close', function (ws) {

  });
});

function parsujNaJson(url) {
  var hash;
  var json = {};
  var hashes = url.slice(url.indexOf('/?') + 2).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    json[hash[0]] = hash[1];
  }
  return json;
}