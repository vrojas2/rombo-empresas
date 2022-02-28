import {
  Button,
  Checkbox,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import { IoPersonAddOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Empresa } from '@rombomx/models'
import { useForm, Controller } from 'react-hook-form'
import { searchItems } from '../../services'

const ICON_SIZE = '1em'
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    control: {
      marginBottom: theme.spacing(2),
    },
    button: {
      width: theme.spacing(16),
    },
    actions: {
      paddingBottom: theme.spacing(2),
      //marginTop: theme.spacing(1),
    },
  }),
)

const NewUsuarioForm = (): JSX.Element => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'))
  const classes = useStyles()
  const { t } = useTranslation()
  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors },
    reset,
    control,
  } = useForm()
  const [open, setOpen] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const [empresas, setEmpresas] = useState<Array<Empresa>>([])

  const loadEmpresas = async () => {
    const result = await searchItems<Empresa>('empresas')
    setEmpresas(result.items)
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const registerNewUsuario = async (val) => {
    console.log('registrando ', val)
  }

  useEffect(() => {
    loadEmpresas()
  }, [])

  return (
    <>
      <Fab
        aria-label="account of current user"
        aria-haspopup="true"
        onClick={handleClickOpen}
        color="secondary"
        size="medium"
      >
        <IoPersonAddOutline size={ICON_SIZE} />
      </Fab>
      <Dialog open={open} fullScreen={fullScreen} fullWidth>
        <DialogTitle>{t('nuevo usuario')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label={t('correo electronico')}
            type="email"
            fullWidth
            id="email"
            name="email"
            {...register('email', {
              required: {
                value: true,
                message: t('el correo es requerido'),
              },
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: t('el correo no es valido'),
              },
            })}
            error={errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label={t('contrasena')}
            type={showPassword ? 'text' : 'password'}
            fullWidth
            id="password"
            name="password"
            error={errors.password}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button color="primary" variant="text" size="small">
                    generar
                  </Button>
                  <IconButton
                    size="small"
                    color={showPassword ? 'secondary' : 'inherit'}
                    onClick={handleClickShowPassword}
                  >
                    {showPassword ? (
                      <IoEyeOutline size={ICON_SIZE} />
                    ) : (
                      <IoEyeOffOutline size={ICON_SIZE} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...register('password', {
              required: {
                value: true,
                message: 'la contraseña es requerida',
              },
              pattern: {
                value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
                message: t('la contraseña no cumple con los requerimientos'),
              },
            })}
          />
          <FormControl variant="filled" className={classes.control} fullWidth>
            <InputLabel id="select-empresa-label">Empresa</InputLabel>
            {empresas.length > 0 && (
              <Controller
                control={control}
                name="empresa"
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <Select
                    labelId="select-empresa-label"
                    fullWidth
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    innerRef={ref}
                  >
                    {empresas.length > 0 &&
                      empresas.map((empresa) => (
                        <MenuItem key={`usuarios-form-empresa-${empresa.id}`} value={empresa.id}>
                          {empresa.nombre}
                        </MenuItem>
                      ))}
                  </Select>
                )}
              />
            )}
          </FormControl>
          <FormControl fullWidth>
            <FormControlLabel
              labelPlacement="start"
              control={<Checkbox name="checkedC" />}
              label={t('notificar al usuario')}
            />
          </FormControl>
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button color="secondary" className={classes.button} onClick={handleClose}>
            {t('cancelar')}
          </Button>
          <Button
            color="primary"
            variant="contained"
            className={classes.button}
            onClick={handleSubmit(registerNewUsuario)}
          >
            {t('registrar')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default NewUsuarioForm
