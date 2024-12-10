import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

 

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(
      searchParams.get('year') || new Date().getFullYear().toString()
    );
    const tipoDelito = searchParams.get('tipoDelito');

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Base query conditions incluyendo causaEcoh = true
    const baseWhere = {
      fechaDelHecho: {
        gte: startDate,
        lte: endDate
      },
      causaEcoh: true, // Regla base: solo causas ECOH
      ...(tipoDelito && tipoDelito !== 'todos' ? { delitoId: parseInt(tipoDelito) } : {})
    };

    // Obtener total de causas del año con filtros
    const totalCausas = await prisma.causa.count({
      where: baseWhere
    });

    // Obtener causas esclarecidas con filtros
    const causasImputados = await prisma.causa.findMany({
      where: baseWhere,
      include: {
        imputados: {
          include: {
            cautelar: true
          }
        }
      }
    });

    let causasFormalizadas = 0;
    let causasConCautelar = 0;
    let causasAmbasSituaciones = 0;
    let causasEsclarecidas = 0;

    causasImputados.forEach((causa) => {
      const tieneFormalizados = causa.imputados.some((imp) => imp.formalizado);
      const tieneCautelar = causa.imputados.some(
        (imp) => imp.cautelarId !== null && imp.cautelar?.fechaTermino === null // Solo cautelares vigentes
      );

      if (tieneFormalizados) causasFormalizadas++;
      if (tieneCautelar) causasConCautelar++;
      if (tieneFormalizados && tieneCautelar) causasAmbasSituaciones++;
      if (tieneFormalizados || tieneCautelar) causasEsclarecidas++;
    });

    const porcentaje = totalCausas > 0 ? (causasEsclarecidas / totalCausas) * 100 : 0;

    return NextResponse.json({
      totalCausas,
      causasEsclarecidas,
      porcentaje,
      detalles: {
        causasFormalizadas,
        causasConCautelar,
        causasAmbasSituaciones
      }
    });
  } catch (error) {
    console.error('Error fetching tasa esclarecimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}