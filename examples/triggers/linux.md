# Linux trigger examples — Zabbix 7.x style

Status: 🟡 **Design draft**. Keys and thresholds must be validated against your Linux base template.

## Agent unavailable

```text
Name: Linux agent unavailable
Expression: nodata(/Plant Linux Base/agent.ping,5m)=1
Severity: High
Tags:
  component=zabbix-agent
  scope=availability
  impact=service-degradation
  notification=active
  runbook=rb-linux-agent-unavailable
```

## Low free space on discovered filesystem

```text
Name: {HOST.NAME}: filesystem {#FSNAME} free space is critically low
Expression: min(/Plant Linux Base/vfs.fs.size[{#FSNAME},pfree],5m)<{$VFS.FS.PFREE.MIN.CRIT:"{#FSNAME}"}
Severity: High
Tags:
  component=filesystem
  scope=capacity
  impact=capacity-risk
  notification=active
  runbook=rb-linux-filesystem-full
```

## High CPU utilization

```text
Name: {HOST.NAME}: CPU utilization is high for 15 minutes
Expression: min(/Plant Linux Base/system.cpu.util[,idle],15m)<{$CPU.IDLE.MIN.WARN}
Severity: Average
Tags:
  component=cpu
  scope=performance
  impact=service-degradation
  notification=active
  runbook=rb-linux-high-cpu
```

Suggested macro:

```text
{$CPU.IDLE.MIN.WARN}=10
```

## Systemd unit failed

```text
Name: {HOST.NAME}: systemd unit {#UNIT.NAME} is failed
Expression: last(/Plant Linux Systemd/systemd.unit.info[{#UNIT.NAME},ActiveState])<>1
Severity: High
Tags:
  component=service
  scope=availability
  impact=service-degradation
  notification=active
  runbook=rb-linux-systemd-unit-failed
```

Validate the value mapping for `systemd.unit.info`. If your item returns strings (`active`, `failed`) instead of numeric values, use string preprocessing or dependent items before triggering.
