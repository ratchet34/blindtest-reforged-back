const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: '6969' });

const buzzers = [];
let client;

wss.on('connection', ws => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`);
    pMess = JSON.parse(message);

    if (!pMess?.type) return;

    if (pMess?.type === 'identification') {
      if (!pMess?.id) return;
      if (pMess?.id === '0') client = ws;
      else buzzers.push({ id: pMess?.id, ws });
      return;
    }

    if (pMess?.type === 'buzz') {
      if (!pMess?.id) return;
      if (!client) return;
      client.send(JSON.stringify({ id: pMess.id, status: 'buzz' }));
      ws.send('1');
    }

    if (pMess?.type === 'unbuzz-all') {
      buzzers.map((buzz) => buzz.send('0'));
    }

    ws.send(JSON.stringify({
      id: pMess.id,
      status: 'buzzed',
    }));
  })
})