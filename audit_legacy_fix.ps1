
$URL = $env:NEXT_PUBLIC_SUPABASE_URL
$KEY = $env:SUPABASE_SERVICE_ROLE_KEY
$TUTOR_ID = "54fb63ef-cc85-4c65-8d02-0787497a381d"

Write-Host "--- Auditing Shreyash Kale (Legacy) ---" -ForegroundColor Cyan

# 1. Get Wallet
$walletUrl = "$URL/rest/v1/wallets?user_id=eq.$TUTOR_ID&select=*"
$wResponse = Invoke-RestMethod -Uri $walletUrl -Headers @{"apikey"=$KEY; "Authorization"="Bearer $KEY"}
Write-Host "`nWallet Record:" -ForegroundColor Green
$wResponse | Format-Table

# 2. Get Transactions
$transUrl = "$URL/rest/v1/transactions?user_id=eq.$TUTOR_ID&select=*&order=created_at.desc&limit=20"
$tResponse = Invoke-RestMethod -Uri $transUrl -Headers @{"apikey"=$KEY; "Authorization"="Bearer $KEY"}
Write-Host "`nRecent Transactions:" -ForegroundColor Green
$tResponse | Select-Object created_at, type, amount, currency, description | Format-Table

# 3. Look for 1000
$culprits = $tResponse | Where-Object { $_.amount -eq 1000 -or $_.amount_inr -eq 1000 }
if ($culprits) {
    Write-Host "`n--- CULPRIT FOUND ---" -ForegroundColor Red
    $culprits | Format-List
} else {
    Write-Host "`nNo 1000 unit transaction found in last 20." -ForegroundColor Yellow
}
