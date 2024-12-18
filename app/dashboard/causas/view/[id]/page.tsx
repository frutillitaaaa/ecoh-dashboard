// app/dashboard/causas/view/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

interface MedidaCautelar {
  id: string;
  tipo: string;
  descripcion: string;
  fechaInicio: string;
  fechaTermino: string | null;
}

interface Imputado {
  id: string;
  nombre: string;
  rut: string;
  nacionalidadId: string;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
  foto: string;
  nacionalidad: {
    id: string;
    nombre: string;
  };
  causas?: CausaImputado[];
}

interface CausaImputado {
  id: string;
  causaId: string;
  imputadoId: string;
  esImputado: boolean;
  esSujetoInteres: boolean;
  formalizado: boolean;
  fechaFormalizacion: string;
  cautelarId: string;
  causa: {
    ruc: string
  };
  plazo: string;
  imputado: {
    nombreSujeto: string;
    fotoPrincipal: string;
    docId:string;
  };
  cautelar: {
    nombre: string;
  };
  datosImputado:Imputado;
}

interface Causa {
  id: string;
  denominacionCausa: string;
  ruc: string;
  rit: string;
  fiscal: {
    id: string;
    nombre: string;
  } | null;
  delito: {
    id: string;
    nombre: string;
  } | null;
  fechaDelHecho: string | null;
  fechaHoraTomaConocimiento: string | null;
  causaEcoh: boolean;
  foliobw: string | null;
  observacion: string | null;
  causasImputados: Array<{
    id: string;
    imputado: Imputado;
  }>;
  victimas: Array<{
    id: string;
    nombre: string;
    rut: string;
  }>;
}

