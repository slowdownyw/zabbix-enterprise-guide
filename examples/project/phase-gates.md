# Phase gates — implementation acceptance checkpoints

> Статус: 🟡 Design draft. Используйте как checklist для gate reviews. Значения `X%`, списки сервисов и количество хостов должны быть адаптированы.

Phase gate — это контрольная точка между фазами внедрения. Gate нужен не для бюрократии, а чтобы команда не масштабировала хаос.

---

## Gate 0 — Ready to start

Цель: проект можно начинать.

### Required

- [ ] Executive sponsor назначен.
- [ ] Monitoring owner назначен.
- [ ] Scope первой итерации описан.
- [ ] Out of scope явно описан.
- [ ] Есть read-only доступ к текущему Zabbix.
- [ ] Есть доступ к текущим problems/events/actions/templates.
- [ ] Есть список ключевых stakeholders.
- [ ] Есть место для артефактов: repo/wiki/folder.
- [ ] Есть decision log или договорённость, где он будет.
- [ ] Есть risk register или договорённость, где он будет.

### Recommended

- [ ] Есть доступ к vCenter/Hyper-V inventory.
- [ ] Есть контакт AD/DNS/DHCP владельцев.
- [ ] Есть контакт Veeam/backup владельца.
- [ ] Есть контакт ServiceDesk/ITSM владельца.
- [ ] Есть contact person от ИБ.
- [ ] Есть contact person от OT/SCADA, если scope касается производства.

### Gate questions

1. Кто будет владельцем мониторинга после проекта?
2. Кто может принимать решения по тегам, severity и шаблонам?
3. Какие сервисы входят в MVP?
4. Какие зоны нельзя трогать без отдельного согласования?
5. Что считается успехом первой итерации?

---

## Gate 1 — Discovery complete

Цель: команда понимает текущее состояние.

### Required artifacts

- [ ] Zabbix host export.
- [ ] Current host groups export.
- [ ] Current template list.
- [ ] Current tags export.
- [ ] Current actions/media types export.
- [ ] Current proxies list.
- [ ] Current web scenarios list.
- [ ] Active problems report.
- [ ] Top noisy triggers report за 30/90 дней.
- [ ] Old/ignored problems report.
- [ ] Disabled hosts/items/triggers report.
- [ ] Stakeholder map.
- [ ] Service catalog draft.
- [ ] Pain log от команд.
- [ ] Risk register top items.

### Quality criteria

- [ ] У каждого ключевого сервиса есть хотя бы предполагаемый owner.
- [ ] Известны blind spots: что не мониторится вообще.
- [ ] Известны top noisy alerts.
- [ ] Известны critical alerts без реакции.
- [ ] Известны хосты без шаблонов.
- [ ] Известны хосты без mandatory tags или с хаотичными tags.
- [ ] Известны устаревшие/disabled объекты.

### Gate questions

1. Какие 5 проблем мониторинга самые опасные?
2. Какие 5 проблем мониторинга самые шумные?
3. Какие сервисы важны бизнесу, но плохо видны в Zabbix?
4. Где Zabbix сам является single point of failure?
5. Какие решения надо принять до pilot?

---

## Gate 2 — Design approved

Цель: модель будущего состояния утверждена до pilot.

### Required decisions

- [ ] Tag schema approved.
- [ ] Host group hierarchy approved.
- [ ] Severity model approved.
- [ ] Template composition model approved.
- [ ] LLD policy approved.
- [ ] Naming conventions approved.
- [ ] Alert routing principles approved.
- [ ] Maintenance windows policy approved.
- [ ] Runbook coverage policy approved.
- [ ] Dashboard audiences approved.
- [ ] Service catalog MVP scope approved.
- [ ] Sizing baseline approved at least at high level.

### Required artifacts

- [ ] `tag-schema.yaml` adapted or approved.
- [ ] RACI matrix adapted.
- [ ] Decision log has accepted records for core decisions.
- [ ] Pilot scope selected.
- [ ] Pilot success criteria written.
- [ ] Rollback approach for pilot documented.

### Gate questions

1. Можно ли объяснить severity model дежурному за 5 минут?
2. Можно ли построить NOC dashboard только по tags?
3. Есть ли владелец у tag schema?
4. Кто утверждает изменения templates?
5. Какие High/Disaster events должны иметь runbooks до pilot?

