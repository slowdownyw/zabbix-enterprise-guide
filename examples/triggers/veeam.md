# Veeam trigger examples — Zabbix 7.x style

Status: 🟡 **Design draft**. These expressions assume custom/dependent items from Veeam API, Enterprise Manager API, PowerShell, or script items.

## Backup job failed

```text
Name: Veeam job {#JOBNAME} failed
Expression: last(/Plant Veeam Backup/veeam.job.status[{#JOBNAME}])={$VEEAM.STATUS.FAILED}
Severity: High
Tags:
  component=backup-job
  scope=backup
  impact=rpo-risk
  notification=active
  runbook=rb-veeam-job-failed
```

Use a value map for job state. Do not compare free-form strings in trigger expressions if you can preprocess to numeric codes.

## Last successful backup older than RPO

```text
Name: Veeam job {#JOBNAME}: last successful backup is older than RPO
Expression: last(/Plant Veeam Backup/veeam.job.age.hours[{#JOBNAME}])>{$VEEAM.JOB.AGE.CRIT.HOURS:"{#JOBNAME}"}
Severity: High
Tags:
  component=backup-job
  scope=recovery
  impact=rpo-risk
  notification=active
  runbook=rb-veeam-rpo-breach
```

This is the preferred RPO check if the item returns age in hours.

Alternative if the item returns Unix timestamp of the last successful run:

```text
Name: Veeam job {#JOBNAME}: last successful backup timestamp is older than RPO
Expression: now()-last(/Plant Veeam Backup/veeam.job.last_success_ts[{#JOBNAME}])>{$VEEAM.JOB.AGE.CRIT.SECONDS:"{#JOBNAME}"}
Severity: High
Tags:
  component=backup-job
  scope=recovery
  impact=rpo-risk
  notification=active
  runbook=rb-veeam-rpo-breach
```

## Repository free space low

```text
Name: Veeam repository {#REPOSITORY}: free space is critically low
Expression: min(/Plant Veeam Backup/veeam.repository.free.pct[{#REPOSITORY}],10m)<{$VEEAM.REPO.FREE.CRIT.PCT:"{#REPOSITORY}"}
Severity: High
Tags:
  component=backup-repository
  scope=capacity
  impact=rpo-risk
  notification=active
  runbook=rb-veeam-repository-full
```

Suggested macros:

```text
{$VEEAM.REPO.FREE.WARN.PCT}=20
{$VEEAM.REPO.FREE.CRIT.PCT}=10
{$VEEAM.JOB.AGE.CRIT.HOURS}=26
{$VEEAM.JOB.AGE.CRIT.SECONDS}=93600
{$VEEAM.STATUS.FAILED}=2
```
