# Implementation checklist — practical execution list

> Статус: 🟡 Design draft. Это рабочий чеклист для внедрения. Он не заменяет project plan, но помогает не забыть ключевые действия.

---

## Phase 0 — Mobilization

### Governance

- [ ] Назначить Executive sponsor.
- [ ] Назначить Monitoring owner.
- [ ] Назначить технического владельца Zabbix.
- [ ] Определить core team.
- [ ] Определить stakeholders.
- [ ] Утвердить scope MVP.
- [ ] Утвердить out of scope.
- [ ] Создать project workspace.
- [ ] Создать decision log.
- [ ] Создать risk register.
- [ ] Создать backlog.

### Access

- [ ] Read-only доступ к Zabbix API.
- [ ] Доступ к Zabbix frontend.
- [ ] Доступ к списку users/user groups.
- [ ] Доступ к vCenter/Hyper-V inventory.
- [ ] Доступ к AD/DNS/DHCP export или владельцам.
- [ ] Доступ к Veeam/backup inventory или владельцу.
- [ ] Доступ к текущему ITSM/reporting, если есть.

### Kickoff

- [ ] Провести kickoff.
- [ ] Зафиксировать цели.
- [ ] Зафиксировать ограничения.
- [ ] Согласовать cadence встреч.
- [ ] Согласовать format артефактов.
- [ ] Согласовать каналы коммуникации.

---

## Phase 1 — Discovery

### Zabbix export

- [ ] Export hosts.
- [ ] Export groups.
- [ ] Export templates.
- [ ] Export host tags.
- [ ] Export interfaces.
- [ ] Export proxies.
- [ ] Export web scenarios.
- [ ] Export actions.
- [ ] Export media types.
- [ ] Export users/user groups.
- [ ] Export maintenance windows.

### Event/noise analysis

- [ ] Active problems snapshot.
- [ ] Problems older than 7/30/90 days.
- [ ] Events for last 30 days.
- [ ] Events for last 90 days.
- [ ] Top noisy triggers.
- [ ] Triggers with high severity but no action.
- [ ] Triggers with action but no owner.
- [ ] Disabled hosts/items/triggers.

### External inventory

- [ ] VM inventory.
- [ ] AD computers.
- [ ] DHCP leases.
- [ ] DNS records.
- [ ] Network devices.
- [ ] Backup protected workloads.
- [ ] Business service list.

### Interviews

- [ ] Infrastructure team.
- [ ] Network team.
- [ ] DBA team.
- [ ] 1C/application team.
- [ ] Security team.
- [ ] OT/SCADA team, if applicable.
- [ ] ServiceDesk team.
- [ ] NOC/on-call team.
- [ ] Business owners for P1/P2 services.

### Discovery outputs

- [ ] Inventory baseline.
- [ ] Coverage matrix.
- [ ] Pain log.
- [ ] Stakeholder map.
- [ ] Service catalog draft.
- [ ] Risk register.
- [ ] CIO one-pager.

---

## Phase 2 — Design & Standardization

### Tag schema

- [ ] Mandatory tags defined.
- [ ] Allowed values defined.
- [ ] Owners for values defined.
- [ ] Tag placement rules defined.
- [ ] Exception policy defined.
- [ ] Tag schema approved.

### Groups / RBAC

- [ ] Host group hierarchy drafted.
- [ ] RBAC requirements collected.
- [ ] User groups mapped.
- [ ] Read/write boundaries agreed.
- [ ] OT/SCADA visibility agreed.
- [ ] Group model approved.

### Severity and routing

- [ ] Severity definitions approved.
- [ ] Disaster criteria approved.
- [ ] High criteria approved.
- [ ] Warning/Information policy approved.
- [ ] Notification policy approved.
- [ ] ITSM mapping drafted.
- [ ] Escalation matrix drafted.

### Templates

- [ ] Base templates defined.
- [ ] Role templates defined.
- [ ] Application templates defined.
- [ ] Synthetic templates defined.
- [ ] LLD policy defined.
- [ ] Value maps policy defined.
- [ ] Macro policy defined.
- [ ] Template change process defined.

### Operations design

- [ ] Maintenance policy.
- [ ] Runbook coverage policy.
- [ ] Dashboard audiences.
- [ ] Service catalog MVP scope.
- [ ] SLA/SLO readiness policy.
- [ ] Weekly alert review process.
- [ ] Zabbix self-monitoring model.

---

## Phase 3 — Pilot

### Prepare

- [ ] Select pilot hosts.
- [ ] Select pilot services.
- [ ] Select pilot teams.
- [ ] Define pilot success criteria.
- [ ] Define rollback approach.
- [ ] Communicate pilot scope.

### Implement

- [ ] Apply tags.
- [ ] Link templates.
- [ ] Configure macros.
- [ ] Configure actions.
- [ ] Configure media/recipients.
- [ ] Configure maintenance examples.
- [ ] Add runbook links.
- [ ] Build NOC dashboard.
- [ ] Build one per-service dashboard.

### Validate

- [ ] Trigger test alerts.
- [ ] Confirm event tags.
- [ ] Confirm routing.
- [ ] Confirm ITSM ticket, if applicable.
- [ ] Confirm dashboard filters.
- [ ] Confirm runbook usability.
- [ ] Measure noise.
- [ ] Collect feedback.
- [ ] Update design.

---

## Phase 4 — Rollout

### Per wave

- [ ] Prepare host/service list.
- [ ] Confirm owners.
- [ ] Confirm criticality.
- [ ] Apply tags.
- [ ] Link templates.
- [ ] Check unsupported items.
- [ ] Check active problems.
- [ ] Tune thresholds.
- [ ] Verify routing.
- [ ] Update dashboards.
- [ ] Update service catalog.
- [ ] Record exceptions.

### After each wave

- [ ] Review noise.
- [ ] Review missing runbooks.
- [ ] Review owner gaps.
- [ ] Review performance impact.
- [ ] Update backlog.
- [ ] Approve next wave.

---

## Phase 5 — Handover

### Training

- [ ] NOC/on-call training.
- [ ] Zabbix admin training.
- [ ] Application owner training.
- [ ] ServiceDesk integration training.
- [ ] Dashboard owner training.

### Ownership

- [ ] Monitoring owner accepts ownership.
- [ ] Tag schema owner assigned.
- [ ] Template owner assigned.
- [ ] Dashboard owner assigned.
- [ ] Runbook owner assigned.
- [ ] Service catalog owner assigned.
- [ ] Weekly review owner assigned.

### Final checks

- [ ] Acceptance checklist passed.
- [ ] Project backlog transferred.
- [ ] Risks transferred.
- [ ] Exceptions documented.
- [ ] Next 30/60/90 day plan created.

## ADR / decision records

Before pilot:

- [ ] ADR-001 Deployment model accepted.
- [ ] ADR-002 Agent mode/encryption accepted or exceptions documented.
- [ ] ADR-003 Tag schema accepted.
- [ ] ADR-004 Template composition model accepted.
- [ ] ADR-005 Retention/sizing baseline at least proposed.

Before rollout:

- [ ] ADR-005 Retention/sizing baseline accepted.
- [ ] ADR-006 Dashboard platform strategy accepted.
- [ ] ADR-007 Change control/GitOps policy accepted.
- [ ] Decision log reviewed at phase gate.

Before handover:

- [ ] All active ADRs have owners.
- [ ] All temporary exceptions have review dates.
- [ ] Superseded decisions are marked clearly.

