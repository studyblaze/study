
$url = "https://exkgplqcdtoxfmxqkdpl.supabase.co/rest/v1"
$key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTA0NzUsImV4cCI6MjA4Nzc4NjQ3NX0.KH1ZiIifSTntBq7tCQc5dLAE05YWxlgGXyI2chEZD0A"
$headers = @{
    "apikey" = $key
    "Authorization" = "Bearer $key"
    "Content-Type" = "application/json"
}

$profileId = "54fb63ef-cc85-4c65-8d02-0787497a381d"
$sql = "SELECT * FROM public.financial_ledger WHERE user_id = '$profileId' ORDER BY created_at DESC LIMIT 10;"

$body = @{
    "sql_query" = $sql
} | ConvertTo-Json

Write-Host "--- CALLING exec_sql FOR SHREYASH ---"
try {
    $response = Invoke-RestMethod -Uri "$url/rpc/exec_sql" -Headers $headers -Method Post -Body $body
    $response | Format-Table -AutoSize
} catch {
    Write-Host "RPC Error: $_"
}
