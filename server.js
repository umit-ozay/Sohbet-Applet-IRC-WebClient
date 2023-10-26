// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const net = require('net');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Socket.IO üzerinden bağlantıyı dinle
io.on('connection', (socket) => {
    console.log('Kullanıcı bağlandı');

    // IRC sunucusuna bağlan
    const ircClient = new net.Socket();
    ircClient.connect(6667, 'irc.sunucuadresi.com', () => {
        console.log('IRC sunucusuna bağlandı');
    });

    // IRC sunucusundan gelen verileri Socket.IO ile istemciye iletiyoruz
    ircClient.on('data', (data) => {
        socket.emit('irc-message', data.toString());
    });

    // Socket.IO üzerinden gelen IRC mesajlarını IRC sunucusuna iletiyoruz
    socket.on('message', (message) => {
        ircClient.write(message);
    });

    // Bağlantı koptuğunda IRC sunucusu bağlantısını da sonlandırıyoruz
    socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı');
        ircClient.end();
    });
});

// Express sunucusunu 3000 portunda dinliyoruz
server.listen(3000, () => {
    console.log('Sunucu dinleniyor: http://localhost:3000');
});
