# Project implementation artifacts

> Статус: 🟡 Design draft. Эти файлы помогают провести внедрение мониторинга как проект, а не как набор правок в Zabbix UI.

## Что внутри

```text
examples/project/
├── README.md
├── raci-matrix.md              # роли и ответственность
├── phase-gates.md              # контрольные точки внедрения
└── implementation-checklist.md # пошаговый execution checklist
```

## Как использовать

1. Скопируйте файлы в project workspace.
2. Замените роли на реальные команды и имена.
3. Уберите лишнее, но не убирайте ответственность.
4. Для каждого gate назначьте accountable.
5. Если gate пропущен — запишите риск.

## Связанные главы

- `docs/16_implementation_playbook.md` — основное руководство по внедрению.
- `docs/07_implementation_roadmap.md` — 90-дневная дорожная карта внедрения.
- `docs/05_layered_design.md` — методика layered design.
- `docs/11_dashboards_reporting.md` — dashboards/reporting design.
- `docs/12_operations.md` — эксплуатационные процедуры.

## Следующие артефакты

Для следующих итераций:

```text
examples/project/stakeholder-map.md
examples/project/workshop-plan.md
examples/project/risk-register.md
examples/project/sizing-questionnaire.md
examples/project/sizing-baseline.md
examples/decisions/adr-template.md
```

## Decision tracking

Implementation projects fail when decisions stay implicit. Use:

- [`../decisions/README.md`](../decisions/README.md) — ADR process and sample decisions;
- [`decision-log.md`](./decision-log.md) — lightweight index of accepted/proposed decisions.

Recommended rule:

> If a decision changes architecture, ownership, alert routing, dashboard semantics, retention, or production change workflow, record it as an ADR.

