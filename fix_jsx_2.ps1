$p = 'c:\Users\SUMIT KUMAR\OneDrive\Desktop\urban-report-ai-main\frontend\src\pages\AdminDashboard.tsx'
$l = Get-Content $p
$newLines = @()
for ($i=0; $i -lt $l.Count; $i++) {
    if ($i -eq 398) { continue } # Skip line 399 (index 398)
    $newLines += $l[$i]
}
$newLines | Set-Content $p
