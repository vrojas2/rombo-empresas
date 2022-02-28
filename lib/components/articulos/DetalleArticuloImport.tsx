import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import { Check, Error } from '@material-ui/icons'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { IoCheckmark } from 'react-icons/io5'

export type Registro = {
  idx: number
  processed: boolean
  error?: string
  reason?: { parameters: Array<any> }
  data?: { nombre: string; clave: string; caracteristicas: string }
}

type Props = {
  registros: Registro[]
  open: boolean
  onClose: () => void
}

const DetalleArticuloImport = ({ registros = [], open, onClose }: Props): ReactElement => {
  const { t } = useTranslation()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  console.log('registros', registros)
  return (
    <Dialog open={open} fullScreen={fullScreen} maxWidth="lg">
      <DialogTitle>{t('Detalles de importación')}</DialogTitle>
      <DialogContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>{t('Línea')}</TableCell>
              <TableCell>{t('Clave')}</TableCell>
              <TableCell>{t('Nombre')}</TableCell>
              <TableCell>{t('Variante')}</TableCell>
              <TableCell>{t('Error')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros
              .filter(({ processed }) => processed)
              .map(({ idx, data, reason, error }) => {
                return (
                  <TableRow key={`registro-${idx}`}>
                    <TableCell>
                      {error ? <Error color="error" /> : <Check color="primary" />}
                    </TableCell>
                    <TableCell align="center">{idx}</TableCell>
                    <TableCell>{error && reason ? data?.[3] || 'NA' : data?.clave}</TableCell>
                    <TableCell>{error && reason ? data?.[1] || '' : data?.nombre}</TableCell>
                    <TableCell>
                      {error && reason ? data?.[2] || 'Principal' : data?.caracteristicas}
                    </TableCell>
                    <TableCell>{t(error || '')}</TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          {t('aceptar')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DetalleArticuloImport