---

## Gate 3 — Pilot complete

Цель: модель проверена на ограниченном, но реальном scope.

### Typical pilot scope

- [ ] 20–50 hosts или согласованный эквивалент.
- [ ] 2–4 business services.
- [ ] Несколько типов объектов: Windows, Linux, network, DB, app, backup, synthetic.
- [ ] 1 NOC/current problems dashboard.
- [ ] 1–2 per-service dashboards.
- [ ] 5–10 runbooks.
- [ ] 1–2 notification routes.

### Required checks

- [ ] Tags применены.
- [ ] Templates linked.
- [ ] Problems получают expected tags.
- [ ] Alert routing работает по tags/severity.
- [ ] NOC/on-call получил тестовый alert и понял действие.
- [ ] Runbook link доступен из alert/trigger.
- [ ] Dashboard показывает service/component view.
- [ ] Maintenance window протестировано.
- [ ] Noise measured before/after.
- [ ] Pilot findings documented.

### Gate questions

1. Что сломалось в tag schema?
2. Какие templates дали слишком много noise?
3. Какие alerts не имеют владельца?
4. Какие dashboards оказались бесполезны?
5. Что надо исправить до rollout?

---

## Gate 4 — Rollout complete

Цель: модель масштабирована на согласованный production scope.

### Required

- [ ] Production hosts в scope имеют mandatory tags.
- [ ] P1/P2 services есть в service catalog draft.
- [ ] High+ routing работает.
- [ ] Disaster alerts имеют runbooks или explicit escalation.
- [ ] NOC dashboard принят NOC/on-call lead.
- [ ] Per-service dashboards приняты владельцами команд.
- [ ] Maintenance process используется.
- [ ] Exceptions documented.
- [ ] Template drift approach documented.
- [ ] Weekly alert review запущен.

### Metrics to record

- [ ] Number of monitored hosts.
- [ ] % hosts with mandatory tags.
- [ ] Number of active High/Disaster triggers.
- [ ] Top 10 noisy triggers.
- [ ] Number of High/Disaster without runbook.
- [ ] Number of services with dashboard.
- [ ] Number of services with owner.
- [ ] Zabbix NVPS / queue / DB growth baseline.

### Gate questions

1. Что осталось вне scope?
2. Какие риски не закрыты?
3. Какие временные исключения надо пересмотреть через месяц?
4. Кто отвечает за post-rollout backlog?

---

## Gate 5 — Handover complete

Цель: команда может эксплуатировать мониторинг без автора внедрения.

### Required

- [ ] Monitoring owner формально принял систему.
- [ ] Zabbix admin знает процесс изменения templates.
- [ ] NOC/on-call прошёл training.
- [ ] Application owners знают свои runbooks.
- [ ] Dashboard owners назначены.
- [ ] Service catalog owner назначен.
- [ ] Tag schema owner назначен.
- [ ] Weekly alert review owner назначен.
- [ ] Backup/restore owner для Zabbix назначен.
- [ ] Post-project backlog передан.

### Demonstration tasks

Команда должна показать, что умеет:

- [ ] Добавить новый host.
- [ ] Назначить mandatory tags.
- [ ] Выбрать правильные templates.
- [ ] Создать maintenance window.
- [ ] Найти owner по problem event.
- [ ] Открыть runbook из alert.
- [ ] Изменить threshold через согласованный процесс.
- [ ] Объяснить, почему alert ушёл или не ушёл.
- [ ] Найти top noisy trigger.
- [ ] Создать задачу на tuning.

### Final acceptance

- [ ] Sponsor принимает результат.
- [ ] Monitoring owner принимает ownership.
- [ ] NOC/on-call подтверждает usability.
- [ ] ServiceDesk подтверждает incident/change process.
- [ ] Security подтверждает отсутствие критичных нарушений по доступам/секретам.
- [ ] OT owner подтверждает, что OT scope не нарушен.

---

## Как использовать

1. Скопируйте этот файл в project workspace.
2. Проставьте даты gate review.
3. Назначьте accountable за каждый gate.
4. Не переходите к следующей фазе, если Required не закрыты.
5. Если gate пропускается — записывайте риск и owner.
