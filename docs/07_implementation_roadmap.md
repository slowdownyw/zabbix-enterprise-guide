!!! info "🟡 Статус: Design draft · v0.1"
    Подход правильный, но конкретный код, конфиги или пороги требуют валидации в вашем окружении.

# 07. Reference 90-day roadmap внедрения

План на 3 месяца для DevOps/инженера, заходящего в проект с **уже криво развёрнутым Zabbix** и задачей навести порядок. Подходит и для green-field, но calibration на legacy.

Структура:

- **Месяц 1 — Discovery.** Read-only режим: ничего не ставим, не меняем. Только наблюдаем, считаем, разговариваем
- **Месяц 2 — Стандартизация.** Tag schema, шаблоны Plant:, severity model, GitOps
- **Месяц 3 — Покрытие и передача.** Дашборды, synthetic monitoring, ITSM-интеграция, knowledge transfer

В каждой фазе — артефакты (документы), которые остаются после вас. **Эти артефакты важнее процесса.**

---

## Месяц 1 — Discovery

### Принципы фазы

1. **Read-only месяц.** Ничего не ставим, не меняем, не отключаем. Только наблюдаем и собираем
2. **Артефакт важнее процесса.** На выходе — документы, которыми могут пользоваться другие
3. **Скорость > полнота.** Лучше 80% инвентаря за 4 недели, чем 100% за полгода
4. **Никакого нового инструментария.** Хочется поднять Netbox? Нельзя. Excel/Confluence/Bookstack — что у них уже есть
5. **Ничего не публикуем без согласования.** Особенно карты сети и списки уязвимых хостов

---

## Готовые «push-button» инструменты — нажал, получил отчёт

Это классика — поставил, запустил, на выходе Excel/HTML с инвентарём. **Не пишешь код**, не парсишь API. Большинство инженеров начинают именно с них.

| Цель | Инструмент | Где взять | Что выдаёт |
|---|---|---|---|
| **AD инвентарь** | **ADRecon** | https://github.com/adrecon/ADRecon | Excel-отчёт со всеми OU, computers, users, GPO, trusts, sessions. Запускается с любого доменного компа |
| **VMware инвентарь** | **RVTools** | https://www.robware.net/rvtools/ | Standalone .exe, читает vCenter, выдаёт Excel со всеми VM, дисками, снапшотами, сетями. Популярный инструмент VMware-инженеров |
| **Hyper-V инвентарь** | **Get-HyperVInventory** | https://github.com/dfinke/HyperVInventory | PowerShell-скрипт, выдаёт HTML-отчёт |
| **Zabbix аудит** | **zabbix-cli** | https://github.com/unioslo/zabbix-cli | CLI-обёртка над API, экспорт хостов/шаблонов/триггеров одной командой |
| **Сетевая discovery** | **LibreNMS** | https://www.librenms.org/ | Ставится рядом с Zabbix, сам находит SNMP-устройства через CDP/LLDP — на выходе карта сети за день |
| **Бэкап конфигов сети** | **Oxidized** | https://github.com/ytti/oxidized | Деплоится в докер, забирает конфиги Cisco/Eltex по SSH, кладёт в Git. Сам по себе — инвентарь сети |
| **OT/ICS discovery** | **Malcolm** | https://github.com/cisagov/Malcolm | Разработан CISA, предназначен для **пассивного** анализа трафика SCADA/ICS. Если разрешат SPAN-порт — можно получить карту обменов, не затрагивая PLC активным сканированием |
| **Универсальный аудит** | **OCS Inventory NG** | https://ocsinventory-ng.org/ | Агенты на Win/Linux собирают железо/софт, шлют на сервер. Обычно используется до Zabbix как inventory-only |

**Совет:** ADRecon + RVTools + Oxidized + один проход zabbix-cli — у вас 70% инвентаря собрано **без единой строки кода**.

---

## Канонические инструменты, если код всё-таки нужен

### Zabbix

| Что | Ссылка |
|---|---|
| Официальное API | https://www.zabbix.com/documentation/current/en/manual/api |
| **pyzabbix** (питон-клиент) | https://github.com/lukecyca/pyzabbix |
| **zabbix_utils** (новый официальный python) | https://github.com/zabbix/python-zabbix-utils |
| Community-шаблоны (золото!) | https://github.com/zabbix/community-templates |
| Официальная биржа шаблонов | https://share.zabbix.com |
| Best Practices (нативный док) | https://www.zabbix.com/documentation/current/en/manual/installation/requirements/best_practices |
| Performance tuning | https://blog.zabbix.com/category/best-practices/ |
| Awesome-list | https://github.com/zabbix-tooling/awesome-zabbix |

### Active Directory

| Что | Ссылка |
|---|---|
| **ADRecon** (главный инструмент) | https://github.com/adrecon/ADRecon |
| **PingCastle** (аудит здоровья AD) | https://www.pingcastle.com/ |
| Microsoft AD PowerShell module docs | https://learn.microsoft.com/en-us/powershell/module/activedirectory/ |
| **BloodHound** (графовый анализ AD — больше для ИБ, но полезен) | https://github.com/BloodHoundAD/BloodHound |

### VMware / гипервизоры

| Что | Ссылка |
|---|---|
| **RVTools** | https://www.robware.net/rvtools/ |
| **govc** (Linux CLI) | https://github.com/vmware/govmomi/tree/main/govc |
| **PowerCLI** (Windows) | https://developer.vmware.com/powercli |
| **vSphere SDK для Python** | https://github.com/vmware/pyvmomi |

### Сеть

| Что | Ссылка | Когда брать |
|---|---|---|
| **Netmiko** | https://github.com/ktbyers/netmiko | Простой SSH к коммутаторам, для скриптов |
| **Nornir** | https://github.com/nornir-automation/nornir | Когда устройств много, нужен параллелизм |
| **NAPALM** | https://github.com/napalm-automation/napalm | Универсальный API к Cisco/Juniper/Arista |
| **Scrapli** | https://github.com/carlmontanari/scrapli | Быстрее Netmiko, асинхронный |
| **Net-SNMP** (snmpwalk) | https://www.net-snmp.org/ | Базовый SNMP-инструмент |

### Веб-CMDB / inventory (если когда-нибудь созреют)

| Что | Ссылка | Зачем |
|---|---|---|
| **NetBox** | https://github.com/netbox-community/netbox | Source of truth для сети + IPAM. Стандарт индустрии. |
| **GLPI + FusionInventory** | https://glpi-project.org/ | Полноценный ITSM с инвентарём, активно используется в РФ |
| **Snipe-IT** | https://snipeitapp.com/ | Учёт активов "по железкам", простой |
| **i-doit** | https://www.i-doit.com/ | Немецкая CMDB, частая в энтерпрайзе |

---

## Литература — что стоит прочесть

### Мониторинг и SRE

| Текст | Почему читать | Ссылка |
|---|---|---|
| **Google SRE Book** — глава "Monitoring Distributed Systems" | Это **базовое мышление**, не Zabbix-специфика. 4 golden signals, white-box vs black-box. 1 час на прочтение, остаёшься умнее половины индустрии | https://sre.google/sre-book/monitoring-distributed-systems/ |
| **Google SRE Workbook** — глава "Alerting on SLOs" | Как правильно делать алерты по SLO, а не по порогам | https://sre.google/workbook/alerting-on-slos/ |
| **Mike Julian — "Practical Monitoring"** (книга) | Лучшая книга про мониторинг как дисциплину, не про инструменты | O'Reilly |
| **Rob Ewaschuk — "My Philosophy on Alerting"** | Манифест "не алертить ради алерта", классика | https://docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q |
| **USE Method (Brendan Gregg)** | Utilization-Saturation-Errors — как мониторить ресурсы | https://www.brendangregg.com/usemethod.html |
| **RED Method (Tom Wilkie)** | Rate-Errors-Duration — как мониторить сервисы | https://thenewstack.io/monitoring-microservices-red-method/ |

### ITIL / ITSM

| Текст | Зачем |
|---|---|
| **Atlassian ITSM guide** — https://www.atlassian.com/itsm | Бесплатно, понятно, без воды. Глава про Event/Incident/Problem management — то что нужно для разговора с CIO |
| **ITIL 4 Foundation** (книга) | Если хочешь говорить с CIO на его языке про практики |
| **The Phoenix Project** (роман) + **The Unicorn Project** | Чтиво про DevOps в форме романа, понятный язык, хорошо продаёт мысль |

### Безопасность и инфраструктура заводов (критично для проекта)

| Текст | Почему критично |
|---|---|
| **NIST SP 800-82 Rev. 3** — Guide to OT Security | https://csrc.nist.gov/pubs/sp/800/82/r3/final — **обязательно к прочтению** перед работой с SCADA-сегментом |
| **CIS Controls v8** | https://www.cisecurity.org/controls/v8 — что и как мерить с точки зрения базовой гигиены |
| **CISA Cybersecurity Best Practices for OT** | https://www.cisa.gov/topics/industrial-control-systems |
| **Purdue Model** (модель уровней OT/IT) | См. "Purdue Enterprise Reference Architecture" как базовую модель разделения SCADA/OT и корпоративной IT-сети |
| **187-ФЗ + приказ ФСТЭК №239** | https://fstec.ru/ — для понимания где у вас КИИ |

