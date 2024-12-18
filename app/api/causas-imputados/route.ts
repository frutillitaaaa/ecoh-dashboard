import { NextResponse } from 'next/server';
import { PrismaClient, CausasImputados } from '@prisma/client';
import { z } from 'zod';
const prisma = new PrismaClient();

const CausaImputadoSchema = z.object({
  causaId: z.string().min(1, 'Debe seleccionar una causa'),
  imputadoId: z.string().min(1, 'El imputado es requerido'),
  esimputado: z.boolean().default(false),
  essujetoInteres: z.boolean().default(false),
  formalizado: z.boolean().default(false),
  fechaFormalizacion: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
  plazo: z.number().nullable().default(0), // Nuevo campo
  cautelarId: z.string().optional().nullable()
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const causaId = searchParams.get('causaId');

    if (causaId) {
      const imputadosData = await prisma.causasImputados.findMany({
        where: {
          causaId: parseInt(causaId)
        },
        select: {
          causaId: true,
          imputadoId: true,
          esimputado: true,
          essujetoInteres: true,
          formalizado: true,
          fechaFormalizacion: true,
          plazo: true, // Nuevo campo
          cautelarId: true,
          causa: {
            select: {
              ruc: true
            }
          },
          imputado: {
            select: {
              nombreSujeto: true,
              fotoPrincipal: true,
              docId: true 
            }
          },
          cautelar: {
            select: {
              nombre: true
            }
          }
        }
      });

      const formattedData = imputadosData.map((registro) => ({
        id: `${registro.causaId}-${registro.imputadoId}`,
        causaId: registro.causaId,
        imputadoId: registro.imputadoId,
        esImputado: registro.esimputado,
        essujetoInteres: registro.essujetoInteres,
        formalizado: registro.formalizado,
        fechaFormalizacion: registro.fechaFormalizacion?.toISOString() || null,
        cautelarId: registro.cautelarId,
        causa: registro.causa,
        plazo: registro.plazo,
        imputado: registro.imputado,
        cautelar: registro.cautelar
      }));

      return NextResponse.json(formattedData);
    }

    // Si no se proporciona causaId, devolver el conteo de imputados por causa
    const causasConCount = await prisma.$queryRaw`
      SELECT 
        c.id as "causaId",
        c.ruc,
        COUNT(CASE WHEN ci.esimputado = true THEN 1 END) as "totalImputados",
        COUNT(CASE WHEN ci.essujeto_interes = true THEN 1 END) as "totalSujetosInteres"
      FROM "Causa" c
      LEFT JOIN "CausasImputados" ci ON c.id = ci.causa_id
      GROUP BY c.id, c.ruc
    `;

    return NextResponse.json(causasConCount);
  } catch (error) {
    console.error('Error detallado:', {
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = CausaImputadoSchema.parse(body);

    // Primero verificamos que existan tanto la causa como el imputado
    const [causa, imputado] = await Promise.all([
      prisma.causa.findUnique({
        where: { id: parseInt(validatedData.causaId) }
      }),
      prisma.imputado.findUnique({
        where: { id: parseInt(validatedData.imputadoId) }
      })
    ]);

    if (!causa || !imputado) {
      return NextResponse.json(
        { error: 'Causa o Imputado no encontrado' },
        { status: 404 }
      );
    }

    const causaImputado = await prisma.causasImputados.create({
      data: {
        causaId: parseInt(validatedData.causaId),
        imputadoId: parseInt(validatedData.imputadoId),
        esimputado: validatedData.esimputado,
        essujetoInteres: validatedData.essujetoInteres,
        formalizado: validatedData.formalizado,
        plazo: validatedData.plazo,
        fechaFormalizacion: validatedData.fechaFormalizacion,
        cautelarId: validatedData.cautelarId
          ? parseInt(validatedData.cautelarId)
          : null
      },
      include: {
        causa: {
          select: {
            ruc: true
          }
        },
        imputado: {
          select: {
            nombreSujeto: true
          }
        },
        cautelar: {
          select: {
            nombre: true
          }
        }
      }
    });

    return NextResponse.json(causaImputado, { status: 201 });
  } catch (error) {
    console.error('Error creating CausaImputado:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una relación entre esta causa y este imputado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// app/api/causas-imputados/route.ts

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const causaId = searchParams.get('causaId');
    const imputadoId = searchParams.get('imputadoId');

    if (!causaId || !imputadoId) {
      return NextResponse.json(
        { error: 'Se requieren causaId e imputadoId' },
        { status: 400 }
      );
    }

    await prisma.causasImputados.delete({
      where: {
        causaId_imputadoId: {
          causaId: parseInt(causaId),
          imputadoId: parseInt(imputadoId)
        }
      }
    });

    return NextResponse.json({
      message: 'Relación causa-imputado eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting CausaImputado:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'No se encontró la relación causa-imputado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
