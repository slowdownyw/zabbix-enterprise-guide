!!! info "Статус: Reference draft"
    Глоссарий фиксирует язык книги. Это не официальный словарь Zabbix и не замена документации, а прикладная карта терминов: что термин значит именно в этой методике и где читать подробнее.

# Глоссарий

## Официальные термины Zabbix: EN / RU / язык книги

Zabbix имеет официальную русскую локализацию документации и интерфейса. Часть её терминов отличается от живого языка инженерного сообщества: в документации написано «узел сети», в разговоре чаще говорят «хост». В таблице ниже разделены три слоя: английский термин, официальный русский вариант и форма, которую книга использует в основном тексте для краткости и простоты.

| Английский термин | Официальный русский | В книге |
|---|---|---|
| Host | Узел сети | хост |
| Host group | Группа узлов сети | группа хостов / host group |
| Host prototype | Прототип узла сети | прототип хоста / host prototype |
| Item | Элемент данных | item / элемент данных / метрика по контексту |
| Item prototype | Прототип элемента данных | item prototype / прототип элемента данных |
| Trigger | Триггер | триггер |
| Trigger prototype | Прототип триггера | trigger prototype / прототип триггера |
| Problem | Проблема | problem / проблема |
| Template | Шаблон | шаблон |
| Discovery rule | Правило обнаружения | LLD rule / правило LLD |
| Action | Действие | action / действие |
| Media type | Тип оповещения | media type / канал оповещения |
| User macro | Пользовательский макрос | user macro / пользовательский макрос |
| Maintenance window | Окно обслуживания | maintenance window / окно обслуживания |
| Service (Zabbix Services / SLA) | Услуга | услуга / service object |
| Service (Linux/Windows) | Служба | служба |
| Service (бизнес-смысл) | Сервис | сервис |
| Map | Карта сети | карта / network map |
| User role | Роль пользователя | роль пользователя |
| Audit log | Журнал аудита | audit log / журнал аудита |

---

Термины сгруппированы по смыслу, а не по алфавиту. Если читаете книгу впервые, полезнее идти от сервисной модели к событиям, шаблонам, архитектуре и эксплуатации.

---

## Базовая модель