### Zabbix в частности

| Текст | Почему читать |
|---|---|
| Официальный блог Zabbix | https://blog.zabbix.com/ — там реальные кейсы, не маркетинг |
| **YouTube канал Zabbix** | Webinars и summit-доклады — лучший источник про шаблоны и LLD на практике |
| **Telegram @zabbix_ru** | Русское комьюнити, можно спрашивать конкретику |
| Книга **Andrea Dalle Vacche — "Mastering Zabbix"** (3-е издание) | Если совсем системно — единственная нормальная книга по Zabbix |

---

## Шаблоны документов — не изобретай

### Inventory

| Шаблон | Где |
|---|---|
| **NIST IR 8011** Asset Management шаблон | https://csrc.nist.gov/pubs/ir/8011/final |
| Atlassian **Confluence Templates** — IT Service Catalog, Incident Postmortem, Project Poster | https://www.atlassian.com/software/confluence/templates |
| **PagerDuty Incident Response docs** (открытые) | https://response.pagerduty.com/ — runbooks, severity levels, on-call всё описано |
| **Google SRE Postmortem template** | https://sre.google/sre-book/postmortem/ |

### Service catalog

| Шаблон | Где |
|---|---|
| ITIL 4 Service Catalog template | Ищите по запросу "ITIL service catalog template Excel" — есть много готовых вариантов |
| **ServiceNow** open templates (даже без подписки можно посмотреть структуру) | https://www.servicenow.com/community/ |

### Шаблон вопросника для интервью

Не ищи — открой **"The Mom Test"** by Rob Fitzpatrick (книга 100 страниц). Это про customer interviews для стартапов, но **техника интервью один в один** работает для discovery в инфре. Главный принцип: спрашивай про **прошлое поведение** ("когда последний раз был инцидент — что вы делали"), не про **гипотетическое** ("а если бы было — что бы вы хотели"). Это меняет качество интервью драматически.

---

## Визуализация — чем рисовать

| Инструмент | Для чего |
|---|---|
| **draw.io / diagrams.net** | https://app.diagrams.net — стандарт для архитектурных диаграмм, бесплатно, есть desktop-версия |
| **Excalidraw** | https://excalidraw.com — для быстрых "от руки" набросков на встречах |
| **Mermaid** | https://mermaid.js.org — диаграммы как код, в Markdown идут в Bookstack/Confluence |
| **PlantUML** | https://plantuml.com — то же самое, но более мощное |
| **Visio** | если уже есть лицензия — используй, не плоди форматы |

---

## РФ-реалии: что работает, что нет

| Что | Состояние | Альтернатива |
|---|---|---|
| Zabbix (open source) | ✅ Работает, поддержка через комьюнити | — |
| **Glaber**, **Пульт** | ✅ Российские форки Zabbix, есть в реестре ПО | Замена Zabbix с отечественной поддержкой |
| **UDV ITM / Cyberlympha ITM** | ✅ Продукты на базе Zabbix-ядра, реестр ПО | Для КИИ-контуров, где важна отечественная цепочка |
| Grafana | ✅ Open source, работает | — |
| NetBox | ✅ Open source, работает | — |
| Veeam | ⚠️ Поддержка может быть ограничена, но работает у многих | RuBackup, Кибер Бэкап |
| ServiceNow | ❌ Ушёл | **Naumen Service Desk**, **Итилиум**, **ITSM 365**, **GLPI** (open) |
| PagerDuty / OpsGenie | ❌ Не работает в РФ нормально | **Mattermost** + Zabbix media, или Telegram-боты, или **Grafana OnCall** (open) |
| Atlassian (Jira/Confluence) | ❌ Прекратил продажи в РФ, но многие остались на купленных лицензиях | **YouTrack**, **Kaiten**, **Аспро.Cloud**, **Bookstack** для wiki |
| RVTools | ✅ Скачивается, работает с любым vCenter | — |
| ADRecon | ✅ Open source PowerShell, работает | — |

---

## Awesome-списки для дальнейшего копания

Это GitHub-страницы где **уже отобрано лучшее** в каждой категории:

| Список | Ссылка |
|---|---|
| Awesome SRE | https://github.com/dastergon/awesome-sre |
| Awesome Sysadmin | https://github.com/awesome-foss/awesome-sysadmin |
| Awesome Monitoring | https://github.com/crazy-canux/awesome-monitoring |
| Awesome Zabbix | https://github.com/zabbix-tooling/awesome-zabbix |
| Awesome Network Automation | https://github.com/networktocode/awesome-network-automation |
| Awesome ICS Security | https://github.com/hslatman/awesome-industrial-control-system-security |
| Awesome Selfhosted | https://github.com/awesome-selfhosted/awesome-selfhosted |

Каждый список — это сэкономленный месяц поиска инструментов.

---

## Минимальный комплект «иду на завод»

Если вы завтра идёте на свечной завод и хотите **за неделю выдать первый осмысленный артефакт**, берите:

1. **RVTools** — на vCenter, выдаёт Excel со всеми VM за 5 минут
2. **ADRecon** — на любом доменном компе, выдаёт Excel со всем AD за 15 минут
3. **zabbix-cli** или один python-скрипт через pyzabbix — экспорт хостов/триггеров
4. **Oxidized в Docker** — собирает конфиги сети, вам сразу видно карту устройств
5. **Excel + draw.io** — для сборки и визуализации
6. **Bookstack/Confluence** — куда складывать документы
7. **Шаблон интервью** из подхода "The Mom Test"
8. **NIST SP 800-82** под подушкой — чтобы не наделать глупостей с SCADA

Всё. Никакого Netbox, никакого DCIM, никакой автоматизации первый месяц. Excel + готовые отчётные тулы + интервью — это **производственная база** discovery-фазы. А дальше уже фантазируем.

---

## Источники правды (в порядке убывания доверия)

Реальность: **ни один источник не полон**. Истину собираем кросс-сверкой.

| Источник | Что даёт | Доверие | Способ снять |
|---|---|---|---|
| **Zabbix API** | Что мониторится сейчас, шаблоны, триггеры, история | 100% по своему скоупу | `pyzabbix` |
| **vCenter / Hyper-V / oVirt** | Все VM, их теги/папки, ресурсы | Высокое | `govc`, PowerCLI, ovirt-engine-sdk |
| **Active Directory** | Доменные компы и серверы, OU-структура | Высокое для Win | `Get-ADComputer` |
| **DHCP leases** | Что реально включено в сети | Среднее (есть статика) | exporter из Win-DHCP/Kea |
| **DNS зоны** | Именованные хосты | Низкое (мусор копится годами) | `dig AXFR` или экспорт |
| **Сетевое железо** | ARP, MAC, CDP/LLDP — что физически воткнуто | Высокое для L2 | SNMP, scrapli/netmiko |
| **Veeam / СРК** | Что бэкапится (≠ что мониторится!) | Высокое | Veeam REST API |
| **UserGate logs** | Что ходит через периметр, top talkers | Среднее | sysmon/syslog |
| **1С кластер** | Производственные базы, сервера приложений | Среднее | `rac` CLI, COM-объекты |
| **TrueNAS/СХД** | Шары, LUN, кому презентовано | Высокое | API |
| **Голова коллег** | Контекст, история, "а вот ещё стоит сервер в углу" | **Самое ценное** | интервью |

**Дельта между источниками — это и есть ваш инвентарь рисков.**  
Хост в AD есть, в Zabbix нет → дыра.  
В Zabbix есть, в vCenter нет → призрак (давно удалённая VM, агент шлёт мусор).  
В Veeam бэкапится, но в Zabbix не виден → ИБ-вопрос: что мы вообще охраняем?

---

## Инструменты по задачам

### Сбор по Zabbix (что уже есть в системе)

**Python + pyzabbix.** Минимальный скрипт, который выдаёт CSV "хосты-группы-шаблоны-теги":

```python
from pyzabbix import ZabbixAPI
import csv

zapi = ZabbixAPI("https://zabbix.plant.local")
zapi.login("readonly_user", "***")  # отдельная учётка с view-only!

hosts = zapi.host.get(
    output=["hostid", "host", "name", "status"],
    selectGroups=["name"],
    selectParentTemplates=["name"],
    selectTags=["tag", "value"],
    selectInterfaces=["ip", "type"],
)

with open("zabbix_inventory.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f, delimiter=";")
    w.writerow(["host", "name", "status", "ip", "groups", "templates", "tags"])
    for h in hosts:
        w.writerow([
            h["host"],
            h["name"],
            "enabled" if h["status"] == "0" else "disabled",
            ";".join(i["ip"] for i in h["interfaces"]),
            "|".join(g["name"] for g in h["groups"]),
            "|".join(t["name"] for t in h["parentTemplates"]),
            "|".join(f"{t['tag']}={t['value']}" for t in h["tags"]),
        ])
```

Дальше всё это в Excel — фильтры, pivot, разбираемся.

