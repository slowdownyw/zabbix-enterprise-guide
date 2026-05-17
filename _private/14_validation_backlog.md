!!! info "🟢 Статус: Conceptually stable · v0.1"
    Концепция устойчива, проверена опытом, литературой и практикой.

# 14. Validation Backlog

Эта глава — **дорожная карта валидации шаблонов из [главы 13](13_template_requirements.md)**. Она основана на техническом ревью со ссылками на официальные источники.

Каждый пункт — это конкретная **дыра**, которую нужно закрыть, прежде чем шаблон можно считать production-ready.

## Что это даёт

- Понимание, **где именно** требования из главы 13 превращаются в риск, если их брать буквально
- Конкретные **правки** с правильным синтаксисом / запросами / порогами
- Ссылки на **официальные источники** (Zabbix docs, MS Learn, UserGate docs)
- **Приоритизированный список** того, что пилотировать в каком порядке

## Как пользоваться

Каждый раздел ниже — это **готовая задача** в backlog. Импортируйте в свой трекер (Jira, Plane, Kaiten), назначайте ответственного, валидируйте поочерёдно.

Рекомендуемый порядок пилотов (по возрастанию сложности):

1. **MSSQL** — официальный template + 3–5 custom SQL items
2. **Veeam** — возраст последнего успешного бэкапа, свободное место в репозитории, упавшие задания
3. **UserGate** — SNMP walk + базовые CPU/mem/interfaces/HA
4. **Exchange** — официальный template + DAG custom PowerShell
5. **1C** — самый тяжёлый, делать последним
6. **SCADA bridge** — просто, но **только после согласования с ИБ/АСУ ТП**

---

Да, **жизнеспособно как инженерный черновик**, но **не жизнеспособно как готовый продакшн-набор шаблонов**.

Моя оценка:

* **Архитектурная идея:** 8/10
* **Покрытие ключевых систем завода:** 8/10
* **Готовность к импорту в Zabbix:** 3/10
* **Продакшн-надёжность без доработки:** 4/10

Главная проблема: текст выглядит как “шаблоны готовы”, а по факту это **матрица требований к шаблонам**. Там много правильных метрик, но часть ключей, выражений и порогов — псевдокод.

---

## Что в этом хорошего

Общая логика совпадает с нормальной архитектурой мониторинга: ОС/железо отдельно, middleware отдельно, приложение отдельно, бизнес-синтетика отдельно. Это ровно тот подход, заложенный в архитектуре проекта: сбор → хранение → корреляция → визуализация → алертинг → runbook → постмортем → обратно в шаблоны. 

Также правильно, что выделены отдельные шаблоны под:

* 1C App Server;
* 1C cluster manager;
* MSSQL для 1С;
* Exchange DAG;
* SCADA bridge;
* Veeam;
* UserGate.

Это хорошо ложится в фазу 2 проекта, где прямо предусмотрена библиотека кастомных `Plant:`-шаблонов, tag schema, severity policy и зависимости триггеров. 

Отдельный плюс — SCADA описана осторожно: без агентов внутрь OT, только внешние проверки. Это соответствует вашей целевой архитектуре: SCADA/OT-сегмент нельзя смешивать с обычным IT-мониторингом, и мониторинг должен быть пассивным со стороны IT. 

---

## Где нужны критические правки

### 1. Это не “готовые Zabbix templates”

Вот такие выражения:

```text
last(sessions)>{$1C.SESSIONS.CRIT}
avg(queue,5m)>{$1C.QUEUE.WARN}
nodata(job_last_run, 86400)=1
```

— это не нормальный современный синтаксис Zabbix. В актуальном синтаксисе выражение должно ссылаться на конкретный item вида:

```text
last(/host/key)>constant
min(/host/key,5m)>constant
```

Официальная документация Zabbix описывает простую форму как `function(/host/key,parameter)<operator><constant>`. ([Zabbix][1])

То есть надо заменить всё на реальные ключи:

```text
last(/Plant 1C App Server/1c.sessions.active)>{$1C.SESSIONS.CRIT}
avg(/Plant 1C App Server/1c.jobs.queue,5m)>{$1C.QUEUE.WARN}
```

