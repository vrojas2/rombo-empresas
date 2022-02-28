import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  makeStyles,
  Theme,
} from '@material-ui/core'
import { CloudDownload } from '@material-ui/icons'
import { useEffect, useState } from 'react'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { ClienteDeEmpresa } from '@rombomx/models'
import { execute } from '../../services'
import { debug } from '../../services/logger'
import { useFeedback } from '../../providers/feedback'
import { useErrorHandler } from '../../providers/errors'

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
  onClose: () => void
  ids: (string | number)[]
}
const ExportClientesModal = ({ open, ids, onClose }: Props): ReactElement => {
  const { t } = useTranslation()
  const classes = useStyles()
  const { handleError } = useErrorHandler()
  const [downloadLink, setDownloadLink] = useState<string>('#')
  const [status, setStatus] = useState<'generando' | 'generado' | 'error'>('generando')

  const exportar = async () => {
    if (open && ids?.length) {
      debug('exportando')
      try {
        setStatus(() => 'generando')
        const { url } = await execute('clientes', '_get_export_url', { ids })
        setStatus(() => 'generado')
        debug(url)
        setDownloadLink(() => url)
      } catch (e) {
        setStatus(() => 'error')
        handleError('Error exportando clientes', '', e)
      }
    }
  }

  const handleClose = () => {
    onClose()
  }

  useEffect(() => {
    exportar()
  }, [open])
  return (
    <Dialog open={open} maxWidth="md">
      <DialogTitle className={classes.title}>{t('Exportando clientes')}</DialogTitle>
      <DialogContent>
        {status === 'generando' && (
          <div className={classes.loader}>
            <CircularProgress />
          </div>
        )}
        {status === 'generado' && (
          <div>
            <Link className={classes.download} href={downloadLink}>
              <CloudDownload />
              {t('Descargar')}
            </Link>
          </div>
        )}
      </DialogContent>
      {status === 'generado' && (
        <DialogActions className={classes.actions}>
          <Button color="primary" onClick={handleClose}>
            {t('aceptar')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

export default ExportClientesModal
