!!! info "🔴 Статус: Requirements only · v0.1"
    Это ТЗ к имплементации, а не сама имплементация. Не импортируйте псевдо-конфиги в production.

# 13. Требования к шаблонам мониторинга

!!! danger "⚠️ ВАЖНО: это НЕ готовые Zabbix-шаблоны"
    Эта глава — **требования к шаблонам** (Plant: monitoring templates), не сами шаблоны.
    
    Конкретно:
    
    - Trigger expressions написаны в **псевдо-синтаксисе** для читаемости (`last(sessions)>X`), а не в актуальном Zabbix-синтаксисе (`last(/host/key)>X`)
    - Часть SQL-запросов для MSSQL — **схематична**, требует доработки под версию SQL Server и нагрузку
    - Веса триггеров (Warning/High/Disaster) и пороги — **отправные точки**, не финальные значения
    - UserGate OID требуют сверки через реальный `snmpwalk` на конкретной версии прошивки
    - LLD-дизайн **не проработан** — для production нужна явная схема discovery rules с фильтрами
    
    **Перед импортом — обязательно проверьте шаблоны в тестовом окружении.**

---

## Что эта глава даёт

- **Структуру шаблонов** Plant: с разделением по системам (1С / MSSQL / Exchange / Veeam / UserGate / SCADA-bridge)
- **Список метрик**, которые имеет смысл собирать для каждого класса систем
- **Идеи триггеров** с примерными порогами как стартовая точка
- **Gotchas** — частые грабли (русская локализация Exchange, кэш сеансов 1С, чтение OPC без агента)

## Что эта глава НЕ даёт

- Импортируемые `.yaml` файлы шаблонов
- Готовые UserParameter скрипты
- Проверенный синтаксис триггеров для Zabbix 7.x
- Учёт особенностей конкретно вашей инфраструктуры

## Как этим пользоваться

1. Прочитайте требования к интересующему вас шаблону
2. Возьмите **базовый шаблон** из community (`slothfk/1c_zabbix_template_ce`, `glukinho/zabbix-veeam-rest` и т.п.) — это отправная точка
3. Адаптируйте под свою версию Zabbix, локализацию, окружение
4. Прогоните на 1–2 хостах в течение 1–2 недель **прежде чем применять массово**
5. Тюньте пороги по своим данным

---

Ниже приведён разбор требований к шаблонам по единой структуре.

---

## Соответствие официальным Template guidelines

