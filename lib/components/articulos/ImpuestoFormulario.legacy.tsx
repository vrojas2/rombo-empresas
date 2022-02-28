import { useState } from 'react'
import { Grid } from '@material-ui/core'

import { IoAddCircleOutline, IoTrashOutline } from 'react-icons/io5'
import { useTranslation } from 'react-i18next'
import { isValidArray } from '@rombomx/ui-commons'
import { SelectCustom, DialogGeneric, Text, InputText } from '../commons'
import { ImpuestosProps, ButtonsDialog } from '../../propTypes'
import { deleteItem } from '../../services'
import { useErrorHandler } from '../../providers/errors'
import { useFeedback } from '../../providers/feedback'

type ImpuestoFormularioProps = {
  field: any
  index: number
  classes: any
  deshabilitado?: boolean
  remove: any
  append: any
  control: any
  errors?: any
  register: any
  impuestos?: any
  getValues?: any
}
export const ImpuestoFormulario = ({
  field,
  index,
  classes,
  deshabilitado,
  remove,
  append,
  control,
  errors,
  register,
  impuestos,
  getValues,
}: ImpuestoFormularioProps): JSX.Element => {
  const { handleError } = useErrorHandler()
  const { t } = useTranslation()
  const { successMessage } = useFeedback()
  const [modalBorrado, setModalBorrado] = useState<boolean>(false)

  const agregarImpuesto = () => {
    append({ impuesto: '' })
    console.log('add')
  }

  const cerrarBorrado = () => {
    setModalBorrado(false)
  }

  const eliminarImpuesto = async () => {
    // console.log('IMPUESTOS', impuestos)
    // console.log('DELETE', impuestoSelecionado)
    // console.log('DELETE index', impuestoSelecionado.index)
    // const _impuestos = getValues()?.impuestos
    // console.log('values', _impuestos)
    // console.log('values', _impuestos[impuestoSelecionado.index])
    // const impuestosRemain = _impuestos.filter((imp, i) => impuestoSelecionado.index !== i)
    // console.log('impuestosRemain', impuestosRemain)
    // setValue('impuestos', impuestosRemain)
    // fields.splice(impuestoSelecionado.index, 1)
    // if (impuestoSelecionado.impuestoId) {
    //   try {
    //     await deleteItem('articulos', `${articuloId}/impuestos/${impuestoSelecionado.impuestoId}`)
    //     remove(impuestoSelecionado.index)
    //     setModalBorrado(false)
    //     successMessage(t('impuesto eliminado exitosamente'))
    //     setImpuestoSeleccionado(null)
    //   } catch (e) {
    //     handleError(t('error'), t(e?.response?.data?.title), e)
    //   }
    // } else {
    remove(index)
    setModalBorrado(false)
    //   successMessage(t('impuesto eliminado exitosamente'))
    //   setImpuestoSeleccionado(null)
    // }
  }

  const botonesBorrar: Array<ButtonsDialog> = [
    {
      title: 'Cancelar',
      onClick: cerrarBorrado,
      color: 'secondary',
    },
    {
      title: 'Aceptar',
      onClick: eliminarImpuesto,
      color: 'primary',
    },
  ]

  const borrarImpuesto = (field, index) => {
    setModalBorrado(true)
  }
  return (
    <>
      <Grid item xs={12}>
        <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
          <Grid xs={4} item>
            {index === 0 && (
              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={1}
              >
                <Grid sm={6} item>
                  <h3>Impuesto</h3>
                </Grid>
                {!deshabilitado && (
                  <Grid sm={6} item>
                    <IoAddCircleOutline
                      className={classes.impuestoIcon}
                      size="2em"
                      onClick={agregarImpuesto}
                    />
                  </Grid>
                )}
              </Grid>
            )}
          </Grid>
          <Grid xs={3} item>
            <SelectCustom
              errors={errors}
              control={control}
              register={register}
              name="impuesto"
              index={index}
              fieldArrayName="impuestos"
              defaultValue={field.impuesto}
              label="Elige el impuesto"
              disabled={deshabilitado}
              rules={{
                required: false,
              }}
              options={impuestos}
              autoWidth
              getValues={getValues}
            />
          </Grid>
          <Grid xs={3} item>
            <SelectCustom
              errors={errors}
              control={control}
              register={register}
              name="impuesto2"
              index={index}
              fieldArrayName="impuestos"
              defaultValue={field.impuesto}
              label="Elige el impuesto"
              disabled={deshabilitado}
              rules={{
                required: false,
              }}
              options={impuestos}
              autoWidth
              getValues={getValues}
            />
          </Grid>
          <Grid item xs={1}>
            {!deshabilitado && (
              <div className={classes.delete}>
                <IoTrashOutline
                  className={classes.deleteIcon}
                  size="2em"
                  onClick={() => borrarImpuesto(field, index)}
                />
              </div>
            )}
          </Grid>
        </Grid>
      </Grid>
      {modalBorrado && (
        <DialogGeneric
          open={modalBorrado}
          text={<Text text="¿Deseas eliminar de forma permanente el impuesto seleccionado?" />}
          title={<Text text="Eliminar impuesto" />}
          buttons={botonesBorrar}
          handleClose={cerrarBorrado}
          actions
        />
      )}
    </>
  )
}

export default ImpuestoFormulario
