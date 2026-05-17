param(
    [Parameter(Mandatory=$true)]
    [string]$JobName
)

$ErrorActionPreference = "Stop"

try {
    Add-PSSnapin VeeamPSSnapIn -ErrorAction SilentlyContinue | Out-Null
    $session = Get-VBRBackupSession |
        Where-Object { $_.JobName -eq $JobName -and $_.Result -eq "Success" } |
        Sort-Object EndTime -Descending |
        Select-Object -First 1

    if ($null -eq $session -or $null -eq $session.EndTime) {
        # No successful session found. Use a large age to trigger RPO breach.
        Write-Output 999999
        exit 0
    }

    $ageHours = [math]::Round(((Get-Date) - $session.EndTime).TotalHours, 2)
    Write-Output $ageHours
}
catch {
    # Explicit collection error value. Trigger separately if desired.
    Write-Output -1
}
