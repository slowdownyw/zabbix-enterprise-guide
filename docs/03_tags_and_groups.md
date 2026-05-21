!!! info "🟢 Статус: Conceptually stable · v0.1"
    Концепция устойчива, проверена опытом, литературой и практикой.

# 03. Теги и группы

Эта глава — про **двухосную модель** организации хостов в Zabbix: host groups для технической структуры и RBAC, теги — для всего остального (бизнес-сервисов, маршрутизации, дашбордов, SLA, корреляции).

Это **не косметика и не способ «подписать хост»**. Это архитектурный слой, на котором держится:

- Кому отправлять алерт (через action conditions по тегам)
- Где показывать ([дашборды по сервисам, не по оборудованию](01_service_not_host.md))
- К какому бизнес-сервису относится событие
- Какой SLA считать ([глава 10](10_sla_service_catalog.md))
- Что подавлять на maintenance window
- Как строить корреляцию событий

Без правильной tag schema у вас на третьем месяце эксплуатации **обязательно** случается переделка половины алертинга.

---

Главная формула:

```text
Host groups = права / техническое дерево / базовая навигация
Tags        = смысл / сервисы / маршрутизация / дашборды / SLA / корреляция
```

В нашем проектном каркасе это именно «двухосная модель»: host groups для технической структуры и RBAC, теги — для бизнес-сервисов, отчётности, SLA и фильтрации. 

## 1. Что именно тегируется в Zabbix

В Zabbix теги можно задавать не только на хостах. Официально теги поддерживаются у templates, hosts, items, web scenarios, triggers, services, template items/triggers, а также у host/item/trigger prototypes. Это важно: тег может жить на разных уровнях и потом попасть в событие/проблему. ([Zabbix][1])

Практически уровни такие:

| Где тег               | Зачем                                                                  |
| --------------------- | ---------------------------------------------------------------------- |
| **Host tag**          | «Что это за хост»: сервис, владелец, площадка, среда, критичность        |
| **Template tag**      | «Что это за класс мониторинга»: linux, windows, unifi, veeam, exchange |
| **Item tag**          | «Что это за метрика»: cpu, memory, disk, network, backup, app          |
| **Trigger tag**       | «Что это за проблема»: availability, performance, capacity, security   |
| **LLD prototype tag** | Автоматически тегировать найденные диски, интерфейсы, БД, процессы     |
| **Service tag**       | Связывать проблемы с бизнес-сервисами и SLA                            |
| **Web scenario tag**  | Тегировать синтетику: owa, 1c-web, portal-login                        |

Ключевой момент: PROBLEM-событие получает теги со всей цепочки сущностей: шаблона, хоста, item/web scenario и триггера. Полные дубли tag:value после подстановки макросов объединяются, чтобы в событии не было одинаковых тегов. ([Zabbix][1])

То есть если у хоста есть:

```text
service=1c-erp
owner=it-apps
env=prod
location=dc-main
```

а у trigger есть:

```text
scope=availability
component=web
```

то проблема в `Monitoring → Problems` получит всё вместе:

```text
service=1c-erp
owner=it-apps
env=prod
location=dc-main
scope=availability
component=web
```

Вот это уже не пустой алерт «Host unavailable», а событие с контекстом.

## 2. Что теги реально решают

### 1. Фильтрация Problems

Вместо «покажи всё горящее» используется фильтр:

```text
env=prod
service=1c-erp
severity >= High
```

или:

```text
owner=network
scope=availability
location=warehouse-2
```

Проблемы и dashboard Problems widget умеют показывать event tags; Zabbix также даёт настраивать порядок и количество отображаемых тегов в Problems и Problems widget. ([Zabbix][1])

### 2. Нормальные дашборды

Без тегов дашборд обычно строится по host groups:

```text
Infra/Linux
Infra/Windows
Infra/Network
```

Это технически удобно, но плохо отвечает на главный эксплуатационный вопрос. Сервисный дашборд должен отвечать не «какой хост красный», а:

```text
работает ли 1С?
работает ли почта?
работает ли интернет на площадке?
работает ли резервное копирование?
```

Это невозможно нормально сделать только host groups, потому что один сервис может состоять из Windows, Linux, MSSQL, сетевого оборудования, проверок web и backup.

С тегами делаем:

