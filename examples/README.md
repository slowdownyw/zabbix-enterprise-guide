# Examples

Практические фрагменты для адаптации под свою инфраструктуру.

## Что внутри

```text
examples/
├── tag-schema.yaml          # reference tag schema: allowed values, levels, routing examples
├── triggers/                # trigger expression patterns in Zabbix 7.x style
├── userparameters/          # Linux/Windows UserParameter examples
├── project/                 # RACI, phase gates, implementation checklist, decision log
└── decisions/               # ADR template and sample architecture decisions
```

## Статусы

- `tag-schema.yaml` — 🟢 conceptually stable / 🟡 adapt before production.
- `triggers/` — 🟡 design draft. Expressions use modern syntax, but item keys and value mappings must be validated in your Zabbix.
- `userparameters/` — 🟡 design draft / lab-adaptable. Scripts require local path, privilege, and timeout review.
- `project/` — 🟡 design draft. Governance/project artifacts must be adapted to your organization.
- `decisions/` — 🟢 conceptually stable / 🟡 adapt before production. ADR process and sample decisions.

## Как использовать

1. Скопируйте нужный пример.
2. Замените host/template names, item keys, paths and macros.
3. Проверьте локально.
4. Прогоните в тестовом Zabbix.
5. Только после этого переносите в production.

## Что сюда добавлять дальше

- `lld-json/` — реальные custom LLD examples.
- `dashboards/` — Grafana/Zabbix dashboard manifests.
- `ansible/` — community.zabbix playbooks.
- `templates/` — только после lab/prod validation.