**Что ещё снять с Zabbix API:**
- `trigger.get` с `selectLastEvent` — какие триггеры сейчас в проблеме и **когда впервые сработали** (вот они, ignored alerts: висят 200 дней — никто не реагирует)
- `event.get` за последние 90 дней с группировкой по triggerid — top noisy alerts
- `httptest.get` — что мониторится синтетикой
- `proxy.get` — реальная топология прокси
- `usergroup.get` + `user.get` — кто имеет доступ (часто всплывают увольнённые)

### Сбор по AD

PowerShell с любого DC, read-only:

```powershell
Get-ADComputer -Filter * -Properties * |
  Select-Object Name, DNSHostName, OperatingSystem, OperatingSystemVersion,
                LastLogonDate, Enabled, DistinguishedName, IPv4Address,
                Description, whenCreated |
  Export-Csv -Path "ad_computers.csv" -NoTypeInformation -Encoding UTF8
```

Дополнительно — `Get-ADUser -Filter {Enabled -eq $true}` для понимания масштаба пользователей, `Get-ADOrganizationalUnit` для OU-структуры (это ваш каркас будущей host group иерархии в Zabbix).

### Сбор по виртуализации

**VMware (govc — лёгкий, не требует Windows):**
```bash
export GOVC_URL='https://vcenter.plant.local'
export GOVC_USERNAME='readonly@vsphere.local'
govc find -type m vm | xargs -I{} govc vm.info -json {} > vms.json
```

**Hyper-V:**
```powershell
Get-VM -ComputerName hv01,hv02,hv03 |
  Select VMName, State, MemoryAssigned, ProcessorCount, Path, Notes,
         @{N='Host';E={$_.ComputerName}} |
  Export-Csv -Path "hyperv_vms.csv"
```

### Сбор по сети (read-only!)

**SNMP-walk главных коммутаторов** для MAC-таблиц и LLDP — это даёт вам **физическую карту**: какой хост в каком порту:

```bash
# Через scrapli + nornir или просто snmpwalk
snmpwalk -v2c -c "$RO_COMMUNITY" 10.0.0.1 lldpRemSysName
snmpwalk -v2c -c "$RO_COMMUNITY" 10.0.0.1 ipNetToMediaPhysAddress  # ARP
snmpwalk -v2c -c "$RO_COMMUNITY" 10.0.0.1 dot1dTpFdbAddress  # MAC table
```

**nmap — только если согласовано с ИБ.** Идеально — `nmap -sn` (ping-only, без портов) по подсети, чтобы не триггерить IDS:
```bash
nmap -sn 10.10.0.0/16 -oG - | awk '/Up$/{print $2}' > alive_hosts.txt
```

**masscan на заводе — нет.** Это OT/IT-смешанная сеть, по SCADA-сегменту любой агрессивный скан может что-нибудь подвесить. PLC-контроллеры роняются с одного "лишнего" пакета — это не миф.

### Сбор по Veeam

```powershell
# Из Veeam консоли
Get-VBRJob | Get-VBRJobObject |
  Select Name, Type, Job, @{N='LastResult';E={$_.GetLastResult()}} |
  Export-Csv "veeam_objects.csv"
```

### Интервью — самый дорогой и самый ценный инструмент

Структурированный шаблон, иначе разговоры расползаются. **30 минут на человека, не больше.** Шаблон вопросника — отдельный артефакт (см. ниже).

---

## Артефакты на выходе — что отдаёшь миру

### 1. **Master Inventory** (главный документ)

Excel/Sheets, один лист — одна сущность. Колонки минимум:

| Поле | Пример |
|---|---|
| `hostname` | srv-1c-prod-01 |
| `fqdn` | srv-1c-prod-01.plant.local |
| `ip` | 10.10.20.15 |
| `os` | Windows Server 2019 |
| `role` | 1C App Server |
| `business_service` | 1C-ERP |
| `criticality` | P1 |
| `location` | DC-Main, rack 7 |
| `owner_team` | IT-Apps |
| `in_zabbix` | yes |
| `zabbix_template` | Windows by agent + 1C custom |
| `in_ad` | yes |
| `in_vcenter` | yes (cluster-prod) |
| `in_veeam` | yes (daily) |
| `notes` | Лицензии HASP USB на этом хосте |
| `last_seen` | 2026-05-09 14:22 |
| `gap` | — |

**Колонка `gap`** — самое ценное. Туда пишешь: `not_in_zabbix`, `no_backup`, `os_eol`, `unknown_owner`. По этой колонке считаешь масштаб боли.

### 2. **Coverage Matrix** (одна страница, на стол руководителю)

Простая таблица сервис × источник:

| Бизнес-сервис | Хостов | В Zabbix | В Veeam | Runbook есть | Owner |
|---|---|---|---|---|---|
| 1C-ERP | 12 | 10 (83%) | 12 (100%) | нет | Application Owner |
| Exchange | 6 | 6 (100%) | 6 (100%) | частично | Петров |
| SCADA-link | 3 | 0 (0%) | — | нет | Сидоров |
| Печать чертежей | 2 | 0 (0%) | 0 | нет | ??? |

Когда руководитель видит "0%" в колонке мониторинга и "???" в owner — у вас бюджет и поддержка.

### 3. **Stakeholder Map** (кто за что отвечает)

Простая карточка на каждого стейкхолдера:

```
Имя: <Application Owner>
Роль: Старший инженер по 1С
Зона: 1C-ERP, лицензирование
Что болит: фоновые джобы виснут, узнаём от пользователей
Что хочет видеть: алерт по очереди > N, дашборд RPHost
Дата интервью: 2026-05-15
```

### 4. **Pain Log** (журнал болей)

Просто список, отсортированный по критичности. Каждая запись:

```
ID: PAIN-007
Источник: интервью с дежурным + лог инцидентов
Боль: Алерты по дисковому пространству приходят ночью на серверы 
      где скрипт ротации логов чинит проблему за 3 минуты, никто не реагирует
Влияние: Алерт-фатига, дежурный игнорит и реальные Disaster
Категория: Alert hygiene
Приоритет: высокий
Решение в фазе 2: dependent triggers + поднять порог + LLD исключение
```

15-20 таких записей за месяц — это ваша дорожная карта на фазу 2.

### 5. **Service Catalog Draft** (черновой каталог сервисов)

Это уже документ для ITSM-разговора:

```
Сервис: 1C-ERP
Описание: Учётная система предприятия
Критичность: P1 (RPO 1 час, RTO 4 часа — заявленные, не подтверждённые)
Компоненты:
  - 12 серверов (см. Master Inventory, фильтр service=1c-erp)
  - БД MSSQL (кластер 2 ноды)
  - Веб-публикация на 2 IIS
  - HASP-сервер лицензий
Зависимости: AD, DNS, Файловые шары
Owner (бизнес): главбух (потребитель), CIO (поставщик)
SLA текущий: формального нет
Часы работы: 06:00-22:00 рабочие дни
```

### 6. **Risk Register** (что нашёл и страшно)

```
Риск-001: 17 серверов с ОС за пределом поддержки (2008 R2, 2012)
Риск-002: SCADA-сегмент имеет двунаправленный доступ к корп. сети 
          через один порт коммутатора (потенциальная КИИ-проблема)
Риск-003: Учётная запись администратора Zabbix используется коллективно,
          5 человек знают пароль (комплаенс)
Риск-004: Бэкапы Veeam пишутся на тот же массив, что и продакшн БД
```

**Это документ для CIO/ИБ, не для общего распространения.** Прямо так и пометить: `Conf: только CIO+ИБ`.

### 7. **Шаблон интервью** (вопросник)

Один файл, один шаблон, заполняешь под каждого:

```markdown
## Интервью: [имя], [роль]
Дата: ____   Длительность: ____

### Что вы делаете и за что отвечаете?
### Какие системы — ваша зона ответственности?
### Что для вас "система работает"?
### Какие 3 последних инцидента запомнились? Что в них пошло не так?
### Какие алерты получаете? Какие реально читаете, какие игнорите?
### Что было бы видеть на одном экране, чтобы не ходить по системам?
### Кто ваш "сосед" — с кем чаще всего пересекаетесь по работе?
### Что бы вы изменили в мониторинге, будь у вас полномочия?
### Что я не спросил, но должен был?

### Решения / договорённости после интервью
### Открытые вопросы
```

Последние два пункта — самые важные. Без них интервью превращается в посиделки.

### 8. **One-pager для встречи в конце месяца**

Финальный артефакт фазы 1 — **одна страница** для итоговой встречи с руководством:

```
ИТОГИ ФАЗЫ 1: ИНВЕНТАРЬ И АУДИТ ZABBIX

Что было сделано:
- Опрошено N человек
- Проинвентаризовано M хостов
- Составлена матрица покрытия по K бизнес-сервисам

Что нашли:
- 23% хостов в инфре не мониторится
- 41% активных триггеров за последние 90 дней не привёл к действию
- 3 бизнес-сервиса не имеют owner'а

Топ-5 рисков (детали в risk register):
1. ...
2. ...

Quick wins (предлагаю сделать в фазе 2 в первые 2 недели):
1. Включить 2 критичных хоста в мониторинг (готово к запуску)
2. Снять 80 noisy-триггеров с Disaster на Information
3. ...

План фазы 2: см. отдельный документ.
```

