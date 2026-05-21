# Quick start — zabbix-enterprise-guide v0.6

Распакуй архив, и за 10 минут поднимешь сайт книги.

## Что внутри архива

```text
zabbix-book/
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── mkdocs.yml
├── requirements.txt
├── .gitignore
├── .github/
│   ├── workflows/pages.yml
│   └── ISSUE_TEMPLATE/
├── docs/                         — 18 страниц книги + index
│   ├── index.md
│   ├── 00_manifesto.md
│   ├── 01_service_not_host.md
│   ├── 02_severity_model.md
│   ├── 03_tags_and_groups.md
│   ├── 04_lld_and_prototypes.md
│   ├── 05_layered_design.md
│   ├── 06_architecture.md
│   ├── 07_implementation_roadmap.md
│   ├── 08_gitops_for_zabbix.md
│   ├── 09_runbooks.md
│   ├── 10_sla_service_catalog.md
│   ├── 11_dashboards_reporting.md
│   ├── 12_operations.md
│   ├── 13_template_requirements.md
│   ├── 14_validation_backlog.md
│   ├── 15_antipatterns.md
│   └── 16_implementation_playbook.md
├── examples/
│   ├── tag-schema.yaml
│   ├── triggers/
│   ├── userparameters/
│   ├── project/                  — RACI, phase gates, implementation checklist, decision log
│   └── decisions/                — ADR template and sample architecture decisions
├── scripts/zbx_audit_now.py
└── diagrams/monitoring-arch.jsx
```

## Шаг 1. Распаковать и проверить локально

```bash
tar -xzf zabbix-enterprise-guide-v0.6-iter2.tar.gz
cd zabbix-book

python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt

mkdocs serve
# открыть http://127.0.0.1:8000
```

## Шаг 2. Собрать как в CI

```bash
mkdocs build --strict
```

## Шаг 3. Создать репозиторий на GitHub

Если используешь имя `slowdownyw/zabbix-enterprise-guide`, ничего менять не нужно.
Если имя другое — поменяй в `mkdocs.yml`:

```yaml
site_url:
repo_url:
repo_name:
```

На GitHub:

1. New repository → `zabbix-enterprise-guide`
2. Public или Private по ситуации
3. Не добавляй README/LICENSE/.gitignore — они уже есть в архиве

## Шаг 4. Запушить

```bash
git init -b main
git add .
git commit -m "Initial commit: enterprise Zabbix guide v0.6 iteration 2"
git remote add origin git@github.com:slowdownyw/zabbix-enterprise-guide.git
git push -u origin main
```

## Шаг 5. Включить GitHub Pages

В репозитории:

1. Settings → Pages
2. Source: GitHub Actions
3. Save

Workflow запустится автоматически на первый push.

## Что добавлено в v0.6

### Iteration 1 — Руководство по внедрению

- `docs/16_implementation_playbook.md` — операционное руководство по внедрению: роли, фазы, decision points, sizing gate, phase gates, acceptance checklist.
- `examples/project/raci-matrix.md` — RACI-матрица ролей.
- `examples/project/phase-gates.md` — gate criteria для Phase 0..5.
- `examples/project/implementation-checklist.md` — пошаговый execution checklist.
- `examples/project/README.md` — как использовать project artifacts.

### Iteration 2 — Architecture Decision Records

- `examples/decisions/README.md` — как вести ADR в проекте внедрения мониторинга.
- `examples/decisions/adr-template.md` — шаблон Architecture Decision Record.
- `examples/decisions/adr-001..007` — примеры решений: deployment model, agent mode/encryption, tag schema, template composition, retention/sizing, dashboard platform, GitOps/change control.
- `examples/project/decision-log.md` — журнал решений для phase gates.

## Что дальше

Следующие итерации v0.6:

- `examples/project/sizing-questionnaire.md` и `sizing-baseline.md`;
- `examples/project/risk-register.md`;
- `examples/project/workshop-plan.md`;
- дополнительные ADR: OT/SCADA boundary, ITSM integration, service catalog scope.
