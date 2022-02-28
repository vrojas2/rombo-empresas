import { useEffect, useState } from 'react'
import { Grid, Divider, createStyles, makeStyles, Theme } from '@material-ui/core'
import { IoTrashOutline } from 'react-icons/io5'
import classnames from 'classnames'
import { isValidArray } from '@rombomx/ui-commons'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'

import { Text, InputText, DialogGeneric } from '../commons'
import { VariantesProps, ButtonsDialog } from '../../propTypes'
import { getVariantsCombination } from '../../helpers'
import { deleteItem } from '../../services'
import { useErrorHandler } from '../../providers/errors'
import { useFeedback } from '../../providers/feedback'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      paddingLeft: '2.5em !important',
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
    variantHeader: {
      backgroundColor: theme.palette.grey[300],
      padding: '1em 0',
    },
    paddingGrid: {
      padding: '0.5em',
    },
  }),
)
/**
 * Componente para mostrar las variantes de un articulo
 * @param VariantesProps
 * @returns JSX.Element
 */
export const VariantesFormulario = ({
  fields,
  remove,
  append,
  control,
  errors,
  deshabilitado,
  articuloCaracteristicas,
  articuloId,
  replace,
  variantesDefault,
}: VariantesProps): JSX.Element => {
  const classes = useStyles()
  const { handleError } = useErrorHandler()
  const { t } = useTranslation()
  const { successMessage, loading } = useFeedback()
  const [varianteSelecionada, setVarianteSeleccionada] =
    useState<{ varianteId: number; index: number }>(null)
  const [modalBorrado, setModalBorrado] = useState<boolean>(false)

  useEffect(() => {
    const variantesArray = getVariantsCombination(articuloCaracteristicas)
    if (isValidArray(variantesArray)) {
      remove()
      if (articuloId && isValidArray(variantesDefault)) {
        const nuevasVariantes = []
        const variantesActuales = []

        variantesArray.map((variante) => {
          const existeVariante = variantesDefault.find(
            (varDefault) => varDefault.nombre.toUpperCase() === variante.toUpperCase(),
          )

          if (existeVariante) {
            variantesActuales.push({
              nombre: variante,
              varianteId: existeVariante.varianteId,
              precio: existeVariante.precio,
              clave: existeVariante.clave,
            })
          } else {
            nuevasVariantes.push({ nombre: variante })
          }
        })
        replace(variantesActuales)
        nuevasVariantes.map((variante) => {
          append(variante)
        })
      } else {
        replace(variantesArray.map((variante) => ({ nombre: variante })))
      }
    } else {
      remove()
    }
  }, [JSON.stringify(articuloCaracteristicas)])

  const cerrarBorrado = () => {
    setModalBorrado(false)
  }

  const eliminarVariante = async () => {
    loading(t('eliminando variante...').toString())
    if (varianteSelecionada.varianteId) {
      try {
        await deleteItem('articulos', `${varianteSelecionada.varianteId}`)
        remove(varianteSelecionada.index)
        setVarianteSeleccionada(null)
        setModalBorrado(false)
        successMessage(t('variante eliminada exitosamente'))
      } catch (e) {
        handleError(t('error'), t(e?.response?.data?.title), e)
      } finally {
        loading(false)
      }
    } else {
      remove(varianteSelecionada.index)
      setVarianteSeleccionada(null)
      setModalBorrado(false)
      loading(false)
      successMessage(t('variante eliminada exitosamente'))
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
      onClick: eliminarVariante,
      color: 'primary',
    },
  ]

  const borrarVariante = (field, index) => {
    setModalBorrado(true)
    setVarianteSeleccionada({ varianteId: field.varianteId, index })
  }

  const pintarVariantes = () => {
    if (!Array.isArray(fields) && fields.length === 0) {
      return null
    }
    return fields.map((field, index) => {
      return (
        <>
          <Grid container direction="row" justifyContent="center" alignItems="center">
            <Grid xs={3} item className={classnames('text-center', classes.paddingGrid)}>
              <Text text={field.nombre} />
            </Grid>
            <Grid xs={3} item className={classnames('text-center', classes.paddingGrid)}>
              <InputText
                label="Precio unitario"
                name="precio"
                fieldArrayName="variantes"
                index={index}
                control={control}
                errors={errors}
                readOnly={deshabilitado}
              />
            </Grid>
            <Grid xs={3} item className={classnames('text-center', classes.paddingGrid)}>
              <InputText
                label="Clave"
                name="clave"
                fieldArrayName="variantes"
                index={index}
                control={control}
                errors={errors}
                readOnly={deshabilitado}
              />
            </Grid>
            <Grid xs={1} item className={classnames('text-center', classes.paddingGrid)}>
              {!deshabilitado && (
                <div className={classes.delete}>
                  <IoTrashOutline
                    className={classes.deleteIcon}
                    size="2em"
                    onClick={() => (deshabilitado ? null : borrarVariante(field, index))}
                  />
                </div>
              )}
            </Grid>
          </Grid>
          <Divider />
        </>
      )
    })
  }
  return (
    <>
      <Grid container direction="column" spacing={2}>
        <Grid item xs={12} className={classes.title}>
          <h4>
            <Text text="Variantes" />
          </h4>
        </Grid>
        <Grid item xs={12}>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            className={classes.variantHeader}
          >
            <Grid xs={3} item className="text-center">
              <Text text="Variante" />
            </Grid>
            <Grid xs={3} item className="text-center">
              <Text text="Precio unitario" />
            </Grid>
            <Grid xs={3} item className="text-center">
              <Text text="Clave" />
            </Grid>
            <Grid xs={1} item />
          </Grid>
        </Grid>
        {pintarVariantes()}
      </Grid>
      {modalBorrado && varianteSelecionada && (
        <DialogGeneric
          open={modalBorrado}
          text="¿Deseas eliminar de forma permanente la variante seleccionada?"
          title="Eliminar variante"
          buttons={botonesBorrar}
          handleClose={cerrarBorrado}
          actions
        />
      )}
    </>
  )
}

export default VariantesFormulario
