import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      fullName, 
      email, 
      roleId, 
      currentPassword, 
      newPassword 
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID пользователя обязателен' },
        { status: 400 }
      );
    }

    // Получаем текущего пользователя
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверяем, что email не занят другим пользователем
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Пользователь с таким email уже существует' },
          { status: 400 }
        );
      }
    }

    // Проверяем роль, если она изменяется
    if (roleId && roleId !== user.roleId) {
      const role = await prisma.role.findUnique({
        where: { id: parseInt(roleId.toString()) },
      });

      if (!role) {
        return NextResponse.json(
          { error: 'Указанная роль не существует' },
          { status: 400 }
        );
      }
    }

    // Проверяем пароль, если он изменяется
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Для изменения пароля необходимо ввести текущий пароль' },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Неверный текущий пароль' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Новый пароль должен содержать минимум 6 символов' },
          { status: 400 }
        );
      }
    }

    // Подготавливаем данные для обновления
    const updateData: Record<string, unknown> = {};

    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (roleId) updateData.roleId = parseInt(roleId.toString());
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      include: {
        role: true,
      },
    });

    // Подготавливаем данные для ответа
    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      roleId: updatedUser.roleId,
      roleName: updatedUser.role.name,
      profileImageUrl: updatedUser.profileImageUrl,
      createdAt: updatedUser.createdAt,
    };

    return NextResponse.json({
      success: true,
      message: 'Профиль успешно обновлен',
      user: userData,
    });

  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 