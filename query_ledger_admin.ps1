
$url = "https://exkgplqcdtoxfmxqkdpl.supabase.co/rest/v1"
$key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMDQ3NSwiZXhwIjoyMDg3Nzg2NDc1fQ.t7Knpc2zi0qDrjQS09AJHWRDrDrpgzFRd5rmP_KvTzE"
$headers = @{
    "apikey" = $key
    "Authorization" = "Bearer $key"
    "Content-Type" = "application/json"
}

$profileId = "54fb63ef-cc85-4c65-8d02-0787497a381d"
$sql = "SELECT id, amount_usd, type, status, created_at FROM public.financial_ledger WHERE user_id = '$profileId' ORDER BY created_at DESC LIMIT 20;"

$body = @{
    "sql_query" = $sql
} | ConvertTo-Json

Write-Host "--- CALLING exec_sql (SERVICE ROLE) FOR SHREYASH ---"
try {
    $response = Invoke-RestMethod -Uri "$url/rpc/exec_sql" -Headers $headers -Method Post -Body $body
    $response | Format-Table -AutoSize
} catch {
    Write-Host "RPC Error: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errBody"
    }
}
