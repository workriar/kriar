# GUIA DE UPLOAD FTP - KRIAR.SITE

## Informações de Acesso FTP

**Host:** kriar.digital
**Host Alternativo:** 177.153.209.189  
**Porta:** 21  
**Usuário FTP:** kriar3  
**Protocolo:** FTP

---

## Método 1: Upload via FileZilla (Recomendado)

### Passo 1: Instalar FileZilla
1. Baixe o FileZilla em: https://filezilla-project.org/
2. Instale o programa seguindo as instruções

### Passo 2: Conectar ao Servidor
1. Abra o FileZilla
2. Preencha os campos no topo:
   - **Host:** kriar.digital (ou 177.153.209.189)
   - **Usuário:** kriar3
   - **Senha:** yHt8wi5AS6biRB2@
   - **Porta:** 21
3. Clique em "Conexão Rápida"

### Passo 3: Fazer Upload
1. No painel esquerdo (Local), navegue até: `e:\KRIAR\kriar.site`
2. No painel direito (Remoto), navegue até a pasta public_html (ou www)
3. Selecione todos os arquivos no painel esquerdo:
   - index.html
   - contato.html
   - login.html
   - robots.txt
   - sitemap.xml
   - manifest.json
   - Pasta css/
   - Pasta js/
   - Pasta assets/ (se existir)
4. Arraste e solte para o painel direito

---

## Método 2: Upload via WinSCP

### Passo 1: Instalar WinSCP
1. Baixe em: https://winscp.net/
2. Instale o programa

### Passo 2: Criar Nova Conexão
1. Abra o WinSCP
2. Clique em "Nova Sessão"
3. Preencha:
   - **Protocolo:** FTP
   - **Nome do host:** kriar.digital
   - **Porta:** 21
   - **Usuário:** kriar3
   - **Senha:** yHt8wi5AS6biRB2@
4. Clique em "Login"

### Passo 3: Transferir Arquivos
1. No painel esquerdo, navegue até: `e:\KRIAR\kriar.site`
2. No painel direito, vá para public_html
3. Selecione tudo e clique em "Upload"

---

## Método 3: Upload via PowerShell (Avançado)

```powershell
# Instalar módulo FTP (se necessário)
Install-Module -Name PSFTP

# Conectar via FTP
$ftpServer = "ftp://kriar.digital"
$userName = "kriar3"
$password = "yHt8wi5AS6biRB2@"

# Criar credenciais
$credentials = New-Object System.Net.NetworkCredential($userName, $password)

# Função para upload
function Upload-FTPFile {
    param($localFile, $remoteFile)
    
    $ftpRequest = [System.Net.FtpWebRequest]::Create("$ftpServer/$remoteFile")
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $ftpRequest.Credentials = $credentials
    
    $fileContent = [System.IO.File]::ReadAllBytes($localFile)
    $ftpRequest.ContentLength = $fileContent.Length
    
    $requestStream = $ftpRequest.GetRequestStream()
    $requestStream.Write($fileContent, 0, $fileContent.Length)
    $requestStream.Close()
}

# Upload dos arquivos principais
Upload-FTPFile "e:\KRIAR\kriar.site\index.html" "public_html/index.html"
Upload-FTPFile "e:\KRIAR\kriar.site\contato.html" "public_html/contato.html"
Upload-FTPFile "e:\KRIAR\kriar.site\login.html" "public_html/login.html"
# ... continue para outros arquivos
```

---

## Método 4: Através do Painel de Controle da Hospedagem

### Se sua hospedagem tem cPanel:
1. Acesse o cPanel da Loca Web
2. Procure por "Gerenciador de Arquivos"
3. Navegue até public_html
4. Clique em "Upload"
5. Selecione todos os arquivos da pasta `e:\KRIAR\kriar.site`
6. Aguarde o upload completar

---

## Estrutura de Pastas no Servidor

Certifique-se de que a estrutura no servidor fique assim:

```
public_html/
├── index.html
├── contato.html
├── login.html
├── robots.txt
├── sitemap.xml
├── manifest.json
├── css/
│   └── styles.css
├── js/
│   └── script.js
└── assets/
    ├── images/
    └── icons/
```

---

## Verificação Pós-Upload

Após fazer o upload, verifique:

1. ✅ Acesse https://kriar.digital - deve mostrar a página principal
2. ✅ Acesse https://kriar.digital/contato.html - deve mostrar a página de contato
3. ✅ Acesse https://kriar.digital/login.html - deve mostrar a página de login
4. ✅ Verifique se o CSS está carregando corretamente
5. ✅ Verifique se o JavaScript está funcionando (menu mobile, formulários)
6. ✅ Teste em dispositivos móveis

---

## Solução de Problemas

### Página não aparece (Error 404)
- Verifique se os arquivos estão na pasta correta (public_html ou www)
- Confirme que index.html está na raiz da pasta pública

### CSS não está carregando
- Verifique se a pasta css/ foi enviada
- Confirme que o caminho no HTML está correto: `css/styles.css`

### Erro de permissão
- Arquivos HTML devem ter permissão 644
- Pastas devem ter permissão 755

### Ajustar permissões via FileZilla:
1. Clique com botão direito no arquivo/pasta
2. Selecione "Permissões de arquivo"
3. Configure:
   - Arquivos: 644
   - Pastas: 755

---

## Contatos de Suporte

**Email:** contato@kriar.digital  
**Suporte Loca Web:** [site da hospedagem]

---

## Comandos FTP Rápidos (via linha de comando)

```bash
# Conectar via FTP
ftp kriar.digital

# Login
Name: kriar3
Password: yHt8wi5AS6biRB2@

# Navegar para pasta
cd public_html

# Upload arquivo único
put index.html

# Upload múltiplos arquivos
mput *.html

# Criar pasta
mkdir css

# Navegar para pasta
cd css

# Upload arquivos da pasta
put styles.css

# Sair
bye
```

---

**Importante:** Sempre faça backup dos arquivos existentes antes de fazer upload de novos arquivos!

---

Última atualização: 11/01/2025
