# Kriar - Automações Inteligentes

Plataforma completa de chatbots e automações inteligentes para WhatsApp, Instagram, Facebook Messenger e Web.

## 🚀 Sobre o Projeto

Kriar é uma solução whitelabel completa de automação inteligente que oferece:

- **Chatbots com IA** - Atendimento automatizado 24/7
- **Multi-canal** - WhatsApp, Instagram, Facebook Messenger e Web
- **Integrações** - Conecte com CRM, ERP, e-commerce e mais
- **Analytics** - Dashboard completo com métricas em tempo real
- **Atendimento Híbrido** - Combine IA com atendimento humano

## 📁 Estrutura do Projeto

```
kriar.digital/
├── index.html          # Página principal
├── contato.html        # Página de contato
├── login.html          # Página de login
├── css/
│   └── styles.css      # Estilos globais
├── js/
│   └── script.js       # JavaScript principal
├── assets/
│   ├── images/         # Imagens do site
│   └── icons/          # Ícones personalizados
└── README.md           # Este arquivo
```

## 🎨 Características

- **Design Moderno**: Interface limpa e profissional
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Performance**: Otimizado para carregamento rápido
- **SEO**: Estrutura otimizada para mecanismos de busca
- **Acessibilidade**: Seguindo as melhores práticas WCAG

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3 (com variáveis CSS)
- JavaScript (ES6+)
- Font Awesome (ícones)
- Google Fonts (Inter)

## 📦 Instalação

1. Clone ou faça download dos arquivos para seu servidor
2. Configure o FTP com as credenciais fornecidas:
   - Host: kriar.digital
   - Usuário: kriar2
   - Porta: 21
3. Faça upload de todos os arquivos mantendo a estrutura de pastas
4. Acesse https://kriar.digital no navegador

## 🚀 Deploy via FTP

### Usando FileZilla ou similar:

1. Conecte-se ao servidor FTP:
   - **Host**: kriar.digital (ou 177.153.209.189)
   - **Usuário**: kriar2
   - **Porta**: 21

2. Faça upload dos arquivos:
   - index.html
   - contato.html
   - login.html
   - Pasta css/
   - Pasta js/
   - Pasta assets/ (quando disponível)

### Usando linha de comando (Windows PowerShell):

```powershell
# Instalar WinSCP se necessário
# Depois conectar e fazer upload dos arquivos
```

## ⚙️ Configurações

### Atualizando Informações de Contato

Edite o arquivo `contato.html` e `index.html` para atualizar:
- Email de contato
- Número de WhatsApp
- Links de redes sociais

### Personalizando Cores

Edite as variáveis CSS no arquivo `css/styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #10b981;
    --accent-color: #f59e0b;
}
```

## 📱 Funcionalidades Implementadas

- ✅ Navegação responsiva com menu mobile
- ✅ Animações suaves ao scroll
- ✅ Formulário de contato funcional
- ✅ Sistema de validação de formulários
- ✅ Chat mockup animado
- ✅ Seções de preços, recursos e soluções
- ✅ Footer completo com links
- ✅ Botão flutuante de WhatsApp
- ✅ FAQ com accordion
- ✅ Página de login

## 🔒 Segurança

- Validação de formulários no frontend
- Proteção contra XSS
- Headers de segurança configurados
- HTTPS obrigatório (configurar no servidor)

## 📊 Analytics

Para adicionar Google Analytics:

1. Crie uma propriedade no Google Analytics
2. Adicione o código de rastreamento antes do `</head>` em todas as páginas:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🤝 Suporte

Para suporte técnico, entre em contato:
- Email: contato@kriar.digital
- WhatsApp: +55 (11) 99999-9999

## 📝 Licença

© 2025 Kriar - Automações Inteligentes. Todos os direitos reservados.

## 🎯 Próximos Passos

- [ ] Adicionar página de blog
- [ ] Criar área de clientes (dashboard)
- [ ] Implementar sistema de pagamento
- [ ] Adicionar mais integrações
- [ ] Criar aplicativo mobile

## 📞 Informações de Deploy FTP

**Servidor**: kriar.digital  
**IP Alternativo**: 177.153.209.189  
**Porta**: 21  
**Usuário**: kriar2  
**Protocolo**: FTP

---

Desenvolvido com ❤️ pela equipe Kriar