А пока это **техническое ТЗ**, а не шаблон.

---

### 2. Veeam: `nodata()` использован неправильно

Вот это:

```text
Задание не запускалось > 24h | nodata(job_last_run, 86400)=1
```

опасно. `nodata()` проверяет, что item вообще не присылал данные. Но если item каждые 5 минут честно отдаёт старый timestamp последнего успешного бэкапа, `nodata()` не сработает.

Правильнее:

```text
now()-last(/veeam/veeam.job.last_success_ts[{#JOBNAME}])>{$VEEAM.BACKUP.AGE.CRIT}
```

или item сразу должен возвращать возраст в часах:

```text
last(/veeam/veeam.job.age.hours[{#JOBNAME}])>{$VEEAM.BACKUP.AGE.CRIT.HOURS}
```

В Operations-разделе это сформулировано правильно: важна не “зелёность job”, а факт, что последний успешный бэкап не старше RPO; зелёный статус задания не равен рабочему восстановимому бэкапу. 

Ещё поправка: официальный Zabbix integration page говорит про мониторинг **Veeam Backup Enterprise Manager** через REST API и script item, а не просто “любой Veeam B&R по порту 9419 без нюансов”. ([Zabbix][2]) Есть и шаблон `Veeam Backup and Replication by HTTP` в репозитории Zabbix для ветки 7.2, но это надо сверять с конкретной версией Veeam и наличием API. ([git.zabbix.com][3])

---

### 3. MSSQL: SQL для “длинных транзакций” слабый

Предложенный запрос:

```sql
SELECT COUNT(*) FROM sys.dm_exec_sessions 
WHERE transaction_isolation_level > 0 
AND last_request_start_time < DATEADD(second,-30,GETDATE())
```

не годится как индикатор длинной транзакции. `transaction_isolation_level > 0` не означает “есть открытая проблемная транзакция”. Это просто уровень изоляции сессии. Для blocking/locking Microsoft рекомендует смотреть `sys.dm_exec_requests.blocking_session_id`; `sys.dm_exec_requests` показывает активно выполняющиеся requests, а `sys.dm_exec_sessions` — все подключения, включая неактивные. ([Microsoft Learn][4])

Лучше разделить на три разных item:

```sql
-- blocked sessions
SELECT COUNT(*)
FROM sys.dm_exec_requests
WHERE blocking_session_id <> 0;

-- long running active requests
SELECT COUNT(*)
FROM sys.dm_exec_requests
WHERE start_time < DATEADD(second, -{$MSSQL.LONGREQ.SEC}, GETDATE());

-- open transactions
SELECT COUNT(*)
FROM sys.dm_exec_sessions
WHERE open_transaction_count > 0
  AND last_request_start_time < DATEADD(second, -{$MSSQL.LONGTRX.SEC}, GETDATE());
```

И уже потом делать разные триггеры: blocking, long request, open transaction. Не мешать всё в один “длинные транзакции”.

---

### 4. Exchange DAG: пороги слишком механические

Идея мониторить `CopyQueueLength`, `ReplayQueueLength`, Content Index и mounted/dismounted — правильная. Официальный шаблон Exchange действительно собирает метрики через Zabbix agent и его рекомендуют использовать вместе с `OS Windows by Zabbix agent`, потому что сам Exchange template не покрывает состояние Windows services. ([Zabbix][5])

Но `CopyQueueLength > 1` как Warning “всегда” — слишком шумный порог для завода. Microsoft описывает Copy Queue Length как количество log-файлов, ожидающих копирования на passive DB copy; для health-проверок database copy фигурирует условие copy queue length less than 10 logs. ([Microsoft Learn][6])

Я бы сделал так:

```text
CopyQueueLength > 10 for 5m      Warning/Average
CopyQueueLength > 50 for 10m     High
ReplayQueueLength > 50/100       зависит от DAG и lagged copies
DB copy status Failed/Suspended  High
Active DB dismounted             Disaster
Test-ReplicationHealth failed    High/Disaster по конкретному тесту
```

И обязательно различать active/passive copies и lagged copies, иначе будут ложные срабатывания.

