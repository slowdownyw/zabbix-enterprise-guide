!!! info "🟢 Статус: Conceptually stable · v0.1"
    Концепция устойчива, проверена опытом, литературой и практикой.


# 04. LLD и prototypes

**Low-Level Discovery (LLD)** — механизм, благодаря которому Zabbix может **сам обнаруживать сущности внутри хоста** (диски, интерфейсы, БД, очереди, процессы) и **сам создавать** для них items, triggers, graphs по заранее заготовленным prototype'ам.

Без LLD заводской Zabbix превращается в неуправляемую ручную модель, где каждый диск, каждый интерфейс, каждая БД заводится руками и неизбежно расходится по хостам. С LLD — стандартизованный механизм масштабирования.

Эта глава — про то, **что такое prototype**, **где это уже используется** (даже если вы не замечали), **где это опасно**, и **где это полезно в вашей архитектуре**.

---

В Zabbix **prototype** — это не «прототип хоста в смысле черновик», а **заготовка для автоматического создания объектов через LLD — Low-Level Discovery**.

Официально LLD умеет автоматически создавать items, triggers и graphs для сущностей внутри хоста: файловых систем, сетевых интерфейсов, CPU cores, SNMP OID, Windows services, VMware VM и т.д. Zabbix discovery rule получает JSON со списком найденных сущностей, например `{#IFNAME}=eth0`, `{#IFNAME}=lo`, и по prototype’ам создаёт реальные items/triggers/graphs под каждую найденную сущность. ([Zabbix][1])

## На пальцах

Допустим, есть сервер `srv-01`. У него диски:

```text
C:
D:
E:
```

Можно руками создать:

```text
Item: свободное место C:
Item: свободное место D:
Item: свободное место E:
Trigger: C: < 10%
Trigger: D: < 10%
Trigger: E: < 10%
```

А можно сделать нормально через LLD:

```text
Discovery rule: найти все файловые системы
Item prototype: свободное место на {#FSNAME}
Trigger prototype: свободное место на {#FSNAME} < 10%
```

И Zabbix сам создаст реальные объекты:

```text
Item: свободное место на C:
Item: свободное место на D:
Item: свободное место на E:

Trigger: C: свободно < 10%
Trigger: D: свободно < 10%
Trigger: E: свободно < 10%
```

Вот эта заготовка `свободное место на {#FSNAME}` и есть **prototype**.

## Какие бывают prototype’ы

Основные:

| Тип                     | Что создаёт                                             |
| ----------------------- | ------------------------------------------------------- |
| **Item prototype**      | Метрики: диск, интерфейс, сервис, БД, tablespace        |
| **Trigger prototype**   | Триггеры для найденных объектов                         |
| **Graph prototype**     | Графики для найденных объектов                          |
| **Host prototype**      | Новые хосты, например VM на гипервизоре                 |
| **Discovery prototype** | Вложенное discovery, например БД → tablespaces → tables |

Для item prototype LLD-макрос в ключе обязателен, чтобы Zabbix понимал, что это разные discovered-объекты, например `vfs.fs.size[{#FSNAME},pfree]`. ([Zabbix][2]) Trigger prototype создаётся аналогично item prototype и может иметь свои зависимости, но с ограничениями: например, он может зависеть от prototype из той же LLD rule или от обычного trigger. ([Zabbix][3])

## Почему вы могли встречать этот термин, но не замечали его

Скорее всего используется, просто вы на него не смотрели как на отдельную сущность. В Zabbix это обычно спрятано внутри шаблонов:

```text
Template → Discovery rules → Item prototypes / Trigger prototypes
```

Типовые встроенные шаблоны почти наверняка имеют prototype’ы:

```text
Linux by Zabbix agent
  └─ Mounted filesystem discovery
       ├─ Item prototypes
       └─ Trigger prototypes

Windows by Zabbix agent
  └─ Network interface discovery
  └─ Windows service discovery

Cisco/Eltex SNMP template
  └─ Interface discovery
       ├─ входящий трафик {#IFNAME}
       ├─ исходящий трафик {#IFNAME}
       └─ trigger prototype: interface down
```

То есть если у вас есть автообнаружение дисков, интерфейсов или сервисов — **prototype’ы уже есть**, даже если никто их так не называл.

## Чем prototype отличается от обычного item/trigger

Обычный item:

```text
vfs.fs.size[C:,pfree]
```

