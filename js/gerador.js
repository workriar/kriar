// Lógica de Upload do Logo do Brand Kit
const logoUpload = document.getElementById('logoUpload');
const clientLogoImg = document.getElementById('clientLogo');
const clientLogoText = document.getElementById('clientLogoText');
let logoBase64 = null;

logoUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            logoBase64 = e.target.result;
            clientLogoImg.src = logoBase64;
            clientLogoImg.style.display = 'block';
            clientLogoText.style.display = 'none';
        };
        reader.readAsDataURL(file);
    } else {
        clientLogoImg.style.display = 'none';
        clientLogoText.style.display = 'block';
        logoBase64 = null;
    }
});

// Atualização de cor ao vivo
const brandColorInput = document.getElementById('brandColor');
const accentBar = document.getElementById('accentBar');
const bgOverlay = document.getElementById('bgOverlay');

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

function updateCanvasGradient(hexColor) {
    const rgb = hexToRgb(hexColor);
    
    // A barra de destaque da logo e do titulo recebe a cor viva da marca
    if(accentBar) accentBar.style.background = hexColor;
    
    // Overlay base bem escura com sutil mistura da cor primária no topo
    if(bgOverlay) bgOverlay.style.background = `linear-gradient(180deg, rgba(${rgb}, 0.2) 0%, rgba(0, 0, 0, 0.95) 100%)`;
}

// Quando o usuário escolhe a cor, muda no preview na hora
brandColorInput.addEventListener('input', (e) => {
    updateCanvasGradient(e.target.value);
});

// Configuração inicial de cor
updateCanvasGradient(brandColorInput.value);


// Lógica Principal de Geração de Posts via IA
document.getElementById('generateBtn').addEventListener('click', async () => {
    const topic = document.getElementById('topicInput').value;
    const brandTone = document.getElementById('brandTone').value;
    const btn = document.getElementById('generateBtn');
    
    if (!topic.trim()) {
        alert('Por favor, digite um tema para criar o post.');
        return;
    }

    // Feedback visual (Premium)
    btn.disabled = true;
    btn.innerHTML = '✨ A IA está trabalhando...';
    btn.classList.add('generating-glow');
    document.getElementById('canvasWrapper').style.opacity = '0.5';

    try {
        const response = await fetch('http://localhost:3005/api/ai/generate-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                topic: topic,
                brandTone: brandTone 
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Atualizar Título no Canvas e Legenda
            document.getElementById('artTitle').innerText = data.title;
            document.getElementById('captionOutput').value = data.caption;
            
            // Exibir blocos escondidos
            document.getElementById('captionCard').style.display = 'block';
            document.getElementById('downloadBtn').style.display = 'inline-flex';
            document.getElementById('downloadBtn').style.justifyContent = 'center';
            document.getElementById('canvasWrapper').style.opacity = '1';
            
            // Se o usuário não fez upload do logo, mostra texto generico "Sua Marca"
            if (!logoBase64) {
                clientLogoText.style.display = 'block';
            }

            // Puxar Imagem Gerada Dinamicamente por IA (Usando a chave extraída do Gemini)
            const imageUrl = "https://image.pollinations.ai/prompt/" + encodeURIComponent(data.imagePrompt) + "?width=1080&height=1080&nologo=true";
            const bgImage = document.getElementById('bgImage');
            
            // Pré-carrega a imagem para evitar flickering
            const tempImg = new Image();
            tempImg.crossOrigin = "Anonymous";
            tempImg.onload = () => {
                bgImage.src = imageUrl;
                bgImage.style.display = 'block';
                document.getElementById('canvasWrapper').style.opacity = '1';
                btn.disabled = false;
                btn.innerHTML = '✨ Gerar Novo Post Personalizado';
                btn.classList.remove('generating-glow');
                document.getElementById('downloadBtn').style.display = 'inline-flex';
            };
            tempImg.src = imageUrl;

            // Scroll suave até a arte
            document.getElementById('canvasWrapper').scrollIntoView({ behavior: 'smooth', block: 'center' });

        } else {
            alert('Erro: ' + (data.error || 'Falha ao gerar o post.'));
            btn.disabled = false;
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao conectar com o servidor. O servidor pode estar offline ou indisponível.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '✨ Gerar Post Personalizado';
        btn.classList.remove('generating-glow');
        document.getElementById('canvasWrapper').style.opacity = '1';
    }
});

// -----------------------------------------------------------------
// Integração Oficial Meta (Redirecionamento OAuth)
// -----------------------------------------------------------------
const connectMetaBtn = document.getElementById('connectMetaBtn');
if (connectMetaBtn) {
    connectMetaBtn.addEventListener('click', async () => {
        const btn = connectMetaBtn;
        const originalText = btn.innerHTML;
        btn.innerHTML = '⏳ Conectando...';
        btn.disabled = true;

        try {
            const response = await fetch('http://localhost:3005/api/meta/auth');
            const data = await response.json();

            if (data.url) {
                // Redireciona o cliente para a tela azul do Facebook!
                window.location.href = data.url;
            } else {
                alert('Erro ao gerar link da Meta.');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        } catch (error) {
            console.error(error);
            alert('Servidor indisponível.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// Botão de Download (HTML to Image)
document.getElementById('downloadBtn').addEventListener('click', () => {
    const canvasElement = document.getElementById('postCanvas');
    const originalTransform = canvasElement.style.transform;
    const btn = document.getElementById('downloadBtn');
    
    btn.innerHTML = '⏳ Gerando arquivo...';
    
    // Removemos a escala para renderizar na qualidade máxima oficial de post do instagram (1080x1080)
    canvasElement.style.transform = 'none';

    html2canvas(canvasElement, { 
        scale: 1, 
        useCORS: true,
        backgroundColor: null
    }).then(canvas => {
        // Restauramos a escala para a miniatura
        canvasElement.style.transform = originalTransform;

        const link = document.createElement('a');
        link.download = `post-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        btn.innerHTML = '📥 Fazer Download PNG';
    });
});

function copyCaption() {
    const copyText = document.getElementById('captionOutput');
    copyText.select();
    document.execCommand('copy');
    alert('✅ Legenda copiada para a área de transferência! Pronta para postar.');
}
