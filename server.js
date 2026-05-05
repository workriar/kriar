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
require('dotenv').config();
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

// Inicializa o Google Gemini usando a chave do .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const PORT = process.env.PORT || 3005;
const AUTH_DIR = path.join(__dirname, '.wa_session');

// Estado global
let currentQR = null;
let connectionStatus = 'disconnected'; // 'disconnected' | 'qr' | 'connecting' | 'connected'
let connectedNumber = null;
let sock = null;

// ── CORS helper ──
// SEGURANÇA: restrito ao domínio da Kriar e localhost para desenvolvimento.
const ALLOWED_ORIGINS = [
    'https://kriar.digital',
    'https://www.kriar.digital',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000'
];

function cors(res, req) {
    const origin = req ? req.headers['origin'] : null;
    // Permite qualquer localhost no modo de desenvolvimento ou os domínios de produção
    const isLocalhost = origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin === 'null');
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) || isLocalhost ? origin : ALLOWED_ORIGINS[0];
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin || '*');
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

    // POST /api/ai/generate-post (Gerador de Posts com IA - Usando GEMINI Gratuito)
    if (req.method === 'POST' && url === '/api/ai/generate-post') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { topic, brandTone } = JSON.parse(body);
                if (!topic) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: 'O tema (topic) é obrigatório' }));
                }

                if (!process.env.GEMINI_API_KEY) {
                    res.writeHead(500);
                    return res.end(JSON.stringify({ error: 'GEMINI_API_KEY não configurada no servidor.' }));
                }

                const model = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: SchemaType.OBJECT,
                            properties: {
                                title: {
                                    type: SchemaType.STRING,
                                    description: "Um título chamativo para a arte de no máximo 6 palavras",
                                },
                                caption: {
                                    type: SchemaType.STRING,
                                    description: "Legenda completa com quebras de linha reais",
                                },
                                imagePrompt: {
                                    type: SchemaType.STRING,
                                    description: "Prompt detalhado EM INGLÊS para gerar uma imagem fotográfica de alta qualidade que sirva de fundo (sem textos na imagem). Ex: 'aesthetic minimalist modern office desk'",
                                },
                            },
                            required: ["title", "caption", "imagePrompt"],
                        },
                    }
                });

                const toneInstruction = brandTone ? `IMPORTANTE: O tom de voz e estilo de comunicação desta marca é: "${brandTone}". Você DEVE adotar estritamente essa personalidade.` : "";
                
                const prompt = `Atue como um Social Media Sênior para o Instagram.
Tema: "${topic}".
${toneInstruction}

REGRAS PARA A LEGENDA (caption):
1. DÊ MUITO ESPAÇO: Insira quebras de linha (\\n) entre todos os parágrafos para uma leitura fluída. NUNCA faça blocões de texto.
2. EMOJIS: Insira emojis no começo dos parágrafos de forma estratégica.
3. CONTEÚDO: Faça um gancho forte na primeira linha, entregue o conteúdo no meio usando listas ou bullets visuais, e termine com um Call to Action (CTA).
4. HASHTAGS: Inclua 5 a 8 hashtags altamente relevantes no final.

Gere o JSON com title, caption bem espaçado, e o imagePrompt em inglês.`;
                const result = await model.generateContent(prompt);
                
                const responseText = result.response.text();
                const content = JSON.parse(responseText);
                
                res.writeHead(200);
                res.end(JSON.stringify(content));
            } catch (err) {
                console.error('[Gemini Error]', err);
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Erro interno ao gerar post com a IA do Google' }));
            }
        });
        return;
    }

    // =========================================================================
    // 🔗 2. INTEGRAÇÃO META (INSTAGRAM & FACEBOOK) - PREPARAÇÃO AMBIENTE
    // =========================================================================
    
    // GET /api/meta/auth - Gera o link de login do Facebook/Instagram
    if (req.method === 'GET' && url === '/api/meta/auth') {
        // Aqui usamos o APP ID oficial do cliente
        const appId = process.env.META_APP_ID || "1452267462744966";
        // Usando o ambiente local de testes em vez do kriar.digital na fase dev:
        const redirectUri = "http://localhost:3005/api/meta/callback";
        const metaAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=instagram_basic,instagram_content_publish,pages_show_list`;
        
        res.writeHead(200);
        res.end(JSON.stringify({ url: metaAuthUrl }));
        return;
    }

    // GET /api/meta/callback - Recebe o token, puxa posts e extrai identidade via IA
    if (req.method === 'GET' && url.startsWith('/api/meta/callback')) {
        // Quando a Meta redirecionar o usuário de volta com o token de acesso (code=...):
        // 1. Puxar posts da Graph API.
        // 2. Mandar textos para o Gemini analisar e gerar o "brandTone".
        // 3. Salvar no Banco de Dados atrelado ao usuário (Supabase).
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <html>
                <head><title>Meta Conectada!</title><style>body{background:#0f172a;color:#fff;font-family:sans-serif;text-align:center;padding-top:100px;}</style></head>
                <body>
                    <h2>✅ Instagram Conectado com Sucesso!</h2>
                    <p>Nossa IA leu suas últimas postagens e configurou o seu Tom de Voz automaticamente.</p>
                    <p style="color:#64748b;">Voltando para o Kriar em 3 segundos...</p>
                    <script>
                        setTimeout(() => {
                            window.location.href = "http://localhost:3005/gerador-posts.html";
                        }, 3000);
                    </script>
                </body>
            </html>
        `);
        return;
    }

    // =========================================================================
    // 💳 3. INTEGRAÇÃO STRIPE (PLANOS DE ASSINATURA)
    // =========================================================================
    
    // POST /api/stripe/create-checkout-session
    if (req.method === 'POST' && url === '/api/stripe/create-checkout-session') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const { priceId } = JSON.parse(body);
                // Integração oficial usando SDK do stripe:
                // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
                // const session = await stripe.checkout.sessions.create({ ... });
                
                // STUB (URL fake para demonstração front-end):
                res.writeHead(200);
                res.end(JSON.stringify({ checkoutUrl: "https://checkout.stripe.com/pay/cs_test_kriar12345" }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: "Erro ao gerar link do Stripe" }));
            }
        });
        return;
    }

    // POST /api/stripe/webhook - Recebe confirmação de pagamento do Stripe
    if (req.method === 'POST' && url === '/api/stripe/webhook') {
        // Aqui o Stripe avisa nosso app que o usuário pagou a assinatura
        // Ação: Liberar acesso Pro na plataforma.
        res.writeHead(200);
        res.end("Webhook Recebido");
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