```text
service=1c-erp
```

и в одном представлении видим:

```text
srv-1c-app-01
srv-1c-app-02
srv-mssql-01
srv-mssql-02
1c-web-synthetic
veeam-job-1c
router-dc-core
```

То есть тег `service=1c-erp` связывает технически разные сущности в один бизнес-сервис.

Для дашбордов уровня item это тоже работает: Item navigator widget умеет фильтровать items по host tags и item tags, а также группировать по значению host tag или item tag — например, по `service`, `location`, `component`. ([Zabbix][2])

### 3. Маршрутизация уведомлений

Именно здесь теги раскрывают свою ценность.

Вместо action:

```text
Severity >= Warning → Telegram
```

делаем:

```text
env=prod
severity >= High
owner=network
→ Telegram сетевой команде
```

или:

```text
env=prod
service=1c-erp
severity >= High
→ Telegram 1C-команде + ITSM ticket
```

Zabbix actions умеют фильтровать события по event tag и event tag value; эти условия есть прямо в action filter conditions. ([Zabbix][3])

Пример логики:

```text
Action: Network High alerts
Conditions:
  Event tag owner = network
  Trigger severity >= High
  Event tag env = prod

Operations:
  Send to Telegram group "network-oncall"
```

Или:

```text
Action: 1C P1
Conditions:
  Event tag service = 1c-erp
  Event tag criticality = P1
  Trigger severity >= Disaster

Operations:
  Telegram + SMS + ITSM P1
```

### 4. ITSM-интеграция

Webhook в ServiceDesk должен получать не просто текст:

```text
Problem: High ICMP ping loss
Host: 10.20.5.239
```

а структуру:

```json
{
  "source": "zabbix",
  "event_id": "47933",
  "service": "warehouse-network",
  "owner": "network",
  "criticality": "P2",
  "location": "warehouse-2",
  "component": "wifi",
  "scope": "availability",
  "severity": "Warning"
}
```

В сообщениях можно использовать `{EVENT.TAGS}`, `{EVENT.TAGSJSON}` и `{EVENT.TAGS.<tag name>}`; Zabbix прямо поддерживает эти макросы для trigger-based notifications. ([Zabbix][1])

### 5. SLA / Services

Если вы хотите считать «доступность 1С», Zabbix должен понять, какие проблемы относятся к 1С.

Здесь важно разделить два разных понятия:

- **Event tag `service=1c-erp`** — это логический тег события, который мы ставим на хосте/триггере для dashboards и routing. Сам по себе он не влияет на Zabbix Services/SLA.
- **Zabbix Service tags** — теги, которые настраиваются непосредственно на объекте типа **Service** (раздел Services в UI). Именно они используются для сопоставления SLA и сервисных правил.

Для связи Problems с сервисом нужны **problem tags** в настройках Service: Zabbix сопоставляет Problems по тегам, и только после этого проблемы с тегом `service=1c-erp` начинают влиять на состояние сервиса. ([Zabbix][1])

```text
Business service: 1C-ERP
Problem tag match:
  tag: service
  value: 1c-erp
```

> Проблемы связанные с этим тегом влияют на состояние сервиса **только после** настройки сервисных правил/problem tags в разделе Services.

### 6. Maintenance точечно, а не топором

Можно подавлять не весь хост, а проблемы определённого типа, если maintenance настроен через tags. Например:

```text
maintenance tag: scope=backup
```

и вы подавляете только проблемы backup, а не вообще всё по серверу.

> **Важно:** Maintenance в Zabbix всегда задаётся на hosts/host groups — это обязательная область применения. Теги работают как **фильтр подавления проблем внутри этой области**. Настроить maintenance «только по тегу» без указания host или host group нельзя.

### 7. Контроль прав на Problems

Host groups остаются основой для нормального RBAC по объектам, но теги могут ограничивать видимость проблем для user groups: Zabbix описывает сценарий, где пользователи группы видят только проблемы с определёнными tags. ([Zabbix][1])

Это не замена host groups, но полезно для NOC/подрядчиков/ИБ.

## 3. Минимальная tag schema

Для хостов я бы вводил 7 обязательных тегов:

```text
env
criticality
service
owner
location
segment
os_family
```

Пример для маршрутизатора склада `router-warehouse-2`:

