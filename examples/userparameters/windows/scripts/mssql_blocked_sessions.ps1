param(
    [Parameter(Mandatory=$true)]
    [string]$ServerInstance,

    [Parameter(Mandatory=$false)]
    [string]$Database = "master"
)

$ErrorActionPreference = "Stop"

$query = @"
SET NOCOUNT ON;
SELECT COUNT(*) AS blocked_sessions
FROM sys.dm_exec_requests
WHERE blocking_session_id <> 0;
"@

try {
    $result = Invoke-Sqlcmd -ServerInstance $ServerInstance -Database $Database -Query $query -TrustServerCertificate
    if ($null -eq $result.blocked_sessions) { Write-Output 0 } else { Write-Output ([int]$result.blocked_sessions) }
}
catch {
    # Zabbix item should return a scalar. Use -1 as an explicit collection error value.
    Write-Output -1
}
