import { useState, useEffect } from 'react'
import { Card, Grid, CardContent, createStyles, makeStyles, Theme } from '@material-ui/core'
import { IoAddCircleOutline, IoTrashOutline } from 'react-icons/io5'
import { useTranslation } from 'react-i18next'

import { isValidArray } from '@rombomx/ui-commons'
import { SelectCustom, DialogGeneric, Text, InputText } from '../commons'
import { ImpuestosProps, ButtonsDialog } from '../../propTypes'
import { deleteItem } from '../../services'
import { useErrorHandler } from '../../providers/errors'
import { useFeedback } from '../../providers/feedback'
import { ImpuestoFormulario } from './ImpuestoFormulario.legacy'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      marginBottom: theme.spacing(2),
      color: theme.palette.text.hint,
    },
    card: {
      marginBottom: theme.spacing(2),
    },
    addDirection: {
      borderTop: '1px solid gray',
    },
    direction: {
      marginTop: '1em',
    },
    impuestoIcon: {
      cursor: 'pointer',
      color: theme.palette.primary.main,
    },
    delete: {
      textAlign: 'right',
      marginRight: 0,
      marginBottom: theme.spacing(2),
    },
    deleteIcon: {
      color: theme.palette.error.main,
      cursor: 'pointer',
    },
  }),
)

/**
 * Componente para mostrar los impuestos de un artículo
 * @params ImpuestosProps
 * @returns JSX.Element
 */
export const ImpuestosFormularioLegacy = ({
  control,
  register,
  append,
  remove,
  fields,
  errors,
  deshabilitado,
  impuestos,
  articuloId,
  getValues,
  setValue,
  replace,
  _impuestos,
}: ImpuestosProps): JSX.Element => {
  const classes = useStyles()
  const [impuestoSelecionado, setImpuestoSeleccionado] =
    useState<{ impuestoId: number; index: number }>(null)
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
    console.log('DELETE', impuestoSelecionado)
    if (impuestoSelecionado.impuestoId) {
      try {
        await deleteItem('articulos', `${articuloId}/impuestos/${impuestoSelecionado.impuestoId}`)
        remove(impuestoSelecionado.index)
        setModalBorrado(false)
        successMessage(t('impuesto eliminado exitosamente'))
        setImpuestoSeleccionado(null)
      } catch (e) {
        handleError(t('error'), t(e?.response?.data?.title), e)
      }
    } else {
      remove(impuestoSelecionado.index)
      setModalBorrado(false)
      successMessage(t('impuesto eliminado exitosamente'))
      setImpuestoSeleccionado(null)
    }
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
    setImpuestoSeleccionado({ index, impuestoId: field.impuestoId })
    setModalBorrado(true)
  }

  const pintarImpuestos = () => {
    if (!isValidArray(fields)) return null
    return fields.map((field, index) => {
      return (
        <Grid item xs={12}>
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={1}
          >
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
            <Grid xs={7} item>
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
      )
    })
  }

  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid container direction="column" alignItems="stretch">
          {pintarImpuestos()}
        </Grid>
      </CardContent>
      {modalBorrado && impuestoSelecionado && (
        <DialogGeneric
          open={modalBorrado}
          text={<Text text="¿Deseas eliminar de forma permanente el impuesto seleccionado?" />}
          title={<Text text="Eliminar impuesto" />}
          buttons={botonesBorrar}
          handleClose={cerrarBorrado}
          actions
        />
      )}
    </Card>
  )
}

export default ImpuestosFormularioLegacy
