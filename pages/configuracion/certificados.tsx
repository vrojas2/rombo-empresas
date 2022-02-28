import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'

import {
  Grid,
  Card,
  CardContent,
  Button,
  makeStyles,
  Theme,
  createStyles,
  IconButton,
  InputAdornment,
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import { Empresa } from '@rombomx/models'
import { Page } from '../../lib/layout/main'
import { Text, InputText, InputFile, DialogGeneric } from '../../lib/components/commons'
import { Certificado, ButtonsDialog } from '../../lib/propTypes'
import { execute, putFile, request } from '../../lib/services'
import { useFeedback } from '../../lib/providers/feedback'

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    label: {
      fontSize: '1.2em',
    },
    title: {
      color: '#7C7C7C',
      fontSize: '18px',
      letterSpacing: 0,
      lineHeight: '22px',
    },
  }),
)

export const CertificadosPage = (): JSX.Element => {
  const classes = useStyle()
  const { loading, successMessage, errorMessage } = useFeedback()
  const { t } = useTranslation()
  const router = useRouter()
  const [certificados, setCertificados] = useState(null)
  const [certificadosDefault, setCertificadosDefault] = useState(null)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [modificar, setModificar] = useState(false)
  const [tieneCertificados, setTieneCertificados] = useState(false)
  const [salirEdicion, setSalirEdicion] = useState(false)
  const [nombreLlave, setNombreLlave] = useState(null)
  const [nombreCertificado, setNombreCertificado] = useState(null)
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<Certificado>({
    defaultValues: certificados,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    criteriaMode: 'firstError',
  })

  const loadCertificados = () => {
    loading(t('cargando información...').toString())
    request<Empresa>('GET', 'empresas', 'certificados-digitales', false)
      .then((data) => {
        if (data) {
          console.log('data', data)
          if (
            data.llavePrivadaUrl &&
            data.llavePrivadaUrl !== null &&
            data.certificadoUrl &&
            data.certificadoUrl !== null &&
            data.certificadoContrasena &&
            data.certificadoContrasena !== null &&
            data.noCertificado &&
            data.noCertificado !== null
          ) {
            const llaveSplit = data.llavePrivadaUrl.split('/')
            console.log('llaveSplit', llaveSplit)
            const llaveNombre = llaveSplit[llaveSplit.length - 1]

            const certSplit = data.certificadoUrl.split('/')
            const certNombre = certSplit[certSplit.length - 1]

            setNombreLlave(llaveNombre)
            setNombreCertificado(certNombre)
            setTieneCertificados(true)
            setCertificados({
              llavePrivada: data.llavePrivadaUrl,
              certificado: data.certificadoUrl,
              contrasena: atob(data.certificadoContrasena),
              noCertificado: data.noCertificado,
            })

            setCertificadosDefault({
              id: data.id,
              llaveNombre,
              nombreCertificado: certNombre,
              llavePrivada: data.llavePrivadaUrl,
              certificado: data.certificadoUrl,
              contrasena: atob(data.certificadoContrasena),
              noCertificado: data.noCertificado,
            })
          }
        }
      })
      .catch((e) => {
        errorMessage(e?.data?.message)
      })
      .finally(() => {
        loading(false)
      })
  }

  const certificadoWatch = watch('certificado')
  const llaveWatch = watch('llavePrivada')
  useEffect(() => {
    loadCertificados()
  }, [])

  useEffect(() => {
    reset(certificados)
  }, [certificados])

  useEffect(() => {
    if (isSubmitted && !certificadoWatch) {
      setError('certificado', {
        type: 'manual',
        message: t(`El certificado es requerido `),
      })
    } else {
      clearErrors('certificado')
    }
  }, [certificadoWatch, isSubmitted])

  useEffect(() => {
    if (isSubmitted && !llaveWatch) {
      setError('llavePrivada', {
        type: 'manual',
        message: t(`La llave privada es requerida `),
      })
    } else {
      clearErrors('llavePrivada')
    }
  }, [llaveWatch, isSubmitted])

  const guardar = async (datos: Certificado) => {
    console.log('datos', datos)
    try {
      let certificado = datos.certificado
      let llavePrivada = datos.llavePrivada

      if (datos.certificado instanceof File) {
        loading(t('subiendo archivos...').toString())
        const certificadoPromise = putFile(
          'empresas',
          `certificados-digitales/get_file_url?name=${certificado.name}`,
          datos.certificado,
          'get',
        )
        const certificadoUrl = await certificadoPromise
        await certificadoUrl.fileUploadPromise
        certificado = certificadoUrl.key
      }

      if (datos.llavePrivada instanceof File) {
        loading(t('subiendo archivos...').toString())
        const llavePromise = putFile(
          'empresas',
          `certificados-digitales/get_file_url?name=${llavePrivada.name}`,
          datos.llavePrivada,
          'get',
        )
        const llaveUrl = await llavePromise
        await llaveUrl.fileUploadPromise
        llavePrivada = llaveUrl.key
      }

      loading(t('guardando...').toString())

      const data = await execute<{ status: string; id: number }>(
        'empresas',
        'certificados-digitales',
        {
          llavePrivada,
          certificado,
          contrasena: datos.contrasena,
          noCertificado: datos.noCertificado,
          nombreCertificado: certificado.name,
          nombreLlave: llavePrivada.name,
        },
      )

      setCertificados({
        id: data.id,
        llavePrivada,
        certificado,
        contrasena: datos.contrasena,
        noCertificado: datos.noCertificado,
      })

      loadCertificados()
      successMessage(t('Sellos digitales guardados con exito').toString())
      setModificar(false)
    } catch (e) {
      console.log('error', e)
      errorMessage(t('ocurrio un error a la hora de subir los certificados').toString())
    } finally {
      loading(false)
    }
  }

  const alternarMostrarContrasena = () => {
    if (tieneCertificados && !modificar) {
      return null
    }
    setMostrarContrasena((mp) => !mp)
  }

  const alternarFocoRaton = (event) => {
    event.preventDefault()
  }

  const permitirModificar = () => {
    setModificar(true)
  }

  const cancelar = async () => {
    setModificar(false)
    setMostrarContrasena(false)
    setNombreLlave(null)
    setNombreCertificado(null)
    setCertificados(null)
    await reset({})
    setNombreLlave(certificadosDefault.llaveNombre)
    setNombreCertificado(certificadosDefault.nombreCertificado)
    await setCertificados(certificadosDefault)
    reset(certificados)
    setTieneCertificados(true)
  }

  const cerrarSalir = () => {
    setSalirEdicion(false)
  }

  const aceptarSalir = () => {
    router.push('/')
  }

  const salir = () => {
    if (modificar) {
      return setSalirEdicion(true)
    }
    router.push('/')
  }

  const botonesBorrar: Array<ButtonsDialog> = [
    {
      title: 'Cancelar',
      onClick: cerrarSalir,
      color: 'secondary',
    },
    {
      title: 'Aceptar',
      onClick: aceptarSalir,
      color: 'primary',
    },
  ]

  const pintarBotonGuardar = () => {
    if (modificar || !tieneCertificados) {
      return (
        <Button size="large" color="primary" fullWidth onClick={handleSubmit(guardar)}>
          <Text text="guardar" />
        </Button>
      )
    }

    if (tieneCertificados) {
      return (
        <Button size="large" color="primary" fullWidth onClick={permitirModificar}>
          <Text text="modificar" />
        </Button>
      )
    }
  }

  return (
    <Page title="Certificados digitales">
      <form>
        <Grid container direction="row" spacing={5}>
          <Grid item xs={8}>
            <Card>
              <CardContent>
                <Grid container direction="column" spacing={2}>
                  <Grid item xs={12}>
                    <Text
                      text="En caso de que necesites facturar, vas a necesitar adjuntar 3 archivos"
                      className={classes.title}
                    />
                  </Grid>
                  <br />
                  <Grid item xs={12}>
                    <Grid container direction="row" alignItems="center">
                      <Grid item xs={7}>
                        <Text
                          text="Archivo certificado de sellos digitales (.cer)"
                          className={classes.label}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <InputFile
                          setValue={setValue}
                          name="certificado"
                          acceptType="application/*"
                          extensions={['cer']}
                          maxSize={1048576}
                          setError={setError}
                          clearErrors={clearErrors}
                          errors={errors}
                          defaultValue={certificados?.certificado}
                          defaultFileName={nombreCertificado}
                          // defaultFileName={certificadoNombreDefault}
                          disabled={tieneCertificados && !modificar}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container direction="row" alignItems="center">
                      <Grid item xs={7}>
                        <Text text="Archivo llave privada (.key)" className={classes.label} />
                      </Grid>
                      <Grid item xs={5}>
                        <InputFile
                          setValue={setValue}
                          name="llavePrivada"
                          acceptType="application/*"
                          extensions={['key']}
                          maxSize={1048576}
                          setError={setError}
                          clearErrors={clearErrors}
                          errors={errors}
                          defaultFileName={nombreLlave}
                          defaultValue={certificados?.llavePrivada}
                          disabled={tieneCertificados && !modificar}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container direction="row" alignItems="center">
                      <Grid item xs={7}>
                        <Text text="Contraseña del certificado" className={classes.label} />
                      </Grid>
                      <Grid item xs={5}>
                        <InputText
                          label="contraseña"
                          type={mostrarContrasena ? 'text' : 'password'}
                          name="contrasena"
                          control={control}
                          errors={errors}
                          required
                          rules={{
                            required: {
                              message: t('La contraseña es requerida'),
                              value: true,
                            },
                            minLength: {
                              message: t('Ingresa al menos 3 caracteres'),
                              value: 3,
                            },
                            maxLength: {
                              message: t('Sólo acepta 32 caracteres o menos'),
                              value: 32,
                            },
                          }}
                          inputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={alternarMostrarContrasena}
                                  onMouseDown={alternarFocoRaton}
                                >
                                  {mostrarContrasena ? <IoEyeOffOutline /> : <IoEyeOutline />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          fullWidth
                          disabled={tieneCertificados && !modificar}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container direction="row" alignItems="center">
                      <Grid item xs={7}>
                        <Text text="Número de certificado" className={classes.label} />
                      </Grid>
                      <Grid item xs={5}>
                        <InputText
                          label="numero de certificado"
                          name="noCertificado"
                          control={control}
                          errors={errors}
                          fullWidth
                          required
                          rules={{
                            required: {
                              message: t('El número certificado es requerido'),
                              value: true,
                            },
                            minLength: {
                              message: t('Ingresa al menos 3 caracteres'),
                              value: 3,
                            },
                            maxLength: {
                              message: t('Sólo acepta 32 caracteres o menos'),
                              value: 32,
                            },
                          }}
                          disabled={tieneCertificados && !modificar}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Grid container direction="column" alignItems="stretch" spacing={1}>
              <Grid item xs={12}>
                {pintarBotonGuardar()}
              </Grid>
              {modificar ? (
                <Grid item xs={12}>
                  <Button
                    size="large"
                    variant="outlined"
                    color="default"
                    fullWidth
                    onClick={cancelar}
                  >
                    <Text text="cancelar" />
                  </Button>
                </Grid>
              ) : null}
              <Grid item xs={12}>
                <Button size="large" color="default" fullWidth onClick={salir}>
                  <Text text="salir" />
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
      {salirEdicion && modificar && (
        <DialogGeneric
          open={salirEdicion && modificar}
          text="¿Deseas salir?, los cambios realizados hasta el momento se perderán"
          title="Certificados digitales"
          buttons={botonesBorrar}
          handleClose={cerrarSalir}
          actions
        />
      )}
    </Page>
  )
}

export default CertificadosPage
