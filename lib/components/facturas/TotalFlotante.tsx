import { useEffect, useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  makeStyles,
  createStyles,
  Theme,
  Fab,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@material-ui/core'
import { groupBy } from 'lodash'
import { IoChevronDown, IoChevronUp } from 'react-icons/io5'
import { useTranslation } from 'react-i18next'
import { Text, InputWithList } from '../commons'
import { TotalFlotanteProps, CalculosProps } from '../../propTypes'
import { isValidArray } from '@rombomx/ui-commons'
import { formatCurrency } from '../../helpers'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    totalMain: {
      position: 'fixed',
      bottom: theme.spacing(7),
      padding: '1em 0em 0 0em',
      left: '50%',
      transform: 'translate(-50%, 0)',
      width: theme.spacing(50),
      borderRadius: '23px',
      boxShadow: '0 0 20px 0 rgba(0,0,0,0.18)',
      zIndex: 1,
      [theme.breakpoints.down('xs')]: {
        width: '100vw',
      },
    },
    totalMin: {
      position: 'fixed',
      bottom: 20,
      right: 10,
      zIndex: 9999,
      backgroundColor: '#FFF',
      cursor: 'pointer',
      padding: '1em',
      width: theme.spacing(25),
      [theme.breakpoints.down('xs')]: {
        right: 0,
        bottom: theme.spacing(7),
      },
    },
    minimize: {
      position: 'absolute',
      right: 20,
      cursor: 'pointer',
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      letterSpacing: 0,
      lineHeight: '29px',
      marginLeft: theme.spacing(2),
    },
    totalDisabled: {
      textAlign: 'right',
      paddingRight: '2em',
    },
    taxesOpen: {
      fontSize: '2em',
      cursor: 'pointer',
    },
    accordion: {
      boxShadow: 'none !important',
    },
    summary: {
      padding: '0px',
      margin: 0,
    },
    details: {
      marginTop: '-2em',
      padding: 0,
      marginBottom: '2em',
    },
    amountDetail: {
      textAlign: 'right',
    },
  }),
)

const CALCULOS_INICIALES = {
  subtotalConDescuento: 0,
  impuestos: 0,
  importeTotal: 0,
  descuento: 0,
  subtotal: 0,
}

