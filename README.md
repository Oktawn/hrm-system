# HRM System

##  Архитектура системы

- **Backend API** - RESTful API сервер на Node.js/Express с TypeScript
- **Frontend** - React/TypeScript SPA с Ant Design 
- **Telegram Bot** - Grammy 
- **Database** - PostgreSQL TypeORM и knex.js
- **Docker** - Контейнеризация всех компонентов

##  Основные возможности

###  Управление персоналом
- Регистрация и профили сотрудников
- Структура отделов и должностей
- Назначение руководителей и подчинённых
- Роли и права доступа (ADMIN, HR, MANAGER, EMPLOYEE, HEAD, HR_DIRECTOR)

###  Система заявок
- Заявки на отпуска
- Заявки на документы и справки
- Согласование и обработка заявок
- Приоритизация и статусы заявок

###  Управление задачами
- Создание и назначение задач
- Система приоритетов и статусов
- Комментарии и файловые вложения
- Статистика выполнения

###  Документооборот
- Автоматическая генерация документов из шаблонов
- Электронное подписание
- Система статусов документов
- Хранение метаданных

###  Комментарии и файлы
- Комментирование задач и заявок
- Загрузка файловых вложений

###  Telegram Integration
- Интерактивный Telegram бот
- Просмотр задач и заявок
- Создание заявок через бот
- Добавление комментариев
- Уведомления и статусы

## 🛠️ Технологический стек

### Backend
- **Node.js** + **Express** 
- **TypeScript** 
- **TypeORM** 
- **Knex.js** 
- **PostgreSQL** 
- **JWT** 
- **bcrypt** 
- **multer** 
- **ExcelJS** 

### Frontend
- **React** + **TypeScript**
- **Vite**
- **Ant Design**
- **React Router** 
- **Zustand**
- **Axios** 

### Bot
- **Grammy** - Telegram Bot framework
- **dedent** - для форматирования строк


##  Структура базы данных

### Основные сущности:
- `users` - пользователи системы
- `employees` - профили сотрудников
- `departments` - отделы компании
- `positions` - должности
- `tasks` - задачи
- `requests` - заявки
- `comments` - комментарии
- `documents` - документы
- `refresh_tokens` - токены обновления

##  Установка и запуск

### Требования
- Docker и Docker Compose
- Node.js 18+ (для локальной разработки)
- PostgreSQL 17+ (если без Docker)

### Быстрый старт с Docker

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/Oktawn/hrm-system.git
cd hrm-system
```

2. **Создайте файл окружения:**
```bash
cp .env
```

3. **Настройте переменные окружения в `.env`:**
```env
# DATABASE
DB_HOST=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
DB_EXTERNAL_PORT=
DB_PORT=

# BACKEND
API_PORT=
JWT_SECRET=
JWT_REFRESH_EXPIRATION=
JWT_EXPIRES_IN=

VITE_API_HOST_URL=
API_HOST_URL=

ORIGIN_FRONTEND=
ORIGIN_BOT=
ORIGIN_HOST_URL_BOT=


BOT_TOKEN=

```

4. **Запустите систему:**
```bash
docker compose build 
docker compose up -d
```

5. **Выполните миграции и наполните базу тестовыми данными:**
```ts
/*
  По умолчанию они закомментированны
*/

// Миграции
await migrate.rollback();
await migrate.latest();

