import os
import csv
import requests
from datetime import datetime

ZBX_URL = os.environ["ZBX_URL"].rstrip("/")
if not ZBX_URL.endswith("api_jsonrpc.php"):
    ZBX_URL += "/api_jsonrpc.php"

ZBX_TOKEN = os.environ["ZBX_TOKEN"]

HEADERS = {
    "Content-Type": "application/json-rpc",
    "Authorization": f"Bearer {ZBX_TOKEN}",
}

SEVERITY = {
    "0": "Not classified",
    "1": "Information",
    "2": "Warning",
    "3": "Average",
    "4": "High",
    "5": "Disaster",
}

IFACE_TYPE = {
    "1": "ZBX",
    "2": "SNMP",
    "3": "IPMI",
    "4": "JMX",
}

AVAIL = {
    "0": "unknown",
    "1": "available",
    "2": "unavailable",
}

MANDATORY_TAGS = [
    "env",
    "location",
    "segment",
    "service",
    "owner",
    "criticality",
    "os_family",
]


def zbx(method, params):
    payload = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1,
    }
    r = requests.post(ZBX_URL, headers=HEADERS, json=payload, timeout=30)
    r.raise_for_status()
    data = r.json()
    if "error" in data:
        raise RuntimeError(data["error"])
    return data["result"]


def tagdict(tags):
    result = {}
    for t in tags or []:
        result[t.get("tag")] = t.get("value", "")
    return result


def write_csv(path, rows, fields):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fields, delimiter=";")
        w.writeheader()
        for row in rows:
            w.writerow(row)


hosts = zbx("host.get", {
    "output": [
        "hostid", "host", "name", "status",
        "available", "snmp_available",
        "error", "snmp_error",
    ],
    "selectGroups": ["name"],
    "selectParentTemplates": ["name"],
    "selectTags": ["tag", "value"],
    "selectInterfaces": ["type", "ip", "dns", "port", "available", "error"],
    "sortfield": "host",
})

host_rows = []
hosts_without_tags = []
hosts_unknown = []
hosts_no_templates = []
hosts_unavailable = []

for h in hosts:
    tags = tagdict(h.get("tags", []))
    groups = [g["name"] for g in h.get("groups", [])]
    templates = [t["name"] for t in h.get("parentTemplates", [])]

    missing_tags = [k for k in MANDATORY_TAGS if not tags.get(k)]

    iface_status = []
    iface_errors = []
    for i in h.get("interfaces", []):
        typ = IFACE_TYPE.get(i.get("type"), i.get("type"))
        av = AVAIL.get(i.get("available"), i.get("available"))
        iface_status.append(f"{typ}:{i.get('ip') or i.get('dns')}:{i.get('port')}:{av}")
        if i.get("error"):
            iface_errors.append(f"{typ}:{i.get('error')}")

    row = {
        "hostid": h["hostid"],
        "host": h["host"],
        "name": h.get("name", ""),
        "enabled": "yes" if h.get("status") == "0" else "no",
        "groups": "|".join(groups),
        "templates": "|".join(templates),
        "tags": "|".join(f"{k}={v}" for k, v in tags.items()),
        "missing_tags": "|".join(missing_tags),
        "service": tags.get("service", ""),
        "owner": tags.get("owner", ""),
        "criticality": tags.get("criticality", ""),
        "location": tags.get("location", ""),
        "os_family": tags.get("os_family", ""),
        "zbx_available": AVAIL.get(h.get("available"), h.get("available")),
        "snmp_available": AVAIL.get(h.get("snmp_available"), h.get("snmp_available")),
        "zbx_error": h.get("error", ""),
        "snmp_error": h.get("snmp_error", ""),
        "interfaces": "|".join(iface_status),
        "interface_errors": "|".join(iface_errors),
    }

    host_rows.append(row)

    if missing_tags:
        hosts_without_tags.append(row)
    if tags.get("service") == "unknown" or tags.get("owner") == "unknown" or tags.get("os_family") == "unknown":
        hosts_unknown.append(row)
    if not templates:
        hosts_no_templates.append(row)
    if h.get("available") == "2" or h.get("snmp_available") == "2" or iface_errors:
        hosts_unavailable.append(row)

fields = list(host_rows[0].keys()) if host_rows else []

write_csv("01_hosts_all.csv", host_rows, fields)
write_csv("02_hosts_missing_tags.csv", hosts_without_tags, fields)
write_csv("03_hosts_unknown_owner_service_os.csv", hosts_unknown, fields)
write_csv("04_hosts_no_templates.csv", hosts_no_templates, fields)
write_csv("05_hosts_unavailable_interfaces.csv", hosts_unavailable, fields)

problems = zbx("problem.get", {
    "output": "extend",
    "selectTags": "extend",
    "selectAcknowledges": "extend",
    "selectSuppressionData": "extend",
    "recent": False,
    "sortfield": ["eventid"],
    "sortorder": "DESC",
})

problem_rows = []
for p in problems:
    tags = tagdict(p.get("tags", []))
    problem_rows.append({
        "eventid": p.get("eventid"),
        "objectid_triggerid": p.get("objectid"),
        "time": datetime.fromtimestamp(int(p["clock"])).strftime("%Y-%m-%d %H:%M:%S"),
        "severity": SEVERITY.get(p.get("severity"), p.get("severity")),
        "name": p.get("name"),
        "service": tags.get("service", ""),
        "owner": tags.get("owner", ""),
        "criticality": tags.get("criticality", ""),
        "location": tags.get("location", ""),
        "env": tags.get("env", ""),
        "tags": "|".join(f"{k}={v}" for k, v in tags.items()),
        "acknowledged": p.get("acknowledged"),
        "suppressed": "yes" if p.get("suppression_data") else "no",
    })

write_csv("06_problems_active.csv", problem_rows, [
    "eventid", "objectid_triggerid", "time", "severity", "name",
    "env", "service", "owner", "criticality", "location",
    "tags", "acknowledged", "suppressed",
])

print("DONE")
print(f"hosts_total={len(host_rows)}")
print(f"hosts_missing_tags={len(hosts_without_tags)}")
print(f"hosts_unknown={len(hosts_unknown)}")
print(f"hosts_no_templates={len(hosts_no_templates)}")
print(f"hosts_unavailable_interfaces={len(hosts_unavailable)}")
print(f"active_problems={len(problem_rows)}")