Это конкретная метрика конкретного диска.

Item prototype:

```text
vfs.fs.size[{#FSNAME},pfree]
```

Это заготовка, из которой Zabbix создаст много конкретных метрик: для `C:`, `D:`, `/`, `/var`, `/opt` и т.д.

Обычный trigger:

```text
srv-01: C: free space < 10%
```

Trigger prototype:

```text
{HOST.NAME}: {#FSNAME} free space < 10%
```

Из него создаются реальные триггеры под каждый discovered-диск.

## Где это полезно в вашей архитектуре

В вашем плане Zabbix для свечного завода LLD прямо указан как часть стандартизации: интерфейсы, диски, очереди 1С и похожие повторяющиеся сущности нужно закрывать через LLD, а не руками. Это логично: в фазе 2 вы приводите шаблоны, группы, теги и severity к нормальной модели, и LLD там нужен именно для масштабирования шаблонов. 

Практические места:

| Область          | Что обнаруживать через LLD                           |
| ---------------- | ---------------------------------------------------- |
| Windows/Linux    | Диски, интерфейсы, services, процессы                |
| Сеть             | Порты коммутаторов, VLAN, sensors, PSU/fan           |
| VMware/Hyper-V   | VM, datastores, hypervisor entities                  |
| MSSQL/PostgreSQL | Базы, tablespaces, replication slots                 |
| 1С               | Кластеры, rphost-процессы, рабочие процессы, очереди |
| Veeam            | Jobs, repositories, backup sessions                  |
| UPS/SNMP         | Батареи, входы/выходы, датчики                       |

## Где prototype’ы опасны

Главная проблема — **они могут нагенерировать мусор и нагрузку**.

Плохой пример:

```text
Discover all Windows services
→ создать item + trigger на каждый service
→ на 500 серверах по 200 services
→ 100 000+ items и куча шума
```

Или:

```text
Discover all network interfaces
→ без фильтра
→ loopback, tunnel, docker, veth, virtual adapters
→ сотни ненужных метрик
```

Поэтому в нормальной эксплуатации LLD всегда идёт с фильтрами, override’ами и lifecycle-политикой: что обнаруживать, что исключать, что делать с исчезнувшими объектами.

## Важная мысль

Prototype — это **часть шаблона**, а не объект эксплуатации сам по себе.

Инженер обычно не “работает с prototype’ом” каждый день. Он работает с уже созданным discovered item/trigger. Но архитектор мониторинга обязан понимать prototype’ы, потому что именно там задаётся массовое поведение:

```text
один неправильный trigger prototype
→ 500 неправильных trigger’ов
→ 500 ложных алертов
```

## Как проверить, используются ли они у вас

В UI:

```text
Data collection → Templates → открыть шаблон → Discovery
```

Дальше смотри:

```text
Discovery rule
  → Item prototypes
  → Trigger prototypes
  → Graph prototypes
  → Host prototypes
```

На хосте реальные созданные объекты обычно помечены как discovered и имеют связь с discovery rule.

## Как бы я это сформулировал коротко

**Prototype в Zabbix — это шаблон внутри LLD-rule, из которого Zabbix автоматически создаёт реальные items/triggers/graphs/hosts для каждого найденного объекта.**

Не prototype:

```text
Следить за диском C:
```

Prototype:

```text
Следить за каждым найденным диском {#FSNAME}
```

Для вашей задачи это один из ключевых механизмов стандартизации: без prototype’ов заводской Zabbix превращается в неуправляемую ручную модель, где диски, интерфейсы, порты и сервисы заводятся руками и неизбежно расходятся по хостам.

[1]: https://www.zabbix.com/documentation/current/en/manual/discovery/low_level_discovery "3 Low-level discovery"
[2]: https://www.zabbix.com/documentation/current/en/manual/discovery/low_level_discovery/item_prototypes "1 Item prototypes"
[3]: https://www.zabbix.com/documentation/current/en/manual/discovery/low_level_discovery/trigger_prototypes "2 Trigger prototypes"


---

## Связь с остальными главами

- [Глава 3 — Теги](03_tags_and_groups.md): теги на prototype-объектах автоматически наследуются на discovered items/triggers — это важный механизм
- [Глава 13 — Шаблоны](13_template_requirements.md): для MSSQL DB, Exchange DB copies, Veeam jobs, UserGate interfaces/VPN — везде нужен LLD

