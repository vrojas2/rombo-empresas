import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  Link,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
} from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid'
import { ChangeEvent, ChangeEventHandler, FormEventHandler, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoIosDownload, IoIosList } from 'react-icons/io'
import { IoCloudDownload } from 'react-icons/io5'
import { Page } from '../../lib/layout/main'
import { useErrorHandler } from '../../lib/providers/errors'
import { useFeedback } from '../../lib/providers/feedback'
import { request } from '../../lib/services'

type Rango = 'semana' | 'mes' | 'ano' | 'rango'

type Venta = {
  id: number
  total: number
  subtotal: number
  nombreArticulo: string
  claveArticulo: string
}

const pesosMxLocale = Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const cantidadMxLocale = Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 0,
})

const useStyles = makeStyles((theme: Theme) => ({
  dataGridContainer: {},
  dataGrid: {
    [theme.breakpoints.down('xs')]: {
      height: `calc(100vh - ${theme.spacing(35)}px)`,
    },
    height: `calc(100vh - ${theme.spacing(34)}px)`,
  },
  dataGridColumns: {
    textTransform: 'capitalize',
  },
  dataGridNumber: {},
}))

const ReportePage = (): JSX.Element => {
  const { t } = useTranslation()
  const { handleError } = useErrorHandler()
  const [rango, setRango] = useState<Rango>('semana')
  const [fechaInicio, setFechaInicio] = useState<string>()
  const [fechaFin, setFechaFin] = useState<string>()
  const [urlDescarga, setUrlDescarga] = useState<string>()
  const [ventas, setVentas] = useState<Array<Venta>>([])
  const [isLoading, setLoading] = useState<boolean>(false)
  const { loading } = useFeedback()
  const classes = useStyles()

  const onSelectRango = ({ target: { value } }: ChangeEvent<{ value: Rango }>) => {
    setRango(value)
  }

  const generarReport = async () => {
    setLoading(true)
    const rangoParam = rango === 'rango' ? `${fechaInicio}:${fechaFin}` : rango
    try {
      const { url } = await request<{ url: string }>(
        'POST',
        'facturas',
        `reportes/_export-ventas-por-articulo?rango=${rangoParam}`,
      )
      setUrlDescarga(url)
    } catch (e) {
      handleError('Error al generar el reporte', 'consulte a su administrador', e)
    } finally {
      setLoading(false)
    }
  }
  const showReporte: FormEventHandler = async (e) => {
    e.preventDefault()
    const rangoParam = rango === 'rango' ? `${fechaInicio}:${fechaFin}` : rango
    setLoading(true)
    try {
      const resp = await request<Venta[]>(
        'GET',
        'facturas',
        `reportes/ventas-por-articulo?rango=${rangoParam}&size=200`,
      )
      console.log('resp', resp)
      setVentas(resp)
    } catch (e) {
      handleError('Error al generar el reporte', 'consulte a su administrador', e)
    } finally {
      setLoading(false)
    }
  }

  const onSetFechaInicio: ChangeEventHandler<HTMLInputElement> = (event) => {
    setFechaInicio(event.target.value)
  }

  const onSetFechaFin: ChangeEventHandler<HTMLInputElement> = (event) => {
    setFechaFin(event.target.value)
  }

  const isDisabled = (): boolean => rango === 'rango' && (!fechaInicio || !fechaFin)

  useEffect(() => {
    loading(isLoading)
  }, [isLoading])

  return (
    <Page title="Ventas por artículo">
      <Dialog open={!!urlDescarga}>
        <DialogTitle>
          <IoCloudDownload /> {t('El reporte está listo')}
        </DialogTitle>
        <DialogContent style={{ textAlign: 'center' }}>
          <DialogContentText>
            <Link href={urlDescarga}>reporte-ventas.xlsx</Link>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => setUrlDescarga(null)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      <Card>
        <CardContent>
          <form onSubmit={showReporte}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="rango-select-label">Periodo de tiempo</InputLabel>
                  <Select
                    labelId="rango-select-label"
                    id="rango-select"
                    value={rango}
                    onChange={onSelectRango}
                    label="Periodo de tiempo"
                  >
                    <MenuItem value="semana">Semana actual</MenuItem>
                    <MenuItem value="mes">Mes actual</MenuItem>
                    <MenuItem value="ano">Año actual</MenuItem>
                    <MenuItem value="rango">Rango de fechas</MenuItem>
                  </Select>
                </FormControl>

                {rango === 'rango' && (
                  <>
                    <br />

                    <Grid container spacing={2}>
                      <Grid xs={6} item>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          type="date"
                          label="Fecha de inicio"
                          onChange={onSetFechaInicio}
                          value={fechaInicio}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>
                      <Grid xs={6} item>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          type="date"
                          label="Fecha de fin"
                          onChange={onSetFechaFin}
                          value={fechaFin}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </>
                )}
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Button
                  type="submit"
                  startIcon={<IoIosList />}
                  color="primary"
                  disabled={isDisabled()}
                  fullWidth
                >
                  {t('ver reporte')}
                </Button>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Button
                  startIcon={<IoIosDownload />}
                  color="secondary"
                  onClick={generarReport}
                  disabled={isDisabled()}
                  fullWidth
                >
                  {t('descargar reporte')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      <br />
      <DataGrid
        density="compact"
        loading={isLoading}
        className={classes.dataGrid}
        rowCount={ventas.length}
        columns={[
          {
            field: 'claveArticulo',
            headerName: 'Clave',
            width: 140,
            headerClassName: classes.dataGridColumns,
          },
          {
            field: 'nombreArticulo',
            headerName: 'Artículo',
            flex: 1,
            headerClassName: classes.dataGridColumns,
          },
          {
            field: 'cantidad',
            headerName: 'Cantidad (unidades)',
            width: 220,
            headerClassName: classes.dataGridColumns,
            align: 'center',
            headerAlign: 'center',
            valueFormatter: (value) => cantidadMxLocale.format(value.row.total),
          },

          {
            field: 'subtotal',
            headerName: 'Subtotal',
            width: 180,
            cellClassName: classes.dataGridNumber,
            headerClassName: classes.dataGridColumns,
            align: 'right',
            valueFormatter: (value) => `$${pesosMxLocale.format(value.row.subtotal)}`,
            headerAlign: 'right',
          },
          {
            field: 'total',
            headerName: 'Total',
            width: 170,
            cellClassName: classes.dataGridNumber,
            headerClassName: classes.dataGridColumns,
            align: 'right',
            valueFormatter: (value) => `$${pesosMxLocale.format(value.row.total)}`,
            headerAlign: 'right',
          },
        ]}
        rows={ventas}
      />
    </Page>
  )
}

export default ReportePage
