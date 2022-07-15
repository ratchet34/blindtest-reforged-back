const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: '6969' });

const buzzers = [];
let client;
let admin;

wss.on('connection', ws => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`);
    let pMess;
    try {
      pMess = JSON.parse(message);
    } catch (e) {
      console.error('Not a JSON string');
      return;
    };

    if (!pMess?.type) return;

    if (pMess.type === 'admin') {
      admin = ws;
    }

    if (pMess.type === 'item-to-admin') {
      if (!admin) return;
      admin.send(JSON.stringify(pMess.data));
    }

    if (pMess?.type === 'identification') {
      if (!pMess?.id) return;
      if (pMess?.id === '0') {
        client = ws;
        buzzers.forEach((b) => client.send(JSON.stringify({ id: b?.id, status: 'handshake' })));
      } else {
        console.log(buzzers);
        if (buzzers.some((b) => b.id === pMess.id)) {
          buzzers.find((b) => b.id === pMess.id).ws = ws;
        } else {
          buzzers.push({ id: pMess?.id, ws });
          console.log({ client, buzzers });
          if (client) client.send(JSON.stringify({ id: pMess?.id, status: 'handshake' }));
        }
      }
      return;
    }

    if (pMess?.type === 'buzz') {
      if (!pMess?.id) return;
      if (!client) return;
      client.send(JSON.stringify({ id: pMess.id, status: 'buzzed' }));
      ws.send('1');
    }

    if (pMess?.type === 'unbuzz-all') {
      buzzers.map((buzz) => buzz.send('0'));
    }
  })
})