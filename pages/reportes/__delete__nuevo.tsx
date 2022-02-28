import { useState, useEffect } from 'react'
import { Plan, Empresa as EmpresaInfo } from '@rombomx/models'
import { Grid, Card, CardContent, Button, TextField, MenuItem } from '@material-ui/core'
import { IoTrendingUp, IoCashOutline, IoPersonOutline } from 'react-icons/io5'
import { FILTROS_FACTURA_FECHA } from '@rombomx/ui-commons'
import { isValidArray } from '@rombomx/ui-commons'
import { TFunction, useTranslation } from 'react-i18next'
import axios from 'axios'

import { Page } from '../../lib/layout/main'
import { DialogGeneric, MenuGeneric, Text } from '../../lib/components/commons'

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
  const { t } = useTranslation()
  const [personalizar, setPersonalizar] = useState<boolean>(false)
  const [resultado, setResultado] = useState<string>('hoy')

  const [gridProps, setGridProps] = useState<GridProps>({
    page: 0,
    size: 25,
    sort: 'nombre',
    order: 'ASC',
  })

  const onChangeResultados = (value: string) => {
    setResultado(value)
    value === 'personalizado' ? setPersonalizar(true) : setPersonalizar(false)
  }

  const opcionesFiltroFecha = [{ id: '', nombre: 'Seleccione una opción' }].concat(
    FILTROS_FACTURA_FECHA,
  )

  return (
    <Page title="Nuevo reporte">
      <Grid container direction="row" spacing={5} className="container-center">
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container direction="column" spacing={2}>
                <Grid container direction="row" alignItems="center">
                  <Grid item xs={12} className="align-left">
                    <h2>Ventas por artículo</h2>
                  </Grid>
                  <Grid item xs={3}>
                    <Text text="Periodo de tiempo" />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      select
                      margin="none"
                      name="fecha"
                      variant="outlined"
                      onChange={(e) => onChangeResultados(e.target.value)}
                      value={resultado}
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
                    </TextField>
                  </Grid>
                  {personalizar && (
                    <Grid item xs={12}>
                      <Grid
                        container
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="center"
                        spacing={1}
                      >
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="date"
                            margin="none"
                            label={t('fecha inicio')}
                            name="fechaInicio"
                            value={gridProps.fechaInicio}
                            placeholder={t('fecha inicio')}
                            variant="outlined"
                            //onChange={asignarFiltro}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            inputProps={{
                              max: gridProps.fechaFin,
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="date"
                            margin="none"
                            label={t('fecha de fin')}
                            name="fechaFin"
                            value={gridProps.fechaFin}
                            placeholder={t('fecha de fin')}
                            variant="outlined"
                            //onChange={asignarFiltro}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            inputProps={{
                              min: gridProps.fechaInicio,
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Page>
  )
}

export default EmpresaPage
