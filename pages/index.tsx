import { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  MenuItem,
  makeStyles,
  Theme,
  Select,
  FormControl,
  InputLabel,
  Typography,
  LinearProgress,
} from '@material-ui/core'
import {
  IoTrendingUp,
  IoCashOutline,
  IoPersonOutline,
  IoPeople,
  IoCalculator,
  IoPricetagsOutline,
  IoReceiptOutline,
} from 'react-icons/io5'
import { FILTROS_FACTURA_FECHA } from '@rombomx/ui-commons'
import { isValidArray } from '@rombomx/ui-commons'
import { useTranslation } from 'react-i18next'
import { homeInfo } from '@rombomx/models/lib'

import { Page } from '../lib/layout/main'
import { Text } from '../lib/components/commons'
import { getEntityRecord } from '../lib/services'

const pesosMxLocale = Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

const cantidadMxLocale = Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 0,
})
const useStyles = makeStyles((theme: Theme) => ({
  title: {},
  loader: {
    width: '100%',
    textAlign: 'center',
    marginBottom: theme.spacing(4),
  },
  loaderWrapper: {
    height: theme.spacing(2),
  },
  indicador: {
    textAlign: 'center',
  },
  indicadorLabel: {
    fontSize: theme.typography.h5.fontSize,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  indicadorLabelIcon: {
    marginRight: theme.spacing(2),
    fontSize: theme.typography.h4.fontSize,
  },
  indicadorValue: {
    fontSize: theme.typography.h4.fontSize,
    color: theme.palette.primary.main,
    height: theme.spacing(8),
  },
}))

interface GridProps {
  page: number
  size: number
  sort: string
  order: string
  cliente?: string
  folio?: string
  fecha?: string
  fechaInicio?: string
  fechaFin?: string
}

export const EmpresaPage = (): JSX.Element => {
  const classes = useStyles()
  const { t } = useTranslation()
  const [personalizar, setPersonalizar] = useState<boolean>(false)
  const [filtro, setFiltro] = useState<string>('hoy')
  const [infoVentas, setInfoVentas] = useState<any>()
  const [infoUsuarios, setInfoUsuarios] = useState<{ count: number }>({
    count: 0,
  })
  const [anterior, setAnterior] = useState<string>('')
  const [cargando, setCargando] = useState<boolean>(true)

  const [gridProps, setGridProps] = useState<GridProps>({
    page: 0,
    size: 25,
    sort: 'nombre',
    order: 'ASC',
  })

  const onChangeFiltro = (value: string) => {
    value === 'personalizado' ? setPersonalizar(true) : setPersonalizar(false)
    setFiltro(value)
  }

  const asignarFiltro = (e) => {
    // fecha personalizada
    if (e.target.name === 'fechaInicio' || e.target.name === 'fechaFin') {
      return setGridProps({
        ...gridProps,
        fecha: opcionesFiltroFecha[5].id,
        [e.target.name]: e.target.value,
      })
    }

    setGridProps({ ...gridProps, [e.target.name]: e.target.value })
  }

  //TODO: remover este método.  No se usa
  const buscar = () => {
    homeInfo()
  }

  const opcionesFiltroFecha = [{ id: '', nombre: 'Seleccione una opción' }].concat(
    FILTROS_FACTURA_FECHA,
  )

  const homeInfo = () => {
    setCargando(true)
    const fecha = new Date()
    const hoy = fecha.getFullYear() + '-' + fecha.getMonth() + 1 + '-' + fecha.getDate()
    let rango: string

    if (filtro === 'esta_semana') {
      rango = 'semana'
      setAnterior(rango)
    } else if (filtro === 'este_mes') {
      rango = 'mes'
      setAnterior(rango)
    } else if (filtro === 'este_año') {
      rango = 'ano'
      setAnterior(rango)
    } else if (filtro === 'hoy') {
      rango = hoy + ':' + hoy
      setAnterior(rango)
    } else if (filtro === 'personalizado') {
      if (gridProps.fechaInicio === undefined || gridProps.fechaFin === undefined) {
        rango = anterior
      } else {
        rango = gridProps.fechaInicio + ':' + gridProps.fechaFin
      }
    }

    Promise.all([
      getEntityRecord<homeInfo>('facturas', `reportes/resumen?rango=${rango}`).then((data) => {
        setInfoVentas({
          facturas: data.count,
          total: data.sum,
          promedio: data.avg,
        })
      }),
      getEntityRecord<{ count: number }>('clientes', `reportes/resumen?rango=${rango}`).then(
        setInfoUsuarios,
      ),
    ])
      .catch((e) => {
        console.error('error', e)
        setInfoVentas(null)
      })
      .finally(() => {
        setTimeout(() => {
          setCargando(false)
        }, 500)
      })
  }

  useEffect(() => {
    homeInfo()
  }, [filtro, gridProps])

  return (
    <Page title="Indicadores de mi empresa">
      <Card>
        <div className={classes.loaderWrapper}>{cargando && <LinearProgress />}</div>
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('Periodo de tiempo')}</InputLabel>
                <Select
                  label={t('Periodo de tiempo')}
                  onChange={(e) => onChangeFiltro(e.target.value as string)}
                  value={filtro}
                >
                  {isValidArray(opcionesFiltroFecha)
                    ? opcionesFiltroFecha.map((opcion, i) => {
                        return (
                          <MenuItem key={`opcion-filtro-fecha-${i}`} value={opcion.id}>
                            <Text text={opcion.nombre} />
                          </MenuItem>
                        )
                      })
                    : null}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              {personalizar && (
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label={t('fecha inicio')}
                  name="fechaInicio"
                  value={gridProps.fechaInicio}
                  placeholder={t('fecha inicio')}
                  onChange={asignarFiltro}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    max: gridProps.fechaFin,
                  }}
                />
              )}
            </Grid>
            <Grid item xs={6} sm={3}>
              {personalizar && (
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  margin="none"
                  label={t('fecha de fin')}
                  name="fechaFin"
                  value={gridProps.fechaFin}
                  placeholder={t('fecha de fin')}
                  variant="outlined"
                  onChange={asignarFiltro}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: gridProps.fechaInicio,
                  }}
                />
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <br />
      <Grid container spacing={5}>
        <Grid item md={6} sm={12} xs={12}>
          <Card className={classes.indicador}>
            <CardContent>
              <div className={classes.indicadorLabel}>
                <IoReceiptOutline color="brown" className={classes.indicadorLabelIcon} />{' '}
                {t('Número de ventas')}
              </div>
              <div className={classes.indicadorValue}>
                {cargando && <CircularProgress />}
                {!cargando && infoVentas && cantidadMxLocale.format(infoVentas.facturas)}
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={6} sm={12} xs={12}>
          <Card className={classes.indicador}>
            <CardContent>
              <div className={classes.indicadorLabel}>
                <IoCashOutline color="green" className={classes.indicadorLabelIcon} />{' '}
                {t(' Monto total de ventas')}
              </div>
              <div className={classes.indicadorValue}>
                {cargando && <CircularProgress />}
                {!cargando &&
                  infoVentas &&
                  `$${pesosMxLocale.format(parseFloat(infoVentas.total))}`}
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={6} sm={12} xs={12}>
          <Card className={classes.indicador}>
            <CardContent>
              <div className={classes.indicadorLabel}>
                <IoCalculator color="gray" className={classes.indicadorLabelIcon} />{' '}
                {t(' Monto promedio por venta')}
              </div>
              <div className={classes.indicadorValue}>
                {cargando && <CircularProgress />}
                {!cargando &&
                  infoVentas &&
                  `$${pesosMxLocale.format(parseFloat(infoVentas.promedio))}`}
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={6} sm={12} xs={12}>
          <Card className={classes.indicador}>
            <CardContent>
              <div className={classes.indicadorLabel}>
                <IoPeople color="purple" className={classes.indicadorLabelIcon} />
                {t('Número de clientes nuevos')}
              </div>
              <div className={classes.indicadorValue}>
                {cargando && <CircularProgress />}
                {!cargando && cantidadMxLocale.format(infoUsuarios?.count || 0)}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Page>
  )
}

export default EmpresaPage