```text
env=prod
criticality=P2
service=warehouse-network
owner=it-infra
location=warehouse-2
segment=it
os_family=network
```

Для сервера 1С:

```text
env=prod
criticality=P1
service=1c-erp
owner=it-apps
location=dc-main
segment=it
os_family=windows
```

Для SCADA bridge:

```text
env=prod
criticality=P1
service=scada-link
owner=ot-team
location=plant-main
segment=ot-dmz
os_family=appliance
```

Важно: значения должны быть **из словаря**, а не «как рука ляжет».

Плохо:

```text
service=1C
service=1c
service=1c-erp
service=1С ERP
service=ERP_1C
```

Хорошо:

```text
service=1c-erp
```

И только так.

## 4. Item tags: зачем они отдельно

Host tags отвечают «кто владелец и к какому сервису относится хост».

Item tags отвечают «что это за метрика».

Пример item tags:

```text
component=cpu
scope=performance
```

```text
component=memory
scope=capacity
```

```text
component=disk
scope=capacity
```

```text
component=interface
scope=network
```

```text
component=backup
scope=recovery
```

Это нужно для дашбордов уровня «покажи мне все метрики capacity по сервису 1С»:

```text
host tag: service=1c-erp
item tag: scope=capacity
```

Или «покажи только сеть»:

```text
item tag: component=interface
```

Для ваших ICMP/Wi-Fi alerts:

```text
component=icmp
scope=availability
```

```text
component=wifi
scope=quality
```

Тогда на дашборде можно разделить:

```text
Availability-проблемы
Performance-проблемы
Capacity-проблемы
Wi-Fi quality-проблемы
```

## 5. Trigger tags: именно они часто управляют алертингом

Trigger tag описывает характер проблемы, которую создаёт конкретный триггер: компонент, симптом, тип влияния или сценарий реакции. Это не тег самого хоста, а дополнительная классификация события.

Примеры:

```text
scope=availability
component=icmp
impact=degradation
```

```text
scope=capacity
component=disk
impact=risk
```

```text
scope=security
component=auth
impact=incident
```

```text
scope=backup
component=veeam
impact=rpo-risk
```

Очень полезный паттерн:

```text
notification=active
notification=dashboard-only
notification=none
```

Например, ICMP loss на Wi-Fi-клиенте:

```text
service=warehouse-network
component=wifi
scope=quality
notification=dashboard-only
```

А недоступность роутера:

```text
service=warehouse-network
component=router
scope=availability
notification=active
```

И action:

```text
notification=active
severity >= Average
→ Telegram
```

## 6. LLD: автоматическое тегирование элементов данных и триггеров

Важно!

LLD сам создаёт items/triggers из prototypes. Значит, теги надо задавать **на prototypes**, а не руками после discovery.

Пример для filesystem discovery:

```text
Item prototype:
  name: Free disk space on {#FSNAME}
  tags:
    component=filesystem
    scope=capacity
    fs={#FSNAME}
```

Trigger prototype:

```text
Trigger prototype:
  name: Filesystem {#FSNAME}: low free space
  tags:
    component=filesystem
    scope=capacity
    fs={#FSNAME}
```

Для network interface discovery:

```text
component=interface
scope=network
interface={#IFNAME}
if_type={#IFTYPE}
```

Zabbix прямо поддерживает LLD macros в trigger prototype tags; например, можно создать tag `scope:{#FSNAME}` или использовать LLD macro в значении тега. ([Zabbix][1])

Практически это решает проблему «у меня 200 интерфейсов, как их разбирать». Не руками. Discovery сам создаст:

```text
interface=ether1
interface=wlan0
interface=pppoe-out1
interface=br-lan
```

И вы потом можете отфильтровать их.

## 7. Как автоматически тегировать хосты

Есть четыре нормальных способа.

### Способ 1. Через templates

Самый чистый для item/trigger tags.

В template `Plant: Windows Base` задаются:

```text
template=plant-windows-base
os_family=windows
```

В item prototypes:

```text
component=filesystem
scope=capacity
```

В trigger prototypes:

```text
scope=capacity
component=filesystem
```

Все хосты, на которые навесили template, начинают порождать проблемы с этими tags. Это не заменяет host tags `service/owner/location`, но закрывает техническую классификацию.

