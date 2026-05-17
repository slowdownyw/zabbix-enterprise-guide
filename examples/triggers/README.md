# Trigger expression examples

Status: 🟡 **Design draft**.

These examples use the modern Zabbix trigger-expression style with explicit `/host/key` item references, for example:

```text
last(/Plant Windows Base/agent.ping)=0
min(/Plant Linux Base/vfs.fs.size[{#FSNAME},pfree],5m)<{$VFS.FS.PFREE.MIN.CRIT}
```

They are intended as **patterns**, not import-ready templates. Before production use:

1. verify exact item keys in your template;
2. verify value mappings and return values;
3. test in a lab Zabbix instance;
4. attach tags and runbook URL;
5. tune thresholds on real historical data.

Recommended trigger tags:

```text
component=<component>
scope=<availability|performance|capacity|backup|recovery|security>
impact=<outage|service-degradation|rpo-risk|capacity-risk|hygiene>
notification=<active|silent|dashboard-only|report-only>
runbook=rb-...
```
