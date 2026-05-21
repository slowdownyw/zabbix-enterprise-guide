---
title: "GitOps для Zabbix — честный взгляд"
description: "Глава объясняет ограничения GitOps для Zabbix и сравнивает практичные подходы к управлению конфигурацией с учётом зрелости команды и риска."
---

!!! info "🟢 Статус: Conceptually stable · v0.1"
    Концепция устойчива, проверена опытом, литературой и практикой.


# 08. GitOps для Zabbix — честный взгляд

Глава о том, **почему в Zabbix нет идеального GitOps**, какие подходы к управлению конфигурацией применяют на практике и как выбрать вариант под зрелость команды, масштаб системы и допустимый уровень риска.

Это **дополнение к главе 7** — там описывается, что в фазе 2 нужно завести конфигурацию в Git. Здесь — как именно.

---

## Честный ответ: нет идеального GitOps для Zabbix

Это **известная боль** в сообществе. Zabbix хранит всю конфигурацию в БД, не в файлах. Нет `git clone && apply` как в Terraform или Kubernetes. Это архитектурное решение авторов, и оно создаёт проблему воспроизводимости.

Процесс «экспорт → Git → импорт руками» — это **честный минимум**, не эталон. Сакрального смысла в нём нет. Типичные проблемы:

- Кто-то зашёл в UI и поменял триггер → в Git это не попало
- Кто-то сделал импорт не из Git, а из своей локальной копии → расхождение
- Git показывает «последний экспорт», а не «текущее состояние Zabbix»
- Уверенности что они совпадают — никакой, если нет автоматики

---

## Как это решается по-нормальному

Спектр от «чуть лучше ручного» до «настоящий IaC».

---

### Уровень 1: Скриптованный экспорт + drift detection

Минимум автоматизации — **задача по расписанию**, которая регулярно экспортирует конфигурацию и коммитит её в Git. Тогда Git это не «то что мы положили», а «слепок реального состояния».

```bash
#!/bin/bash
# zabbix_export_to_git.sh — запускается по cron раз в час

ZABBIX_URL="https://zabbix.plant.local/api_jsonrpc.php"
TOKEN=$(cat /etc/zabbix/api_token)
REPO=/opt/zabbix-config

# Экспорт всех шаблонов через API
python3 export_all_templates.py \
  --url "$ZABBIX_URL" \
  --token "$TOKEN" \
  --output "$REPO/templates/"

# Экспорт host groups, hosts, media types...
# ...

cd $REPO
git add -A
git diff --cached --quiet || git commit -m "auto-export $(date +%Y-%m-%dT%H:%M)"
git push
```

**Что это даёт:** Git становится **аудит-логом** реального состояния. Если кто-то руками поменял триггер в UI — через час это появится в Git как коммит с diff. Это уже видно.

**Что это не даёт:** запрета на прямые изменения в UI. Дисциплина — организационная, не техническая.

> ⚠️ Без нормализации scheduled auto-export превращает Git в шум. Экспортированный YAML может содержать поля runtime, изменяющиеся при каждом запросе (lastaccess, triggerid ordering и т.д.). Рекомендации: сортировать поля, убирать нестабильные значения runtime, один объект — один файл со стабильным именем, использовать `git diff --stat` для фильтрации незначительных изменений.

---

### Уровень 2: Ansible community.zabbix

Это **де-факто стандарт**, если нужен IaC для Zabbix.

https://github.com/ansible-collections/community.zabbix

Модули: `zabbix_host`, `zabbix_template`, `zabbix_hostgroup`, `zabbix_action`, `zabbix_user` и т.д.

Как выглядит:

```yaml
# playbook: zabbix_hosts.yml
- name: Ensure 1C app servers in Zabbix
  hosts: localhost
  tasks:
    - name: Add 1C app server
      community.zabbix.zabbix_host:
        server_url: https://zabbix.plant.local
        login_user: admin
        login_password: "{{ vault_zabbix_pass }}"
        host_name: srv-1c-prod-01
        visible_name: "1C App Server 01"
        host_groups:
          - Applications/1C
        link_templates:
          - Plant: Linux base
          - Plant: 1C App Server
        interfaces:
          - type: 1  # agent
            main: 1
            ip: 10.10.20.15
            port: 10050
        tags:
          - tag: env
            value: prod
          - tag: service
            value: 1c-erp
          - tag: criticality
            value: P1
        state: present
```