Zabbix публикует [Template guidelines](https://www.zabbix.com/documentation/guidelines/en/template_guidelines) — стандарт для официальных и публичных шаблонов. Шаблоны из этой главы не являются публичными, но стоит сверяться со стандартом при разработке собственных.

Ключевые требования стандарта к тегам, которые пересекаются с нашей схемой:

- **Шаблон** должен иметь теги `class` (тип: `database`, `os`, `service` и др.) и `target` (имя продукта: `mssql`, `exchange`, `1c`)
- **Элемент данных** должен иметь тег `component`: `cpu`, `memory`, `storage`, `network`, `application`, `kpi`
- **Триггер** должен иметь тег `scope`: `availability`, `performance`, `capacity`, `security`, `notice`
- **Прототипы** — те же теги плюс LLD-макросы в значениях: `disk: {#DEVNAME}`

При доработке корпоративных шаблонов эти теги добавляются поверх host tags из [главы 3](03_tags_and_groups.md).

## Принцип структуры каждого шаблона

Для каждого блока ниже — одна и та же схема:
**Откуда брать базу → Items (ключ + интервал) → Macros → Triggers (выражение + severity) → Сверка / gotchas**

---

## 1. Plant: 1C App Server

**Базовый шаблон:** `slothfk/1c_zabbix_template_ce` (GitHub) — разбит на несколько частей по функциональному назначению: рабочий сервер, кластер, сеансы. Также есть `nikimaxim/zbx-1c-server`.

### Items

| Метрика | Ключ Zabbix | Интервал | Метод |
|---|---|---|---|
| Очередь фоновых заданий | `rac cluster list` + `rac job list` → UserParameter | 1m | agent (скрипт) |
| Активные сеансы | `rac session list` count | 1m | agent (скрипт) |
| Лицензии HASP — выдано / доступно | UserParameter → `hasp_srm` или лог | 2m | agent |
| Размер кэша сеансов (`/tmp/1cv8*`, `/var/1C/cache`) | `vfs.dir.size[/var/1C/cache]` | 5m | agent |
| Дисковое I/O на `/var/1C` | `vfs.dev.read.time[sda]` / write | 1m | agent |
| Процессы rphost живы | `proc.num[rphost]` | 1m | agent |
| Рестарты рабочих процессов | diff в логе `1cv8crwpsrv.log` | 1m | log/agent |

### Macros

```
{$1C.SESSIONS.WARN}     = 300
{$1C.SESSIONS.CRIT}     = 500
{$1C.QUEUE.WARN}        = 50   # очередь фоновых заданий
{$1C.CACHE.MAX.GB}      = 20
{$1C.HASP.MIN}          = 2    # минимум свободных лицензий
```

### Triggers

| Название | Выражение | Severity |
|---|---|---|
| Сеансов > порог | `last(sessions)>{$1C.SESSIONS.CRIT}` | High |
| HASP лицензии заканчиваются | `last(hasp_free)<{$1C.HASP.MIN}` | High |
| HASP лицензии исчерпаны | `last(hasp_free)=0` | Disaster |
| Очередь фоновых заданий растёт | `avg(queue,5m)>{$1C.QUEUE.WARN}` | Average |
| Кэш сеансов аномально вырос | `last(cache_size)>{$1C.CACHE.MAX.GB}G` | Warning |
| rphost не найден на этом хосте | `last(proc.num[rphost])=0` | High (не Disaster: в кластере могут быть другие рабочие серверы; Disaster — когда нет рабочих процессов во всём кластере ИЛИ синтетика 1С не проходит) |

**Сверка и gotchas:**
- `rac` — консольная утилита, работает только если запущен `ragent`. UserParameter должен выполняться от имени пользователя `usr1cv8`, иначе получишь пустой вывод.
- HASP: `hasp_srm` слушает на порту 1947. Если лицензий нет — 1С молча не запускает сеансы, не пишет очевидной ошибки. Мониторить надо превентивно, за 2–3 лицензии до нуля.
- Кэш сеансов: путь зависит от конфигурации, уточни `grep CachePath /etc/1C/1cv8.cfg`.

---

## 2. Plant: 1C Server (cluster manager)

### Items

| Метрика | Ключ | Интервал |
|---|---|---|
| Доступность `rac cluster list` | UserParameter → exit code | 1m |
| Процесс `rphost` | `proc.num[rphost]` | 30s |
| Процесс `rmngr` | `proc.num[rmngr]` | 30s |
| Счётчик рестартов рабочих процессов | парсинг лога `1cv8crwpsrv` | 2m |
| Количество рабочих процессов | `rac process list` → count | 2m |
| Доступность RAC-порта (1545) | `net.tcp.port[,1545]` | 1m |

### Triggers

| Название | Выражение | Severity |
|---|---|---|
| rmngr упал | `last(proc.num[rmngr])=0` | Disaster (менеджер кластера — без него кластер недоступен) |
| rphost упал (single-server) | `last(proc.num[rphost])=0` | Disaster только если это единственный рабочий сервер кластера; иначе High |
| RAC порт недоступен | `last(net.tcp.port[,1545])=0` | High |
| Рестарты рабочих процессов >N за час | `sum(restarts,1h)>3` | High |
| Нет рабочих процессов | `last(process_count)=0` | Disaster |

**Gotchas:** `rmngr` — менеджер кластера, если он падает, то весь кластер умирает. Это всегда Disaster. `rphost` — рабочий процесс, их может быть несколько — падение одного может быть Average, всех — Disaster. Используй `proc.num` с именем процесса, а не просто проверку порта.

---

## 3. Plant: MSSQL for 1C

**Базовый шаблон:** официальный `MSSQL by Zabbix agent 2` — не требует внешних скриптов, работает через плагин agent 2, поддерживается с Zabbix 6.0. Для старых версий — ODBC вариант.

### Items (ключевые для 1С-окружения)

| Метрика | Ключ / счётчик | Интервал |
|---|---|---|
| Deadlocks/sec | `\SQLServer:Locks(_Total)\Number of Deadlocks/sec` | 30s |
| Активные блокировки | `\SQLServer:Locks(_Total)\Lock Waits/sec` | 30s |
| Длинные транзакции | SQL-запрос к `sys.dm_exec_sessions` | 1m |
| tempdb used % | SQL к `tempdb` / `sys.dm_db_file_space_usage` | 2m |
| Время последнего бэкапа | SQL к `msdb.dbo.backupset` | 5m |
| Buffer cache hit ratio | `\SQLServer:Buffer Manager\Buffer cache hit ratio` | 1m |
| User connections | `\SQLServer:General Statistics\User Connections` | 1m |
| Размер БД 1С | `\SQLServer:Databases({#DBNAME})\Data File(s) Size (KB)` | 5m |

SQL для длинных транзакций (open transaction age):
```sql
-- Активные транзакции с указанием длительности и блокировок
SELECT COUNT(*) FROM sys.dm_exec_sessions s
JOIN sys.dm_tran_session_transactions t ON s.session_id = t.session_id
JOIN sys.dm_tran_active_transactions at ON t.transaction_id = at.transaction_id
WHERE at.transaction_begin_time < DATEADD(second,-30,GETDATE())
AND s.status NOT IN ('sleeping','background')
-- Примечание: этот запрос показывает именно открытые транзакции,
-- а не просто активные сессии. Учитывайте также blocking chains:
-- sys.dm_exec_requests WHERE blocking_session_id <> 0
```

SQL для возраста бэкапа:
```sql
SELECT DATEDIFF(hour, MAX(backup_finish_date), GETDATE()) 
FROM msdb.dbo.backupset 
WHERE database_name='<dbname>' AND type='D'
```

### Macros

```
{$MSSQL.DEADLOCKS.MAX}      = 1      # deadlocks/sec
{$MSSQL.LONGTRX.SEC}        = 30
{$MSSQL.TEMPDB.MAX.PCT}     = 80
{$MSSQL.BACKUP.AGE.WARN}    = 24     # часов
{$MSSQL.BACKUP.AGE.CRIT}    = 48
{$MSSQL.BUFFERCACHE.MIN}    = 90     # % попаданий в кэш
```

### Triggers

| Название | Severity |
|---|---|
| Deadlocks > 1/sec | **High** (для 1С это критично — зависание документов) |
| Транзакция >30s активна | Average |
| Транзакция >5m активна | High |
| tempdb > 80% | Average |
| tempdb > 95% | High (Disaster только при наличии ошибок выделения `tempdb` в errorlog или реальном impact — сам по себе 95% может быть нормальным поведением под нагрузкой) |
| Бэкап > 24h назад | High |
| Бэкап > 48h назад | Disaster |
| Buffer cache hit ratio < 90% | Average |

**Gotchas:**
- Официальный шаблон Zabbix имеет макрос `{$MSSQL.DBNAME.NOTMATCHES}` с дефолтом `master|tempdb|model|msdb` — tempdb из стандартного дискавери исключён, его нужно мониторить отдельными items.
- Макросы `{$MSSQL.BACKUP_FULL.USED}`, `{$MSSQL.BACKUP_LOG.USED}` позволяют отключить триггеры возраста бэкапа для конкретных БД — полезно для реплик или тестовых баз.
- Для 1С-специфики добавь мониторинг `sys.dm_exec_query_stats` — тяжёлые запросы убивают производительность раньше, чем сработает deadlock.

---

## 4. Plant: Exchange DAG member

**Базовый шаблон:** официальный `Microsoft Exchange Server 2016 by Zabbix agent` — работает только через Zabbix agent, без внешних скриптов; рекомендуется использовать в связке с `OS Windows by Zabbix agent`.

**Совместимость с локализованной Windows:** на русских (и других не-English) Windows perf counter discovery через `perf_instance.discovery` может возвращать локализованные имена объектов, что приводит к расхождению с ключами шаблона. Если discovery Exchange DB работает некорректно — переключите на `perf_instance_en.discovery` (English instance names). Проверяйте поведение на конкретной версии ОС и шаблона; для уточнения: `perf_instance.discovery` vs `perf_instance_en.discovery` в документации Zabbix agent.

### Items

| Метрика | Счётчик / ключ | Интервал |
|---|---|---|
| CopyQueueLength (репликация) | `\MSExchange Replication(*)\CopyQueueLength` | 30s |
| ReplayQueueLength | `\MSExchange Replication(*)\ReplayQueueLength` | 30s |
| Content Index State (per DB) | `Get-MailboxDatabase -Status | Select ContentIndexState` через PS | 5m |
| Mailbox DB mounted/dismounted | `\MSExchange Active Manager(*)\*` | 1m |
| Transport queue — Mailbox Delivery | `\MSExchangeTransport Queues(_total)\Active Mailbox Delivery Queue Length` | 1m |
| Transport queue — Total | `\MSExchangeTransport Queues(_total)\Aggregate Delivery Queue Length` | 1m |
| OWA requests/sec | `\MSExchange OWA\Requests/sec` | 1m |
| Активные пользователи OWA | `\MSExchange OWA\Current Unique Users` | 2m |

### Triggers — отправные пороги

!!! warning "Эти пороги — не догма, а starting point"
    Значения ниже — это **отправные точки** из шаблонов сообщества. Microsoft в документации для health-проверок database copy упоминает условие *copy queue length less than 10 logs*, поэтому порог `>1` как постоянный Warning будет излишне шумным на любой активной системе. Тюнить по своим данным после 1–2 недель наблюдения. Также обязательно различать active/passive copies и lagged copies — иначе будут ложные срабатывания.

| Название | Условие | Severity |
|---|---|---|
| CopyQueueLength > 10 | `min(/host/CopyQueueLength,5m)>10` | Warning / Average |
| CopyQueueLength > 50 | `min(/host/CopyQueueLength,10m)>50` | High |
| ReplayQueueLength > 50–100 | зависит от DAG и lagged copies | High |
| DB copy status Failed/Suspended | `last(/host/copy_status)<>Healthy` | High |
| Content Index не Healthy | `last(/host/ci_state)<>1` (enum) | Average |
| Active DB dismounted | `last(/host/db_state)<>1` | Disaster |
| Test-ReplicationHealth failed | по конкретному тесту | High/Disaster |
| Delivery Queue > 3000 | `last(/host/aggregate_queue)>3000` | High |
| Active Mailbox Queue > 100 | per-queue, `last(...)>100` | Average |

**Gotchas:**
- DAG health (`Test-ReplicationHealth`) через PowerShell — лучше вынести в отдельный UserParameter, т.к. команда медленная (5–15 сек).
- Content Index: значения `HealthyCrawling` допустимы, `Failed`/`Unknown` — проблема. Нужна value map: `1=Healthy, 2=Crawling, 3=Failed, 4=Unknown`.
- Очереди транспорта — пороги Aggregate > 3000 и Largest Delivery > 100 как ориентир; для уточнения использовать `perf_counter_en`.
- Мониторинг DAG с одного члена видит только себя. Для cross-DAG health нужен внешний скрипт на каждом члене или централизованный PowerShell с сервера Exchange.
- **Различать active/passive copies.** Lagged copies (намеренно отстающие реплики) дают высокую CopyQueueLength по дизайну — на них нужны отдельные шаблоны с более мягкими порогами.

---

## 5. Plant: SCADA-IT bridge (read-only!)

Особый случай — **принципиально ограниченный мониторинг**. Никаких агентов внутрь. Только внешние проверки.

### Items

| Метрика | Ключ | Интервал | Метод |
|---|---|---|---|
| ICMP до OPC-сервера | `icmpping[opc-server-ip,3,100,1000,100]` | 30s | simple check |
| ICMP latency | `icmppingsec[opc-server-ip]` | 30s | simple check |
| TCP порт OPC DA (135) | `net.tcp.port[opc-server-ip,135]` | 1m | simple check |
| TCP порт OPC UA (4840) | `net.tcp.port[opc-server-ip,4840]` | 1m | simple check |
| TCP порт DCOM (если используется) | `net.tcp.port[opc-server-ip,{$OPC.DCOM.PORT}]` | 1m | simple check |

### Macros

```
{$OPC.ICMP.LOSS.MAX}    = 30    # % потерь
{$OPC.ICMP.LATENCY.MAX} = 10    # ms
{$OPC.PORT}             = 4840  # OPC UA default
```

### Triggers

| Название | Severity |
|---|---|
| OPC-сервер не пингуется | Disaster |
| Потери ICMP > 30% | High |
| TCP порт OPC недоступен | Disaster |
| Задержка ICMP > 10ms | Warning |

**Gotchas:**
- `read-only` — это архитектурное требование. Никаких Zabbix agent, никаких SNMP walk внутрь ОТ-сегмента без согласования с SCADA-инженерами и ИБ.
- ⚠️ Даже ICMP ping и TCP port check являются **активным зондированием** — они отправляют пакеты в OT-сегмент. На некоторых PLC и SCADA-контроллерах это может вызвать нежелательную реакцию. Все проверки согласуются с командой АСУ ТП и ИБ до включения.
- Мониторинг с Zabbix proxy, расположенного в IT-DMZ, а не из основной сети.
- Если OPC DA (порт 135 + динамические порты DCOM) — нужно знать конкретный статический порт, который назначен в реестре OPC-серверу. Его нужно уточнить у SCADA-инженеров.
- Добавляется тег `segment=OT` и настраивается отдельный escalation — алерты должны идти SCADA-инженерам, не только NOC.

---

## 6. Plant: Veeam backup target

**Базовый шаблон:** официальный `Veeam Backup and Replication` через REST API. Версия шаблона зависит от версии Zabbix — берите шаблон строго под свою версию Zabbix (6.0, 6.4, 7.0, 7.2). REST API требует Veeam B&R с активным REST API (порт 9419, доступен не во всех редакциях и версиях Veeam).

Для старых версий Veeam — PowerShell-вариант (`romainsi/zabbix-VEEAM_B-R` или `glukinho/zabbix-veeam-rest`).

### Items

| Метрика | Источник | Интервал |
|---|---|---|
| Возраст последнего успешного бэкапа | REST API `/api/v1/backupSessions` | 5m |
| Статус задания (Success/Warning/Failed) | REST API, LLD по заданиям | 5m |
| Свободное место в репозитории (GB и %) | REST API `/api/v1/backupRepositories` | 10m |
| Объём репозитория | REST API | 10m |
| Статус сервисов Veeam | `service.info[VeeamBackupSvc]` | 1m |
| Длительность выполнения задания | REST API `duration` | при срабатывании |

### Macros

```
{$VEEAM.API.URL}              = https://veeam-server:9419
{$VEEAM.USER}                 = zabbix_readonly
{$VEEAM.PASSWORD}             = <secret>   # ⚠️ Использовать Secret user macros (тип "Secret text") в Zabbix;
                                             # не хранить в plain text в export/YAML/git
{$VEEAM.BACKUP.AGE.WARN}     = 24    # часов (число, не "24h"! item должен возвращать числовые часы)
{$VEEAM.BACKUP.AGE.CRIT}     = 26    # часов
{$VEEAM.REPO.FREE.WARN.PCT}  = 20
{$VEEAM.REPO.FREE.CRIT.PCT}  = 10
```

### Triggers

!!! warning "Правильный паттерн для бэкапов — возраст, а не nodata()"
    `nodata()` проверяет, что item **вообще не присылал данные**. Но если item каждые 5 минут честно отдаёт старый timestamp последнего успешного бэкапа — `nodata()` не сработает. Правильный паттерн — измерять **возраст** последнего успешного бэкапа в часах или секундах.

| Название | Выражение (Zabbix 7.x синтаксис) | Severity |
|---|---|---|
| Задание завершилось с ошибкой | `last(/Plant Veeam/veeam.job.result[{#JOBNAME}])=0` (Failed) | **High** |
| Задание завершилось с предупреждением | `last(/Plant Veeam/veeam.job.result[{#JOBNAME}])=1` (Warning) | Average |
| Бэкап нарушил RPO (возраст > 24h) | `last(/Plant Veeam/veeam.job.age.hours[{#JOBNAME}])>{$VEEAM.BACKUP.AGE.WARN}` | **High** |
| Бэкап критически старый (возраст > 26h) | `last(/Plant Veeam/veeam.job.age.hours[{#JOBNAME}])>{$VEEAM.BACKUP.AGE.CRIT}` | **Disaster** |
| Репозиторий < 20% | `last(/Plant Veeam/veeam.repo.free.pct[{#REPONAME}])<{$VEEAM.REPO.FREE.WARN.PCT}` | High |
| Репозиторий < 10% | `last(/Plant Veeam/veeam.repo.free.pct[{#REPONAME}])<{$VEEAM.REPO.FREE.CRIT.PCT}` | Disaster |
| Сервис VeeamBackupSvc упал | `last(/Plant Veeam/service.info[VeeamBackupSvc])<>0` | High |

Альтернативная форма — если item возвращает timestamp, а не возраст:

```text
now()-last(/Plant Veeam/veeam.job.last_success_ts[{#JOBNAME}])>{$VEEAM.BACKUP.AGE.CRIT}
```

**Gotchas:**
- Через REST API возможно получать last job result/duration/date для каждого задания через LLD, а также total capacity и free space репозиториев.
- **Возраст бэкапа** (а не статус последнего задания) — один из самых важных триггеров в инфраструктуре. Зелёный статус задания не равен рабочему восстановимому бэкапу: retention policy может выбросить нужную точку, или задание сегодня прошло, но восстановиться из него нельзя.
- REST API доступен не во всех редакциях Veeam; требуются Veeam B&R Community Edition (ограничено) или платные редакции. Уточнить перед настройкой.
- При использовании PowerShell-метода — выполнение команд `Get-VBRBackupSession` может занимать от 30 секунд до 3+ минут на больших историях, поэтому используется промежуточный XML-файл.

---

## 7. Plant: UserGate cluster

**Базовый шаблон:** UserGate предоставляет официальный шаблон Zabbix для SNMPv2 с набором элементов данных, триггерами и графиками; загрузить можно из веб-консоли раздела Диагностика и мониторинг → SNMP. Также есть шаблон сообщества `AndAndr/Zabbix-templates` с поддержкой SNMPv2/v3 и трапами.

UserGate UTM поддерживает SNMP v2c и v3, как polling-запросы, так и SNMP traps.

### Items

| Метрика | OID / ключ | Интервал | Метод |
|---|---|---|---|
| CPU usage | `UTM-MIB::utmCpuLoad` | 1m | SNMP |
| Memory usage | `UTM-MIB::utmMemUsed` | 1m | SNMP |
| Active sessions | `UTM-MIB::utmSessions` | 1m | SNMP |
| Throughput (in/out) | `IF-MIB::ifInOctets/ifOutOctets` per interface | 30s | SNMP |
| Cluster sync state | через SNMP trap или API | 1m | SNMP trap / HTTP |
| VPN tunnel state (per tunnel) | `UTM-MIB::vpnTunnelState` или API | 2m | SNMP |
| Доступность management-интерфейса | `net.tcp.port[,8001]` (HTTPS admin) | 1m | agent/simple |
| Статус HA / failover | SNMP trap `utmClusterState` | event | SNMP trap |

### Macros

```
{$UG.SNMP.COMMUNITY}     = <secret macro>   # никогда не "public"; рекомендуется SNMPv3 для production
{$UG.CPU.WARN}           = 80
{$UG.CPU.CRIT}           = 95
{$UG.MEM.WARN}           = 85
{$UG.SESSIONS.MAX}       = 50000
{$UG.REPO.FREE.MIN}      = 10
```

### Triggers

| Название | Severity |
|---|---|
| CPU > 95% в течение 5 мин | Disaster |
| CPU > 80% в течение 10 мин | High |
| Cluster sync потерян | Disaster |
| VPN туннель упал | High (с context macro per tunnel) |
| Active sessions > max | Average |
| Management-интерфейс недоступен | Disaster |

**Gotchas:**
- Необходимо разрешить SNMP в зоне интерфейса в веб-консоли UserGate (Сеть → Зоны → Контроль доступа → SNMP), иначе опросы не пройдут.
- MIB-файлы (`UTM-MIB.mib` и `UTM-TRAPS-MIB.mib`) скачиваются из веб-консоли UserGate — без них OID останутся числовыми.
- Для cluster sync: UserGate использует SNMP traps для событий кластера. Настрой `snmptrapd` + `snmptt` на Zabbix server и сконвертируй MIB.
- VPN-туннели: если туннелей > 50, включи LLD по `UTM-MIB::vpnTunnelTable` — иначе придётся вручную добавлять каждый.
- Существует шаблон сообщества `UsergateUTM` для Zabbix 4/7 с поддержкой SNMP traps — хорошая отправная точка.

---

## Сводная таблица: метод сбора и готовые источники

| Шаблон | Метод | Готовый шаблон | Ссылка |
|---|---|---|---|
| 1C App Server | Zabbix agent + UserParameter (скрипты `rac`) | slothfk, nikimaxim | GitHub |
| 1C Cluster manager | Zabbix agent + UserParameter | slothfk | GitHub |
| MSSQL | Zabbix Agent 2 (plugin) или ODBC | **Официальный Zabbix** | zabbix.com/integrations/mssql |
| Exchange DAG | Zabbix agent (perf_counter_en) | **Официальный Zabbix** | zabbix.com/integrations/ms_exchange |
| SCADA-IT bridge | Simple check (ICMP + tcp) | Ручная сборка | — |
| Veeam | HTTP (REST API) или PowerShell | **Официальный Zabbix** (7.2+) | zabbix.com/integrations/veeam |
| UserGate | SNMP v2c/v3 + traps | Официальный UserGate + AndAndr | GitHub + docs.usergate.com |

---

## Настройка порогов через макросы с контекстом

Все пороговые значения в шаблонах этой главы задаются через пользовательские макросы. Для LLD-объектов (базы данных MSSQL, Veeam jobs, сетевые интерфейсы) используйте **макросы с контекстом** — они позволяют задать разные пороги для разных обнаруженных объектов без изменения шаблона.

Принцип: дефолт на шаблоне, переопределение на хосте или на конкретный объект:

```
{$VEEAM.BACKUP.AGE.WARN}              = 24    ← все задания
{$VEEAM.BACKUP.AGE.WARN:"FullBackup"} = 168   ← недельный full — другой RPO
```

Триггер-прототип использует: `{$VEEAM.BACKUP.AGE.WARN:"{#JOB.NAME}"}`.

Подробно механизм описан в [главе 4 — LLD и прототипы](04_lld_and_prototypes.md).

## Что делать дальше

Порядок внедрения имеет значение:

1. **MSSQL и Veeam** — берутся официальные шаблоны, они рабочие из коробки. Macros настраиваются под локальные пороги.
2. **Exchange** — официальный шаблон + патч для русской локализации (`perf_instance_en`).
3. **UserGate** — MIB скачивается из консоли, разворачивается шаблон сообщества, проверяются traps.
4. **1C** — самое трудоёмкое. `slothfk` используется как база, скрипты UserParameter дорабатываются под локальную конфигурацию. Плановый объём работ — 2–3 дня.
5. **SCADA-bridge** — 30 минут: simple checks + 2–3 триггера. Обязательно согласование с ИБ и SCADA-командой.

---

## Связь с остальными главами

- [Глава 4 — LLD](04_lld_and_prototypes.md): для большинства шаблонов выше нужен LLD