export default function CausaViewPage() {
  const params = useParams();
  const [causa, setCausa] = useState<Causa | null>(null);
  const [imputados, setImputados] = useState<CausaImputado[]>([]);
  const [causaImputado, setCausaImputado] = useState<CausaImputado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCausa = async () => {
      try {
        // 1. Obtener la causa con sus relaciones básicas
        const causaResponse = await fetch(`/api/causas/${params.id}`);
        if (!causaResponse.ok) throw new Error('Error al cargar la causa');
        const causaData = await causaResponse.json();
        setCausa(causaData);
        

        // 2. Obtener los imputados de la causa
        const imputadosResponse = await fetch(
          `/api/causas-imputados?causaId=${params.id}`
        );
        if (!imputadosResponse.ok)
          throw new Error('Error al cargar los imputados');
        const imputadosData = await imputadosResponse.json();
        
        setImputados(imputadosData);
        
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        toast.error('Error al cargar los datos de la causa');
      } finally {
        setLoading(false);
      }
    };

    fetchCausa();
    
    
    /*
    const fetchCautelaresImputado = async () => {
     // 3. Para cada imputado, obtener sus medidas cautelares
        const imputadosConMedidas = await Promise.all(
          imputadosData.map(async (imputado: any) => {
            try {
              const medidasResponse = await fetch(
                `/api/medidas-cautelares?imputadoId=${imputado.id}`
              );
              const medidas = medidasResponse.ok
                ? await medidasResponse.json()
                : [];
              return {
                ...imputado,
                medidasCautelares: medidas
              };
            } catch (error) {
              console.error(
                `Error al cargar medidas para imputado ${imputado.id}:`,
                error
              );
              return imputado;
            }
          })
        );

      imputados.map(async (imputado: any) => { 
        try {
          //Obtener datos de cada imputado
          const imputadosResponse = await fetch(
            `/api/imputado/id=${imputado.imputado.imputadoId}`
          )
          if(!imputadosResponse.ok) 
          throw new Error('Error al cargar los datos de los imputados');
          const imputadosData = await imputadosResponse.json();

          setDatosImputado(imputadosData);
        } catch (error) {
          console.error('Error al cargar los datos:', error);
        }
      });
      
        
    };
    
    fetchCautelaresImputado();
    */
  }, [params.id]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!causa) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p>No se encontró la causa</p>
        <Link href="/dashboard/causas">
          <Button variant="outline">Volver</Button>
        </Link>
      </div>
      
    );
  }
 
  const GeneratePdf = dynamic(() => import('@/components/GeneratePdf'), {
      ssr: false,
  });

  const datosCausa = {
    RUC: causa.ruc,
    denominacion: causa.denominacionCausa,
    fiscal: causa.fiscal?.nombre ?? null,
    RIT: causa.rit,
    delito: causa.delito?.nombre ?? null,
    folio_bw: causa.foliobw ?? null,
    fecha_toma_conocimiento: causa.fechaHoraTomaConocimiento ? format(new Date(causa.fechaHoraTomaConocimiento), 'dd/MM/yyyy', {
      locale: es
    }) : null,
    fecha_del_hecho: causa.fechaDelHecho ? format(new Date(causa.fechaDelHecho), 'dd/MM/yyyy', {
      locale: es
    }) : null,
    estado_ecoh: causa.causaEcoh,
    nombre_imputado: imputados.map(causaImputado => causaImputado.imputado.nombreSujeto) || null,
    rut_imputado: imputados.map(causaImputado => causaImputado.imputado.docId) || null
};
console.log(datosCausa);
  return (
    <div className="container mx-auto space-y-6 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/causas">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Detalles de la Causa</h1>
            <p className="text-muted-foreground">RUC: {causa.ruc}</p>
          </div>
          <div className="hidden items-center space-x-2 md:flex ml-10">
              <GeneratePdf pdfData={datosCausa} />
        </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Información General</TabsTrigger>
          <TabsTrigger value="imputados">Imputados</TabsTrigger>
          <TabsTrigger value="victimas">Víctimas</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Causa</CardTitle>
              <CardDescription>Detalles generales de la causa</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Denominación</h3>
                  <p className="text-sm text-muted-foreground">
                    {causa.denominacionCausa}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">RIT</h3>
                  <p className="text-sm text-muted-foreground">
                    {causa.rit || '-'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Fiscal</h3>
                  <p className="text-sm text-muted-foreground">
                    {causa.fiscal?.nombre || '-'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Delito</h3>
                  <p className="text-sm text-muted-foreground">
                    {causa.delito?.nombre || '-'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Folio BW</h3>
                  <p className="text-sm text-muted-foreground">
                    {causa.foliobw || '-'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Fecha del Hecho</h3>
                  <p className="text-sm text-muted-foreground">
                    {causa.fechaDelHecho
                      ? format(new Date(causa.fechaDelHecho), 'dd/MM/yyyy', {
                          locale: es
                        })
                      : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Fecha Toma Conocimiento</h3>
                  <p className="text-sm text-muted-foreground">
                    {causa.fechaHoraTomaConocimiento
                      ? format(
                          new Date(causa.fechaHoraTomaConocimiento),
                          'dd/MM/yyyy HH:mm',
                          { locale: es }
                        )
                      : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Estado ECOH</h3>
                  <Badge variant={causa.causaEcoh ? 'default' : 'secondary'}>
                    {causa.causaEcoh ? 'Sí' : 'No'}
                  </Badge>
                </div>
                {causa.observacion && (
                  <div className="col-span-2">
                    <h3 className="font-medium">Observación</h3>
                    <p className="text-sm text-muted-foreground">
                      {causa.observacion}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imputados">
          <Card>
            <CardHeader>
              <CardTitle>Imputados y Medidas Cautelares</CardTitle>
              <CardDescription>
                Listado de imputados en la causa y sus medidas cautelares
              </CardDescription>
            </CardHeader>
            <CardContent>
              {imputados.length > 0 ? (
                <div className="space-y-6">
                  {imputados.map((causaImputado) => (
                    <div
                      key={causaImputado.id}
                      className="space-y-4 rounded-lg border p-4"
                    >
                      <div>
                        <h4 className="text-lg font-medium">
                          {causaImputado.imputado.nombreSujeto}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          RUT: {causaImputado.imputado.docId|| '-'}
                        </p>
                      </div>
                      
                      {/* Medidas Cautelares */}
                      {/* está en 1.txt*/}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No hay imputados registrados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="victimas">
          <Card>
            <CardHeader>
              <CardTitle>Víctimas</CardTitle>
              <CardDescription>Listado de víctimas en la causa</CardDescription>
            </CardHeader>
            <CardContent>
              {causa.victimas?.length > 0 ? (
                <div className="space-y-4">
                  {causa.victimas.map((victima) => (
                    <div key={victima.id} className="rounded-lg border p-4">
                      <h4 className="font-medium">{victima.nombre}</h4>
                      <p className="text-sm text-muted-foreground">
                        RUT: {victima.rut || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No hay víctimas registradas
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
