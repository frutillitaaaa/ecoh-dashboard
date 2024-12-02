// app/api/auth/verify-admin/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role, hasPermission } from '@/utils/roles';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const { userId } = getAuth(request);
    console.log('Verificando userId en API:', userId);

    if (!userId) {
      console.log('No hay userId en la petición');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que prisma esté disponible
    if (!prisma) {
      console.error('Prisma no está inicializado');
      return NextResponse.json(
        { error: 'Error de configuración' },
        { status: 500 }
      );
    }

    const user = await prisma.usuarios.findUnique({
      where: {
        clerk_id: userId
      }
    });

    console.log('Usuario encontrado:', user);

    if (!user) {
      console.log('Usuario no encontrado en BD');
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 403 }
      );
    }

    if (!hasPermission(user.rol as Role, Role.ADMIN)) {
      console.log('Usuario sin permisos de admin');
      return NextResponse.json(
        { error: 'Sin permisos suficientes' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