### Способ 2. Через autoregistration actions

Для активных агентов можно использовать autoregistration: ранее неизвестный active agent обращается к серверу, и Zabbix автоматически добавляет его в мониторинг. Autoregistration action может добавлять хост, класть его в host group, линковать templates и т.д.; условия можно строить по hostname/host metadata. ([Zabbix][4])

В Zabbix теги хоста не обязательно проставлять только вручную. Для discovery и autoregistration actions доступны операции добавления и удаления host tags. Это значит, что базовые теги можно назначать автоматически уже при появлении хоста в мониторинге: по proxy, IP-диапазону, имени агента, metadata или другим условиям discovery/autoregistration. ([Zabbix][3])

> **⚠ Версия Zabbix:** операции `add/remove host tags` в autoregistration actions отсутствуют в Zabbix **6.0 LTS**. Они появились в более новых версиях ветки 6.x/7.x. Если вы на 6.0 LTS — назначение host tags через autoregistration требует API/скрипта или обновления до версии с поддержкой этих операций.

На агенте:

```ini
ServerActive=10.10.10.10
Hostname=srv-1c-app-01
HostMetadata=env=prod service=1c-erp owner=it-apps location=dc-main os_family=windows role=1c-app
```

В Zabbix:

```text
Autoregistration action: 1C app servers

Conditions:
  Host metadata contains service=1c-erp
  Host metadata contains role=1c-app

Operations:
  Add host
  Add to host group: Applications/1C
  Link templates:
    Plant: Windows Base
    Plant: 1C App Server
  Add host tags:
    env=prod
    service=1c-erp
    owner=it-apps
    location=dc-main
    os_family=windows
    criticality=P1
```

Но тут есть нюанс: Zabbix condition «contains/matches» не парсит metadata как JSON. Это просто строка. Поэтому metadata надо делать максимально простым и предсказуемым.

### Способ 3. Через API / CSV / CMDB

Для существующей инфраструктуры это самый практичный путь.

Вы делаете CSV:

```csv
host;env;criticality;service;owner;location;segment;os_family
srv-1c-app-01;prod;P1;1c-erp;it-apps;dc-main;it;windows
srv-mssql-01;prod;P1;1c-erp;dba;dc-main;it;windows
router-warehouse-2;prod;P2;warehouse-network;it-infra;warehouse-2;it;network
```

Скрипт читает CSV и вызывает `host.update`.

Но осторожно: `host.update` с параметром `tags` **заменяет текущие host tags**, а все tags, которых нет в запросе, будут удалены. Это официально указано в API-документации. ([Zabbix][5])

Поэтому правильный алгоритм:

```text
1. host.get(selectTags)
2. взять существующие tags
3. смерджить с новыми
4. host.update(tags=merged_tags)
```

Мини-скелет логики:

```python
def merge_tags(existing, desired):
    result = {(t["tag"], t.get("value", "")): t for t in existing}

    for tag, value in desired.items():
        result[(tag, value)] = {"tag": tag, "value": value}

    return list(result.values())
```

Так делать не нужно:

```python
host.update(hostid=123, tags=[{"tag": "service", "value": "1c-erp"}])
```

Так можно удалить все остальные tags.

### Способ 4. Через IaC / Ansible

Для нормальной промышленной модели host tags должны жить не в голове инженера и не в UI, а в декларативном описании хоста:

```yaml
host_name: srv-1c-app-01
groups:
  - Applications/1C
templates:
  - Plant: Windows Base
  - Plant: 1C App Server
tags:
  env: prod
  criticality: P1
  service: 1c-erp
  owner: it-apps
  location: dc-main
  segment: it
  os_family: windows
```

Тогда Zabbix — это runtime, а Git/Ansible/CMDB — источник правды.

## 8. Как это ложится на интеграцию с Telegram

Без тегов Telegram получает примерно это:

```text
Problem: ICMP Ping: High ICMP ping loss
Host: 10.20.5.239
Severity: Warning
Loss: 33.33%
```

После нормального тегирования сообщение должно быть таким:

```text
Problem: ICMP Ping: High ICMP ping loss
Host: terminal-warehouse-1
IP: 10.20.5.239

Service: warehouse-network
Owner: it-infra
Location: warehouse-2
Segment: it
Component: icmp
Scope: availability
Severity: Warning

Operational data: Loss 33.33%
Runbook: https://wiki.local/runbooks/icmp-loss
```

