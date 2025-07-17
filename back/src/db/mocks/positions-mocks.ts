export const positions = [
    // IT отдел (id: 1)
    { id: 1, name: "Руководитель IT отдела", baseSalary: 180000.00, grade: "Senior", departmentId: 1 },
    { id: 2, name: "Старший разработчик", baseSalary: 140000.00, grade: "Senior", departmentId: 1 },
    { id: 3, name: "Frontend разработчик", baseSalary: 110000.00, grade: "Middle", departmentId: 1 },
    { id: 4, name: "Backend разработчик", baseSalary: 115000.00, grade: "Middle", departmentId: 1 },
    { id: 5, name: "DevOps инженер", baseSalary: 130000.00, grade: "Middle", departmentId: 1 },
    { id: 6, name: "Младший разработчик", baseSalary: 80000.00, grade: "Junior", departmentId: 1 },
    { id: 7, name: "QA инженер", baseSalary: 90000.00, grade: "Middle", departmentId: 1 },
    { id: 8, name: "Системный администратор", baseSalary: 100000.00, grade: "Middle", departmentId: 1 },

    // HR отдел (id: 2)
    { id: 9, name: "Руководитель HR отдела", baseSalary: 160000.00, grade: "Senior", departmentId: 2 },
    { id: 10, name: "HR менеджер", baseSalary: 100000.00, grade: "Middle", departmentId: 2 },
    { id: 11, name: "HR специалист", baseSalary: 70000.00, grade: "Junior", departmentId: 2 },
    { id: 12, name: "Рекрутер", baseSalary: 80000.00, grade: "Middle", departmentId: 2 },

    // Финансовый отдел (id: 3)
    { id: 13, name: "Руководитель финансового отдела", baseSalary: 200000.00, grade: "Senior", departmentId: 3 },
    { id: 14, name: "Главный бухгалтер", baseSalary: 120000.00, grade: "Senior", departmentId: 3 },
    { id: 15, name: "Бухгалтер", baseSalary: 70000.00, grade: "Middle", departmentId: 3 },
    { id: 16, name: "Финансовый аналитик", baseSalary: 90000.00, grade: "Middle", departmentId: 3 },
    { id: 17, name: "Казначей", baseSalary: 85000.00, grade: "Middle", departmentId: 3 },

    // Маркетинг (id: 4)
    { id: 18, name: "Руководитель маркетинга", baseSalary: 170000.00, grade: "Senior", departmentId: 4 },
    { id: 19, name: "Маркетинг менеджер", baseSalary: 95000.00, grade: "Middle", departmentId: 4 },
    { id: 20, name: "SMM специалист", baseSalary: 60000.00, grade: "Junior", departmentId: 4 },
    { id: 21, name: "Контент-менеджер", baseSalary: 55000.00, grade: "Junior", departmentId: 4 },
    { id: 22, name: "Дизайнер", baseSalary: 75000.00, grade: "Middle", departmentId: 4 },

    // Продажи (id: 5)
    { id: 23, name: "Руководитель отдела продаж", baseSalary: 190000.00, grade: "Senior", departmentId: 5 },
    { id: 24, name: "Старший менеджер по продажам", baseSalary: 120000.00, grade: "Senior", departmentId: 5 },
    { id: 25, name: "Менеджер по продажам", baseSalary: 80000.00, grade: "Middle", departmentId: 5 },
    { id: 26, name: "Менеджер по работе с клиентами", baseSalary: 75000.00, grade: "Middle", departmentId: 5 },

    // Операционный отдел (id: 6)
    { id: 27, name: "Руководитель операционного отдела", baseSalary: 150000.00, grade: "Senior", departmentId: 6 },
    { id: 28, name: "Операционный менеджер", baseSalary: 100000.00, grade: "Middle", departmentId: 6 },
    { id: 29, name: "Специалист по процессам", baseSalary: 80000.00, grade: "Middle", departmentId: 6 },

    // Юридический отдел (id: 7)
    { id: 30, name: "Руководитель юридического отдела", baseSalary: 220000.00, grade: "Senior", departmentId: 7 },
    { id: 31, name: "Юрист", baseSalary: 110000.00, grade: "Middle", departmentId: 7 },
    { id: 32, name: "Помощник юриста", baseSalary: 60000.00, grade: "Junior", departmentId: 7 },

    // Отдел качества (id: 8)
    { id: 33, name: "Руководитель отдела качества", baseSalary: 160000.00, grade: "Senior", departmentId: 8 },
    { id: 34, name: "Менеджер по качеству", baseSalary: 90000.00, grade: "Middle", departmentId: 8 },
    { id: 35, name: "Специалист по качеству", baseSalary: 70000.00, grade: "Middle", departmentId: 8 },

    // Закупки и логистика (id: 9)
    { id: 36, name: "Руководитель отдела закупок", baseSalary: 150000.00, grade: "Senior", departmentId: 9 },
    { id: 37, name: "Менеджер по закупкам", baseSalary: 85000.00, grade: "Middle", departmentId: 9 },
    { id: 38, name: "Логист", baseSalary: 75000.00, grade: "Middle", departmentId: 9 },
    { id: 39, name: "Специалист по закупкам", baseSalary: 65000.00, grade: "Junior", departmentId: 9 },

    // Исследования и разработки (id: 10)
    { id: 40, name: "Руководитель R&D", baseSalary: 250000.00, grade: "Senior", departmentId: 10 },
    { id: 41, name: "Ведущий исследователь", baseSalary: 180000.00, grade: "Senior", departmentId: 10 },
    { id: 42, name: "Исследователь", baseSalary: 120000.00, grade: "Middle", departmentId: 10 },
    { id: 43, name: "Аналитик", baseSalary: 95000.00, grade: "Middle", departmentId: 10 },

    // Служба безопасности (id: 11)
    { id: 44, name: "Руководитель службы безопасности", baseSalary: 180000.00, grade: "Senior", departmentId: 11 },
    { id: 45, name: "Специалист по безопасности", baseSalary: 95000.00, grade: "Middle", departmentId: 11 },
    { id: 46, name: "Охранник", baseSalary: 45000.00, grade: "Junior", departmentId: 11 },

    // Административный отдел (id: 12)
    { id: 47, name: "Руководитель административного отдела", baseSalary: 130000.00, grade: "Senior", departmentId: 12 },
    { id: 48, name: "Администратор", baseSalary: 60000.00, grade: "Middle", departmentId: 12 },
    { id: 49, name: "Секретарь", baseSalary: 50000.00, grade: "Junior", departmentId: 12 },
    { id: 50, name: "Офис-менеджер", baseSalary: 70000.00, grade: "Middle", departmentId: 12 }
];
