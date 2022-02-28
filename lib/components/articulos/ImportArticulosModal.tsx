import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Link,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core'
import { Delete } from '@material-ui/icons'
import { useEffect } from 'react'
import { ChangeEvent, ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useErrorHandler } from '../../providers/errors'
import { useFeedback } from '../../providers/feedback'
import { useServerMessages } from '../../providers/server-messages'
import { putFile } from '../../services'
import { debug } from '../../services/logger'
import { Alert } from '@material-ui/lab'
import DetalleArticuloImport, { Registro } from './DetalleArticuloImport'

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  content: {
    minWidth: theme.spacing(50),
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  instructions: {
    marginBottom: theme.spacing(2),
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(2),
  },
  fileName: {
    maxWidth: '70%',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  fileButton: {
    margin: theme.spacing(1),
  },
  message: {
    color: theme.palette.text.hint,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

type Props = { open: boolean; onClose: () => void }
export const ImportArticulosModal = ({ open, onClose }: Props): ReactElement => {
  const { t } = useTranslation()
  const classes = useStyles()
  const { handleError } = useErrorHandler()
  const { errorMessage, attentionMessage, successMessage } = useFeedback()
  const { onMessage } = useServerMessages()
  const [resultados, setResultados] = useState<Registro[]>([])
  const [verDetalles, setVerDetalles] = useState<boolean>(false)
  const [file, setFile] = useState<File>()
  const [status, setStatus] = useState<
    'inicio' | 'cargando' | 'procesando' | 'terminado' | 'terminado_con_errores' | 'error'
  >('inicio')
  const [message, setMessage] = useState<string>()
  const [progress, setProgress] = useState<number>(0)

  const handleClose = () => {
    onClose()
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files[0])
    setStatus('inicio')
  }

  const removeFile = () => {
    setFile(null)
    setStatus('inicio')
  }

  const upload = async () => {
    if (!file) return

    debug('importando archivo', file)
    setProgress(0)
    setStatus('cargando')
    try {
      setMessage(t('Importando articulos...'))
      const { fileUploadPromise, key } = await putFile('articulos', '_get_import_url', file)
      setProgress(5)
      setMessage(t('Cargando archivo...'))
      await fileUploadPromise
      setMessage(() => t('Archivo cargado. Procesando...'))
      setProgress(10)
      const timeout = setTimeout(() => {
        attentionMessage(
          t(
            'El proceso de importación está tardando más de lo debido. Por favor recargue su navegador y verifique.',
          ),
        )
      }, 1000 * 60 * 3) // espera 3 minutos
      debug('subscribiendo a', 'articulos-import', key)
      onMessage('articulos-import', key, ({ error, register, status, progress, message }) => {
        console.log('MESSAGES', { error, register, status, progress, message })
        if (error && !register) {
          setProgress(() => 0)
          setFile(() => null)
          setStatus(() => 'error')
          errorMessage(message, 'Error importando articulos.')
          clearTimeout(timeout)
        } else if (status === 'terminado') {
          clearTimeout(timeout)
          const resultados = JSON.parse(message)
          const errors = resultados.filter(({ error, processed }) => processed === true && !!error)
          setResultados(() => resultados)
          if (errors?.length) {
            setStatus(() => 'terminado_con_errores')
          } else {
            setStatus(() => 'terminado')
          }
        } else {
          //Se ignoran mensajes resagados si el estado es concluyente
          setStatus((prev) => {
            if (prev === 'terminado' || prev === 'terminado_con_errores' || prev === 'error') {
              return prev
            }
            return 'procesando'
          })
          setProgress((prev) => (prev < progress ? progress : prev))
          setMessage(() => message)
        }
      })
      debug('el archivo', key, 'fue subido. Esperando respuesta de proceso')
    } catch (e) {
      handleError(t('error al subir archivo'), e)
    }
  }

  useEffect(() => {
    if (open) {
      setStatus('inicio')
      setProgress(0)
      setFile(null)
    }
  }, [open])

  return (
    <>
      <Dialog open={open}>
        <DialogTitle>{t('Importar Articulos')}</DialogTitle>
        <DialogContent className={classes.content}>
          <Grid item className={classes.instructions}>
            <Typography variant="body1">
              {t('Selecciona un archivo en formato excel con el listado de tus articulos.')}
            </Typography>
            {/* <Typography gutterBottom variant="body2">
              {t('Para más información ingresa')} <Link>{t('aquí')}</Link>.
            </Typography> */}
          </Grid>

          <Grid container className={classes.container}>
            {file?.name && status === 'inicio' && (
              <>
                <Grid item className={classes.fileName}>
                  {file.name}
                </Grid>
                <Grid item>
                  <IconButton color="secondary" onClick={removeFile}>
                    <Delete />
                  </IconButton>
                </Grid>
              </>
            )}
            {!file?.name && (
              <Grid item className={classes.fileButton}>
                <Button color="primary" component="label">
                  {t('selecciona el archivo')}
                  <input
                    type="file"
                    hidden
                    onChange={onFileChange}
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  />
                </Button>
              </Grid>
            )}
          </Grid>

          {(status === 'procesando' || status === 'cargando') && (
            <div className={classes.message}>
              <Typography variant="body2" align="center">
                {message}
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </div>
          )}
          {status === 'terminado' && (
            <Alert severity="success">{t('Su archivo fué procesado correctamente')}</Alert>
          )}
          {status === 'terminado_con_errores' && (
            <Alert severity="warning">
              {t('Algunos registros no pudieron ser cargados correctamente')}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          {status !== 'terminado' && status !== 'terminado_con_errores' && (
            <Button onClick={handleClose} disabled={status !== 'inicio' && status !== 'error'}>
              {t('cancelar')}
            </Button>
          )}
          {status !== 'terminado' && status !== 'terminado_con_errores' && (
            <Button disabled={!file || status !== 'inicio'} color="primary" onClick={upload}>
              {t('importar')}
            </Button>
          )}
          {(status === 'terminado' || status === 'terminado_con_errores') && (
            <>
              <Button color="secondary" onClick={() => setVerDetalles(true)}>
                {t('ver detalles')}
              </Button>
              <Button color="primary" onClick={handleClose}>
                {t('aceptar')}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      <DetalleArticuloImport
        registros={resultados}
        open={verDetalles}
        onClose={() => setVerDetalles(false)}
      />
    </>
  )
}

export default ImportArticulosModal
