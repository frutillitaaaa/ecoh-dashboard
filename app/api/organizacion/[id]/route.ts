// app/api/organizacion/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const OrganizacionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  fechaIdentificacion: z.string().transform((str) => new Date(str)),
  activa: z.boolean().default(true),
  tipoOrganizacionId: z.number().int().positive()
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const organizacion = await prisma.organizacionDelictual.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        tipoOrganizacion: true,
        miembros: {
          include: {
            imputado: true
          }
        }
      }
    });

    if (!organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(organizacion);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const validatedData = OrganizacionSchema.parse(body);

    const organizacion = await prisma.organizacionDelictual.update({
      where: {
        id: id
      },
      data: validatedData,
      include: {
        tipoOrganizacion: true,
        miembros: {
          include: {
            imputado: true
          }
        }
      }
    });

    return NextResponse.json(organizacion);
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    // Error de Prisma cuando no encuentra el registro
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.organizacionDelictual.delete({
      where: {
        id: parseInt(params.id)
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}