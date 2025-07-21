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

### Аутентификация
- `POST /api/auth/login` - вход в систему
- `POST /api/auth/logout` - выход
- `POST /api/auth/refresh` - обновление токена
- `GET /api/auth/check` - проверка токена

### Сотрудники
- `GET /api/employees` - список сотрудников
- `GET /api/employees/:id` - профиль сотрудника
- `POST /api/employees/create` - создание сотрудника
- `PUT /api/employees/update/:id` - обновление профиля

### Задачи
- `GET /api/tasks` - список задач
- `POST /api/tasks` - создание задачи
- `PUT /api/tasks/:id` - обновление задачи
- `GET /api/tasks/stats` - статистика задач

### Заявки
- `GET /api/requests` - список заявок
- `POST /api/requests/create` - создание заявки
- `PUT /api/requests/update/:id` - обновление заявки
- `PATCH /api/requests/:id/status` - изменение статуса
