!!! info "🟢 Статус: Conceptually stable · v0.1"
    Концепция устойчива, проверена опытом, литературой и практикой.


# 08. GitOps для Zabbix — честный взгляд

Глава о том, **почему нет идеального GitOps для Zabbix**, какой реальный спектр подходов используется в проде, и что выбирать под вашу зрелость и риск-аппетит.

Это **дополнение к главе 7** — там описывается, что в фазе 2 нужно завести конфиг в git. Здесь — как именно.

---

## Честный ответ: нет идеального GitOps для Zabbix

Это **известная боль** в сообществе. Zabbix хранит всю конфигурацию в БД, не в файлах. Нет `git clone && apply` как в Terraform или Kubernetes. Это архитектурное решение авторов, и оно создаёт проблему воспроизводимости.

Процесс «экспорт → git → импорт руками» — это **честный минимум**, не эталон. Сакрального смысла в нём нет. Типичные проблемы:

- Кто-то зашёл в UI и поменял триггер → в git это не попало
- Кто-то сделал import не из git, а из своей локальной копии → расхождение
- Git показывает «последний export», а не «текущее состояние Zabbix»
- Уверенности что они совпадают — никакой, если нет автоматики

---

## Как это решается по-нормальному

Спектр от «чуть лучше ручного» до «настоящий IaC».

---

### Уровень 1: Скриптованный экспорт + drift detection

Минимум автоматизации — **scheduled job** который регулярно экспортирует конфиг и коммитит в git. Тогда git это не «то что мы положили», а «слепок реального состояния».

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

**Что это даёт:** git становится **аудит-логом** реального состояния. Если кто-то руками поменял триггер в UI — через час это появится в git как коммит с diff. Это уже видно.

**Что это не даёт:** запрета на прямые изменения в UI. Дисциплина — организационная, не техническая.

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
- YAML в git = желаемое состояние
- `ansible-playbook` применяет diff, не перезаписывает
- Idempotent: можно гонять сколько угодно
- CI/CD pipeline: merge request → ansible apply → Zabbix обновился

**Где трение:**
- Не все объекты Zabbix покрыты модулями одинаково хорошо (шаблоны — хуже всего)
- Шаблоны всё равно проще хранить в YAML и делать `zabbix_template` модулем для import
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

**Что это даёт:** настоящий GitOps. State в terraform.tfstate, план перед apply, полный контроль.

**Проблемы:**
- Provider написан комьюнити, не официальный Zabbix
- Поддерживается неравномерно, не все объекты покрыты
- `terraform.tfstate` надо хранить удалённо (S3/Consul), это инфраструктура
- Если кто-то меняет в UI — state расходится с реальностью, нужен `terraform refresh`

**Итог:** интересно для новых инсталляций, для реорганизации легаси — боль.

---

### Уровень 4: Zabbix CLI + CI/CD (ближайший к «настоящему GitOps»)

`zabbix-cli` (https://github.com/unioslo/zabbix-cli) умеет export/import через API в batch-режиме.

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

**Что даёт:** merge request = код-ревью изменения шаблона. Apply по нажатию кнопки в GitLab. Лог кто и когда применил.

---

## Как убедиться что git = Zabbix (drift detection)

Это отдельная задача, и без неё любой из подходов выше — «на доверии».

**Простой вариант:** ежечасный скрипт сравнивает хеши экспортированных YAML с тем что в git:

```python
# Псевдокод
exported = zabbix_api.export_all_templates()
committed = git_repo.read_latest("templates/")

diff = diff_yaml(exported, committed)
if diff:
    send_alert("Zabbix config drift detected!", diff)
```

**Что это даёт:** если кто-то поменял в UI напрямую — через час приходит алерт. Менеджер видит. Это organizational enforcement через мониторинг.

**Кстати:** можно поставить Zabbix action на audit log события (`EVENT.SOURCE=5` — configuration change) и слать в канал все изменения в UI. Тогда drift виден в реальном времени, не через час.

---

## Что реально делают в продакшне

Честная картина по зрелости:

| Уровень зрелости | Как управляют конфигом |
|---|---|
| **Большинство** | Только UI, никакого git, «в голове и по памяти» |
| **Средний уровень** | Ручной export в git «когда вспоминают», как задокументированные снапшоты |
| **Хороший уровень** | Scheduled auto-export + Ansible для хостов, шаблоны в YAML в git |
| **Зрелые команды** | Terraform/Ansible + CI/CD pipeline + drift detection |
| **Единицы** | Полный IaC, никаких изменений через UI в продакшне |

Завод с вероятностью 95% сейчас на уровне «только UI». Цель реалистичная за год — «хороший уровень».

---

## Что выбрать для завода в рамках проекта

Честная рекомендация с учётом ресурсов и сроков:

**Фаза 2 (сейчас):**
- Auto-export в git по cron (1 вечер работы, даёт аудит-лог)
- Ansible для управления **хостами** (теги, группы, шаблоны) — это решает главную боль массовых изменений
- Шаблоны — YAML в git, import через UI или скрипт при изменениях

**Фаза 3 / Год 2:**
- CI/CD pipeline на GitLab (если GitLab уже есть или появится)
- Drift detection alert
- Постепенно — всё через Ansible, ничего напрямую в UI

**Почему не Terraform сейчас:** provider сырой для легаси-инсталляций, риски выше пользы. Ansible зрелее для этой задачи.

---

## TL;DR

Ручной процесс «экспорт → git → импорт» — это честный минимум который даёт хоть что-то. Гарантии равенства git и Zabbix без автоматики — действительно нет. Правильный путь: **auto-export для аудита + Ansible для изменений + drift detection для контроля**. Terraform — хорош для новых инсталляций, не для реорганизации легаси.

---

## Связь с остальными главами

- [Глава 7 — Roadmap](07_implementation_roadmap.md): GitOps вводится в фазе 2 (стандартизация)
- [Глава 12 — Эксплуатационная модель мониторинга](12_operations.md): часть процессов изменений (maintenance windows, onboarding) удобнее автоматизировать через тот же CI/CD pipeline