---

## Что НЕ нужно делать (хотя руки чешутся)

- ❌ **Поднимать Netbox/iTop как CMDB.** Это полугодовой проект сам по себе. Excel + Confluence — норм.
- ❌ **Рисовать топологию сети до последнего порта.** Вы не сетевик и вам её все равно даст сетевик за 30 минут на свою. Вам нужен **логический** уровень: какие сегменты, как связаны, где границы.
- ❌ **Запускать масштабное сканирование nmap по всей инфре.** Без согласования с ИБ — нельзя. С согласованием — только подтверждённые сегменты.
- ❌ **Ставить агенты "просто посмотреть, чо там".** Read-only месяц.
- ❌ **Чистить триггеры, "пока есть время".** Чистка — это фаза 2 после стандартизации шаблонов. Иначе перенастроишь, а потом снова перенастроишь.
- ❌ **Учить шаблоны "как надо" и переписывать.** Сейчас задача — понять, потом проектировать.
- ❌ **Делать красивую Grafana с наскока.** Дашборды — фаза 3, иначе они не лягут на правильную модель тегов.

---

## Что хочется, но рано

Это вещи, которые выглядят соблазнительно в первый месяц, но **дают результат только после стандартизации**:

| Хочется | Почему рано | Когда |
|---|---|---|
| Включить auto-registration агентов | Сейчас попадут в неправильные группы | Фаза 2, после tag schema |
| Подключить Zabbix к Grafana | Без правильных тегов = бесполезные дашборды | Фаза 3 |
| Поднять отдельный Loki/Graylog | Неприоритет, у них и так Zabbix болит | Год 2 |
| Связать с ServiceDesk через webhook | Сначала договориться о severity-маппинге | Фаза 2-3 |
| Алерты в Mattermost/Telegram | Сначала почистить шум, потом маршрутизировать | Фаза 2 |
| Метрики в OpenTelemetry формате | Это другая вселенная, не Zabbix | Год 2-3 |

---

## Чек-лист готовности фазы 1

К концу месяца на выходе должны быть:

- [ ] `inventory.xlsx` — Master Inventory с заполненной колонкой `gap`
- [ ] `coverage_matrix.pdf` — матрица покрытия для CIO
- [ ] `stakeholders.md` — карта стейкхолдеров с интервью
- [ ] `pain_log.md` — журнал болей, 15+ записей
- [ ] `service_catalog_draft.md` — 5-7 ключевых сервисов
- [ ] `risk_register.md` — реестр рисков (отдельно для ИБ/CIO)
- [ ] `interviews/*.md` — заполненные шаблоны по каждому интервью
- [ ] `phase1_summary.pdf` — one-pager для итоговой встречи
- [ ] `phase2_proposal.md` — что и как будем делать дальше (черновик)

Этот список — и есть полный ответ на вопрос «что нужно сделать в первый месяц проекта».

---

## Месяц 2 — Стандартизация

Фаза 2 — **стандартизация**. Это самый рискованный этап: разломать тут можно больше, чем в фазе 1. Принцип — «правим основу, пока в системе мало данных и пока не привыкли к старому».

---

## Цели фазы и принципы

1. **Каркас, на который ляжет всё остальное.** Если tag schema, иерархия групп и severity-модель не заданы здесь — фаза 3 (дашборды, отчёты) будет переделкой.
2. **Не Big Bang.** Меняем волнами: схему согласовали → пилот 50 хостов → катим на остальные.
3. **Каждое изменение — обратимо.** Все изменения в Zabbix делаем через **export YAML → правка → import**, чтобы был git-трекинг и rollback.
4. **Измерять до и после.** В начале фазы фиксируем: сколько триггеров активно, сколько событий в день, сколько алертов уходит. В конце — те же метрики. Иначе нельзя доказать что стало лучше.
5. **Ничего, что меняет поведение прода без пилота.** Severity downgrade — пилот. Новые шаблоны — пилот. Новые dependent triggers — пилот.

---

## Tag Schema — главный артефакт фазы

Это **самое важное решение** проекта. Если ошибётесь здесь — переделывать через год будет очень больно. Поэтому: **схема согласована письменно с CIO/тимлидом до того, как вы прикоснётесь к Zabbix**.

### Принцип: 5–7 обязательных тегов, остальные опциональные

Больше — никто не заполняет, начинается хаос. Меньше — не хватает измерений для дашбордов и отчётов.

### Обязательные теги (mandatory) — каждый хост обязан иметь

| Тег | Возможные значения | Пример | Зачем |
|---|---|---|---|
| `env` | `prod` / `test` / `dr` / `dev` | `env=prod` | Фильтрация: дежурный смотрит только prod |
| `criticality` | `P1` / `P2` / `P3` / `P4` | `criticality=P1` | Для маршрутизации алертов и отчётности SLA |
| `service` | имя бизнес-сервиса | `service=1c-erp` | Сводка по сервисам для CIO и бизнеса |
| `owner` | команда | `owner=it-apps` | Кому летит алерт, кто чинит |
| `location` | физическая площадка | `location=dc-main` | Гео-фильтрация, реакция на падение площадки |
| `segment` | `it` / `ot` / `dmz` / `kii` | `segment=ot` | **Критично для завода.** Отделяет SCADA от корп. сети в любом дашборде |
| `os_family` | `windows` / `linux` / `network` / `hypervisor` / `storage` / `appliance` | `os_family=windows` | Технические дашборды |

### Опциональные теги (если применимо)

```
backup=daily | weekly | none
pii=yes | no                    # 152-ФЗ контур
kii=yes | no                    # 187-ФЗ
sla=24x7 | business_hours | none
purdue=level0 | level1 | ... | level4   # для OT-сегмента
vendor=cisco | eltex | hp | dell
warranty_until=2027-12          # для capacity planning
```

### Соглашения по именованию

Вот это вылезет, если не зафиксировать:

- **Только lower-case**, без пробелов, разделитель — `-` (`1c-erp`, не `1С_ERP`)
- **Английский для ключей**, любой язык для значений (хотя лучше тоже англ.)
- **Никаких аббревиатур только-для-нас.** `service=krp-2` через год никто не вспомнит
- **Список разрешённых значений** для каждого тега — отдельный документ. Без этого начнётся `service=1c`, `service=1c-erp`, `service=1c_erp`, `service=ERP-1C` — и всё, аналитика сломана

### Документ соглашения (артефакт)

Один markdown-файл в Bookstack, на видном месте. Структура:

```markdown
# Tag Schema for Zabbix
Owner: <ваш-имя>
Approved: <date>, by CIO
Version: 1.0

## Mandatory tags
### env
Allowed values: prod, test, dr, dev
Default: prod
Rationale: ...

### criticality
Allowed values: P1, P2, P3, P4
Definitions:
  P1 — отказ ведёт к остановке производства или невозможности 
       работы основной массы пользователей. Реакция 24/7.
  P2 — отказ ведёт к деградации сервиса, не блокирует работу.
       Реакция в рабочие часы.
  P3 — отказ инфра-компонента без видимого эффекта на сервисы.
  P4 — мониторинг для статистики, без эскалации.
...

## How to apply
1. Все новые хосты получают теги при заведении (см. шаблон процедуры)
2. Существующие хосты — в ходе фазы 2, через CSV-импорт
3. Изменение схемы — только через MR в репозиторий + согласование

## Audit query
Однократно прогнать в Zabbix скрипт audit_missing_tags.py 
(см. репозиторий monitoring-tools)
```

### Массовое присваивание тегов

Не вручную. Делается так:

1. Экспорт всех хостов в CSV (фаза 1 это уже сделала)
2. Заполняешь колонки тегов в Excel — это **бизнес-задача**, не техническая. На неё уходит неделя обсуждений с командой
3. Скрипт через Zabbix API раскатывает теги по CSV
4. Дифф-отчёт «что было / что стало» в Bookstack

Скрипт — 30 строк на pyzabbix:
```python
# Скелет
import csv
from pyzabbix import ZabbixAPI

zapi = ZabbixAPI("https://zabbix.plant.local")
zapi.login("admin", "***")

with open("hosts_with_tags.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f, delimiter=";"):
        tags = []
        for key in ["env","criticality","service","owner","location","segment","os_family"]:
            if row.get(key):
                tags.append({"tag": key, "value": row[key]})
        zapi.host.update(hostid=row["hostid"], tags=tags)
```

⚠️ **Важно:** `host.update` с параметром `tags` **полностью заменяет** теги хоста. Прочитай существующие, объедини, тогда обновляй — иначе сотрёшь то, что было.

---

## Иерархия host groups — теги ≠ группы

Это путаница из прошлых вопросов. Разберём окончательно.

| Аспект | **Host Groups** | **Tags** |
|---|---|---|
| Назначение | RBAC (права доступа) | Логическая категоризация |
| Влияет на пользователей | да (видишь только свои группы) | нет |
| Иерархия | да (через `/`, с 6.2) | нет, плоские |
| Для дашбордов | устаревший подход | **современный подход** |
| Для алерт-маршрутизации | возможно | **рекомендуется** |
| Зашита в шаблон | можно | можно |

