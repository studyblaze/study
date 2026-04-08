
$url = "https://exkgplqcdtoxfmxqkdpl.supabase.co/rest/v1"
$key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTA0NzUsImV4cCI6MjA4Nzc4NjQ3NX0.KH1ZiIifSTntBq7tCQc5dLAE05YWxlgGXyI2chEZD0A"
$headers = @{
    "apikey" = $key
    "Authorization" = "Bearer $key"
    "Content-Type" = "application/json"
}

Write-Host "--- AUDITING SHREYASH KALE (ID: 3) ---"

# 1. Get Tutor Details
try {
    $tutorResponse = Invoke-RestMethod -Uri "$url/tutors?id=eq.3&select=*,profiles(*)" -Headers $headers -Method Get
    if ($null -eq $tutorResponse -or $tutorResponse.Count -eq 0) {
        Write-Host "Tutor not found"
        exit
    }
    $tutor = $tutorResponse[0]
    $profileId = $tutor.profile_id
    Write-Host "Tutor: $($tutor.profiles.full_name), Profile ID: $profileId"
} catch {
    Write-Host "Error fetching tutor: $_"
    exit
}

# 2. Check Financial Ledger for ANY entries > 500 or just the last 50
Write-Host "`n--- RECENT LEDGER ENTRIES (Last 50) ---"
try {
    $ledgerUrl = "$url/financial_ledger?user_id=eq.$profileId&order=created_at.desc&limit=50"
    $ledger = Invoke-RestMethod -Uri $ledgerUrl -Headers $headers -Method Get
    $ledger | Select-Object created_at, amount_usd, original_amount, original_currency, type, status | Format-Table -AutoSize
} catch {
    Write-Host "Error fetching ledger: $_"
}

# 3. Check Subscriptions
Write-Host "`n--- ACTIVE SUBSCRIPTIONS ---"
try {
    $subsUrl = "$url/subscriptions?tutor_id=eq.3"
    $subs = Invoke-RestMethod -Uri $subsUrl -Headers $headers -Method Get
    $subs | Select-Object id, student_id, balance_hours, status | Format-Table -AutoSize
} catch {
    Write-Host "Error fetching subscriptions: $_"
}