| Термин | Коротко | Где читать |
|---|---|---|
| **Мониторинг** | Не набор графиков, а эксплуатационная функция: сбор данных, хранение, корреляция, визуализация, алертинг, реагирование и улучшение шаблонов после инцидентов. | [Манифест](00_manifesto.md), [Архитектура](06_architecture.md), [Операционка](12_operations.md) |
| **Метрика** | Измеряемое значение: загрузка CPU, возраст бэкапа, число сессий, статус проверки. Метрика сама по себе ещё не алерт. | [Сервис, а не хост](01_service_not_host.md), [Severity](02_severity_model.md) |
| **Item** | Объект Zabbix, который собирает одну метрику или состояние. | [LLD](04_lld_and_prototypes.md), [Требования к шаблонам](13_template_requirements.md) |
| **Trigger** | Правило, которое превращает метрику в проблемное состояние. В зрелой модели trigger должен не только “краснеть”, но и нести смысл через severity, теги и runbook. | [Severity](02_severity_model.md), [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **Alert** | Уведомление человеку или системе. Не каждое problem event обязано быть активным alert. | [Severity](02_severity_model.md), [Операционка](12_operations.md) |
| **Event** | Событие Zabbix: факт изменения состояния, например переход trigger в PROBLEM или OK. | [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **Problem event** | Событие PROBLEM, с которым работает дежурный: что сломалось, где, чей сервис, какой impact и что делать. | [Многоуровневая модель](05_layered_design.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Recovery event** | Событие восстановления. Важно для recovery notification, auto-close тикетов и расчёта времени восстановления. | [Многоуровневая модель](05_layered_design.md), [Операционка](12_operations.md) |
| **Host** | Объект мониторинга в Zabbix. Это может быть сервер, сетевое устройство, proxy, виртуальный объект или синтетическая точка проверки. | [Сервис, а не хост](01_service_not_host.md), [Теги](03_tags_and_groups.md) |
| **Service** | Бизнес-смысл, ради которого существуют компоненты: 1С, почта, файловые шары, печать, SCADA-контур. Сервис не равен одному хосту. | [Сервис, а не хост](01_service_not_host.md), [SLA](10_sla_service_catalog.md) |
| **Business service** | Сервис глазами пользователя или бизнеса: “можно провести документ”, “почта отправляется”, “производственный контур виден”. | [Сервис, а не хост](01_service_not_host.md), [Дашборды](11_dashboards_reporting.md) |
| **Component** | Техническая часть сервиса: БД, IIS, rphost, лицензии HASP, очередь, сетевой линк. | [Сервис, а не хост](01_service_not_host.md), [Многоуровневая модель](05_layered_design.md) |
| **Resource** | Низкоуровневый ресурс: CPU, RAM, диск, интерфейс, процесс. Ресурс важен, но не всегда означает влияние на сервис. | [Сервис, а не хост](01_service_not_host.md), [Severity](02_severity_model.md) |
| **Synthetic check** | Проверка пользовательского пути: логин, открытие страницы, отправка письма, запись/чтение файла. Ловит проблемы, которых не видно по отдельным компонентам. | [Сервис, а не хост](01_service_not_host.md), [Roadmap](07_implementation_roadmap.md) |
| **E2E-проверка** | End-to-end сценарий, проверяющий сервис целиком с точки зрения пользователя. | [Сервис, а не хост](01_service_not_host.md), [Roadmap](07_implementation_roadmap.md) |
| **Сервисная модель** | Способ описать мониторинг вокруг бизнес-сервисов, а не вокруг списка серверов. | [Сервис, а не хост](01_service_not_host.md), [SLA](10_sla_service_catalog.md) |
| **Сервисный каталог** | Список сервисов, владельцев, часов работы, критичности, зависимостей и целевых уровней доступности. | [SLA](10_sla_service_catalog.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Service owner** | Владелец сервиса: человек или роль, которые принимают бизнес-смысл, критичность и правила реакции. | [SLA](10_sla_service_catalog.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Monitoring owner** | Владелец мониторинга как продукта: отвечает за правила, качество модели, развитие и эксплуатационную дисциплину. | [Implementation Playbook](16_implementation_playbook.md), [Roadmap](07_implementation_roadmap.md) |

---

## Severity, события и реакция

| Термин | Коротко | Где читать |
|---|---|---|
| **Severity** | Не “насколько страшно”, а какое действие требуется и за какое время. | [Severity](02_severity_model.md), [Roadmap](07_implementation_roadmap.md) |
| **Disaster** | Бизнес-сервис недоступен или есть критичный пользовательский impact. Требует немедленной реакции, звонка/эскалации и runbook. | [Severity](02_severity_model.md), [Anti-patterns](15_antipatterns.md) |
| **High** | Сервис деградирует или скоро ляжет, если не вмешаться. Требует активного уведомления и реакции в ограниченное время. | [Severity](02_severity_model.md), [Runbooks](09_runbooks.md) |
| **Average** | Требует плановой реакции, но не должен будить команду ночью. Часто уходит в тикет или рабочий канал. | [Severity](02_severity_model.md) |
| **Warning** | Превентивный сигнал или тренд. Обычно дашборд/плановая работа, а не активный алерт. | [Severity](02_severity_model.md), [Операционка](12_operations.md) |
| **Information** | Событие, которое полезно знать, но на которое не реагируют как на инцидент. | [Severity](02_severity_model.md) |
| **Impact** | Влияние проблемы на сервис: outage, degradation, capacity risk, data loss risk. Часто фиксируется тегом. | [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **Scope** | Тип проблемы: availability, performance, capacity, backup, security, quality. | [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **Усталость от алертов** (Alert fatigue) | Состояние, когда алертов так много, что команда перестаёт им доверять и пропускает реальный инцидент. | [Severity](02_severity_model.md), [Операционка](12_operations.md), [Anti-patterns](15_antipatterns.md) |
| **Disaster inflation** | Ситуация, когда слишком много триггеров имеют severity Disaster, и настоящий Disaster теряется в шуме. | [Severity](02_severity_model.md), [Anti-patterns](15_antipatterns.md) |
| **Silent mode** | Крайность, когда уведомления выключены или игнорируются, и команда узнаёт о проблемах от пользователей. | [Severity](02_severity_model.md) |
| **Action** | Правило Zabbix, которое решает, кому и куда отправить уведомление или какую операцию выполнить. | [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **Operation** | Конкретное действие внутри Action: отправить сообщение через media type, выполнить remote command. Webhook в Zabbix реализуется как media type/интеграция и вызывается через операцию отправки сообщения. | [Многоуровневая модель](05_layered_design.md), [Roadmap](07_implementation_roadmap.md) |
| **Recovery operation** | Действие при восстановлении: уведомить о RESOLVED, закрыть тикет, обновить статус. | [Многоуровневая модель](05_layered_design.md), [Операционка](12_operations.md) |
| **Escalation** | Передача инцидента дальше по цепочке: L1, L2, профильная команда, руководитель. | [Архитектура](06_architecture.md), [Операционка](12_operations.md) |
| **Escalation matrix** | Документированная схема: кто получает P1/P2, через сколько минут, кто резервный контакт. | [Операционка](12_operations.md), [Implementation Playbook](16_implementation_playbook.md) |
| **L1 / L2** | Уровни поддержки. L1 — дежурный/NOC: первичное реагирование, диагностика по runbook. L2 — профильный инженер: разбор корневых причин, нестандартные случаи. | [Runbooks](09_runbooks.md), [Операционка](12_operations.md) |
| **Дежурство** (On-call) | Дежурство или роль, которая обязана реагировать на активные уведомления. | [Runbooks](09_runbooks.md), [Операционка](12_operations.md) |
| **NOC** | Операционный центр или дежурная функция, которая смотрит активные проблемы, подтверждает события и эскалирует. | [Дашборды](11_dashboards_reporting.md), [Операционка](12_operations.md) |
| **Acknowledge** | Подтверждение, что событие взято в работу. Не равно исправлению проблемы. | [Дашборды](11_dashboards_reporting.md), [Операционка](12_operations.md) |
| **Auto-resolve** | Событие восстановилось само. Полезно для анализа шума и проверки, были ли реальные действия. | [Дашборды](11_dashboards_reporting.md), [Операционка](12_operations.md) |
| **Flapping** | Частое переключение OK/PROBLEM. Требует hysteresis, задержек, коррекции порогов или другой логики trigger. | [Roadmap](07_implementation_roadmap.md), [Операционка](12_operations.md) |
| **Hysteresis** | Разные условия входа в проблему и выхода из неё, чтобы trigger не “дребезжал”. | [Roadmap](07_implementation_roadmap.md), [Требования к шаблонам](13_template_requirements.md) |
| **Trigger dependency** | Зависимость между триггерами, позволяющая подавлять дочерние симптомы при корневой проблеме. | [Сервис, а не хост](01_service_not_host.md), [Roadmap](07_implementation_roadmap.md) |
| **Correlation** | Объединение или подавление связанных событий, чтобы вместо каскада симптомов получить управляемую картину. | [Манифест](00_manifesto.md), [Архитектура](06_architecture.md), [Теги](03_tags_and_groups.md) |
| **Noise ratio** | Доля шумовых, бесполезных или самовосстанавливающихся алертов. Используется в регулярном alert review. | [Операционка](12_operations.md), [Дашборды](11_dashboards_reporting.md) |
| **Alert hygiene** | Регулярная дисциплина чистки шумных триггеров, проверки severity, runbook coverage и маршрутизации. | [Операционка](12_operations.md), [Дашборды](11_dashboards_reporting.md) |
| **Еженедельный разбор алертов** (Weekly alert review) | Регулярная короткая встреча, где разбирают топ шумовых триггеров, пропуски runbook и качество реакции. | [Операционка](12_operations.md), [Implementation Playbook](16_implementation_playbook.md) |

---

## Теги, группы и смысл события

| Термин | Коротко | Где читать |
|---|---|---|
| **Tag** | Метаданные Zabbix, которые дают событию смысл: сервис, владелец, среда, компонент, тип проблемы. | [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **Tag schema** | Документированный набор обязательных тегов, уровней размещения и разрешённых значений. | [Теги](03_tags_and_groups.md), [ADR tag schema](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-003-tag-schema.md) |
| **Mandatory tags** | Минимальный набор тегов, без которого host/event нельзя считать управляемым. | [Теги](03_tags_and_groups.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Allowed values** | Разрешённые значения тегов, чтобы не получить `1c`, `1c-erp`, `ERP-1C` как разные сервисы. | [Теги](03_tags_and_groups.md), [examples/tag-schema.yaml](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/tag-schema.yaml) |
| **Host tag** | Тег на уровне host: кто объект, чей он, где расположен, какой сервис обслуживает. | [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **Item tag** | Тег на уровне item: что измеряется, например filesystem, rphost, backup age. | [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **Trigger tag** | Тег на уровне trigger: что произошло и как реагировать: scope, component, impact, notification, runbook. | [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **Prototype tag** | Тег, заданный на prototype, чтобы discovered item/trigger сразу наследовал правильный смысл. | [LLD](04_lld_and_prototypes.md), [Теги](03_tags_and_groups.md) |
| **Event tag `service`** | Методический тег события (`service=<name>`), связывающий объект или событие с бизнес-сервисом. Используется для dashboards, routing и фильтрации. | [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **Zabbix Service tag** | Тег, настраиваемый непосредственно на объекте типа **Service** в Zabbix (раздел Services). Используется для сопоставления SLA и сервисных правил; не то же самое, что event tag `service=` на хосте/триггере. | [SLA](10_sla_service_catalog.md), [Теги](03_tags_and_groups.md) |
| **env** | Среда хоста: prod, test, dev, dr. `dr` — площадка аварийного восстановления (Disaster Recovery site). Нужна для фильтрации, routing и maintenance windows. | [Теги](03_tags_and_groups.md), [Roadmap](07_implementation_roadmap.md) |
| **location** | Площадка или логическое место: dc-main, plant-main, remote-site. | [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **segment** | Сетевой или организационный сегмент: it, ot, dmz, cloud. Влияет на права, безопасность и архитектуру proxy. | [Теги](03_tags_and_groups.md), [Архитектура](06_architecture.md) |
| **owner** | Команда или роль, которая отвечает за сервис/компонент. | [Теги](03_tags_and_groups.md), [Implementation Playbook](16_implementation_playbook.md) |
| **criticality** | Критичность сервиса или объекта, обычно P1/P2/P3/P4. Не должна заменять severity. | [Теги](03_tags_and_groups.md), [Roadmap](07_implementation_roadmap.md) |
| **os_family** | Семейство ОС, полезное для фильтрации, шаблонов, отчётности и инвентаризации. | [Теги](03_tags_and_groups.md), [Roadmap](07_implementation_roadmap.md) |
| **role** | Роль хоста: 1c-app, mssql, proxy, web, db. Не равна бизнес-сервису. | [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **notification** | Тег, который определяет активность уведомления: active, passive, dashboard-only и т.п. | [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **Host group** | Группа объектов мониторинга: официально «группа узлов сети», в книге часто «группа хостов». В этой методике нужна для RBAC и грубой технической навигации, а не для сервисного каталога. | [Теги](03_tags_and_groups.md), [Roadmap](07_implementation_roadmap.md) |
| **RBAC** | Role-Based Access Control: кто что видит и кто что может менять. В Zabbix во многом опирается на host groups. | [Теги](03_tags_and_groups.md), [Roadmap](07_implementation_roadmap.md) |
| **Business view** | Представление сервисов для бизнеса: статус, SLA, impact, без низкоуровневого шума. | [Сервис, а не хост](01_service_not_host.md), [Дашборды](11_dashboards_reporting.md) |
| **Service tree** | Дерево бизнес-сервисов и зависимостей, через которое можно показывать статус сервиса, а не отдельных хостов. | [Многоуровневая модель](05_layered_design.md), [SLA](10_sla_service_catalog.md) |
| **Event context** | Полный набор данных в событии: service, owner, env, component, impact, runbook, location. | [Многоуровневая модель](05_layered_design.md), [Теги](03_tags_and_groups.md) |
| **Tag-based routing** | Маршрутизация уведомлений по тегам события, а не по имени host group или trigger. | [Теги](03_tags_and_groups.md), [Многоуровневая модель](05_layered_design.md) |
| **Maintenance by tags** | Подавление конкретного типа проблем через теги. Maintenance задаётся на hosts/host groups, а теги используются как фильтр подавления проблем внутри заданной области. | [Теги](03_tags_and_groups.md), [Операционка](12_operations.md) |

---

## Шаблоны, LLD и композиция

| Термин | Коротко | Где читать |
|---|---|---|
| **Template** | Шаблон Zabbix: набор items, triggers, LLD, macros, tags и правил для класса объектов. | [Многоуровневая модель](05_layered_design.md), [Требования к шаблонам](13_template_requirements.md) |
| **Linked template** | Шаблон, привязанный к host или другому template. В Zabbix композиция строится через набор linked templates. | [Многоуровневая модель](05_layered_design.md) |
| **Template composition** | Подход “несколько узких шаблонов на host”, а не один монолитный шаблон на всё. | [Многоуровневая модель](05_layered_design.md), [ADR composition](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-004-template-composition-model.md) |
| **Base template** | Шаблон базового слоя: ОС, агент, сеть, инфраструктурные ресурсы. | [Многоуровневая модель](05_layered_design.md), [Требования к шаблонам](13_template_requirements.md) |
| **Role template** | Шаблон роли хоста: например MSSQL Server, 1C App Node, Exchange DAG member. | [Многоуровневая модель](05_layered_design.md), [ADR composition](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-004-template-composition-model.md) |
| **Application template** | Шаблон прикладных метрик, которые описывают работу приложения или сервиса. | [Многоуровневая модель](05_layered_design.md), [Требования к шаблонам](13_template_requirements.md) |
| **Synthetic template** | Шаблон пользовательского сценария: логин, письмо, веб-путь, файл. | [Сервис, а не хост](01_service_not_host.md), [Многоуровневая модель](05_layered_design.md) |
| **Common Policy template** | Узкий шаблон политик: conventions, macros, общие технические теги. Не место для случайных items. | [Многоуровневая модель](05_layered_design.md) |
| **Agent Health template** | Шаблон проверки самого агента: доступность, свежесть активных checks, версия. | [Многоуровневая модель](05_layered_design.md), [Операционка](12_operations.md) |
| **Self-monitoring** | Мониторинг самого Zabbix и его компонентов. Должен быть отдельным контуром, потому что слепота мониторинга критична. | [Многоуровневая модель](05_layered_design.md), [Операционка](12_operations.md), [Anti-patterns](15_antipatterns.md) |
| **Monolithic template** | Антипаттерн: один шаблон, куда складывают ОС, приложение, БД, синтетику и исключения. | [Многоуровневая модель](05_layered_design.md), [Anti-patterns](15_antipatterns.md) |
| **LLD** | Low-Level Discovery: автообнаружение сущностей внутри host и создание items/triggers по prototype. | [LLD](04_lld_and_prototypes.md), [Требования к шаблонам](13_template_requirements.md) |
| **Discovery rule** | Правило LLD, которое возвращает найденные сущности: диски, интерфейсы, БД, очереди, сервисы. | [LLD](04_lld_and_prototypes.md), [Требования к шаблонам](13_template_requirements.md) |
| **Prototype** | Заготовка объекта, из которой LLD создаёт конкретные items, triggers, graphs. | [LLD](04_lld_and_prototypes.md) |
| **Item prototype** | Заготовка item для каждой найденной сущности. | [LLD](04_lld_and_prototypes.md), [Теги](03_tags_and_groups.md) |
| **Trigger prototype** | Заготовка trigger для каждой найденной сущности. Ошибка в prototype размножается на сотни объектов. | [LLD](04_lld_and_prototypes.md), [Требования к шаблонам](13_template_requirements.md) |
| **LLD filter** | Фильтр, ограничивающий, какие найденные сущности создавать. Без фильтров LLD может создать мусор и нагрузку. | [LLD](04_lld_and_prototypes.md), [Anti-patterns](15_antipatterns.md) |
| **LLD lifecycle policy** | Правила, что делать с исчезнувшими discovered objects: удалять, disable, держать history. | [LLD](04_lld_and_prototypes.md), [Требования к шаблонам](13_template_requirements.md) |
| **Discovered item/trigger** | Конкретный item или trigger, созданный из prototype. | [LLD](04_lld_and_prototypes.md), [Теги](03_tags_and_groups.md) |
| **Macro** | Переменная Zabbix для порогов, URL, настроек шаблона и переиспользования. | [Многоуровневая модель](05_layered_design.md), [Требования к шаблонам](13_template_requirements.md) |
| **Value mapping** | Преобразование числовых/строковых значений в понятные статусы. Критично для шаблонов и trigger expressions. | [Требования к шаблонам](13_template_requirements.md), [examples/triggers](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/triggers/README.md) |
| **Preprocessing** | Подготовка данных item перед хранением и trigger evaluation: JSONPath, regex, преобразования, dependent items. | [Требования к шаблонам](13_template_requirements.md) |
| **Dependent item** | Item, который получает значение из master item через preprocessing. Удобно для API/JSON и тяжёлых запросов. | [Требования к шаблонам](13_template_requirements.md) |
| **UserParameter** | Пользовательский ключ агента Zabbix, который запускает локальный скрипт или команду. | [Требования к шаблонам](13_template_requirements.md), [examples/userparameters](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/userparameters/README.md) |
| **Trigger expression** | Выражение Zabbix, определяющее PROBLEM/OK. Должно быть валидировано под реальные keys и версии Zabbix. | [Требования к шаблонам](13_template_requirements.md), [examples/triggers](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/triggers/README.md) |
| **Runbook URL** | Ссылка на инструкцию, хранящаяся в поле **Menu entry URL** триггера; в уведомлениях доступна через макрос `{TRIGGER.URL}`. | [Severity](02_severity_model.md), [Runbooks](09_runbooks.md), [Многоуровневая модель](05_layered_design.md) |

---

## Архитектура и развёртывание

| Термин | Коротко | Где читать |
|---|---|---|
| **Zabbix server** | Центральный компонент, который принимает данные, считает trigger, хранит конфигурацию и управляет событиями. | [Архитектура](06_architecture.md), [ADR deployment](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-001-deployment-model.md) |
| **Zabbix frontend** | Веб-интерфейс Zabbix. Может жить вместе с server или отдельно. | [Архитектура](06_architecture.md), [ADR deployment](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-001-deployment-model.md) |
| **Zabbix proxy** | Промежуточный сборщик для площадок, DMZ, удалённых сегментов и OT-граничных зон. Даёт буферизацию и снижает связность. | [Архитектура](06_architecture.md), [Roadmap](07_implementation_roadmap.md) |
| **Active proxy** | Proxy сам отправляет данные на server. Часто удобнее для firewall и удалённых площадок. | [Архитектура](06_architecture.md), [ADR deployment](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-001-deployment-model.md) |
| **Active agent** | Агент сам забирает список checks и отправляет данные. Удобен для сегментированных сетей. | [Архитектура](06_architecture.md), [ADR agent mode](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-002-agent-mode-and-encryption.md) |
| **Passive agent** | Zabbix server/proxy сам опрашивает agent. Требует доступности agent по сети. | [ADR agent mode](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-002-agent-mode-and-encryption.md), [Roadmap](07_implementation_roadmap.md) |
| **PSK** | Pre-shared key для TLS-шифрования agent/proxy connections. Практичный baseline безопасности. | [Roadmap](07_implementation_roadmap.md), [ADR agent mode](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-002-agent-mode-and-encryption.md) |
| **TLS-сертификаты** | Более строгая модель шифрования, обычно требует внутреннего CA и зрелой эксплуатации сертификатов. | [Roadmap](07_implementation_roadmap.md), [ADR agent mode](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-002-agent-mode-and-encryption.md) |
| **CA** | Certificate Authority — удостоверяющий центр, выпускающий TLS-сертификаты. Требуется при шифровании соединений agent/proxy через TLS с сертификатами. | [Roadmap](07_implementation_roadmap.md), [ADR agent mode](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-002-agent-mode-and-encryption.md) |
| **DMZ** | Сегмент между доверенными и недоверенными зонами. Часто место для proxy или интеграционных точек. | [Архитектура](06_architecture.md), [Implementation Playbook](16_implementation_playbook.md) |
| **DC** | Data Center — площадка или здание, где размещена инфраструктура. В тег-схеме используется как значение тега location (например, dc-main, dc-dr). | [Теги](03_tags_and_groups.md), [Архитектура](06_architecture.md) |
| **DR** | Disaster Recovery site — резервная площадка для аварийного восстановления. В тег-схеме: env=dr, location=dc-dr. Связан с метриками RPO/RTO. | [Теги](03_tags_and_groups.md), [Roadmap](07_implementation_roadmap.md) |
| **OT** | Operational Technology: промышленный контур, где активное вмешательство и сканирование могут быть опасны. | [Манифест](00_manifesto.md), [Архитектура](06_architecture.md), [Implementation Playbook](16_implementation_playbook.md) |
| **SCADA** | Системы диспетчерского управления и сбора данных. В книге рассматриваются как осторожный, часто read-only контур мониторинга. | [Манифест](00_manifesto.md), [Архитектура](06_architecture.md), [Требования к шаблонам](13_template_requirements.md) |
| **КИИ** | Критическая информационная инфраструктура. В книге важна как архитектурное ограничение: нельзя “просто поставить агент”. | [Манифест](00_manifesto.md), [Архитектура](06_architecture.md) |
| **Read-only monitoring** | Модель мониторинга без установки агента и без выполнения команд на целевой системе. Конкретные методы (ICMP/TCP, SNMP, read-only API) остаются активными проверками и согласуются с ИБ/владельцем отдельно. | [Архитектура](06_architecture.md), [Требования к шаблонам](13_template_requirements.md) |
| **Passive discovery** | Обнаружение через пассивный анализ трафика или read-only источники, особенно в OT/SCADA. | [Roadmap](07_implementation_roadmap.md), [Implementation Playbook](16_implementation_playbook.md) |
| **HA** | High availability. Полезна, но не исправляет плохую модель тегов, шаблонов и реакции. | [Архитектура](06_architecture.md), [ADR deployment](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-001-deployment-model.md) |
| **PostgreSQL для Zabbix** | Часто предпочтительный выбор для зрелой/крупной инсталляции при наличии компетенций: хорошо работает с партиционированием и контролем history/trends. | [Архитектура](06_architecture.md), [Roadmap](07_implementation_roadmap.md) |
| **Partitioning** | Партиционирование таблиц history/trends, чтобы БД не разрасталась в неуправляемый монолит. В Zabbix 6/7 с PostgreSQL возможны три подхода: ручное партиционирование, TimescaleDB (hypertables/compression) и штатный housekeeping — выбор зависит от NVPS и компетенций. | [Roadmap](07_implementation_roadmap.md), [Anti-patterns](15_antipatterns.md) |
| **Housekeeping** | Механизм очистки истории в Zabbix. В больших инсталляциях часто требует пересмотра: при TimescaleDB/партиционировании штатный housekeeping настраивается или отключается отдельно. | [Roadmap](07_implementation_roadmap.md), [Операционка](12_operations.md) |
| **History** | Сырые значения метрик за короткий/средний период. | [Roadmap](07_implementation_roadmap.md), [ADR retention](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-005-retention-and-sizing-baseline.md) |
| **Trends** | Агрегированные значения для долгосрочного хранения и отчётности. | [Roadmap](07_implementation_roadmap.md), [ADR retention](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-005-retention-and-sizing-baseline.md) |
| **NVPS** | New values per second: поток новых значений в Zabbix. Важен для sizing server и БД. | [Roadmap](07_implementation_roadmap.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Sizing** | Оценка нагрузки, ресурсов, БД, proxy, history/trends, LLD и числа checks до внедрения. | [Implementation Playbook](16_implementation_playbook.md), [ADR retention](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-005-retention-and-sizing-baseline.md) |
| **Планирование ёмкости** (Capacity planning) | Регулярное прогнозирование ресурсов: диски, CPU, лицензии, БД, каналы, рост items. | [Операционка](12_operations.md), [Дашборды](11_dashboards_reporting.md) |

---

## Эксплуатация, runbooks и отчётность

| Термин | Коротко | Где читать |
|---|---|---|
| **Runbook** | Пошаговая инструкция “что делать, если сработал этот конкретный alert”. Не архитектурная статья и не общий мануал. | [Runbooks](09_runbooks.md), [Severity](02_severity_model.md) |
| **TL;DR runbook** | Первые строки runbook, которые закрывают 80% ночных случаев и читаются в стрессе. | [Runbooks](09_runbooks.md), [Манифест](00_manifesto.md) |
| **Runbook coverage** | Доля High/Disaster alerts, у которых есть рабочая ссылка на runbook. | [Runbooks](09_runbooks.md), [Дашборды](11_dashboards_reporting.md) |
| **Known error** | Известная проблема с описанным workaround или устойчивым способом диагностики. | [Runbooks](09_runbooks.md), [Архитектура](06_architecture.md) |
| **Postmortem** | Разбор инцидента после восстановления: timeline, root cause, impact, action items. | [Архитектура](06_architecture.md), [Операционка](12_operations.md) |
| **Blameless postmortem** | Постмортем без поиска виноватого: цель — улучшить систему, runbooks, thresholds, шаблоны и процессы. | [Архитектура](06_architecture.md), [Операционка](12_operations.md) |
| **Задача / Пункт плана** (Action item) | Конкретное улучшение после инцидента: владелец, срок, проверяемый результат. | [Операционка](12_operations.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Maintenance window** | Плановое окно, в котором часть alerting подавляется или меняет правила реакции. | [Операционка](12_operations.md), [Теги](03_tags_and_groups.md) |
| **Календарь заморозки** (Freeze calendar) | Периоды, когда изменения запрещены или ограничены: закрытие месяца, производственный пик, годовой баланс. | [Операционка](12_operations.md), [SLA](10_sla_service_catalog.md) |
| **Change request** | Формальная заявка на изменение, часто связанная с maintenance window и ServiceDesk. | [Операционка](12_operations.md), [GitOps](08_gitops_for_zabbix.md) |
| **ServiceDesk / ITSM** | Система учёта инцидентов, изменений и SLA. Zabbix создаёт сигнал, ITSM хранит процесс. | [Roadmap](07_implementation_roadmap.md), [Implementation Playbook](16_implementation_playbook.md) |
| **ITIL** | IT Infrastructure Library — набор практик по управлению IT-услугами. В книге — ориентир для incident management, change control, SLA и сервисного каталога. | [SLA](10_sla_service_catalog.md), [Операционка](12_operations.md) |
| **CMDB** | Configuration Management Database — база данных конфигурационных единиц инфраструктуры. Zabbix может выступать источником данных для CMDB или синхронизироваться с ней через API. | [Implementation Playbook](16_implementation_playbook.md), [Roadmap](07_implementation_roadmap.md) |
| **Ticket** | Запись инцидента или задачи в ITSM. Не все alerts должны становиться тикетами. | [Теги](03_tags_and_groups.md), [Roadmap](07_implementation_roadmap.md) |
| **Auto-close** | Автоматическое закрытие или перевод тикета при recovery event. Требует аккуратной интеграции. | [Roadmap](07_implementation_roadmap.md), [Операционка](12_operations.md) |
| **SLA** | Service Level Agreement: договорённость с бизнесом о доступности или качестве сервиса. Нельзя подписывать без данных. | [SLA](10_sla_service_catalog.md), [Манифест](00_manifesto.md) |
| **SLO** | Service Level Objective: внутренняя цель ИТ, часто предшествует SLA. | [SLA](10_sla_service_catalog.md), [Roadmap](07_implementation_roadmap.md) |
| **SLI** | Service Level Indicator: конкретная измеряемая метрика, из которой считается SLO/SLA. | [SLA](10_sla_service_catalog.md), [Roadmap](07_implementation_roadmap.md) |
| **OLA** | Operational Level Agreement: договорённость между ИТ-командами. | [SLA](10_sla_service_catalog.md) |
| **UC** | Underpinning Contract: договор с внешним поставщиком, поддерживающий SLA. | [SLA](10_sla_service_catalog.md) |
| **Service hours** | Часы, в которые сервис обязан работать по SLO/SLA. Без них процент доступности бессмысленен. | [SLA](10_sla_service_catalog.md) |
| **Maintenance exclusion** | Исключение плановых работ из расчёта SLA, если это согласовано заранее. | [SLA](10_sla_service_catalog.md), [Операционка](12_operations.md) |
| **MTTR** | Mean Time To Recovery/Repair: среднее время восстановления после инцидента. | [Дашборды](11_dashboards_reporting.md), [Операционка](12_operations.md) |
| **MTBF** | Mean Time Between Failures: средний интервал между сбоями. | [Дашборды](11_dashboards_reporting.md), [Операционка](12_operations.md) |
| **RPO** | Recovery Point Objective: допустимая потеря данных по времени. Важен для backup monitoring. | [Операционка](12_operations.md), [SLA](10_sla_service_catalog.md) |
| **RTO** | Recovery Time Objective: целевое время восстановления сервиса. | [Операционка](12_operations.md), [SLA](10_sla_service_catalog.md) |
| **Dashboard** | Витрина мониторинга для конкретной аудитории и действия. Не “все графики на одном экране”. | [Дашборды](11_dashboards_reporting.md), [Anti-patterns](15_antipatterns.md) |
| **NOC dashboard** | Экран для дежурного: что горит сейчас, что подтверждать, куда эскалировать. | [Дашборды](11_dashboards_reporting.md), [Операционка](12_operations.md) |
| **Per-service dashboard** | Дашборд одного бизнес-сервиса, фильтруемый по `service=` и смежным тегам. | [Дашборды](11_dashboards_reporting.md), [Теги](03_tags_and_groups.md) |
| **Executive dashboard** | Представление для руководства: статус сервисов, SLA, риски, без технического шума. | [Дашборды](11_dashboards_reporting.md), [SLA](10_sla_service_catalog.md) |
| **Report** | Периодическая сводка: daily NOC, weekly operations, monthly SLA, quarterly capacity. | [Дашборды](11_dashboards_reporting.md), [Операционка](12_operations.md) |
| **Audience** | Конкретный пользователь дашборда или отчёта. Без аудитории дашборд становится шумом. | [Дашборды](11_dashboards_reporting.md) |
| **Refresh rate** | Частота обновления дашборда/отчёта. Для NOC и CIO нужны разные скорости. | [Дашборды](11_dashboards_reporting.md) |

---

## Проект, GitOps и управление изменениями

| Термин | Коротко | Где читать |
|---|---|---|
| **Discovery** | Фаза инвентаризации: что есть, что мониторится, где gaps, кто владельцы, какие события шумят. | [Roadmap](07_implementation_roadmap.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Пробел / Зона непокрытия** (Gap) | Разрыв между тем, что должно мониториться, и тем, что реально покрыто. | [Roadmap](07_implementation_roadmap.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Coverage** | Доля хостов, сервисов или проверок, покрытых мониторингом и обязательными тегами. | [Roadmap](07_implementation_roadmap.md), [Дашборды](11_dashboards_reporting.md) |
| **Pilot** | Ограниченное внедрение на выбранном сервисе/площадке для проверки модели до rollout. | [Roadmap](07_implementation_roadmap.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Rollout** | Раскатка изменений волнами после pilot. | [Roadmap](07_implementation_roadmap.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Wave** | Одна волна rollout: ограниченный набор хостов/сервисов/шаблонов с проверкой после изменения. | [Implementation Playbook](16_implementation_playbook.md), [Roadmap](07_implementation_roadmap.md) |
| **Phase gate** | Контрольная точка между фазами внедрения: что принято, что измерено, что нельзя тащить дальше. | [Implementation Playbook](16_implementation_playbook.md), [examples/project](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/project/phase-gates.md) |
| **Передача в эксплуатацию** (Handover) | Передача мониторинга в штатную эксплуатацию: роли, runbooks, dashboards, процессы, ответственность. | [Implementation Playbook](16_implementation_playbook.md), [Roadmap](07_implementation_roadmap.md) |
| **Operations Handbook** | Итоговый эксплуатационный документ: архитектура, процессы, runbooks, escalation, передача в эксплуатацию, routine operations. | [Roadmap](07_implementation_roadmap.md), [Операционка](12_operations.md) |
| **ADR** | Architecture Decision Record: запись архитектурного решения, вариантов, последствий и критериев пересмотра. | [Implementation Playbook](16_implementation_playbook.md), [examples/decisions](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/README.md) |
| **Decision log** | Журнал решений, помогающий видеть, какие ADR предложены, приняты и когда пересматриваются. | [examples/project](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/project/decision-log.md), [Implementation Playbook](16_implementation_playbook.md) |
| **RACI** | Матрица ответственности: Responsible, Accountable, Consulted, Informed. | [Implementation Playbook](16_implementation_playbook.md), [examples/project](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/project/raci-matrix.md) |
| **Acceptance checklist** | Список критериев, по которым внедрение можно принимать, а не просто считать “настроенным”. | [Implementation Playbook](16_implementation_playbook.md), [examples/project](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/project/implementation-checklist.md) |
| **GitOps для Zabbix** | Подход к контролю конфигурации через Git, export/import, review, drift detection и частичную автоматизацию. | [GitOps](08_gitops_for_zabbix.md), [ADR change control](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-007-change-control-and-gitops.md) |
| **CI/CD** | Continuous Integration / Continuous Delivery — практика непрерывной интеграции и доставки. В контексте книги: автоматизированный lint, тестирование и экспорт/импорт конфигурации Zabbix через pipeline. | [GitOps](08_gitops_for_zabbix.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Export/import** | Минимальный способ версионировать Zabbix-конфигурацию: экспортировать YAML/XML, хранить в Git, импортировать изменения. | [GitOps](08_gitops_for_zabbix.md), [Roadmap](07_implementation_roadmap.md) |
| **Drift** | Расхождение между тем, что хранится в Git/стандарте, и тем, что реально находится в Zabbix UI. | [GitOps](08_gitops_for_zabbix.md), [Операционка](12_operations.md) |
| **Drift detection** | Регулярная проверка расхождений между Git/export и живой конфигурацией Zabbix. | [GitOps](08_gitops_for_zabbix.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Change control** | Процесс, который определяет, кто и как меняет production monitoring, как фиксируется причина и как откатываться. | [GitOps](08_gitops_for_zabbix.md), [ADR change control](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/decisions/adr-007-change-control-and-gitops.md) |
| **Rollback** | Возврат к предыдущей рабочей конфигурации после неудачного изменения. | [GitOps](08_gitops_for_zabbix.md), [Roadmap](07_implementation_roadmap.md) |
| **PR/review** | Проверка изменений перед применением: templates, tag schema, alert actions, dashboards, reports. | [GitOps](08_gitops_for_zabbix.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Auto-registration** | Автоматическое добавление новых agents/hosts в Zabbix. Полезно, но опасно без tag schema и правил групп. | [Roadmap](07_implementation_roadmap.md), [GitOps](08_gitops_for_zabbix.md) |
| **HostMetadata** | Строка метаданных агента для auto-registration и первичной классификации host. | [Теги](03_tags_and_groups.md), [Roadmap](07_implementation_roadmap.md) |
| **Retagging** | Приведение существующих hosts/items/triggers к новой tag schema. | [Теги](03_tags_and_groups.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Production-ready** | Готовность к production: не только работает в тесте, но имеет ownership, теги, runbooks, routing, rollback и мониторинг влияния. | [README](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/README.md), [Implementation Playbook](16_implementation_playbook.md) |
| **Lab-tested** | Проверено в лаборатории, но требует проверки на реальной инфраструктуре и данных. | [README](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/README.md), [scripts](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/scripts/README.md) |
| **Design draft** | Концептуально полезный черновик, который нужно адаптировать и валидировать в конкретной среде. | [README](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/README.md), [examples](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/examples/README.md) |
| **Requirements only** | Требования и дизайн, а не готовый импортируемый шаблон. | [Требования к шаблонам](13_template_requirements.md), [README](https://github.com/slowdownyw/zabbix-enterprise-guide/blob/main/README.md) |

---

## Предметные сокращения и контуры

| Термин | Коротко | Где читать |
|---|---|---|
| **1С** | Критичный бизнес-сервис в примерах книги: rphost, HASP, веб-публикация, MSSQL/PostgreSQL, синтетика. | [Сервис, а не хост](01_service_not_host.md), [Требования к шаблонам](13_template_requirements.md) |
| **HASP** | Лицензирование 1С; исчерпание лицензий может быть пользовательским impact, а не просто технической метрикой. | [Сервис, а не хост](01_service_not_host.md), [Требования к шаблонам](13_template_requirements.md) |
| **rphost** | Рабочий процесс 1С. Падение одного и всех процессов имеет разный impact и severity. | [Требования к шаблонам](13_template_requirements.md), [Сервис, а не хост](01_service_not_host.md) |
| **MSSQL** | Частый слой middleware для 1С/Exchange/приложений: locks, deadlocks, backup age, tempdb, sessions. | [Требования к шаблонам](13_template_requirements.md), [Многоуровневая модель](05_layered_design.md) |
| **PostgreSQL** | БД Zabbix или прикладная БД; в Zabbix-контуре важны partitioning, retention, trends/history. | [Архитектура](06_architecture.md), [Roadmap](07_implementation_roadmap.md) |
| **Exchange** | Пример сервиса, который проверяется не только health БД, но и синтетикой отправки/получения почты. | [Сервис, а не хост](01_service_not_host.md), [Требования к шаблонам](13_template_requirements.md) |
| **DAG** | Database Availability Group — группа высокой доступности баз данных Exchange. В шаблонах проверяются состояние реплик, очереди и синтетика отправки/получения. | [Требования к шаблонам](13_template_requirements.md), [Сервис, а не хост](01_service_not_host.md) |
| **Veeam** | Пример backup-системы: возраст последнего успешного бэкапа важнее простого статуса job. | [Операционка](12_operations.md), [Требования к шаблонам](13_template_requirements.md) |
| **UserGate** | Пример сетевого/ИБ-компонента, где важны интерфейсы, VPN, политики, доступность. | [Требования к шаблонам](13_template_requirements.md), [Roadmap](07_implementation_roadmap.md) |
| **OPC** | Интерфейс/протокол в промышленном контуре; мониторинг требует осторожности и согласования с SCADA/ИБ. | [Требования к шаблонам](13_template_requirements.md), [Архитектура](06_architecture.md) |
| **HMI / PLC** | Human-Machine Interface / Programmable Logic Controller — компоненты промышленного контура. Мониторинг — пассивный или через OPC/SNMP, строго read-only, согласуется с ИБ и владельцем SCADA. | [Архитектура](06_architecture.md), [Требования к шаблонам](13_template_requirements.md) |
| **SNMP** | Базовый способ мониторинга сетевого оборудования, UPS, PDU, части железа. | [Архитектура](06_architecture.md), [Требования к шаблонам](13_template_requirements.md) |
| **UPS / PDU** | Источник бесперебойного питания / блок распределения питания. Мониторятся через SNMP: уровень заряда, нагрузка, статус батареи, входное/выходное напряжение. | [Архитектура](06_architecture.md), [Требования к шаблонам](13_template_requirements.md) |
| **IPMI / iLO / iDRAC** | Каналы мониторинга железа: питание, температура, RAID, аппаратные события. | [Сервис, а не хост](01_service_not_host.md), [Архитектура](06_architecture.md) |
| **DNS health** | Синтетическая или компонентная проверка разрешения ключевых имён. | [Roadmap](07_implementation_roadmap.md), [Сервис, а не хост](01_service_not_host.md) |
| **AD / Kerberos** | Инфраструктурный сервис, который часто требует синтетической проверки входа/получения ticket, а не только ping DC. | [Roadmap](07_implementation_roadmap.md), [Сервис, а не хост](01_service_not_host.md) |
| **DFS / файловые шары** | Пример сервиса, где важно проверять пользовательский путь чтения/записи, а не только доступность сервера. | [Сервис, а не хост](01_service_not_host.md), [SLA](10_sla_service_catalog.md) |
| **P1/P2/P3/P4** | Классы критичности или приоритета, часто используются в service catalog и ITSM. Не равны автоматически Zabbix severity. | [Roadmap](07_implementation_roadmap.md), [SLA](10_sla_service_catalog.md) |
