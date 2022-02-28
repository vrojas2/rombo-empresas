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
  data?: { nombre: string; rfc: string }
  reason?: any
}

type Props = {
  registros: Registro[]
  open: boolean
  onClose: () => void
}

const DetalleClienteImport = ({ registros = [], open, onClose }: Props): ReactElement => {
  const { t } = useTranslation()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog open={open} fullScreen={fullScreen} maxWidth="lg">
      <DialogTitle>{t('Detalles de importación')}</DialogTitle>
      <DialogContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>{t('Línea')}</TableCell>
              <TableCell>{t('RFC')}</TableCell>
              <TableCell>{t('Nombre')}</TableCell>
              <TableCell>{t('Error')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros
              .filter(({ processed }) => processed)
              .map(({ idx, data, error, reason }) => {
                console.log('reason', reason)
                console.log('error', error)
                console.log('data', data)
                return (
                  <TableRow key={`registro-${idx}`}>
                    <TableCell>
                      {error ? <Error color="error" /> : <Check color="primary" />}
                    </TableCell>
                    <TableCell align="center">{idx}</TableCell>
                    <TableCell>{error && reason ? data?.[3] : data?.rfc}</TableCell>
                    <TableCell>{error && reason ? data?.[2] : data?.nombre}</TableCell>
                    {/* <TableCell>{data?.rfc}</TableCell>
                    <TableCell>{data?.nombre}</TableCell> */}
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

export default DetalleClienteImport