### Целевая иерархия групп (для прав доступа)

```
Infra/
  Linux/
  Windows/
  Network/
  Storage/
  Hypervisors/
Applications/
  1C/
  Exchange/
  WebServers/
  Databases/
OT/
  SCADA-IT-bridge/
  Engineering-stations/
Locations/
  DC-Main/
  DC-Backup/
  Workshop-1/
  Workshop-2/
  Warehouse/
```

И **всё**. Не пытайся в группах закодировать всё — для этого есть теги. Группы — для ответа на вопрос «**кто** имеет право это видеть и редактировать».

### Permission model

Параллельно нужно нарисовать матрицу:

| Команда / роль | Группы read | Группы write | Действия |
|---|---|---|---|
| NOC дежурные | All except OT | None | acknowledge events, comments |
| Инженеры инфраструктуры | Infra/* + Locations/* | Infra/* | manage hosts, items |
| DBA | Applications/Databases | Applications/Databases | manage DB hosts only |
| Сетевики | Infra/Network | Infra/Network | manage network gear only |
| СКАДА-инженеры | OT/* (read-only из IT) | — | view-only из их сегмента |
| ИБ | All (read) | None | view + audit |
| Bookstack-руководство | Custom dashboard only | — | через Grafana, не через Zabbix UI |

**Это документ для CIO.** Пусть утверждает.

---

## Шаблоны — стратегия чистки

Самая трудоёмкая часть фазы. Делается **параллельно** с тегами, не последовательно.

### Принцип трёх слоёв шаблонов

```
┌─────────────────────────────────────────────┐
│ Custom plant-specific templates             │  ← создаём минимум
│ (1C, SCADA-bridge, custom apps)             │
├─────────────────────────────────────────────┤
│ Service templates (наследуют base)          │  ← MSSQL, Exchange, IIS, Postgres
│ Чистим существующие community-templates     │
├─────────────────────────────────────────────┤
│ Base OS templates                            │  ← Linux/Windows by Zabbix agent
│ Берём встроенные, но **с нашими порогами**  │
└─────────────────────────────────────────────┘
```

### Что делать с существующими шаблонами

**Не удалять. Не переписывать.** Делаем форк-через-клон:

1. Берёшь встроенный `Linux by Zabbix agent`
2. Клонируешь как `Plant: Linux base`
3. В клоне правишь пороги, отключаешь ненужные items, добавляешь tag `template=plant-linux-base`
4. Привязываешь к новому хосту в пилоте → проверяешь
5. Перепривязка существующих хостов на новый шаблон — **только после миграции по группам**, иначе можно получить дубли алертов

### Что чистить в шаблонах (типовая команда)

| Симптом | Действие |
|---|---|
| Item собирается, но никем не используется (нет триггеров, нет графиков, нет в дашбордах) | **Disable**, не удалить. Через месяц если никто не вспомнил — удалить |
| Триггер не срабатывал больше года | Disable, в backlog на ревизию |
| Триггер срабатывает >10 раз в день | Поднять порог или ввести hysteresis (`{TRIGGER.VALUE}` для recovery expression) |
| Item с интервалом 30s, но используется только в долгом графике | Поменять на 5 min, разгрузить БД |
| Дублирующиеся items (одна метрика двумя шаблонами) | Оставить из основного шаблона, второй убрать |

### Custom templates под завод (что точно понадобится)

Из контекста заводского стека:

```
Plant: 1C App Server
  - очередь фоновых заданий
  - использование лицензий HASP
  - количество активных сеансов
  - размер кэша сеансовых данных
  - дисковое I/O на /var/1C
  
Plant: 1C Server (cluster manager)
  - доступность через rac
  - процессы rphost/rmngr
  - перезапуски рабочих процессов
  
Plant: MSSQL for 1C
  - блокировки, deadlocks
  - длинные транзакции (>30s)
  - tempdb usage
  - backup latest
  
Plant: Exchange DAG member
  - replication queue
  - content index status
  - mailbox database state
  - DAG member health
  
Plant: SCADA-IT bridge (read-only!)
  - icmp до OPC-сервера
  - доступность TCP-порта OPC
  - ничего внутрь!
  
Plant: Veeam backup target
  - last successful backup age (HARD trigger если >24h)
  - repository free space
  - failed jobs
  
Plant: UserGate cluster
  - cluster sync state
  - active sessions, throughput
  - VPN tunnel state
```

Каждый — отдельный шаблон, не сваливай в один. Композиция через привязку нескольких шаблонов к хосту.

---

## Severity normalization — снимаем алерт-фатигу

Это вторая по важности задача после тегов.

### Целевые определения (повторение из первого ответа, но с операционкой)

| Severity | Когда | Канал | SLA реакции | Кто получает |
|---|---|---|---|---|
| **Disaster** | Бизнес-сервис недоступен | Звонок (autodial) + SMS + Telegram + ITSM-тикет P1 | < 15 мин | Дежурный + on-call инженер + руководитель ИТ |
| **High** | Сервис деградирует, ляжет в течение часа | Telegram + email + ITSM-тикет P2 | < 1 час | Дежурный + команда сервиса |
| **Average** | Узел требует внимания | Email команде | в рабочие часы | Команда сервиса |
| **Warning** | Тренд, превентив | Только дашборд | плановая работа | Команда сервиса (видит на дашборде) |
| **Information** | События для аудита | Никаких уведомлений | — | — |

### Процесс нормализации (4 шага)

**Шаг 1. Аудит.** Запрос к API:
```
trigger.get + selectLastEvent + countOutput по severity
event.get за 90 дней с группировкой по triggerid
```
На выходе таблица: `triggerid | name | severity | events_90d | acknowledged_pct`. Сортируешь по `events_90d` desc, смотришь топ-100. Это **90% вашего шума**.

**Шаг 2. Категоризация топ-100 шумовых.** Глазами, с командой:

| Категория | Пример | Что делать |
|---|---|---|
| Реальный шум (не требует реакции) | Disk usage 81% на сервере где скрипт ротации работает | Severity Information, или disable |
| Истинный disaster, но плохо настроенный (флапает) | "Service down" во время рестарта | Добавить hysteresis, увеличить confirmation period |
| Severity завышена | "CPU 95% one minute" с severity Disaster | Понизить до Warning, или поднять порог + длительность |
| Severity занижена | Реальная пропажа сервиса с severity Warning | Поднять до Disaster |
| Полезный, но плохо описан | Триггер сработал, никто не понимает что делать | Добавить description с runbook-ссылкой |

**Шаг 3. Согласование.** Документ "Severity Adjustment Plan" — список изменений на согласование. **Не делать самому.** Потому что то что выглядит шумом для вас — может быть важной метрикой для DBA.

**Шаг 4. Раскатка волнами.** По 20-30 триггеров в неделю. После каждой волны — замер: упало ли число событий, не пропустили ли что важное.

### Hysteresis и confirmation period — два главных приёма

Большинство «флапающих» триггеров чинятся одной из двух техник:

**Hysteresis** (разные пороги на сработку и восстановление):
```
Срабатывание: cpu_load > 90 за последние 5 минут
Восстановление: cpu_load < 70 за последние 5 минут
```
В Zabbix делается через **recovery expression**, отдельный от основного. Триггер не «мерцает» вокруг порога.

**Confirmation period** (порог должен держаться время):
```
Триггер: используй last(/host/key,5m) > 90, не last(...) > 90
```
Минимальная длительность — приём от 80% флапа.

---

## Dependent triggers — подавление каскадного шума

Сценарий: упал коммутатор → сразу же 200 серверов «недоступны» → 200 алертов. Звонят все, никто ничего не делает.

Решение — **trigger dependencies**:

```
Trigger A: "Switch sw-core-01 down"
   ↑ depend
Trigger B: "Host srv-1c-01 unreachable"
Trigger C: "Host srv-1c-02 unreachable"
... (все хосты за этим коммутатором)
```

При сработке A триггеры B-C-... не отправляют уведомления.

**Где обязательно настроить:**
- Все хосты — зависят от своего default gateway
- Хосты в DC — зависят от ToR-коммутатора
- Все хосты сайта — зависят от линка к этому сайту
- Сервисы внутри хоста — зависят от хоста (`host unreachable` подавляет `service down`)
- Веб-публикация 1С — зависит от IIS, IIS — от хоста, хост — от свича

Это видно как **дерево зависимостей**, его рисуешь и закладываешь в Zabbix через `trigger.update` параметром `dependencies`.

---

## LLD — где использовать, где нет

Low-Level Discovery — мощно, но опасно для производительности.

### Где обязательно

| Сущность | Discovery rule |
|---|---|
| Сетевые интерфейсы | `net.if.discovery` (Linux), `vfs.fs.discovery` (Windows) |
| Файловые системы | `vfs.fs.discovery` |
| Процессы 1С (rphost) | через `proc.num` с фильтром по name |
| MSSQL базы данных | через ODBC discovery |
| VLAN на коммутаторах | через SNMP discovery |
| VM на гипервизоре | встроенные vmware.* items |

### Где **не** использовать

| Сущность | Почему |
|---|---|
| Все процессы Windows | 200 процессов × 5 items × 1000 хостов = миллион items, БД захлёбывается |
| Все логические диски ноутбуков пользователей | флешки, CD-ROM, mapped drives → шум |
| Полный SNMP-walk коммутатора | многие OID не нужны и не работают, перегруз |

### Правила хорошего LLD

- Всегда задавай **filter** в discovery rule. Не «все интерфейсы», а «`{#IFNAME} not match @bonded|loopback|docker`»
- Период discovery — **час, минимум**. Не каждые 5 минут
- Lifetime для пропавших объектов — **30 дней**, не «forever». Иначе исчезнувшие диски остаются вечно в БД

---

## Партиционирование БД и performance

Из обсуждения с прошлых чатов — у них Zabbix с большой накопленной БД.

### Что проверить в первую неделю фазы

```sql
-- размер таблиц истории
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename LIKE 'history%' OR tablename LIKE 'trends%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

Если `history` — 100+ ГБ и не партиционирована, это **бомба**. Housekeeper не успевает удалять старые записи, БД пухнет, запросы тормозят.

### Решение

Для PostgreSQL — **TimescaleDB** или нативное partitioning:
- https://www.zabbix.com/documentation/current/en/manual/appendix/install/db_partitioning
- Готовые скрипты для PG партиционирования: ищи "zabbix postgresql partitioning script" — есть несколько хороших на GitHub

После партиционирования:
- В UI Zabbix отключить housekeeping для `history` и `trends` (вкладка Administration → Housekeeping)
- Удаление старых данных идёт через **DROP PARTITION**, мгновенно

⚠️ Это серьёзная операция. **Делается на пилоте, в окно техработ, с бэкапом.** Не в первый день фазы.

---

## PSK — шифрование агентов

Если у них агенты подключаются без шифрования (default), это нужно исправлять, особенно в КИИ-контексте.

| Уровень | Сложность | Стоит делать? |
|---|---|---|
| **PSK (pre-shared key)** | средняя | ✅ Да, минимум что должно быть |
| **TLS-сертификаты** | высокая (нужен внутренний CA) | для КИИ-сегмента — да |
| **Без шифрования** | — | ❌ Не вариант для прода |

PSK раскатывается одним Ansible-playbook'ом, ключи генерируются на сервере. Самое сложное — миграция: переключение хоста с unencrypted на PSK требует одновременного апдейта конфига агента и настроек хоста в Zabbix UI. Делается волнами по 50-100 хостов.

---

## Process — как катить изменения без срыва

### GitOps для Zabbix-конфига (минимальный)

Не пытайся внедрить полноценный CI/CD в первый месяц. Минимум который действительно работает:

```
repo: monitoring-config
├── templates/
│   ├── plant-linux-base.yaml
│   ├── plant-1c-app-server.yaml
│   └── ...
├── tag-schema.md
├── severity-policy.md
├── permissions-matrix.xlsx
├── runbooks/
│   ├── disaster-1c-erp-down.md
│   └── ...
└── scripts/
    ├── apply_tags.py
    ├── audit_triggers.py
    └── ...
```

Изменения шаблонов:
1. Экспорт из Zabbix UI в YAML
2. Коммит в git
3. Правка локально
4. Импорт обратно через UI или API
5. Тест на пилотных хостах

Это **не полноценный GitOps**, но даёт версионирование и rollback. Большего пока не нужно.

### Change management внутри фазы

Каждое значимое изменение — короткая запись в журнале:

```
ChangeID: CHG-042
Date: 2026-05-21
Summary: Понизили severity у 23 триггеров на дисковое пространство
Rationale: Pain log #007, alert fatigue
Pilot: srv-files-01, srv-files-02
Pilot result: 2 дня без false positives
Rollout: вся группа Infra/Windows, 84 хоста
Rollback plan: import templates_backup_20260520.yaml
Approved by: <CIO/тимлид>
```

15-20 таких записей в фазе — нормально. Это документ для ИБ и для собственной защиты («ой, у нас алерты пропали» — «нет, вот change request, согласовано»).

---

## Артефакты на выходе фазы 2

К концу фазы должны быть:

- [ ] **Tag Schema document** — утверждённый, в Bookstack/git
- [ ] **Permissions Matrix** — кто что видит, утверждено CIO
- [ ] **Severity Policy** — определения, маршрутизация, утверждено
- [ ] **Custom plant templates library** — 7-10 кастомных шаблонов в git
- [ ] **Trigger dependency tree** — диаграмма + реализация в Zabbix
- [ ] **Severity Adjustment Log** — таблица "было/стало" по триггерам
- [ ] **Change Log фазы 2** — журнал изменений
- [ ] **Performance baseline** — графики "до/после" по нагрузке БД, потоку событий, числу алертов в день
- [ ] **Phase 2 retrospective** — что получилось, что пошло не так, риски на фазу 3

---

## Что НЕ делать в фазе 2

- ❌ **Менять схему партиционирования и tag schema в одну неделю.** Любая катастрофа — и непонятно, что её вызвало.
- ❌ **Переписывать встроенные шаблоны Zabbix.** При апгрейде версии — потеряешь правки. Только клонировать.
- ❌ **Делать массовое удаление триггеров.** Только disable, на месяц — потом удаление.
- ❌ **Включать severity escalation сразу для всех каналов.** Сначала только email, потом Telegram, потом SMS, потом autodial. Поэтапно — иначе после первого инцидента половина команды отрубит уведомления.
- ❌ **Включать auto-registration агентов до полной стабилизации tag schema.** Они начнут попадать в default group без тегов — мусор.
- ❌ **Пытаться унифицировать всё.** Завод — гетерогенная среда. Где-то останутся легаси-шаблоны и легаси-теги. Это норма.

---

## Что хочется, но рано

| Хочется | Почему рано | Когда |
|---|---|---|
| Grafana Zabbix datasource + красивые дашборды | Без стабильной tag schema — переделка | Фаза 3 |
| Webhook в ServiceDesk (Naumen/GLPI) | Нужна стабильная severity model | Фаза 3 |
| Anomaly detection через Zabbix triggers | Сначала чистка шума, потом ML | Фаза 4 / Год 2 |
| Synthetic monitoring (httptest) для бизнес-сервисов | После определения сервисного каталога | Фаза 3 |
| Автоматическое создание хостов через Ansible | После tag schema | Конец фазы 2 / фаза 3 |
| Long-term storage в TimescaleDB/Clickhouse | Сначала партиционирование родного PG | Год 2 |
| Переход на Zabbix 7+ (если у них старая) | Не во время реформы. После стабилизации | Фаза 4 |

---

## Чек-лист готовности к фазе 3

К моменту завершения фазы 2 (8 неделя проекта) у вас должны быть:

- ✅ Все хосты в Zabbix имеют 7 обязательных тегов
- ✅ Иерархия host groups перестроена и согласована
- ✅ Permission matrix внедрена
- ✅ Шум алертов снижен на 50-70% (замер до/после)
- ✅ Trigger dependencies настроены для top-20 критичных хостов
- ✅ Severity нормализована для top-100 шумовых триггеров
- ✅ 7-10 custom templates под завод созданы и опилотированы
- ✅ Изменения версионируются в git
- ✅ Команда понимает новую схему (мини-обучение проведено)

Если всё это есть — фаза 3 (дашборды, отчётность, runbooks, интеграции) ляжет на готовый каркас и будет в основном сборкой витрин и интеграций, не борьбой с базовой моделью.


---

## Месяц 3 — Покрытие и передача

Фаза 3 — **покрытие пробелов + передача в эксплуатацию**. Это «момент истины»: всё что наработали в фазах 1-2 либо начинает работать как процесс, либо умирает в виде красивых документов на полке.

---

## Цели фазы и принципы

1. **Конечная цель — штатная эксплуатация силами команды заказчика.** К концу фазы команда должна работать с системой сама, по регламентам. Если система не работает без внешнего консультанта — фаза провалена, неважно как красивы дашборды.
2. **Дашборд без аудитории — мусор.** Каждый дашборд имеет конкретного человека, который на него смотрит регулярно. Если такого человека нет — дашборд не делается.
3. **Алерт без runbook — недосказанный алерт.** К концу фазы у каждого триггера severity High+ есть привязанный runbook. Без исключений.
4. **Отчётность — автоматическая.** Если CIO получает отчёт раз в месяц, а команда «собирает его руками за 2 дня», он перестанет выходить сразу после ухода ответственного человека в отпуск. Автоматизация — обязательна.
5. **Документация — там, где её ищут пользователи.** Не там, где удобно класть инженеру. Если у них Confluence — клади туда. Если Bookstack — туда. Если папки в DFS — туда, как ни больно.

---

## Дашборды — фаза 3

В фазе 3 строятся дашборды для всех аудиторий: NOC, per-service, тимлид, CIO, ИБ, SCADA/OT. **Дизайн дашбордов вынесен в отдельную главу — [глава 11 — Дашборды и отчётность](11_dashboards_reporting.md).** В roadmap здесь только то, что специфично для **3-й фазы внедрения**.

### Чек-лист построения дашбордов в фазе 3

- [ ] Развёрнут Grafana (если ещё не было) — отдельный VM, доступ через корп. SSO
- [ ] Подключён [Grafana Zabbix datasource plugin](https://github.com/grafana/grafana-zabbix)
- [ ] Построены 7 базовых дашбордов (см. [главу 11](11_dashboards_reporting.md), раздел «Аудитория → цель → refresh → формат»):
    - [ ] NOC (главный экран дежурки, full-screen TV)
    - [ ] Per-service (по каждому сервису из service-каталога)
    - [ ] Тимлид эксплуатации
    - [ ] CIO / руководитель ИТ
    - [ ] Директор завода (через push-отчёты от CIO, не дашборд)
    - [ ] ИБ
    - [ ] SCADA/OT bridge (read-only)
- [ ] Каждый дашборд имеет владельца и обозначен в title
- [ ] Виджеты читают теги из tag schema, не хардкод имён хостов
- [ ] Настроен drill-down: executive → service → component → host через Data Links
- [ ] Refresh-rate откалиброван по аудитории (10с для NOC, 1ч для CIO)

Детальный дизайн каждого типа дашборда (виджеты, цвет, поведение) — в [главе 11](11_dashboards_reporting.md).

---

## Synthetic monitoring — e2e проверки бизнес-сервисов

В Zabbix это **httptest** + scenarios. Большая ценность: ловит проблемы, которых не видят item-чеки.

### Что синтетикой обязательно покрыть на заводе

| Сервис | Сценарий |
|---|---|
| 1C веб-публикация | login → открыть документ → создать тестовый документ → удалить |
| Exchange OWA | login → открыть inbox → отправить письмо самому себе |
| Веб-портал ИС | login → открыть главную → перейти в раздел |
| Файловые шары | mount → открыть файл → запись/чтение тестового файла |
| Печать | отправка тестового задания на сетевой принтер (через Print Server API) |
| 1С-обмен с банком | проверка соединения с банк-клиентом (если возможно) |
| DNS | разрешение 5-10 ключевых DNS-имён |
| AD | Kerberos-тикет получение |

### Принципы синтетики

- **Отдельный технический пользователь** для каждого сервиса (не администратор!), с минимальными правами
- **Идемпотентность:** сценарий не должен оставлять следов (созданный документ — удалён в конце)
- **Изоляция:** синтетика-юзер не должен ломать продакшн-данные при ошибке
- **Логирование:** синтетика-инциденты — всегда P1, потому что это видит конечный пользователь
- **Запуск:** каждые 5-10 минут с одного-двух прокси, не чаще

⚠️ **Согласуй с ИБ.** Синтетика-юзер с записью в 1С — это объект интереса аудита.

---

## Runbooks — структура и привязка

Это часто забывают, и зря — без runbook'ов мониторинг это половина системы.

### Структура одного runbook'а

Шаблон в Bookstack, один файл = один сценарий:

```markdown
# RUNBOOK: 1C-ERP веб-публикация недоступна

**Severity:** Disaster (P1)
**SLA реакции:** 15 минут
**Owner:** IT-Apps team
**Last reviewed:** 2026-05-20 by Application Owner

## Симптом
Алерт триггера "1C-ERP web publication HTTP 5xx > 10 errors/min"
или
синтетика "1C-ERP web login scenario" вернула FAIL

## Влияние на бизнес
Пользователи не могут работать с 1С через веб. 
Толстый клиент работает (если БД доступна).
Затронуты: ~200 пользователей удалёнки и тонких клиентов.

## Первая проверка (5 минут)
1. Проверь доступность IIS на хостах: `curl https://1c.plant.local/test`
2. Проверь состояние сервисов 1С: на srv-1c-app-01 и -02 
   запусти `Get-Service "1C:Enterprise*"`
3. Проверь логи IIS: `C:\inetpub\logs\LogFiles\W3SVC1\` за последние 30 минут
4. Проверь нагрузку на MSSQL (см. дашборд "1C-MSSQL")

## Типовые причины
| Причина | Признак | Что делать |
|---|---|---|
| MSSQL deadlocks | dashboard "1C-MSSQL" → красный график deadlocks | См. runbook "MSSQL deadlocks 1C" |
| Перезапуск IIS требуется | events 5009 в System log | `iisreset /noforce` (с разрешения дежурного) |
| Закончились лицензии HASP | event "license server unavailable" | См. runbook "HASP license issues" |
| Disk full на /Logs | дашборд "1C-app-host" | Очистка логов > 7 дней |

## Эскалация
- 15 минут не починилось → звонок старшему 1С-инженеру (Application Owner, <phone>)
- 30 минут → CIO + поднимаем DR-веб-сервер (см. runbook "1C web DR failover")
- 60 минут → инцидент классифицируется P1 в ITSM, постмортем обязателен

## Постмортем
После закрытия инцидента — заполнить шаблон постмортема в Bookstack (ссылка)

## Связанные runbooks
- 1C web DR failover
- MSSQL deadlocks 1C
- HASP license issues
```

### Привязка к триггеру

В Zabbix это делается через **URL** в triggers или через **description** с ссылкой:

```
Description: 
1C-ERP web publication unavailable. 
Runbook: https://wiki.plant.local/runbooks/1c-erp-web-down
```

Когда алерт прилетает в Telegram/email/Mattermost — там сразу ссылка. Дежурный не ищет в голове "что делать", он открывает runbook.

### Покрытие — не нужно 100%

Реалистично:
- **100%** runbook'ов для Disaster триггеров — обязательно
- **80%** для High — целевой показатель
- **30-40%** для Average — нормально
- Warning — без runbook'ов, это плановая работа

---

## ITSM-интеграция

Цель: каждый Disaster и High автоматически создаёт тикет в системе ServiceDesk.

### Что у них вероятно есть (РФ-реалии)

| Система | Статус | Интеграция с Zabbix |
|---|---|---|
| **Naumen Service Desk** | очень частое в РФ | через webhook, есть готовые примеры |
| **GLPI** | open source, тоже частое | Zabbix media для GLPI |
| **Итилиум** | российская | webhook |
| **ServiceDesk Plus** (Manage Engine) | до санкций популярно | webhook |
| **ServiceNow** | редко в РФ сейчас | если есть — встроенная |
| **Excel** или почта | бывает | надо договариваться о Zabbix → email-парсер |

### Принципы интеграции

- **Один источник правды** для инцидентов. Если ITSM есть — он главный, Zabbix только триггерит создание
- **Не плодить тикеты-дубли.** Используй correlation ID = triggerid+eventid, чтобы повторное срабатывание не создавало новый тикет
- **Auto-close при resolve.** Если триггер ушёл в OK состояние, тикет закрывается автоматически (или переходит в специальный статус для ручной проверки)
- **Не все алерты в ITSM.** Только Disaster + High. Average — на email команде, Warning — на дашборде

### Webhook на стороне Zabbix

В Zabbix 5+ есть полноценный JavaScript webhook media type. Вместо классического email:

```javascript
// Скелет webhook'а
var params = JSON.parse(value),
    request = new HttpRequest(),
    response;

request.addHeader("Content-Type: application/json");
request.addHeader("Authorization: Bearer " + params.api_token);

var payload = {
    title: params.subject,
    description: params.message,
    severity: params.severity,
    correlation_id: params.eventid,
    source: "zabbix",
    affected_service: params.tag_service,
    assignee_team: params.tag_owner
};

response = request.post(params.endpoint, JSON.stringify(payload));
return response;
```

Параметры берутся из triggers через макросы `{EVENT.TAGS.service}`, `{EVENT.TAGS.owner}` — поэтому tag schema из фазы 2 это **технический фундамент** интеграции.

---

## Отчётность — фаза 3

Дизайн отчётности — отдельная тема, она вынесена в **[главу 11 — Дашборды и отчётность](11_dashboards_reporting.md)** (разделы про целевую матрицу и автоматизацию). В roadmap здесь только специфика фазы 3.

### Чек-лист построения отчётности в фазе 3

- [ ] Согласована с CIO целевая матрица отчётов (см. [главу 11](11_dashboards_reporting.md), раздел «Целевая матрица отчётности»):
    - [ ] Daily NOC summary (ежедневно дежурной службе)
    - [ ] Weekly operations (понедельник 9:00 ИТ-команде)
    - [ ] Monthly SLA report (1 число CIO + владельцам сервисов)
    - [ ] Monthly executive (для директора завода через CIO)
    - [ ] Quarterly capacity review (раз в квартал)
- [ ] Отчёты автоматизированы (Grafana Reports / panel render API / Zabbix Scheduled Reports)
- [ ] Каждый отчёт уходит на функциональный адрес, не личный
- [ ] Body каждого отчёта содержит выводы, не только вложение
- [ ] Отчёты собираются раз в день в нерабочее время, вне пика бизнес-нагрузки

Это разовая работа на 2-3 дня + потом cron-job. Никто отчёт не собирает руками после этого.

---

## SLI / SLO / SLA — реальная история для завода

Тут нужна осторожность — слова «SLA» на заводе часто звучат, но часто без смысла.

### Определения для разговора

- **SLI** (indicator) — конкретная метрика. *«Доступность 1С веб-публикации в рабочее время»*
- **SLO** (objective) — внутренняя цель. *«SLI ≥ 99.5% за месяц»*
- **SLA** (agreement) — договор с бизнесом. *«Если SLO не выполнен — формальное эскалирование»*

### Что реалистично сделать в фазе 3

- Определить **3-5 ключевых SLI** для топ-сервисов (не больше)
- Согласовать **SLO** внутри ИТ — это ваша цель, вы договариваетесь с собой
- **SLA — не подписывать в первый год.** SLA — это политика, требует юридической работы и взаимных обязательств с бизнесом. Не вступайте в эту территорию преждевременно.

### Реалистичные SLI для завода

| Сервис | SLI | SLO предложение |
|---|---|---|
| 1C-ERP web | % успешных синтетика-проверок в рабочее время | 99.5% |
| Exchange | синтетика OWA login + send-receive | 99.5% |
| AD | синтетика Kerberos ticket | 99.9% |
| Файловые шары | синтетика mount+read+write | 99.0% |
| Печать | успешность тестовых печатных заданий | 98.0% |

**Важно:** SLI считается **только в рабочее время** (по будням 8:00-18:00, например). Иначе ночные техработы убивают цифру.

---

## Покрытие пробелов из фазы 1

К концу фазы 3 закрыть всё что в `coverage_matrix` было «не мониторится». Конкретно для завода типичный список:

- [ ] **SCADA-bridge хосты** — пассивный мониторинг (icmp, OPC-port TCP)
- [ ] **UserGate cluster** — синхронизация HA, состояние tunnels
- [ ] **Exchange DAG** — replication queue, content index, mailbox database state
- [ ] **TrueNAS** — pool health, SMART для дисков, репликация snapshot'ов
- [ ] **Veeam** — last backup status для всех jobs (с алертом если >24h)
- [ ] **AD health** — replication latency, SYSVOL state, FSMO availability
- [ ] **Network gear** — ошибки на portах, температура, состояние ИБП через IPMI/SNMP
- [ ] **1С детально** — очереди, сессии, регламентные задания
- [ ] **Print services** — состояние очередей, доступность принтеров
- [ ] **Сертификаты** — expiration alerts за 30 дней до конца (через Blackbox или нативный Zabbix item)
- [ ] **DNS health** — синтетика по ключевым именам
- [ ] **DHCP scope utilization** — % использования (если пул близок к исчерпанию — устройства начнут падать по сети)

---

## Knowledge transfer — самое недооценённое

Без этого все ваши шаблоны и runbook'и через полгода превратятся в музей.

### Активности

**Серия workshop'ов** для команды — 4-6 встреч по 1.5 часа:
1. Архитектура мониторинга — как это работает в целом
2. Tag schema и почему она важна — на конкретных кейсах
3. Как добавить новый хост / шаблон — практика
4. Как реагировать на алерт — runbook + ITSM
5. Как делать постмортем — практика на реальном инциденте
6. Как читать дашборд тимлида / как делать новый

**Парные дежурства.** Первые 2-4 недели после запуска — вы сидите рядом с дежурным, помогаете. Не «вы теперь сами», а «вместе разбираемся».

**Документация для нового сотрудника.** Один документ "Как стать дежурным за неделю". Чек-лист: что прочитать, какие учётки получить, к кому подойти, на каком тренинге побыть.

### Кого назначить хранителем системы

В команде должен быть **один человек — назначенный owner мониторинга**, не вы. Это либо:
- Самый сильный технически в команде (если согласен)
- Тимлид (но он будет тонуть в операционке)
- Специально нанятый под это monitoring engineer

Без owner'а после вашего ухода система деградирует за полгода. Это закон.

---

## Артефакты на выходе фазы 3

К концу фазы:

- [ ] **Дашборды по 6 аудиториям** созданы и в эксплуатации
- [ ] **Synthetic monitoring** для 5-8 ключевых сервисов запущен
- [ ] **Runbooks library в Bookstack** — минимум 30 runbook'ов, все Disaster покрыты
- [ ] **ITSM-интеграция** работает на Disaster и High
- [ ] **Регламент алертинга и эскалации** — утверждённый документ
- [ ] **Отчётность автоматизирована** — 5+ автоматических отчётов
- [ ] **SLI определены** для топ-сервисов, SLO согласованы внутри ИТ
- [ ] **Постмортем-шаблон** + 2-3 проведённых постмортема как пример
- [ ] **Training materials** — 6 workshop'ов проведены, материалы в Bookstack
- [ ] **Owner мониторинга** назначен и обучен
- [ ] **Operations handbook** — главный документ передачи в эксплуатацию

### Operations Handbook — финальный артефакт проекта

Один документ, ссылка на который на главной Bookstack:

```markdown
# Plant IT Monitoring — Operations Handbook
Version: 1.0  Date: 2026-08-XX

## Architecture overview
[ссылка на архитектурную диаграмму]

## Tag schema and groups
[ссылка на документ]

## Severity policy and escalation
[ссылка]

## Dashboards directory
- NOC: [link]
- Per-service: [link]
- Lead/CIO: [link]
...

## Runbooks directory
[link на список]

## How-to guides
- Add new host
- Create new template
- Modify trigger threshold
- Investigate alert
- Run postmortem
- Generate ad-hoc report

## On-call rotation
[link]

## Reporting calendar
[когда какой отчёт уходит]

## Contacts and ownership
[link]

## Change management process
[link]

## Known issues / debt
[список того что не успели]
```

Этот документ — **то что вы передаёте команде в день закрытия проекта**.

---

## Что НЕ делать в фазе 3

- ❌ **Делать дашборды без определённой аудитории.** «Может, кому-то понадобится» — никому не понадобится. Делай только под живых людей с реальной потребностью.
- ❌ **Перекладывать всё в Grafana одним большим переносом.** Часть остаётся в native Zabbix — это нормально.
- ❌ **Подписывать SLA с бизнесом в первый год.** Это политика, требует подготовки.
- ❌ **Делать runbook'и «формально».** Лучше 20 хороших runbook'ов чем 100 формальных. Формальный runbook никто не читает.
- ❌ **Отправлять CIO-отчёт без просмотра CIO черновика.** Согласуй формат до автоматизации.
- ❌ **Делать knowledge transfer один раз и забыть.** Это процесс, не событие.

---

## Что хочется, но рано (или вообще не на этой фазе)

| Хочется | Почему рано | Когда |
|---|---|---|
| Anomaly detection / ML алерты | Сначала стабильная база | Год 2 |
| OpenTelemetry / трейсы | Не для заводской инфры | Если когда-то будут микросервисы |
| Полноценная CMDB (NetBox + интеграция) | Большой проект сам по себе | Параллельный трек |
| AIOps / AI-alerting | Маркетинг, в основном | Когда будет зрелость 4+ |
| Self-healing automation | Опасно без культуры observability | Год 2 |
| Cost monitoring / FinOps | Завод — это CapEx, не OpEx, не нужно | Никогда (для завода) |
| Полная Grafana миграция | Параллельная система — двойная нагрузка | Решение через год |

---

## Финальная встреча и закрытие проекта

Что должно произойти:

1. **Демо «как было / как стало»** для CIO и команды
   - Метрики до/после: число алертов в день, MTTR, coverage %, число активных триггеров
   - Скриншоты дашбордов «до» и «после»
2. **Передача Operations Handbook** — обзор документа с командой, вопросы-ответы
3. **Назначение нового owner'а официально** (приказ, мейл, что угодно — но формализовано)
4. **Список технического долга** — что не успели, рекомендации на следующий год
5. **Postmortem проекта** — что получилось, что нет, рекомендации на будущие проекты в компании

---

## Метрики успеха проекта в целом (3 фазы)

Если в финале можете показать:

- ✅ Число алертов в день снижено на 60%+
- ✅ MTTR по P1 снизилась (например, с 2ч до 45 мин)
- ✅ Coverage хостов выросло с условных 70% до 95%+
- ✅ Все сервисы P1 имеют synthetic monitoring и runbook
- ✅ Команда работает по новому регламенту без вашего участия 2 недели
- ✅ CIO получает автоматический отчёт и понимает его

— это **успех**, не «настройка Zabbix». Это разница между настройщиком и архитектором.

---

На этом каркас трёх фаз закрыт. У читателя теперь есть скелет проекта на 6 месяцев — по фазам, с артефактами и инструментами. Каждый компонент (дашборды, runbook'и, ITSM webhook'и) при необходимости раскрывается в соответствующих главах книги.

---

## Связь с остальными главами

- Инструменты: [глава 3](03_tags_and_groups.md) (теги), [глава 4](04_lld_and_prototypes.md) (LLD), [глава 13](13_template_requirements.md) (шаблоны)
- GitOps для Zabbix вынесен в [главу 8](08_gitops_for_zabbix.md)
- SLA, обсуждаемые в фазе 3, — в [главе 10](10_sla_service_catalog.md)
- Runbook'и из фазы 3 — в [главе 9](09_runbooks.md)
