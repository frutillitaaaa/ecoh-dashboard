import React, { useState } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Button } from '@/components/ui/button';
import {Download} from 'lucide-react';

if (pdfMake && pdfFonts && pdfFonts.pdfMake?.vfs) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
} else {
    console.error('No se pudo asignar las fuentes vfs a pdfMake');
}

interface DatosCausa {
    RUC: string;
    denominacion: string;
    fiscal: string | null;
    RIT: string;
    delito: string | null;
    folio_bw: string | null;
    fecha_toma_conocimiento: string | null;
    fecha_del_hecho: string | null;
    estado_ecoh: boolean;
    nombre_imputado: string[] | null;
    rut_imputado: string[] | null;
}

interface pdfProps {
    pdfData : DatosCausa;
}

const GeneratePdf :  React.FC<pdfProps> = ({ pdfData }) => {

    const generatePdf = (params: DatosCausa) => {
        if (!params) return;

        let estado:string = '';
        if (params.estado_ecoh) {
            estado = 'si';
        } else {
            estado = 'no';
        }

        const RIT = params.RIT ?? '-';
        const fiscal = params.fiscal ?? '-';
        const delito = params.delito ?? '-';
        const fecha_toma_conocimiento = params.fecha_toma_conocimiento ?? '-';
        const fecha_del_hecho = params.fecha_del_hecho ?? '-';
        const nombre_imputado = params.nombre_imputado ?? ['-'];
        const rut_imputado = params.rut_imputado ?? ['-'];

        const documentDefinition = {

            content : [
                {text: 'Detalles de la Causa', font: 'Roboto', bold: true, fontSize: 20},
                {text: `RUC: ${params.RUC}`, font: 'Roboto', bold: false, fontSize: 20 },
                {text: `\nDenominación: ${params.denominacion}`, font: 'Roboto', bold: true },
                {text: `\nRIT: ${RIT}`},
                {text: `\nFiscal: ${fiscal}`},
                {text: `\nDelito: ${delito}`},
                {text: `\nFolio BW: ${params.folio_bw}`},
                {text: `\nFecha del hecho: ${fecha_del_hecho}`},
                {text: `\nFecha Toma de conocimiento: ${fecha_toma_conocimiento}`},
                {text: `\nCausa ECOH: ${estado}`},
                {text: `\nImputados`, font: 'Roboto', bold: false, fontSize: 20},
                ...nombre_imputado.map((nombre, index) => ({
                    text: `\nNombrea: ${nombre} \nRUT: ${rut_imputado[index]}`,
                    font: 'Roboto',
                    bold: false
                }))

            ],
        };

        pdfMake.createPdf(documentDefinition).download(`CAUSA${params.RUC}.pdf`);

    }

    return (
        <div className="hidden items-center space-x-2 md:flex ml-10">
              <Button variant="outline" size="default" onClick = {() => generatePdf(pdfData)}>   
              <Download className="h-4 w-4" />
              Descargar Informe
              </Button>
        </div>
    );
};

export default GeneratePdf;

//agregando comentarios
//aaa
//aaaa
///aaa