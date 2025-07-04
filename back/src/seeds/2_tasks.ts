import { Knex } from "knex";
import { TaskStatusEnum, TaskPriorityEnum } from "../commons/enums/enums";
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {

  await knex("tasks_assignees_employees").del();
  await knex("tasks").del();

  const employees = await knex("employees").select("*");

  if (employees.length === 0) {
    return;
  }

  const managers = await knex("employees")
    .join("users", "employees.userId", "users.id")
    .where("users.role", "IN", ["admin", "manager"])
    .select("employees.*");

  const creators = managers.length > 0 ? managers : employees.slice(0, 5); 

  const tasks = [];
  const taskTitles = [
    "Разработка API для модуля сотрудников",
    "Обновление дизайн системы", 
    "Настройка CI/CD pipeline",
    "Оптимизация производительности базы данных",
    "Создание документации проекта",
    "Исправление критических багов",
    "Разработка мобильного приложения",
    "Интеграция с внешними сервисами",
    "Проведение code review",
    "Настройка мониторинга системы",
    "Обновление зависимостей проекта",
    "Разработка системы уведомлений",
    "Оптимизация фронтенд компонентов",
    "Настройка автоматического тестирования",
    "Разработка админ панели",
    "Миграция данных",
    "Создание backup системы",
    "Оптимизация SEO",
    "Разработка API документации",
    "Настройка кеширования",
    "Реорганизация структуры проекта",
    "Создание landing page",
    "Интеграция платежной системы",
    "Разработка системы отчетов",
    "Настройка безопасности",
    "Создание системы аналитики",
    "Разработка чат-бота",
    "Настройка Docker контейнеров",
    "Создание системы логирования",
    "Разработка календаря событий",
    "Интеграция с CRM системой",
    "Создание модуля комментариев",
    "Разработка системы тегов",
    "Настройка ElasticSearch",
    "Создание системы ролей",
    "Разработка файлового менеджера",
    "Настройка Redis кеширования",
    "Создание системы задач",
    "Разработка модуля отпусков",
    "Интеграция с почтовым сервисом",
    "Создание дашборда метрик",
    "Разработка системы оценок",
    "Настройка Webpack",
    "Создание модуля обучения",
    "Разработка системы штрафов",
    "Интеграция с облачным хранилищем",
    "Создание системы workflow",
    "Разработка модуля расписания",
    "Настройка GraphQL API",
    "Создание системы архивирования",
    "Разработка модуля заявок",
    "Интеграция с системой учета времени",
    "Создание системы опросов",
    "Разработка модуля инвентаря",
    "Настройка microservices архитектуры",
    "Создание системы версионирования",
    "Разработка модуля контрактов",
    "Интеграция с биометрической системой",
    "Создание системы backup",
    "Разработка модуля бюджета",
    "Настройка Kubernetes",
    "Создание системы аудита",
    "Разработка модуля проектов",
    "Интеграция с системой видеоконференций",
    "Создание системы шаблонов",
    "Разработка модуля документооборота",
    "Настройка мониторинга производительности",
    "Создание системы автоматизации",
    "Разработка модуля клиентов",
    "Интеграция с системой IP-телефонии",
    "Создание системы геолокации",
    "Разработка модуля складского учета",
    "Настройка системы резервного копирования",
    "Создание системы многоязычности",
    "Разработка модуля финансов",
    "Интеграция с системой электронной подписи",
    "Создание системы персонализации",
    "Разработка модуля поставщиков",
    "Настройка системы балансировки нагрузки",
    "Создание системы рекомендаций",
    "Разработка модуля маркетинга",
    "Интеграция с социальными сетями",
    "Создание системы A/B тестирования",
    "Разработка модуля продаж",
    "Настройка системы автоскейлинга",
    "Создание системы machine learning",
    "Разработка модуля логистики",
    "Интеграция с системой бухгалтерии",
    "Создание системы blockchain",
    "Разработка модуля качества",
    "Настройка системы CDN",
    "Создание системы IoT мониторинга",
    "Разработка модуля безопасности",
    "Интеграция с системой видеонаблюдения",
    "Создание системы прогнозирования",
    "Разработка модуля производства",
    "Настройка системы failover",
    "Создание системы чат-поддержки",
    "Разработка модуля HR аналитики",
    "Интеграция с системой планирования ресурсов",
    "Создание системы виртуальной реальности",
    "Разработка модуля экологического мониторинга",
    "Настройка системы edge computing",
    "Создание системы распознавания речи",
    "Разработка модуля управления знаниями",
    "Интеграция с системой управления версиями",
    "Создание системы predictive analytics",
    "Разработка модуля кросс-платформенной совместимости",
    "Настройка системы real-time коммуникаций",
    "Создание системы автоматического масштабирования",
    "Разработка модуля интеллектуального поиска",
    "Интеграция с квантовыми вычислениями",
    "Создание системы нейронных сетей",
    "Разработка модуля дополненной реальности",
    "Настройка системы распределенных вычислений",
    "Создание системы компьютерного зрения",
    "Разработка модуля обработки естественного языка",
    "Интеграция с системой робототехники",
    "Создание системы автономного управления",
    "Разработка модуля квантовой криптографии",
    "Настройка системы распределенного хранения",
    "Создание системы искусственного интеллекта",
    "Разработка модуля автоматизированного тестирования",
    "Интеграция с системой умного города",
    "Создание системы цифровых двойников",
    "Разработка модуля управления данными",
    "Настройка системы облачных вычислений"
  ];

  const descriptions = [
    "Необходимо создать полноценный REST API с CRUD операциями",
    "Обновить компоненты в соответствии с новыми требованиями дизайна",
    "Настроить автоматическое развертывание для разных сред",
    "Провести анализ и оптимизацию запросов к базе данных",
    "Создать подробную техническую документацию проекта",
    "Устранить выявленные критические ошибки в системе",
    "Разработать мобильную версию приложения",
    "Настроить интеграцию с третьими сторонами",
    "Провести ревью кода для повышения качества",
    "Настроить систему мониторинга и алертов",
    "Реализовать систему сбора и анализа метрик пользователей",
    "Создать интерактивного помощника для поддержки клиентов",
    "Настроить контейнеризацию всех сервисов приложения",
    "Внедрить централизованную систему сбора и анализа логов",
    "Разработать функционал планирования и управления событиями",
    "Интегрировать с внешней CRM системой для синхронизации данных",
    "Добавить возможность оставлять комментарии к различным сущностям",
    "Создать систему категоризации и поиска по тегам",
    "Настроить полнотекстовый поиск с использованием ElasticSearch",
    "Реализовать гибкую систему ролей и разрешений",
    "Создать удобный интерфейс для работы с файлами",
    "Внедрить кеширование данных с использованием Redis",
    "Разработать систему управления задачами и workflow",
    "Создать модуль для управления отпусками и больничными",
    "Настроить отправку email уведомлений через внешний сервис",
    "Создать интерактивный дашборд с ключевыми метриками",
    "Внедрить систему оценки производительности сотрудников",
    "Оптимизировать сборку фронтенда с помощью Webpack",
    "Создать платформу для онлайн обучения сотрудников",
    "Разработать систему учета нарушений и штрафов",
    "Интегрировать с облачными сервисами для хранения файлов",
    "Создать конструктор бизнес-процессов и workflow",
    "Разработать систему планирования рабочего времени",
    "Реализовать GraphQL API для гибких запросов данных",
    "Создать систему архивирования старых данных",
    "Разработать модуль обработки заявок и запросов",
    "Интегрировать с системой учета рабочего времени",
    "Создать конструктор опросов и анкет для сотрудников",
    "Разработать систему учета материально-технических ценностей",
    "Настроить микросервисную архитектуру приложения",
    "Создать систему контроля версий документов",
    "Разработать модуль управления контрактами и соглашениями",
    "Интегрировать с биометрической системой доступа",
    "Настроить автоматическое резервное копирование данных",
    "Создать систему планирования и контроля бюджета",
    "Развернуть приложение в Kubernetes кластере",
    "Внедрить систему аудита всех действий пользователей",
    "Разработать модуль управления проектами",
    "Интегрировать с платформой видеоконференций",
    "Создать библиотеку переиспользуемых шаблонов",
    "Разработать систему электронного документооборота",
    "Настроить мониторинг производительности приложения",
    "Создать систему автоматизации рутинных процессов",
    "Разработать CRM модуль для работы с клиентами",
    "Интегрировать с корпоративной IP-телефонией",
    "Создать систему определения местоположения сотрудников",
    "Разработать модуль складского учета и инвентаризации",
    "Настроить отказоустойчивую систему бэкапов",
    "Создать поддержку множественных языков интерфейса",
    "Разработать модуль финансового планирования",
    "Интегрировать с системой электронной цифровой подписи",
    "Создать систему персонализации пользовательского интерфейса",
    "Разработать модуль управления поставщиками",
    "Настроить балансировку нагрузки между серверами",
    "Создать систему рекомендаций на основе поведения пользователей",
    "Разработать модуль автоматизации маркетинговых кампаний",
    "Интегрировать с популярными социальными сетями",
    "Создать платформу для A/B тестирования интерфейса",
    "Разработать CRM для отдела продаж",
    "Настроить автоматическое масштабирование ресурсов",
    "Внедрить алгоритмы машинного обучения для прогнозирования",
    "Разработать модуль управления логистическими процессами",
    "Интегрировать с корпоративной системой бухгалтерского учета",
    "Создать систему на базе блокчейн технологий",
    "Разработать модуль контроля качества продукции",
    "Настроить сеть доставки контента (CDN)",
    "Создать систему мониторинга IoT устройств",
    "Разработать комплексный модуль информационной безопасности",
    "Интегрировать с системой видеонаблюдения",
    "Создать систему прогнозирования трендов и аналитики",
    "Разработать модуль автоматизации производственных процессов",
    "Настроить систему автоматического переключения при сбоях",
    "Создать платформу для чат-поддержки в реальном времени",
    "Разработать модуль HR аналитики и кадрового планирования",
    "Интегрировать с системой планирования ресурсов предприятия",
    "Создать платформу виртуальной и дополненной реальности",
    "Разработать модуль экологического мониторинга производства",
    "Настроить вычисления на периферийных устройствах",
    "Создать систему распознавания и обработки речи",
    "Разработать платформу управления корпоративными знаниями",
    "Интегрировать с распределенными системами контроля версий",
    "Создать модуль предиктивной аналитики данных",
    "Разработать решение для кросс-платформенной совместимости",
    "Настроить систему коммуникаций в реальном времени",
    "Создать платформу автоматического горизонтального масштабирования",
    "Разработать модуль интеллектуального семантического поиска",
    "Интегрировать с экспериментальными квантовыми вычислениями",
    "Создать систему глубокого обучения нейронных сетей",
    "Разработать модуль дополненной реальности для обучения",
    "Настроить распределенную систему параллельных вычислений",
    "Создать платформу компьютерного зрения и анализа изображений",
    "Разработать модуль обработки естественного языка",
    "Интегрировать с робототехническими системами автоматизации",
    "Создать систему автономного управления бизнес-процессами",
    "Разработать модуль квантовой криптографии для защиты данных",
    "Настроить распределенную файловую систему хранения",
    "Создать комплексную платформу искусственного интеллекта",
    "Разработать модуль полностью автоматизированного тестирования",
    "Интегрировать с экосистемой умного города",
    "Создать систему цифровых двойников для моделирования процессов",
    "Разработать модуль интеллектуального управления большими данными",
    "Настроить гибридную облачную инфраструктуру нового поколения"
  ];

  for (let i = 0; i < 125; i++) {
    const creator = creators[i % creators.length];
    const title = taskTitles[i % taskTitles.length];
    const description = descriptions[i % descriptions.length];

    tasks.push({
      title: title,
      description: description,
      status: Object.values(TaskStatusEnum)[Math.floor(Math.random() * Object.values(TaskStatusEnum).length)],
      priority: Object.values(TaskPriorityEnum)[Math.floor(Math.random() * Object.values(TaskPriorityEnum).length)],
      deadline: faker.date.future({ years: 0.5 }), // Дедлайн в течение 6 месяцев
      creatorId: creator.id,
      attachments: Math.random() > 0.7 ? JSON.stringify([
        { name: `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`, url: `/files/${title.toLowerCase().replace(/\s+/g, '_')}.pdf` }
      ]) : null
    });
  }
  
  await knex("tasks").insert(tasks).returning('*');
};
