$baseUrl = 'https://kriar.digital'
$ogImage = 'https://kriar.digital/assets/images/logo-kriar.png'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$pages = [ordered]@{
    'contato.html'     = @{ title = 'Contato | Kriar'; desc = 'Fale com a equipe da Kriar. Tire duvidas, solicite uma demonstracao ou entre em contato pelo WhatsApp.' }
    'sobre.html'       = @{ title = 'Sobre Nos | Kriar'; desc = 'Conheca a Kriar: missao, valores, equipe e historia de uma empresa brasileira apaixonada por automacao com IA.' }
    'blog.html'        = @{ title = 'Blog | Kriar - Automacoes Inteligentes'; desc = 'Artigos, dicas e novidades sobre chatbots, automacao com IA, WhatsApp Business e atendimento digital.' }
    'integracoes.html' = @{ title = 'Integracoes | Kriar'; desc = 'Conecte a Kriar com CRMs, ERPs, e-commerce e muito mais. Mais de 50 integracoes disponiveis.' }
    'api.html'         = @{ title = 'API | Kriar - Documentacao'; desc = 'Documentacao completa da API da Kriar. Integre nossa plataforma de automacao diretamente na sua aplicacao.' }
    'ajuda.html'       = @{ title = 'Central de Ajuda | Kriar'; desc = 'Encontre respostas, tutoriais e suporte para usar a plataforma Kriar de automacao com IA.' }
    'status.html'      = @{ title = 'Status do Sistema | Kriar'; desc = 'Verifique em tempo real o status de todos os servicos da Kriar. Transparencia operacional 24/7.' }
    'privacidade.html' = @{ title = 'Politica de Privacidade | Kriar'; desc = 'Politica de Privacidade da Kriar em conformidade com a LGPD. Saiba como tratamos seus dados pessoais.' }
    'termos.html'      = @{ title = 'Termos de Uso | Kriar'; desc = 'Termos e condicoes de uso da plataforma Kriar. Leia os direitos e responsabilidades dos usuarios.' }
    'lgpd.html'        = @{ title = 'LGPD | Kriar - Conformidade'; desc = 'Saiba como a Kriar esta em conformidade com a LGPD e como exercer seus direitos como titular de dados.' }
    'carreiras.html'   = @{ title = 'Carreiras | Kriar'; desc = 'Vagas abertas na Kriar. Junte-se a um time apaixonado por IA, automacao e impacto real nos negocios.' }
    'parceiros.html'   = @{ title = 'Parceiros | Kriar'; desc = 'Programa de parceiros da Kriar. Revenda, integre ou indique e construa um negocio de sucesso com IA.' }
    'afiliados.html'   = @{ title = 'Afiliados | Kriar'; desc = 'Programa de afiliados da Kriar. Ganhe comissoes indicando nossa plataforma de automacao com IA.' }
    'cases.html'       = @{ title = 'Cases de Sucesso | Kriar'; desc = 'Historias reais de empresas que transformaram seu atendimento com chatbots e automacao da Kriar.' }
    'docs.html'        = @{ title = 'Documentacao | Kriar'; desc = 'Documentacao tecnica completa da Kriar. Guias, referencias de API e exemplos de integracao.' }
    'tutoriais.html'   = @{ title = 'Tutoriais | Kriar'; desc = 'Tutoriais passo a passo para configurar chatbots, automacoes e integracoes na plataforma Kriar.' }
    'webinars.html'    = @{ title = 'Webinars | Kriar'; desc = 'Webinars ao vivo e gravados sobre automacao com IA, chatbots e estrategias para WhatsApp Business.' }
    'login.html'       = @{ title = 'Entrar | Kriar'; desc = 'Acesse sua conta na plataforma Kriar e gerencie seus chatbots e automacoes com IA.' }
}

foreach ($file in $pages.Keys) {
    $info = $pages[$file]
    $path = Join-Path $root $file
    if (-not (Test-Path $path)) { Write-Warning "Not found: $path"; continue }

    $raw = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

    if ($raw -match 'og:type') {
        Write-Host "Skipped (OG exists): $file"
        continue
    }

    $canonical = "$baseUrl/$file"
    $seoBlock = "    <meta name=`"robots`" content=`"index, follow`">`n" +
    "    <link rel=`"canonical`" href=`"$canonical`">`n" +
    "    <meta property=`"og:type`" content=`"website`">`n" +
    "    <meta property=`"og:site_name`" content=`"Kriar - Automacoes Inteligentes`">`n" +
    "    <meta property=`"og:title`" content=`"$($info.title)`">`n" +
    "    <meta property=`"og:description`" content=`"$($info.desc)`">`n" +
    "    <meta property=`"og:url`" content=`"$canonical`">`n" +
    "    <meta property=`"og:image`" content=`"$ogImage`">`n" +
    "    <meta property=`"og:locale`" content=`"pt_BR`">`n" +
    "    <meta name=`"twitter:card`" content=`"summary_large_image`">`n" +
    "    <meta name=`"twitter:title`" content=`"$($info.title)`">`n" +
    "    <meta name=`"twitter:description`" content=`"$($info.desc)`">`n" +
    "    <meta name=`"twitter:image`" content=`"$ogImage`">`n" +
    "    <link rel=`"apple-touch-icon`" href=`"assets/images/logo-kriar.png`">"

    # Insert after the icon link
    if ($raw -match '(?s)(<link rel="icon"[^>]+>)') {
        $iconTag = $matches[1]
        $updated = $raw.Replace($iconTag, "$iconTag`n$seoBlock")
        [System.IO.File]::WriteAllText($path, $updated, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Updated: $file"
    }
    else {
        Write-Warning "Icon tag not found in $file"
    }
}
Write-Host "`nAll done!"