```bash
ansible-playbook zabbix_hosts.yml
```

**Что это даёт:**
- YAML в Git = желаемое состояние
- Idempotent: можно гонять сколько угодно
- CI/CD pipeline: merge request → ansible apply → Zabbix обновился

> ⚠️ Поведение «только diff, не перезаписывает» зависит от конкретного модуля и его параметров. Перед применением в рабочей среде: читайте документацию модуля, запускайте `--check` (пробный запуск), пилотируйте на нескольких хостах, проверяйте что теги/шаблоны не удаляются деструктивно при неполном плейбуке.

**Где трение:**
- Не все объекты Zabbix покрыты модулями одинаково хорошо (шаблоны — хуже всего)
- Шаблоны всё равно проще хранить в YAML и делать `zabbix_template` модулем для импорта
- Хосты, группы, права, медиа — через Ansible отлично

---

### Уровень 3: Terraform provider

Существует: https://github.com/claranet/terraform-provider-zabbix

```hcl
resource "zabbix_host" "srv_1c_prod_01" {
  host = "srv-1c-prod-01"
  name = "1C App Server 01"

  groups = [zabbix_hostgroup.apps_1c.id]
  
  templates = [
    zabbix_template.linux_base.id,
    zabbix_template.app_1c.id,
  ]

  agent {
    ip   = "10.10.20.15"
    port = 10050
    main = true
  }

  tags = {
    env         = "prod"
    service     = "1c-erp"
    criticality = "P1"
  }
}
```

```bash
terraform plan   # показывает diff
terraform apply  # применяет
```

**Что это даёт:** ближе к полноценному IaC. State в terraform.tfstate, `terraform plan` как diff перед apply.

**Проблемы:**
- Provider написан сообществом, не официальный Zabbix
- Поддерживается неравномерно, не все объекты покрыты
- `terraform.tfstate` надо хранить удалённо (S3/Consul), это инфраструктура
- Если кто-то меняет в UI — state расходится с реальностью, нужен `terraform refresh`

**Итог:** интересно для новых инсталляций, для реорганизации легаси — боль.

---

### Уровень 4: Zabbix CLI + CI/CD (ближайший к «настоящему GitOps»)

