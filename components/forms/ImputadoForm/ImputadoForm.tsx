'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import NacionalidadSelect from '@/components/select/NacionalidadSelect';

const ImputadoFormSchema = z.object({
  nombreSujeto: z.string().min(1, 'El nombre es requerido'),
  docId: z.string().min(1, 'El documento de identidad es requerido'),
  nacionalidadId: z.string().min(1, 'La nacionalidad es requerida')
});

type ImputadoFormValues = z.infer<typeof ImputadoFormSchema>;

interface ImputadoFormProps {
  initialValues?: Partial<ImputadoFormValues>;
  onSubmit: (data: ImputadoFormValues) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
}

export default function ImputadoForm({
  initialValues,
  onSubmit,
  isSubmitting,
  isEditing
}: ImputadoFormProps) {
  const form = useForm<ImputadoFormValues>({
    resolver: zodResolver(ImputadoFormSchema),
    defaultValues: {
      nombreSujeto: '',
      docId: '',
      nacionalidadId: '',
      ...initialValues
    }
  });

  const isFormDirty = Object.keys(form.formState.dirtyFields).length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombreSujeto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ingrese el nombre completo" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Documento de Identidad */}
        <FormField
          control={form.control}
          name="docId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Documento de Identidad</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ingrese el documento de identidad"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nacionalidad */}
        <FormField
          control={form.control}
          name="nacionalidadId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nacionalidad</FormLabel>
              <FormControl>
                <NacionalidadSelect
                  value={field.value}
                  onValueChange={field.onChange} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting || !isFormDirty}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || (!isFormDirty && !isEditing)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : isEditing ? (
              'Actualizar'
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}