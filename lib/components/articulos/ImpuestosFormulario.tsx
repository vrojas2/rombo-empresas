import { useState, useEffect } from 'react'
import {
  Card,
  Grid,
  CardContent,
  createStyles,
  makeStyles,
  Theme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from '@material-ui/core'
import { IoAddCircleOutline, IoTrashOutline } from 'react-icons/io5'
import { useTranslation } from 'react-i18next'

import { isValidArray } from '@rombomx/ui-commons'
import { DialogGeneric, Text } from '../commons'
import { TaxsProps, ButtonsDialog, ImpuestoState } from '../../propTypes'
import { deleteItem } from '../../services'
import { useErrorHandler } from '../../providers/errors'
import { useFeedback } from '../../providers/feedback'

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
    formControl: {
      minWidth: 120,
      width: '100%',
    },
  }),
)

/**
 * Componente para mostrar los impuestos de un artículo
 * @params ImpuestosProps
 * @returns JSX.Element
 */
export function TaxsFormulario({
  articuloId,
  impuestos,
  deshabilitado,
  setValue,
  impuestosDefault,
}: TaxsProps): JSX.Element {
  const classes = useStyles()
  const [impuestosState, setImpuestosState] = useState<Array<ImpuestoState>>([])
  const [impuestoSelecionado, setImpuestoSeleccionado] = useState<number>(null)
  const { handleError } = useErrorHandler()
  const { t } = useTranslation()
  const { successMessage, loading } = useFeedback()
  const [modalBorrado, setModalBorrado] = useState<boolean>(false)

  useEffect(() => {
    agregarImpuesto()
  }, [])

  useEffect(() => {
    if (isValidArray(impuestosDefault)) {
      setImpuestosState(impuestosDefault)
    }
  }, [impuestosDefault])

  const agregarImpuesto = () => {
    const _impuestos = [...impuestosState]
    _impuestos.push({ impuesto: '' })
    setImpuestosState(_impuestos)
  }

  const cerrarBorrado = () => {
    setModalBorrado(false)
  }

  const removerImpuesto = () => {
    const _impuestos = impuestosState.filter((imp, i) => i !== impuestoSelecionado)
    setImpuestosState(_impuestos)
    setValue('impuestos', _impuestos)
  }

  const eliminarImpuesto = async () => {
    if (!isValidArray(impuestosState)) {
      return
    }

    const impuestoEncontrado = impuestosState[impuestoSelecionado]
    if (impuestoEncontrado) {
      loading(t('eliminado impuesto').toString())
      if (impuestoEncontrado.impuestoId) {
        try {
          await deleteItem('articulos', `${articuloId}/impuestos/${impuestoEncontrado.impuestoId}`)
          removerImpuesto()
          setModalBorrado(false)
          successMessage(t('impuesto eliminado exitosamente'))
          setImpuestoSeleccionado(null)
        } catch (e) {
          handleError(t('error'), t(e?.response?.data?.title), e)
        } finally {
          loading(false)
        }
      } else {
        removerImpuesto()
        setModalBorrado(false)
        successMessage(t('impuesto eliminado exitosamente'))
        setImpuestoSeleccionado(null)
        loading(false)
      }
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

  const borrarImpuesto = (index) => {
    setImpuestoSeleccionado(index)
    setModalBorrado(true)
  }

  const onChangeImpuesto = (value, index) => {
    const _impuestos = [...impuestosState]
    _impuestos[index].impuesto = value
    setImpuestosState(_impuestos)
    setValue('impuestos', _impuestos)
  }

  const pintarMenuImpuestos = () => {
    if (!isValidArray(impuestos)) {
      return null
    }

    return impuestos.map((_impuesto) => (
      <MenuItem value={_impuesto.id}>{t(_impuesto.name)}</MenuItem>
    ))
  }

  const pintarImpuestos = () => {
    if (!isValidArray(impuestosState)) {
      return null
    }
    console.log('impuestosState', impuestosState)
    return impuestosState.map((impuestoField, index) => {
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
              {deshabilitado ? (
                <TextField
                  label={t('Impuesto')}
                  inputProps={{ readOnly: deshabilitado }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={`${impuestoField?.impuestoRegistro?.tipo}-${impuestoField?.impuestoRegistro?.nombre}`}
                  fullWidth
                />
              ) : (
                <TextField
                  select
                  label={t('Impuesto')}
                  disabled={deshabilitado}
                  onChange={(e) => onChangeImpuesto(e.target.value, index)}
                  value={impuestoField.impuesto}
                  fullWidth
                >
                  <MenuItem value="">
                    <em>{t('ninguno')}</em>
                  </MenuItem>
                  {pintarMenuImpuestos()}
                </TextField>
              )}
            </Grid>
            <Grid item xs={1}>
              {!deshabilitado && index > 0 && (
                <div className={classes.delete}>
                  <IoTrashOutline
                    className={classes.deleteIcon}
                    size="2em"
                    onClick={() => borrarImpuesto(index)}
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
      {modalBorrado && (
        <DialogGeneric
          key={`modal-borrado-impuesto-${Math.random()}`}
          open={modalBorrado}
          text="Deseas eliminar de forma permanente el impuesto seleccionado?"
          title="Eliminar impuesto"
          buttons={botonesBorrar}
          handleClose={cerrarBorrado}
          actions
        />
      )}
    </Card>
  )
}

export default TaxsFormulario
