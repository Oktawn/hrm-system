import createError from "http-errors";
import { compareSync, hashSync } from "bcrypt";
import { employeeRepository, userRepository } from "../db/db-rep";

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export class ProfileService {

  async getProfile(userId: string) {
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["employee", "employee.position", "employee.department"]
    });

    if (!user) {
      throw createError(404, "User not found");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.employee?.firstName || null,
      lastName: user.employee?.lastName || null,
      phone: user.employee?.phone || null,
      position: user.employee?.position?.name || null,
      department: user.employee?.department?.name || null,
      role: user.role,
    };
  }

  async updateProfile(userId: string, profileData: UpdateProfileData) {
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["employee"]
    });

    if (!user) {
      throw createError(404, "User not found");
    }

    try {
      // Обновляем email в таблице users
      if (profileData.email !== user.email) {
        // Проверяем, что новый email не занят
        const existingUser = await userRepository.findOne({
          where: { email: profileData.email }
        });
        
        if (existingUser && existingUser.id !== userId) {
          throw createError(409, "Email already exists");
        }
        
        user.email = profileData.email;
        await userRepository.save(user);
      }

      // Обновляем данные сотрудника
      if (user.employee) {
        user.employee.firstName = profileData.firstName;
        user.employee.lastName = profileData.lastName;
        user.employee.phone = profileData.phone || null;
        await employeeRepository.save(user.employee);
      }

      return await this.getProfile(userId);
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw createError(500, "Internal server error");
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findOneBy({ id: userId });
    
    if (!user) {
      throw createError(404, "User not found");
    }

    const isValidPassword = compareSync(currentPassword, user.password);
    if (!isValidPassword) {
      throw createError(400, "Current password is incorrect");
    }

    try {
      user.password = hashSync(newPassword, 12);
      await userRepository.save(user);
    } catch (error) {
      throw createError(500, "Internal server error");
    }
  }

}
