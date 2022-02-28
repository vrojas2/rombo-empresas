import { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Theme,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
} from '@material-ui/core'
import _ from 'lodash'
import { Direccion } from '@rombomx/models/lib'
import { useTranslation } from 'react-i18next'
import { isValidArray } from '@rombomx/ui-commons'

const useStyles = makeStyles((theme: Theme) => ({
  title: {},
  loader: {
    width: '100%',
    textAlign: 'center',
    marginBottom: theme.spacing(4),
  },
  download: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(1),
    '&>svg': {
      marginRight: theme.spacing(2),
    },
  },
  actions: {},
}))

type Props = {
  open: boolean
  direcciones: Array<Direccion>
  direccionSeleccionada: Direccion
  onClose: (direccion: Direccion) => void
}

const DireccionesModal = ({
  open,
  direcciones,
  direccionSeleccionada,
  onClose,
}: Props): JSX.Element => {
  const { t } = useTranslation()
  const classes = useStyles()
  const [value, setValue] = useState<Direccion>(null)

  useEffect(() => {
    if (isValidArray(direcciones) && direccionSeleccionada) {
      setValue(direccionSeleccionada)
    }
  }, [])

  const handleClose = () => {
    onClose(value)
  }

  const handleChange = (event) => {
    setValue(JSON.parse(event.target.value))
  }

  return (
    <Dialog open={open}>
      <DialogTitle className={classes.title}>{t('Cambiando dirección')}</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="direcciones"
            name="direcciones"
            value={JSON.stringify(value)}
            onChange={handleChange}
          >
            {isValidArray(direcciones) &&
              direcciones.map((direccion) => {
                return (
                  <FormControlLabel
                    value={JSON.stringify(direccion)}
                    control={<Radio />}
                    label={`${direccion.direccion || ''} ${direccion.municipio || ''} ${
                      direccion.ciudad || ''
                    } ${direccion.estado || ''} ${direccion.codigoPostal || ''} ${
                      direccion.pais || ''
                    }`}
                  />
                )
              })}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button color="secondary" onClick={handleClose}>
          {t('cancelar')}
        </Button>
        <Button color="primary" onClick={handleClose}>
          {t('aceptar')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DireccionesModal