---

### 5. 1С: база нормальная, но это самая “ручная” часть

Ссылки на `slothfk/1c_zabbix_template_ce` и `nikimaxim/zbx-1c-server` нормальные как отправная точка. Но `slothfk` прямо описан как шаблон для Zabbix 4.4, без релизов на GitHub, то есть это не “современный поддерживаемый официальный шаблон”. ([GitHub][7]) `nikimaxim/zbx-1c-server` ориентирован на 1C Server 8.3+ и требует поднятый RAS для мониторинга. ([GitHub][8])

Что нужно поправить:

* `rac`/`ras`-команды не гонять каждую минуту тяжёлыми скриптами на каждом item;
* лучше один collector-скрипт раз в 1–2 минуты собирает JSON, а Zabbix разбирает dependent items;
* для тяжёлых проверок использовать `zabbix_sender`/trapper, а не синхронные UserParameter;
* права `usr1cv8`, путь к `rac`, порт RAS, кластер, список infobase — всё вынести в macros;
* HASP/Sentinel мониторинг сначала надо конкретизировать: откуда именно берём “free licenses” — Sentinel Admin Control Center, лог 1С, API/утилита, file parser.

UserParameter в Zabbix — это команда, выполняемая агентом; она подчиняется timeout агента, и при превышении timeout процесс будет убит. ([Zabbix][9]) Поэтому длинные `rac session list`/PowerShell/лог-парсеры напрямую в item — путь к флапу и `ZBX_NOTSUPPORTED`.

---

### 6. UserGate: идея правильная, имена OID надо сверить по MIB

UserGate действительно поддерживает SNMP v2c/v3, SNMP queries и traps, а MIB-файлы скачиваются из консоли; в документации перечислены `UTM-MIB`, `UTM-TRAPS-MIB`, `UTM-TRAPS-BINDINGS-MIB`, `UTM-INTERFACES-MIB`. ([docs.usergate.com][10])

Но в тексте есть подозрительные имена:

```text
UTM-MIB::utmCpuLoad
UTM-MIB::utmMemUsed
UTM-MIB::utmSessions
```

В документации UserGate видны, например, `cpuLoad`, `memoryUsed`, `usersCounter`, а в trap bindings — `utmCPUUsage`, `utmMemory`, `utmSessions`. ([docs.usergate.com][10]) Поэтому перед шаблоном надо сделать не “по памяти”, а так:

```bash
snmpwalk -v3 ... UG_IP .1.3.6.1.4.1.45741
snmptranslate -Tz -m +UTM-MIB
```

И уже из реального MIB собрать LLD. Иначе получишь красивый шаблон, в котором половина items `not supported`.

---

## Самые опасные места в текущем тексте

### `Disaster` слишком часто используется

`rphost=0` может быть Disaster, если это единственный рабочий процесс. Но если rphost несколько, падение одного процесса — это не Disaster, а деградация. Disaster должен означать “бизнес-сервис лежит”, а не “компоненту плохо”. Это соответствует вашей severity-модели: Disaster — бизнес-сервис недоступен, High — сервис деградирует, Average/Warning — техническое внимание и тренды. 

### Нет service-level checks

Для 1С, Exchange, Veeam, UserGate тут много component checks, но мало проверок “пользователь реально может работать”. В roadmap правильно заложено: технические слои плюс business/synthetic checks — “документ проводится?”, “почта отправляется?”, “зарплата начислится?”. 

Без синтетики будет классическая ситуация: все серверы зелёные, а пользователи орут.

### Нет LLD-дизайна

Для MSSQL DB, Exchange DB copies, Veeam jobs, UserGate interfaces/VPN, 1C infobases нужно LLD. Ручной список items быстро сгниёт.

### Нет value maps

Нужны value maps для:

* Veeam job result;
* Exchange ContentIndexState;
* DB mounted/dismounted;
* UserGate HA state;
* service states;
* 1C cluster/rac status.

Без value maps дежурный увидит `2`, `3`, `0`, а не “Failed”, “Suspended”, “Healthy”.

---

## Как бы я это превратил в нормальный рабочий план

