# Windows trigger examples — Zabbix 7.x style

Status: 🟡 **Design draft**. Keys and return values must be validated against the actual linked Windows template.

## Agent unavailable

```text
Name: Windows agent unavailable
Expression: nodata(/Plant Windows Base/agent.ping,5m)=1
Severity: High
Tags:
  component=zabbix-agent
  scope=availability
  impact=service-degradation
  notification=active
  runbook=rb-windows-agent-unavailable
```

Use `nodata()` here only for agent freshness/availability. Do not use it as a replacement for business state checks.

## Low free space on discovered filesystem

```text
Name: {HOST.NAME}: filesystem {#FSNAME} free space is critically low
Expression: min(/Plant Windows Base/vfs.fs.size[{#FSNAME},pfree],5m)<{$VFS.FS.PFREE.MIN.CRIT:"{#FSNAME}"}
Severity: High
Tags:
  component=filesystem
  scope=capacity
  impact=capacity-risk
  notification=active
  runbook=rb-windows-filesystem-full
```

Suggested macros:

```text
{$VFS.FS.PFREE.MIN.WARN}=20
{$VFS.FS.PFREE.MIN.CRIT}=10
{$VFS.FS.PFREE.MIN.CRIT:"C:"}=15
```

## Windows service down

```text
Name: {HOST.NAME}: critical Windows service {#SERVICE.NAME} is not running
Expression: last(/Plant Windows Services/service.info[{#SERVICE.NAME},state])<>0
Severity: High
Tags:
  component=service
  scope=availability
  impact=service-degradation
  notification=active
  runbook=rb-windows-service-down
```

Validate the expected `service.info[...,state]` value mapping in your template. In many Windows templates, `0` means running.

## Reboot detected

```text
Name: {HOST.NAME}: Windows host has been rebooted
Expression: last(/Plant Windows Base/system.uptime)<10m
Severity: Warning
Tags:
  component=os
  scope=availability
  impact=hygiene
  notification=dashboard-only
  runbook=rb-windows-unplanned-reboot
```

Keep reboot triggers below High unless the reboot causes service impact or violates a change window.
