import { UserRoleEnum } from "../commons/enums/enums";

/**
 * Определяет роль пользователя на основе названия должности
 */
export function getRoleByPositionName(positionName: string): UserRoleEnum {
  const lowerName = positionName.toLowerCase();

  // HR роли
  if (lowerName.includes('hr') ||
    lowerName.includes('chro') ||
    lowerName.includes('персонал')) {
    return UserRoleEnum.HR;
  }

  // Руководящие роли (топ-менеджмент)
  if (lowerName.includes('руководитель') ||
    lowerName.includes('директор') ||
    lowerName.includes('начальник') ||
    lowerName.includes('заведующий') ||
    lowerName.includes('cto') ||
    lowerName.includes('cfo') ||
    lowerName.includes('cmo') ||
    lowerName.includes('coo') ||
    lowerName.includes('cso') ||
    lowerName.includes('главный') ||
    lowerName.includes('principal')) {
    return UserRoleEnum.HEAD;
  }

  // Менеджерские роли
  if (lowerName.includes('менеджер') ||
    lowerName.includes('manager') ||
    lowerName.includes('lead') ||
    lowerName.includes('лид')) {
    return UserRoleEnum.MANAGER;
  }

  // По умолчанию - обычный сотрудник
  return UserRoleEnum.EMPLOYEE;
}