//  Сиды
await seed.run();
```

### Доступ к сервисам

- **Frontend:** http://127.0.0.1:5173
- **Backend API:** http://127.0.0.1:API_PORT
- **Database:** DB_HOST:5432  или http://localhost:DB_EXTERNAL_PORT

### Тестовые данные

После выполнения сидов будут созданы:
- 200 тестовых сотрудников
- Отделы и должности
- Задачи и заявки
- Комментарии и документы

**Администратор:**
- Email: `иван.петров@hrm.com`
- Password: `password123`

##  Разработка

### Backend разработка

```bash
cd back
npm install
npm run dev  
```

### Frontend разработка

```bash
cd front
npm install
npm run dev  # Запуск в режиме разработки
```

### Bot разработка

```bash
cd bot
npm install
npm run dev  
```


##  Использование Telegram бота

1. Найдите бота по токену в Telegram
2. Отправьте команду `/start`
3. Используйте интерактивные кнопки для:
   - Просмотра задач и заявок
   - Создания заявок
   - Добавления комментариев
   - Поиска по статусам и приоритетам

### Доступные команды:
- `/start` - начать работу с ботом
- `/reset` - сбросить все действия
- `/keyboard` - показать главное меню

##  Система ролей

### Роли пользователей:
- **ADMIN** - полный доступ к системе
- **HR** - управление персоналом и документами
- **HR_DIRECTOR** - расширенные HR права
- **MANAGER** - управление подчинёнными
- **HEAD** - руководитель отдела
- **EMPLOYEE** - базовые права сотрудника

### Права доступа:
- Просмотр и редактирование профилей
- Создание и управление задачами
- Обработка заявок
- Генерация документов
- Управление отделами и должностями

## API Endpoints

###  Аутентификация (`/api/auth`)
- `POST /register` - регистрация нового пользователя
- `POST /login` - вход в систему
- `POST /logout` - выход из системы
- `POST /refresh` - обновление токена доступа
- `GET /check` - проверка действительности токена
- `GET /check/bot` - проверка Telegram бота

###  Профиль (`/api/profile`)
- `GET /` - получить профиль текущего пользователя
- `PUT /` - обновить профиль
- `PUT /password` - изменить пароль

###  Сотрудники (`/api/employees`)
- `GET /` - список всех сотрудников
- `GET /:id` - профиль сотрудника по ID
- `GET /account/me` - получить информацию о своём аккаунте
- `GET /stats` - статистика по сотрудникам
- `GET /managers` - список доступных менеджеров (HR/ADMIN/MANAGER)
- `POST /create` - создание нового сотрудника (ADMIN)
- `PUT /update/me` - обновление собственного профиля
- `PUT /update` - обновление профиля другого сотрудника (HR/ADMIN/MANAGER)
- `DELETE /:id` - удаление сотрудника (ADMIN)

###  Отделы (`/api/departments`)
- `GET /` - список всех отделов
- `GET /:id` - информация об отделе по ID
- `GET /stats` - статистика по отделам
- `GET /employee/:employeeId/stats` - статистика отдела конкретного сотрудника
- `POST /` - создание нового отдела (ADMIN/HR)
- `PUT /:id` - обновление отдела (ADMIN/HR)
- `DELETE /:id` - удаление отдела (ADMIN)

###  Должности (`/api/positions`)
- `GET /` - список всех должностей
- `GET /:id` - информация о должности по ID
- `GET /department/:departmentId` - должности по отделу
- `POST /` - создание новой должности (ADMIN/HR)
- `PUT /:id` - обновление должности (ADMIN/HR)
- `DELETE /:id` - удаление должности (ADMIN)

###  Задачи (`/api/tasks`)
- `GET /` - список всех задач
- `GET /:id` - задача по ID
- `GET /stats` - общая статистика задач
- `GET /recent` - последние задачи
- `GET /assignee/:assigneeId` - задачи по исполнителю
- `GET /creator/:creatorId` - задачи по создателю
- `GET /status/:status` - задачи по статусу
- `GET /priority/:priority` - задачи по приоритету
- `POST /create` - создание новой задачи
- `PUT /update/:id` - обновление задачи
- `PATCH /:id/status` - изменение статуса задачи
- `DELETE /:id` - удаление задачи

#### Статистика задач (`/api/tasks/statistics`)
- `GET /` - расширенная статистика
- `GET /total` - общая статистика
- `GET /personal` - персональная статистика
- `GET /export` - экспорт статистики в Excel

#### Задачи для бота (`/api/tasks/bots`)
- `GET /` - все незавершенные задачи для Telegram бота
- `GET /:id` - задача по ID для бота
- `GET /status/:status` - задачи по статусу для бота
- `GET /priority/:priority` - задачи по приоритету для бота

###  Заявки (`/api/requests`)
- `GET /` - список всех заявок
- `GET /:id` - заявка по ID
- `GET /status/:status` - заявки по статусу
- `GET /priority/:priority` - заявки по приоритету
- `GET /employee/:employeeId` - заявки конкретного сотрудника
- `POST /create` - создание новой заявки
- `PUT /update/:id` - обновление заявки
- `PATCH /:id/status` - изменение статуса заявки
- `DELETE /:id` - удаление заявки

#### Заявки для бота (`/api/requests/bot`)
- `GET /` - все заявки для Telegram бота
- `GET /:id` - заявка по ID для бота
- `GET /status/:status` - заявки по статусу для бота
- `GET /priority/:priority` - заявки по приоритету для бота
- `GET /employee/:employeeId` - заявки по ID сотрудника для бота
- `GET /employee/:name` - заявки по имени сотрудника для бота
- `POST /create` - создание заявки через бота
- `PUT /update/:id` - обновление заявки через бота
- `PATCH /:id/status` - изменение статуса заявки через бота

###  Документы (`/api/documents`)
- `GET /` - список документов (ADMIN/HR/MANAGER)
- `GET /:id` - документ по ID
- `GET /employee/:employeeId` - документы конкретного сотрудника
- `GET /status/:status` - документы по статусу (ADMIN/HR/MANAGER)
- `POST /` - создание нового документа (ADMIN/HR)
- `POST /generate/:requestId` - генерация документа по заявке (ADMIN/HR)
- `POST /:id/regenerate` - перегенерация документа (ADMIN/HR)
- `PUT /:id` - обновление документа
- `PATCH /:id/status` - изменение статуса документа (ADMIN/HR/MANAGER)
- `PATCH /:id/sign` - подписание документа (ADMIN/HR/MANAGER)
- `PATCH /:id/reject` - отклонение документа (ADMIN/HR/MANAGER)
- `DELETE /:id` - удаление документа (ADMIN/HR)

###  Комментарии (`/api/comments`)
- `POST /` - добавление комментария
- `GET /task/:taskId` - комментарии к задаче
- `GET /request/:requestId` - комментарии к заявке
- `PUT /:commentId` - обновление комментария
- `DELETE /:commentId` - удаление комментария

#### Комментарии для бота (`/api/comments/bot`)
- `POST /` - добавление комментария через бота
- `PUT /:commentId` - обновление комментария через бота

###  Загрузка файлов (`/api/uploads`)
- `POST /upload` - загрузка файлов
- `GET /download/:filename` - скачивание файла
- `GET /view/:filename` - просмотр файла

