
$url = "https://exkgplqcdtoxfmxqkdpl.supabase.co/rest/v1"
$key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTA0NzUsImV4cCI6MjA4Nzc4NjQ3NX0.KH1ZiIifSTntBq7tCQc5dLAE05YWxlgGXyI2chEZD0A"
$headers = @{
    "apikey" = $key
    "Authorization" = "Bearer $key"
    "Content-Type" = "application/json"
}

$profileId = "54fb63ef-cc85-4c65-8d02-0787497a381d"

Write-Host "--- DATA FOR SHREYASH KALE ($profileId) ---"

# 1. Wallets
Write-Host "`n--- WALLETS ---"
try {
    $wallet = Invoke-RestMethod -Uri "$url/wallets?user_id=eq.$profileId" -Headers $headers -Method Get
    $wallet | Select-Object user_id, balance, currency | Format-Table -AutoSize
} catch {
    Write-Host "Wallet error: $_"
}

# 2. Financial Ledger (Available and not Available)
Write-Host "`n--- FINANCIAL LEDGER (ALL) ---"
try {
    $ledger = Invoke-RestMethod -Uri "$url/financial_ledger?user_id=eq.$profileId&order=created_at.desc" -Headers $headers -Method Get
    $ledger | Select-Object id, amount_usd, status, available_at, type, original_amount, original_currency | Format-Table -AutoSize
} catch {
    Write-Host "Ledger error: $_"
}
