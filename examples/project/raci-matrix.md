# RACI matrix — monitoring implementation

> Статус: 🟡 Design draft. Это стартовая матрица ответственности. Перед применением замените роли на реальные команды и имена.

RACI помогает избежать классической проблемы: “все участвовали, но никто не владеет результатом”.

Обозначения:

| Символ | Значение |
|---|---|
| **R** | Responsible — делает работу |
| **A** | Accountable — несёт итоговую ответственность / утверждает |
| **C** | Consulted — консультируется до решения |
| **I** | Informed — информируется после решения |

Правило: в каждой строке должен быть ровно один **A**. Если accountable больше одного — решения будут зависать.

---

## Роли

| Роль | Описание |
|---|---|
| **Sponsor** | CIO / ИТ-директор. Снимает политические и ресурсные блокеры |
| **Monitoring owner** | Владелец мониторинга как продукта после внедрения |
| **Monitoring architect** | Отвечает за design: tags, severity, templates, architecture |
| **Zabbix admin** | Реализует изменения в Zabbix |
| **Platform owner** | Серверы, ОС, БД, backup, HA |
| **Network owner** | SNMP, firewall, proxy placement, network devices |
| **Security owner** | Доступы, секреты, audit, compliance |
| **OT owner** | АСУ ТП / SCADA / industrial safety boundary |
| **App owner** | Владельцы 1С/Exchange/MSSQL/Veeam/других систем |
| **ServiceDesk owner** | ITSM, incidents, changes, maintenance workflow |
| **NOC lead** | Дежурная служба / on-call процесс |
| **Business owner** | Бизнес-владелец сервиса |

---

## Project governance

| Активность | Sponsor | Monitoring owner | Architect | Zabbix admin | Platform | Network | Security | OT | App | ServiceDesk | NOC | Business |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Утверждение scope | A | R | C | I | C | C | C | C | C | C | C | C |
| Назначение owners | A | R | C | I | I | I | I | I | I | I | I | C |
| Ведение decision log | I | A | R | C | C | C | C | C | C | C | C | I |
| Ведение risk register | I | A | R | C | C | C | C | C | C | C | C | I |
| Phase gate review | A | R | R | C | C | C | C | C | C | C | C | C |

---

## Architecture and platform

| Активность | Sponsor | Monitoring owner | Architect | Zabbix admin | Platform | Network | Security | OT | App | ServiceDesk | NOC | Business |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Deployment model | I | A | R | C | R | C | C | C | I | I | I | I |
| DB / storage / backup design | I | A | C | C | R | I | C | I | I | I | I | I |
| Proxy topology | I | A | R | C | C | R | C | C | I | I | I | I |
| Agent mode standard | I | A | R | R | C | C | C | C | C | I | I | I |
| Encryption / PSK policy | I | A | C | R | C | C | R | C | I | I | I | I |
| Zabbix self-monitoring | I | A | R | R | R | C | C | I | I | I | C | I |
| Sizing baseline | I | A | R | C | R | C | C | C | C | I | I | I |

---

## Design model

| Активность | Sponsor | Monitoring owner | Architect | Zabbix admin | Platform | Network | Security | OT | App | ServiceDesk | NOC | Business |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Tag schema | I | A | R | C | C | C | C | C | C | C | C | C |
| Host group hierarchy | I | A | R | R | C | C | C | C | I | I | I | I |
| Severity model | C | A | R | C | C | C | C | C | C | C | R | C |
| Template composition model | I | A | R | R | C | C | C | C | C | I | C | I |
| LLD policy | I | A | R | R | C | C | C | C | C | I | I | I |
| Maintenance policy | I | A | C | R | C | C | C | C | C | R | R | I |
| Runbook policy | I | A | R | C | C | C | C | C | R | C | R | I |
| Dashboard audiences | C | A | R | C | I | I | C | C | C | C | R | C |
| SLA/SLO model | A | R | C | I | I | I | C | C | C | C | C | R |

---

## Discovery and rollout

| Активность | Sponsor | Monitoring owner | Architect | Zabbix admin | Platform | Network | Security | OT | App | ServiceDesk | NOC | Business |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Zabbix inventory export | I | A | C | R | I | I | I | I | I | I | I | I |
| Top noisy triggers report | I | A | R | R | I | I | I | I | C | I | C | I |
| Service catalog draft | C | A | R | I | I | I | I | I | C | I | C | R |
| Pilot host selection | I | A | R | R | C | C | C | C | C | I | C | I |
| Tag rollout | I | A | R | R | C | C | C | C | C | I | I | I |
| Template rollout | I | A | R | R | C | C | C | C | C | I | C | I |
| Alert routing test | I | A | R | R | I | I | C | I | C | R | R | I |
| Dashboard acceptance | I | A | R | C | I | I | C | C | C | I | R | C |
| Runbook acceptance | I | A | C | C | C | C | C | C | R | C | R | I |

---

## Handover

| Активность | Sponsor | Monitoring owner | Architect | Zabbix admin | Platform | Network | Security | OT | App | ServiceDesk | NOC | Business |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Handover training | I | A | R | R | C | C | C | C | C | C | R | I |
| Operations ownership transfer | A | R | C | C | C | C | C | C | C | C | C | I |
| Weekly alert review launch | I | A | R | R | C | C | C | C | C | C | R | I |
| Post-project backlog transfer | I | A | R | C | C | C | C | C | C | C | C | I |
| Final acceptance | A | R | C | C | C | C | C | C | C | C | C | C |

---

## Как адаптировать

1. Замените роли на реальные команды.
2. Уберите роли, которых нет, но не убирайте ответственность.
3. Если одна команда совмещает несколько ролей — оставьте роли в таблице, но укажите одну команду в отдельной колонке.
4. Проверьте, что в каждой строке ровно один **A**.
5. Приложите RACI к project charter или kickoff notes.
