/**
 * Kriar — Servidor WhatsApp (Baileys)
 * Gera QR Code real para conexão do WhatsApp e expõe API para o dashboard.
 *
 * Endpoints:
 *   GET  /api/wa/qr      → retorna QR Code como base64 PNG ou status de conexão
 *   GET  /api/wa/status  → retorna estado atual { status, number }
 *   POST /api/wa/logout  → desconecta a sessão
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const QRCode = require('qrcode');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const AUTH_DIR = path.join(__dirname, '.wa_session');

// Estado global
let currentQR = null;
let connectionStatus = 'disconnected'; // 'disconnected' | 'qr' | 'connecting' | 'connected'
let connectedNumber = null;
let sock = null;

// ── CORS helper ──
// SEGURANÇA: restrito apenas ao domínio da Kriar.
// Em desenvolvimento local, adicione 'http://localhost:PORT' se necessário.
const ALLOWED_ORIGINS = [
    'https://kriar.digital',
    'https://www.kriar.digital'
];

function cors(res, req) {
    const origin = req ? req.headers['origin'] : null;
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
}

// ── Inicia conexão WhatsApp com Baileys ──
async function startWA() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        browser: ['Kriar IA', 'Chrome', '120.0'],
        generateHighQualityLinkPreview: false,
    });

    // Evento: QR Code gerado
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            connectionStatus = 'qr';
            // Converte o QR string em imagem base64 PNG
            currentQR = await QRCode.toDataURL(qr, { width: 256, margin: 2 });
            console.log('[WhatsApp] QR Code gerado — aguardando escaneio...');
        }

        if (connection === 'connecting') {
            connectionStatus = 'connecting';
            console.log('[WhatsApp] Conectando...');
        }

        if (connection === 'open') {
            connectionStatus = 'connected';
            currentQR = null;
            connectedNumber = sock.user?.id?.split(':')[0] || 'Desconhecido';
            console.log(`[WhatsApp] ✅ Conectado! Número: ${connectedNumber}`);
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log('[WhatsApp] Conexão encerrada. Razão:', reason);

            if (reason === DisconnectReason.loggedOut) {
                // Sessão encerrada — apaga credenciais e reinicia
                connectionStatus = 'disconnected';
                connectedNumber = null;
                fs.rmSync(AUTH_DIR, { recursive: true, force: true });
                setTimeout(startWA, 2000);
            } else if (reason !== DisconnectReason.connectionReplaced) {
                connectionStatus = 'disconnected';
                setTimeout(startWA, 3000); // reconecta automaticamente
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// ── Servidor HTTP ──
const server = http.createServer(async (req, res) => {
    cors(res, req);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = req.url.split('?')[0];

    // GET /api/wa/qr
    if (req.method === 'GET' && url === '/api/wa/qr') {
        if (connectionStatus === 'connected') {
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'connected', number: connectedNumber }));
        } else if (currentQR) {
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'qr', qr: currentQR }));
        } else {
            res.writeHead(200);
            res.end(JSON.stringify({ status: connectionStatus }));
        }
        return;
    }

    // GET /api/wa/status
    if (req.method === 'GET' && url === '/api/wa/status') {
        res.writeHead(200);
        res.end(JSON.stringify({
            status: connectionStatus,
            number: connectedNumber
        }));
        return;
    }

    // POST /api/wa/logout
    if (req.method === 'POST' && url === '/api/wa/logout') {
        if (sock) {
            await sock.logout().catch(() => { });
        }
        connectionStatus = 'disconnected';
        connectedNumber = null;
        currentQR = null;
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true }));
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
    console.log(`\n🚀 Kriar WhatsApp Server rodando em http://localhost:${PORT}`);
    console.log('📡 Endpoints disponíveis:');
    console.log(`   GET  http://localhost:${PORT}/api/wa/qr`);
    console.log(`   GET  http://localhost:${PORT}/api/wa/status`);
    console.log(`   POST http://localhost:${PORT}/api/wa/logout`);
    console.log('\n⏳ Iniciando conexão WhatsApp...\n');
    startWA();
});
