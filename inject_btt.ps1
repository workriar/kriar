$button = @"

    <!-- Back to Top Button -->
    <button id="backToTop" aria-label="Voltar ao topo">
        <i class="fas fa-chevron-up"></i>
    </button>

"@

$files = Get-ChildItem -Path "g:\kriar.site\kriar" -Filter "*.html" | Where-Object { $_.Name -ne "index.html" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -notmatch 'id="backToTop"') {
        $updated = $content -replace '(\s*<script src="js/script\.js">)', "$button`$1"
        [System.IO.File]::WriteAllText($file.FullName, $updated, [System.Text.Encoding]::UTF8)
        Write-Host "Updated: $($file.Name)"
    }
    else {
        Write-Host "Already has button: $($file.Name)"
    }
}

Write-Host "Done."