### Шаг 1. Переименовать документ честно

Не “готовые шаблоны”, а:

```text
Plant Monitoring Template Requirements v0.1
```

### Шаг 2. Для каждого шаблона добавить 6 обязательных полей

```text
Template name:
Supported Zabbix version:
Collection method:
Required agent/proxy/API permissions:
LLD rules:
Runbook URL:
```

### Шаг 3. Разделить items на 3 класса

```text
A. Official/native items — берём из официального шаблона
B. Custom lightweight items — можно UserParameter
C. Heavy collector items — только cached JSON / zabbix_sender / trapper
```

### Шаг 4. Для каждого триггера указать impact

Не просто:

```text
rphost down = Disaster
```

А:

```text
Condition: all rphost processes are down for 2m
Impact: 1C application service unavailable
Severity: Disaster
Runbook: /runbooks/1c-rphost-all-down
```

### Шаг 5. Завести пилотную волну

Я бы пилотировал в таком порядке:

1. **MSSQL** — официальный template + 3–5 custom SQL items.
2. **Veeam** — возраст последнего успешного бэкапа, свободное место в репозитории, упавшие задания.
3. **UserGate** — SNMP walk + базовые CPU/mem/interfaces/HA.
4. **Exchange** — официальный template + DAG custom PowerShell.
5. **1C** — самый тяжёлый, делать последним.
6. **SCADA bridge** — просто, но только после согласования с ИБ/АСУ ТП.

---

## Итог

**Да, направление правильное.** Такой набор шаблонов действительно закрывает основные больные зоны завода: 1С, БД, почту, бэкапы, периметр, OT-bridge.

Но в текущем виде это:

> **хороший design draft, не production implementation.**

Чтобы стало продом, нужно:

1. заменить псевдо-ключи на реальные Zabbix item keys;
2. переписать trigger expressions в актуальном синтаксисе;
3. убрать `nodata()` там, где нужен age check;
4. сделать LLD для DB/jobs/interfaces/tunnels/DB copies;
5. тяжелые проверки вынести в cached collectors/trapper;
6. снизить количество Disaster;
7. добавить runbook URL к каждому High+;
8. прогнать всё на пилоте 1–2 недели до массового раската.

Я бы это не выкидывал. Я бы взял как **скелет библиотеки `Plant:`-шаблонов**, но перед внедрением провёл бы технический hardening.

[1]: https://www.zabbix.com/documentation/current/en/manual/config/triggers/expression "2 Trigger expression"
[2]: https://www.zabbix.com/integrations/veeam "VEEAM monitoring and integration with Zabbix"
[3]: https://git.zabbix.com/projects/ZBX/repos/zabbix/browse/templates/app/veeam/backup_replication_http?at=release%2F7.2 "Veeam Backup and Replication by HTTP"
[4]: https://learn.microsoft.com/en-us/troubleshoot/sql/database-engine/performance/understand-resolve-blocking "Understand and resolve SQL Server blocking problems"
[5]: https://www.zabbix.com/integrations/ms_exchange "MS Exchange monitoring and integration with Zabbix"
[6]: https://learn.microsoft.com/en-us/exchange/high-availability/manage-ha/configure-db-properties "Configure mailbox database copy properties"
[7]: https://github.com/slothfk/1c_zabbix_template_ce "slothfk/1c_zabbix_template_ce: Шаблон Zabbix для ..."
[8]: https://github.com/nikimaxim/zbx-1c-server "nikimaxim/zbx-1c-server: Zabbix template for monitoring ..."
[9]: https://www.zabbix.com/documentation/8.0/en/manual/config/items/userparameters "5 User parameters"
[10]: https://docs.usergate.com/snmp_169.html "SNMP - UserGate :: Портал документации"


---

## Связь с остальными главами

- [Глава 13 — Template requirements](13_template_requirements.md): этот документ — критика конкретно главы 13
- [Глава 7 — Roadmap](07_implementation_roadmap.md): пилоты привязываются к фазе 2/3 roadmap'а
- [Глава 12 — Операционка](12_operations.md): пилоты идут через нормальный change-process с maintenance windows