И action должен решить:

```text
если service=warehouse-network
и component=icmp
и severity=Warning
и notification=dashboard-only
→ НЕ слать в Telegram
```

А вот если:

```text
host=router-warehouse-2
service=warehouse-network
component=router
scope=availability
severity=High
notification=active
```

тогда:

```text
→ Telegram
```

## 9. Пример дашбордов на тегах

### NOC dashboard

Фильтр:

```text
env=prod
severity >= High
```

Показывает всё, что реально требует реакции.

### Дашборд «Склад»

Фильтр:

```text
service=warehouse-network
location=warehouse-2
```

Виджеты:

```text
router-warehouse-2 availability
internet availability
wifi errors
icmp latency by hosts
active problems
```

### Дашборд «1C-ERP»

Фильтр:

```text
service=1c-erp
env=prod
```

Виджеты:

```text
1C app servers
MSSQL
backup age
web synthetic check
active users/sessions
active problems by component
```

### Дашборд «Capacity»

Фильтр:

```text
scope=capacity
env=prod
```

Группировка:

```text
service
location
component
```

На выходе не «диски всех серверов», а:

```text
1c-erp → disk
exchange → mailbox db storage
backup → repository
```

## 10. Какую tag schema я бы ввёл прямо сейчас

### Host tags, обязательные

```text
env=prod|test|dev|dr
criticality=P1|P2|P3|P4
service=<service-name>
owner=<team-or-person>
location=<site>
segment=it|ot|dmz|home|cloud
os_family=windows|linux|network|storage|hypervisor|appliance
```

> **Замечание:** значения `os_family=network|storage|hypervisor|appliance` смешивают семейство ОС и класс устройства. Если в проекте это вызывает путаницу, рассмотрите разделение на два тега: `os_family=windows|linux|...` и `device_class=server|network|storage|appliance` — или используйте общий `platform` с произвольными значениями.

### Host tags, опциональные

```text
backup=daily|weekly|none
sla=24x7|business-hours|none
vendor=keenetic|unifi|cisco|mikrotik|dell|hp
role=router|switch|ap|db|app|web|backup
lifecycle=prod|legacy|to-retire
```

### Item tags

```text
component=cpu|memory|disk|interface|wifi|backup|database|web|icmp
scope=availability|performance|capacity|security|quality|recovery
```

### Trigger tags

```text
impact=outage|degradation|risk|noise
notification=active|dashboard-only|none
runbook=required|optional
```

Можно спорить о названиях, но принцип такой: **host tags описывают объект, item tags описывают метрику, trigger tags описывают проблему**.

## 11. Что не надо делать

Не надо лепить 30 host tags на каждый объект. Каждый тег попадает в события, а event tags занимают место в БД: Zabbix оценивает один tag record примерно в 100 байт на event, и размер базы событий растёт как `event_count × tag_count`. ([Zabbix][6])

Не надо делать теги с высокой кардинальностью без нужды:

```text
bad:
ticket_id=INC-123456
last_seen=2026-05-11-16-35
current_ip=10.20.5.239
serial_number=...
```

Это либо inventory, либо operational data, либо macro, но не tag для каждого event.

Не надо использовать tags как замену dependencies. Если упал свитч и за ним 50 хостов, это решается trigger dependencies, а не тегами.

Не надо смешивать `owner` и `service`. `owner` на уровне хоста — это **ответственная команда за объект** (тот, кто обслуживает именно этот хост/компонент). Один сервис может иметь несколько ответственных команд по компонентам. Например:

```text
service=1c-erp
owner=it-apps
component=web
```

и:

```text
service=1c-erp
owner=dba
component=database
```

Для дополнительной маршрутизации в многокомандных сервисах можно добавить `resolver_group` или `support_team` на уровне trigger tag — это позволяет настроить action «при component=database слать dba-oncall».

Это нормально.

## 12. Практический порядок внедрения

Практический порядок для первого внедрения:

