import { useState } from 'react'
import { Grid, makeStyles, createStyles, Theme } from '@material-ui/core'
import { IoTrashOutline } from 'react-icons/io5'
import { useTranslation } from 'react-i18next'
import { ArticuloDeEmpresa } from '@rombomx/models/lib'

import { ArticuloCaracteristicaProps, ButtonsDialog } from '../../propTypes'
import { InputText, InputTags, DialogGeneric, Text } from '../commons'
import { deleteItem, getEntityRecord } from '../../services'
import { useErrorHandler } from '../../providers/errors'
import { useFeedback } from '../../providers/feedback'
import { getDataArticulo } from '../../components/articulos'
import { isValidArray } from '@rombomx/ui-commons'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    delete: {
      textAlign: 'right',
      marginRight: 0,
      marginBottom: theme.spacing(2),
    },
    deleteIcon: {
      color: theme.palette.error.main,
      cursor: 'pointer',
    },
    deleteButton: {
      textAlign: 'right',
      paddingRight: 0,
    },
    containerTags: {
      width: '100%',
      display: 'flex',
      flexFlow: 'row wrap',
      padding: '0.5em',
    },
  }),
)

/**
 * Componente para mostrar el formulario de la opción de la variante
 * @params ArticuloCaracteristicaProps
 * @returns JSX.Element
 */
export const ArticuloCaracteristicaFormulario = ({
  control,
  setValue,
  deshabilitado,
  errors,
  index,
  getValues,
  field,
  articuloId,
  setArticulo,
  variantes,
  remove,
}: ArticuloCaracteristicaProps): JSX.Element => {
  const classes = useStyles()
  const { handleError } = useErrorHandler()
  const { t } = useTranslation()
  const { successMessage, loading } = useFeedback()
  const [modalBorrado, setModalBorrado] = useState<boolean>(false)

  const cerrarBorrado = () => {
    setModalBorrado(false)
  }

  const eliminarCaracteristica = async () => {
    loading(t('eliminando opcion de variante...').toString())
    if (field.caracteristicaId) {
      try {
        await deleteItem('articulos', `${articuloId}/caracteristicas/${field.caracteristicaId}`)

        const _articulo = await getEntityRecord<ArticuloDeEmpresa>('articulos', `${articuloId}`)
        setArticulo(getDataArticulo(_articulo))
        remove(index)
        setModalBorrado(false)
        successMessage(t('Opción eliminada exitosamente'))
      } catch (e) {
        handleError(t('error'), t(e?.response?.data?.title), e)
      } finally {
        loading(false)
      }
    } else {
      remove(index)
      setModalBorrado(false)
      successMessage(t('Opción eliminada exitosamente'))
      loading(false)
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
      onClick: eliminarCaracteristica,
      color: 'primary',
    },
  ]

  const eliminarOpcion = (opciones) => {
    if (isValidArray(variantes) && isValidArray(opciones)) {
      const variantesABorrar = variantes.filter((variante) => {
        if (variante.varianteId && variante.nombre.includes(opciones[0])) {
          return variante
        }
      })

      const valoresFormulario = getValues()
      const { variantesBorrar } = valoresFormulario
      let variantesAux = []
      if (variantesBorrar) {
        variantesAux = variantesBorrar.concat(variantesABorrar)
      } else {
        variantesAux = variantesABorrar
      }
      setValue('variantesBorrar', variantesAux)
    }
  }

  const borrarCaracteristica = () => {
    setModalBorrado(true)
  }

  return (
    <Grid container direction="row" alignItems="center">
      <Grid item xs={3}>
        <InputText
          label={`opcion ${index + 1}`}
          name="caracteristica"
          fieldArrayName="articuloCaracteristicas"
          index={index}
          control={control}
          errors={errors}
          readOnly={deshabilitado}
        />
      </Grid>
      <Grid item xs={8}>
        <div className={classes.containerTags}>
          <InputTags
            label="Variantes"
            placeholder="Enter para agregar"
            name="valor"
            fieldArrayName="articuloCaracteristicas"
            index={index}
            setValue={setValue}
            getValues={getValues}
            errors={errors}
            disabled={deshabilitado}
            onDelete={eliminarOpcion}
          />
        </div>
      </Grid>
      <Grid item xs={1}>
        {!deshabilitado && (
          <div className={classes.delete}>
            <IoTrashOutline
              className={classes.deleteIcon}
              size="2em"
              onClick={() => borrarCaracteristica()}
            />
          </div>
        )}
      </Grid>
      {modalBorrado && (
        <DialogGeneric
          open={modalBorrado}
          key={`modal-borrado-carateristica-${index}`}
          title={<Text text="Eliminar opción de variante" />}
          buttons={botonesBorrar}
          handleClose={cerrarBorrado}
          actions
        >
          <>
            <Text text="¿Deseas eliminar de forma permanente la opción variante seleccionada?" />
            <br />
            <b>
              <Text text="(Se eliminarán las variante que dependan de ella)" />
            </b>
          </>
        </DialogGeneric>
      )}
    </Grid>
  )
}

export default ArticuloCaracteristicaFormulario
