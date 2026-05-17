# MSSQL trigger examples — Zabbix 7.x style

Status: 🟡 **Design draft**. These expressions assume custom/dependent items exist in `Plant: MSSQL for 1C`.

## Blocking sessions detected

```text
Name: {HOST.NAME}: MSSQL has blocked sessions on {#DBNAME}
Expression: min(/Plant MSSQL for 1C/mssql.blocked_sessions[{#DBNAME}],5m)>{$MSSQL.BLOCKED_SESSIONS.WARN}
Severity: Average
Tags:
  component=mssql
  scope=performance
  impact=service-degradation
  notification=active
  runbook=rb-mssql-blocking
```

Suggested SQL for the item:

```sql
SELECT COUNT(*)
FROM sys.dm_exec_requests
WHERE blocking_session_id <> 0;
```

## Long-running active requests

```text
Name: {HOST.NAME}: MSSQL long-running active requests on {#DBNAME}
Expression: min(/Plant MSSQL for 1C/mssql.long_requests[{#DBNAME}],5m)>{$MSSQL.LONG_REQUESTS.WARN}
Severity: Average
Tags:
  component=mssql
  scope=performance
  impact=service-degradation
  notification=active
  runbook=rb-mssql-long-requests
```

Suggested SQL for the item:

```sql
SELECT COUNT(*)
FROM sys.dm_exec_requests
WHERE start_time < DATEADD(second, -$(LONGREQ_SEC), GETDATE());
```

## tempdb usage critical

```text
Name: {HOST.NAME}: MSSQL tempdb usage is critical
Expression: min(/Plant MSSQL for 1C/mssql.tempdb.used.pct,5m)>{$MSSQL.TEMPDB.USED.CRIT}
Severity: High
Tags:
  component=tempdb
  scope=capacity
  impact=service-degradation
  notification=active
  runbook=rb-mssql-tempdb-full
```

Suggested macros:

```text
{$MSSQL.TEMPDB.USED.WARN}=80
{$MSSQL.TEMPDB.USED.CRIT}=95
```

## Full backup age exceeds RPO

```text
Name: {HOST.NAME}: MSSQL full backup for {#DBNAME} is older than RPO
Expression: last(/Plant MSSQL for 1C/mssql.backup.age.hours[{#DBNAME},full])>{$MSSQL.BACKUP.AGE.CRIT.HOURS:"{#DBNAME}"}
Severity: High
Tags:
  component=backup-job
  scope=recovery
  impact=rpo-risk
  notification=active
  runbook=rb-mssql-backup-rpo-breach
```

Do not use `nodata()` for this check if the item reports an old timestamp or age on every poll. Trigger on the backup age value.