`zabbix-cli` (https://github.com/unioslo/zabbix-cli) умеет export/import через API в пакетном режиме.

В связке с GitLab CI:

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - apply

validate:
  script:
    - python3 scripts/validate_templates.py templates/

apply:
  script:
    - zabbix-cli --config zabbix-cli.conf
        template import --file templates/plant-linux-base.yaml
        template import --file templates/plant-1c-app.yaml
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual  # ← ручное подтверждение, не автоприменение
```

**Что даёт:** merge request = code review изменения шаблона. Apply по нажатию кнопки в GitLab. Лог кто и когда применил.

---

## Что покрывает export/import — и что не покрывает

`configuration.export` / `configuration.import` покрывают **шаблоны, хосты, группы, карты, экраны, медиа-типы**. Это полезный слепок, но не полный снимок Zabbix:

- **Пользователи и роли** — через `user.get` / `usergroup.get`, отдельно
- **Actions и escalation rules** — через `action.get`, не входят в configuration.export
- **Authentication settings** (LDAP, SAML, MFA) — только через UI или отдельные API
- **Global macros** — через `usermacro.get` с `globalmacro=true`
- **Media и уведомления** — отчасти в export, но credentials/tokens — нет (см. управление секретами ниже)

Для **контролируемого применения** используй [`configuration.importcompare`](https://www.zabbix.com/documentation/current/en/manual/api/reference/configuration/importcompare) — API-метод, возвращающий diff между файлом и текущим состоянием без применения. Это аналог `terraform plan` для Zabbix-конфигурации.

---

## Как убедиться что Git = Zabbix (drift detection)

Это отдельная задача, и без неё любой из подходов выше — «на доверии».

**Простой вариант:** ежечасный скрипт сравнивает хеши экспортированных YAML с тем, что в Git:

```python
# Псевдокод
exported = zabbix_api.export_all_templates()
committed = git_repo.read_latest("templates/")

diff = diff_yaml(exported, committed)
if diff:
    send_alert("Zabbix config drift detected!", diff)
```

**Что это даёт:** если кто-то поменял в UI напрямую — через час приходит алерт. Менеджер видит. Это организационный контроль через мониторинг.

**Кстати:** для контроля UI-изменений в реальном времени надёжнее периодически опрашивать [`auditlog.get`](https://www.zabbix.com/documentation/current/en/manual/api/reference/auditlog/get) через внешний скрипт и слать события в канал. Zabbix action на `EVENT.SOURCE=5` (internal event) технически возможен, но события аудита не всегда маппятся на действия достаточно надёжно — проверяйте поведение на вашей версии.

---

## Что реально делают в промышленной среде

Честная картина по зрелости:

| Уровень зрелости | Как управляют конфигом |
|---|---|
| **Большинство** | Только UI, никакого Git, «в голове и по памяти» |
| **Средний уровень** | Ручной экспорт в Git «когда вспоминают», как задокументированные снапшоты |
| **Хороший уровень** | Scheduled auto-export + Ansible для хостов, шаблоны в YAML в Git |
| **Зрелые команды** | Terraform/Ansible + CI/CD pipeline + drift detection |
| **Единицы** | Полный IaC, никаких изменений через UI в промышленной среде |

С вероятностью 95%, ваш свечной заводик сейчас на уровне «только UI». Реалистичная цель за год — «хороший уровень».

---

## Что выбрать для завода в рамках проекта

Честная рекомендация с учётом ресурсов и сроков:

**Фаза 2 (сейчас):**
- Auto-export в Git по cron (1 вечер работы, даёт аудит-лог)
- Ansible для управления **хостами** (теги, группы, шаблоны) — это решает главную боль массовых изменений
- Шаблоны — YAML в Git, импорт через UI или скрипт при изменениях

**Фаза 3 / Год 2:**
- CI/CD pipeline на GitLab (если GitLab уже есть или появится)
- Drift detection alert
- Постепенно — всё через Ansible, ничего напрямую в UI

**Почему не Terraform сейчас:** provider сырой для инсталляций legacy, риски выше пользы. Ansible более зрелый для этой задачи.

---

## Управление секретами — что не кладут в Git

Ни в каком из уровней GitOps следующее не хранится в открытом Git-репозитории без шифрования:

| Что | Где хранить |
|---|---|
| API token Zabbix | Ansible Vault / CI/CD variables / Vault |
| Пароли media types (email relay, webhook) | Ansible Vault / CI secrets |
| PSK-ключи агентов | Отдельное хранилище секретов, не в YAML конфиге |
| SNMP community strings | Ansible Vault / Vault |
| Пароли LDAP/SAML binding | Только через Vault или CI environment variables |
| Webhook credentials (Telegram token, etc.) | CI secrets или Ansible Vault |

Инструменты: [Ansible Vault](https://docs.ansible.com/ansible/latest/vault_guide/), [SOPS](https://github.com/getsops/sops), [HashiCorp Vault](https://www.vaultproject.io/), переменные окружения CI. Регулярно ротируйте токены, особенно API token с правом `write`.

---

## Аварийное изменение через UI

Даже при зрелом GitOps бывают ситуации когда нужно немедленно поменять порог, отключить триггер, изменить шаблон — прямо в UI, без pipeline.

Политика аварийных изменений:

1. **Кто может:** только назначенный владелец мониторинга (или дежурный инженер с явным разрешением)
2. **Что фиксируется:** причина в комментарии/тикете (инцидент, номер, что меняется)
3. **Как потом:** в течение следующего рабочего дня — экспорт изменения в Git, коммит со ссылкой на инцидент
4. **Контроль:** drift detection (см. выше) покажет расхождение. Без коммита в Git после аварийного изменения — это техдолг, который надо закрыть

Без явной политики аварийных изменений команда будет тайно менять UI и «забывать» фиксировать изменения в Git, что разрушает весь GitOps.

---

## Коротко

Ручной процесс «экспорт → Git → импорт» — это честный минимум который даёт хоть что-то. Гарантии равенства Git и Zabbix без автоматики — действительно нет. Правильный путь: **auto-export для аудита + Ansible для изменений + drift detection для контроля**. Terraform — хорош для новых инсталляций, не для реорганизации легаси.

---

## Связь с остальными главами

- [Глава 7 — Roadmap](07_implementation_roadmap.md): GitOps вводится в фазе 2 (стандартизация)
- [Глава 12 — Эксплуатационная модель мониторинга](12_operations.md): часть процессов изменений (окна обслуживания, ввод хостов в мониторинг) удобнее автоматизировать через тот же CI/CD pipeline
