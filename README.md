# GTU Student Task Tracker

Веб-приложение для управления учебными задачами двух семестров. Задачи можно
добавлять, редактировать, отмечать выполненными и удалять. Данные сохраняются
локально в базе SQLite.

## Возможности

- добавление, редактирование и удаление задач;
- разделение задач по первому и второму семестру;
- установка срока выполнения;
- отметка выполненных задач;
- локальное хранение данных в SQLite;
- адаптивный веб-интерфейс.

## Требования

- [Python 3.10 или новее](https://www.python.org/downloads/);
- современный веб-браузер.

Отдельно устанавливать SQLite не нужно: он входит в стандартную поставку
Python.

## Установка и запуск

### Windows (PowerShell)

Откройте PowerShell в папке проекта и выполните:

```powershell
python -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

Если команда `python` открывает Microsoft Store или не найдена, установите
Python с официального сайта и при установке отметьте **Add Python to PATH**.
Если в системе доступна команда `py`, можно использовать `py` вместо `python`.

### macOS и Linux

Откройте терминал в папке проекта и выполните:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

После запуска откройте в браузере:

<http://127.0.0.1:5000>

Чтобы остановить сервер, нажмите `Ctrl+C` в терминале.

При следующих запусках достаточно активировать окружение и запустить
приложение:

```powershell
# Windows
.\.venv\Scripts\Activate.ps1
python app.py
```

```bash
# macOS и Linux
source .venv/bin/activate
python app.py
```

## Структура проекта

```text
app.py                 Flask-приложение и API
requirements.txt       Python-зависимости
templates/index.html   HTML-интерфейс
static/app.js           логика интерфейса
static/style.css        стили
tasks.db                локальная база данных (создаётся автоматически)
```

## Ограничения полей

- название задачи — от 1 до 128 символов;
- описание — до 500 символов;
- семестр — первый или второй;
- срок выполнения — дата в формате `ГГГГ-ММ-ДД`.

## API

| Метод | URL | Описание |
| --- | --- | --- |
| `GET` | `/api/tasks` | Получить список задач |
| `POST` | `/api/tasks` | Добавить задачу |
| `PUT` | `/api/tasks/<id>` | Изменить задачу |
| `PATCH` | `/api/tasks/<id>/status` | Изменить статус задачи |
| `DELETE` | `/api/tasks/<id>` | Удалить задачу |

## Используемые технологии

Python, Flask, SQLite, HTML, CSS и JavaScript.