```text
1. Завести словарь тегов в markdown:
   env, criticality, service, owner, location, segment, os_family.

2. Проставить host tags на 10-20 ключевых хостов:
   коммутаторы, серверы, важные сетевые устройства.

3. В шаблонах поправить trigger tags:
   scope, component, notification.

4. В LLD prototypes добавить item/trigger tags:
   filesystem/interface/wifi/etc.

5. Переписать Telegram action:
   не только severity,
   а severity + tags.

6. Сделать 2 Problems widget:
   - Active important: env=prod, notification=active
   - Warehouse network: service=warehouse-network

7. Через неделю посмотреть:
   какие tags реально помогают,
   какие мусор,
   какие values расползлись.
```

Итоговая картина должна быть такой:

```text
Хост-группы отвечают: кто имеет доступ и где объект фактически лежит.
Теги отвечают: что это значит для эксплуатации.
Actions отвечают: кому слать.
Dashboards отвечают: кому что показывать.
Services/SLA отвечают: как это влияет на бизнес.
Runbooks отвечают: что делать.
```

Вот тогда Zabbix перестаёт быть «кучей алертов в Telegram» и становится системой управления эксплуатацией.

[1]: https://www.zabbix.com/documentation/current/en/manual/config/tagging "6 Tagging"
[2]: https://www.zabbix.com/documentation/current/en/manual/web_interface/frontend_sections/dashboards/widgets/item_navigator "17 Item navigator"
[3]: https://www.zabbix.com/documentation/current/en/manual/api/reference/action/object "Action object"
[4]: https://www.zabbix.com/documentation/current/en/manual/discovery/auto_registration "2 Active agent autoregistration"
[5]: https://www.zabbix.com/documentation/current/en/manual/api/reference/host/update "host.update"
[6]: https://www.zabbix.com/documentation/current/en/manual/installation/requirements "2 Requirements"


---

## Официальные рекомендации Zabbix по тегам шаблонов

Zabbix публикует [Template guidelines](https://www.zabbix.com/documentation/guidelines/en/template_guidelines) — официальный стандарт для разработки публичных шаблонов. При проектировании корпоративных шаблонов полезно от него отталкиваться.

Ключевые рекомендации по тегам из официального стандарта:

**Уровень шаблона** — два обязательных тега:

| Тег | Назначение | Примеры значений |
|---|---|---|
| `class` | Тип отслеживаемой сущности | `application`, `database`, `hardware`, `network`, `os`, `service`, `storage`, `cloud` |
| `target` | Название продукта | `apache`, `postgresql`, `cisco`, `windows` |

Дополнительно: `subclass` — уточняет класс (`webserver`, `containers`).

**Уровень элемента данных** — тег `component` с одним из значений:

`cpu` · `memory` · `network` · `storage` · `power` · `os` · `system` · `application` · `kpi` · `raw`

**Уровень триггера** — тег `scope` с одним из значений:

`availability` · `performance` · `capacity` · `security` · `notice` · `compliance`

**Уровень прототипа** — те же теги плюс LLD-макросы в значениях:

```
component: storage
disk: {#DEVNAME}
```

Это совпадает с нашей корпоративной моделью тегов — `scope`, `component` уже используются в схеме. Отличие: в официальном стандарте `class`/`target` на уровне шаблона не используются в нашей схеме, потому что у нас другая RBAC-модель (через host groups, а не template tags).

## Резюме главы

Главное, что нужно унести:

1. **Группы — для RBAC и грубой техн. навигации.** Не пытайтесь засунуть в групповую структуру бизнес-смысл.
2. **Теги — для всего остального.** Сервис, владелец, площадка, среда, критичность, OS, сегмент.
3. **Минимум 7 обязательных тегов:** `env`, `location`, `segment`, `service`, `owner`, `criticality`, `os_family`. Без них дашборды и SLA не строятся.
4. **Tag schema — это документ.** Не «договорённости в Telegram», а файл в Git со списком разрешённых значений по каждому тегу.
5. **Теги наследуются** от template/host/item/trigger в событие. Используйте это.

См. также:

- [Глава 4 — LLD и prototypes](04_lld_and_prototypes.md) — теги на prototype-объектах
- [Глава 7 — Roadmap](07_implementation_roadmap.md) — когда внедрять tag schema
- [`zbx_audit_now.py`](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/scripts/zbx_audit_now.py) — скрипт, который покажет, у каких хостов какие теги отсутствуют
