# UserParameter examples

Status: 🟡 **Design draft / lab-adaptable**.

Zabbix `UserParameter` lets an agent expose custom item keys by running local commands or scripts. Use it sparingly:

- keep scripts short and deterministic;
- enforce timeouts at script level when possible;
- never print secrets;
- return one scalar value per item;
- return numeric values for trigger-friendly checks;
- run under a least-privilege account;
- validate locally with `zabbix_agent2 -t <key>` or equivalent.

Structure:

```text
linux/
  1c-rac.conf
  scripts/
    1c_rac_available.sh
    1c_sessions_count.sh
windows/
  mssql.conf
  veeam.conf
  scripts/
    mssql_blocked_sessions.ps1
    veeam_last_success_age_hours.ps1
```

Copy scripts to your agent script directory, adjust paths, users, DSNs, and permissions, then include the `.conf` snippets from your Zabbix agent configuration.