export const TotalFlotante = ({
  conceptos,
  setValueToForm,
  deshabilitado,
}: TotalFlotanteProps): JSX.Element => {
  const { t } = useTranslation()
  const [extendido, setExtendido] = useState(true)
  const [impuestos, setImpuestos] = useState(null)
  const [calculos, setCalculos] = useState<CalculosProps>({
    subtotalConDescuento: 0,
    importeTotal: 0,
    impuestos: 0,
    descuento: 0,
    subtotal: 0,
  })
  const classes = useStyles()
  const sumarImpuestos = (acum, valorActual) => {
    return {
      importe: Number(Number(acum.importe + valorActual.importe).toFixed(2)),
    }
  }

  const sumarconceptos = (acum, valorActual) => {
    let _impuestos = { importe: 0 }
    if (isValidArray(valorActual.impuestos)) {
      _impuestos = valorActual.impuestos.reduce(sumarImpuestos, _impuestos)
    }

    return {
      subtotal: Number(Number(acum.subtotal + valorActual.subtotal).toFixed(2)),
      subtotalConDescuento: Number(
        Number(acum.subtotalConDescuento + valorActual.subtotalConDescuento).toFixed(2),
      ),
      impuestos: acum.impuestos + _impuestos.importe,
      descuento: acum.descuento + valorActual.descuentoImporte,
      importeTotal: Number(Number(acum.importeTotal + valorActual.importeTotal).toFixed(2)),
    }
  }

  useEffect(() => {
    if (isValidArray(conceptos)) {
      const _calculos = conceptos.reduce(sumarconceptos, CALCULOS_INICIALES)
      const _impuestos = conceptos
        .flatMap((concepto) => {
          if (isValidArray(concepto.impuestos)) {
            return concepto.impuestos.flatMap((imp) => imp)
          }
        })
        .filter((imp) => !!imp)

      if (isValidArray(_impuestos)) {
        const impuestosAgrupados = groupBy(_impuestos, 'satImpuestoId')
        setImpuestos(impuestosAgrupados)
      }
      setValueToForm('impuestos', _calculos.impuestos)
      setValueToForm('total', _calculos.importeTotal)
      setValueToForm('subtotal', _calculos.subtotal)
      setValueToForm('subtotalConDescuento', _calculos.subtotalConDescuento)
      setValueToForm('descuento', _calculos.descuento)
      setCalculos(_calculos)
    } else {
      setValueToForm('impuestos', 0)
      setValueToForm('total', 0)
      setValueToForm('subtotal', 0)
      setValueToForm('descuento', 0)
      setCalculos({
        subtotalConDescuento: 0,
        importeTotal: 0,
        impuestos: 0,
        descuento: 0,
        subtotal: 0,
      })
    }
  }, [conceptos])

  const abrirTotal = () => {
    setExtendido((_extendido) => !_extendido)
  }

  const mostrarImpuestos = () => {
    if (!impuestos) {
      return (
        <Grid item xs={12} key="impuestos-total-flotante-01">
          <Text text="Sin impuestos..." />
        </Grid>
      )
    }

    const keys = Object.keys(impuestos)

    if (!isValidArray(keys)) {
      return
    }
    const _impuestos = keys.map((key) => {
      return impuestos[key].reduce(
        (acum, actual) => ({
          importe: Number(Number(acum.importe + actual.importe).toFixed(2)),
          descripcion: actual.descripcion,
        }),
        { descripcion: '', importe: 0 },
      )
    })

    return _impuestos.map((imp, i) => (
      <Grid item xs={12} key={`impuestos-total-flotante-${i}`}>
        <Grid container>
          <Grid item xs={4}>
            {imp.descripcion}:
          </Grid>
          <Grid item xs={8} className={classes.amountDetail}>
            {formatCurrency(imp.importe)}
          </Grid>
        </Grid>
      </Grid>
    ))
  }

  if (deshabilitado) {
    return (
      <Card>
        <CardContent>
          <Grid container direction="row" alignItems="flex-start" justifyContent="flex-end">
            <Grid item xs={6} className={classes.totalDisabled}>
              <Text text="Total" className={classes.title} />
            </Grid>
            <Grid item xs={6}>
              <Grid container direction="column" justifyContent="flex-start">
                <Grid item>
                  <Grid container direction="row" alignItems="center">
                    <Grid item xs={4}>
                      <Text text="Subtotal:" />
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        variant="outlined"
                        label={t('subtotal')}
                        value={formatCurrency(calculos.subtotalConDescuento)}
                        required
                        inputProps={{
                          readOnly: true,
                        }}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid container direction="row" alignItems="center">
                    <Grid item xs={4}>
                      <Text text="Impuestos:" />
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        variant="outlined"
                        label={t('total')}
                        value={formatCurrency(calculos.impuestos)}
                        required
                        size="small"
                        inputProps={{
                          readOnly: true,
                        }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid container direction="row" alignItems="center">
                    <Grid item xs={4}>
                      <Text text="Total:" />
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        variant="outlined"
                        label={t('total')}
                        value={formatCurrency(calculos.importeTotal)}
                        required
                        size="small"
                        inputProps={{
                          readOnly: true,
                        }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }

  if (extendido) {
    return (
      <Card className={classes.totalMain}>
        <Grid container direction="row" justifyContent="center">
          <Grid item xs={10}>
            <Text text="Total" className={classes.title} />
          </Grid>
          <Grid item xs={2}>
            <IoChevronDown onClick={abrirTotal} className={classes.minimize} />
          </Grid>
        </Grid>
        <CardContent>
          <Grid container direction="row" alignItems="flex-start" justifyContent="center">
            <Grid item xs={1} />
            <Grid item xs={10}>
              <Grid container direction="column" justifyContent="flex-start">
                <Grid item>
                  <Grid container direction="row" alignItems="center">
                    <Grid item xs={4}>
                      <Text text="Subtotal" />
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        variant="outlined"
                        label={t('subtotal')}
                        disabled={deshabilitado}
                        value={formatCurrency(calculos.subtotalConDescuento)}
                        required
                        inputProps={{
                          readOnly: true,
                        }}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Accordion className={classes.accordion} square>
                    <AccordionSummary
                      className={classes.summary}
                      aria-label="Expand"
                      aria-controls="taxes-container"
                      id="taxes-container-header"
                    >
                      <Grid container direction="row" alignItems="center">
                        <Grid item xs={4}>
                          <Text text="Impuestos" />
                        </Grid>
                        <Grid item xs={8}>
                          <Grid container>
                            <Grid item xs={12}>
                              <TextField
                                variant="outlined"
                                label={t('total')}
                                disabled={deshabilitado}
                                value={formatCurrency(calculos.impuestos)}
                                required
                                size="small"
                                InputProps={{
                                  endAdornment: <IoChevronDown className={classes.taxesOpen} />,
                                }}
                                inputProps={{
                                  readOnly: true,
                                }}
                                fullWidth
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </AccordionSummary>
                    <AccordionDetails className={classes.details}>
                      <Grid container direction="row" justifyContent="flex-start" spacing={1}>
                        <Grid item xs={12}>
                          <hr />
                        </Grid>
                        <Grid item xs={12}>
                          <Text text="Desglose" />
                        </Grid>
                        {mostrarImpuestos()}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
                <Grid item>
                  <Grid container direction="row" alignItems="center">
                    <Grid item xs={4}>
                      <Text text="Total" />
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        variant="outlined"
                        label={t('total')}
                        disabled={deshabilitado}
                        value={formatCurrency(calculos.importeTotal)}
                        required
                        size="small"
                        inputProps={{
                          readOnly: true,
                        }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }

  return (
    <Paper variant="elevation" className={classes.totalMin} onClick={abrirTotal}>
      <Grid container direction="row" justifyContent="center" alignItems="center" spacing={1}>
        <Grid item xs={12}>
          <IoChevronUp className={classes.minimize} />
        </Grid>
        <Grid item xs={6} sm={5}>
          Total:
        </Grid>
        <Grid item xs={6} sm={7}>
          {formatCurrency(calculos.importeTotal)}
        </Grid>
        <Grid item xs={6} sm={5}>
          Subtotal:
        </Grid>
        <Grid item xs={6} sm={7}>
          {formatCurrency(calculos.subtotalConDescuento)}
        </Grid>
        <Grid item xs={6} sm={5}>
          Impuestos:
        </Grid>
        <Grid item xs={6} sm={7}>
          {formatCurrency(calculos.impuestos)}
        </Grid>
      </Grid>
    </Paper>
  )
}

export default TotalFlotante
