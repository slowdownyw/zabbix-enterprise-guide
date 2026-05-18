# Zabbix Enterprise Guide

Книга-руководство по построению зрелого мониторинга на Zabbix для крупных инфраструктур.

**Не инструкция.** **Не сборник готовых шаблонов.** Это операционная инженерия: как думать про мониторинг, как заходить в проект с криво развёрнутым Zabbix, как разделить IT и OT, как не утонуть в alert fatigue.

---

## С чего начать

Если нужен общий словарь перед чтением или во время проекта, откройте [глоссарий](glossary.md): там собраны ключевые термины книги с отсылками к главам и рабочим артефактам.

Если вы здесь впервые — читайте по порядку первые шесть глав (часть «Принципы и дизайн»). Это **основа**, без которой остальные главы рассыпаются:

1. [**Манифест**](00_manifesto.md) — зачем эта книга и кому она нужна
2. [**Сервис, а не хост**](01_service_not_host.md) — главный принцип всего, что дальше
3. [**Severity = действие**](02_severity_model.md) — почему 200 Disaster-триггеров это не зрелость
4. [**Теги и группы**](03_tags_and_groups.md) — двухосная модель, без которой ничего не работает
5. [**LLD и prototypes**](04_lld_and_prototypes.md) — фундамент масштабирования
6. [**Многоуровневый дизайн**](05_layered_design.md) — методический центр: как четыре измерения слоёв собираются в единый язык проектирования

Дальше — по вкусу:

- **Внедрение Zabbix с нуля или с легаси** → начните с [Implementation Playbook](16_implementation_playbook.md), затем используйте [reference 90-day roadmap](07_implementation_roadmap.md)
- **Архитектура и масштабирование** → [Слои и развёртывание](06_architecture.md)
- **Эксплуатация уже работающего Zabbix** → [Эксплуатационная модель](12_operations.md) + [Runbooks](09_runbooks.md)
- **Нужно проектировать или принимать шаблоны** → [Требования к шаблонам](13_template_requirements.md) с честным дисклеймером

---

## Статусы глав

| Бейдж | Значение |
|---|---|
| 🟢 | **Conceptually stable** — концепция устойчива |
| 🟡 | **Design draft** — подход верный, код/пороги требуют валидации |
| 🔴 | **Requirements only** — это ТЗ, не имплементация |
| ⚫ | **Lab-tested** — проверено в лаборатории |
| 🟣 | **Production-tested** — проверено в продакшне |

В шапке каждой главы — её статус.

**Критерии валидации статусов ⚫ / 🟣:**

| Параметр | Lab-tested | Production-tested |
|---|---|---|
| Версия Zabbix | указана явно | указана явно |
| Размер стенда | hosts/items/NVPS | реальная нагрузка |
| БД | тип и версия | тип и версия |
| Proxy | да/нет | да/нет |
| HA | не требуется | желательно |
| Сценарий отказа | базовый smoke | подтверждён в поле |

Если глава не несёт ни ⚫, ни 🟣 — считайте её непроверенной на конкретной инфраструктуре.

---

## Полное оглавление

### Часть I. Принципы и дизайн

- [Манифест](00_manifesto.md) · 🟢
- [Сервис, а не хост](01_service_not_host.md) · 🟢
- [Severity = действие](02_severity_model.md) · 🟢
- [Теги и группы](03_tags_and_groups.md) · 🟢
- [LLD и prototypes](04_lld_and_prototypes.md) · 🟢
- [Многоуровневый дизайн](05_layered_design.md) · 🟢

### Часть II. Архитектура и внедрение

- [Слои и развёртывание](06_architecture.md) · 🟡
- [Implementation Playbook](16_implementation_playbook.md) · 🟡
- [Reference 90-day roadmap внедрения](07_implementation_roadmap.md) · 🟡
- [GitOps для Zabbix](08_gitops_for_zabbix.md) · 🟢

### Часть III. Эксплуатация

- [Runbooks](09_runbooks.md) · 🟢
- [SLA и сервисный каталог](10_sla_service_catalog.md) · 🟡
- [Дашборды и отчётность](11_dashboards_reporting.md) · 🟢
- [Эксплуатационная модель](12_operations.md) · 🟡

### Часть IV. Шаблоны

- [Требования к шаблонам](13_template_requirements.md) · 🔴

### Финал

- [Anti-patterns](15_antipatterns.md) · 🟢

---

## Практические примеры

В репозитории есть директория `examples/`:

- `tag-schema.yaml` — reference-схема тегов;
- `triggers/` — примеры trigger expressions;
- `userparameters/` — примеры UserParameter;
- `project/` — RACI, phase gates и implementation checklist.

Они намеренно вынесены из книги: это рабочие артефакты для копирования и адаптации, а не narrative-главы. Статус большинства примеров — 🟡 Design draft.

---

## Лицензия

- Документация — [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- Код — [MIT](https://opensource.org/licenses/MIT)

## Project and decision artifacts

Для практического внедрения используйте:

- [`examples/project/`](https://github.com/slowdownyw/zabbix-enterprise-guide/tree/main/examples/project) — RACI, phase gates, implementation checklist и decision log;
- [`examples/decisions/`](https://github.com/slowdownyw/zabbix-enterprise-guide/tree/main/examples/decisions) — ADR template и примеры архитектурных решений.

ADR нужны не для бюрократии, а чтобы зафиксировать: какой вариант выбран, почему, кто согласовал, какие последствия для эксплуатации и когда решение пересматривать.

