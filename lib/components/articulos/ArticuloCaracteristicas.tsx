import { Grid, makeStyles, createStyles, Theme } from '@material-ui/core'
import { IoAddCircleOutline } from 'react-icons/io5'
import getConfig from 'next/config'
import { useTranslation } from 'react-i18next'

import ArticuloCaracteristicaFormulario from './ArticuloCaracteristicaFormulario'
import Text from '../commons/Text'
import { ArticuloCaracteristicasProps } from '../../propTypes'
import { useFeedback } from '../../providers/feedback'

const { publicRuntimeConfig } = getConfig()
const { maxItemsVariants } = publicRuntimeConfig

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: '2em',
    },
    iconAdd: {
      cursor: 'pointer',
      color: theme.palette.primary.main,
    },
    title: {
      fontWeight: 'bold',
      letterSpacing: 0,
      lineHeight: '24px',
      fontSize: '1.3em',
      paddingRight: '1em',
    },
    subtitle: {
      fontSize: '0.8em',
      lineHeight: '17px',
    },
  }),
)
/**
 * Componente para mostrar las opciones de variantes (configurar variantes)
 * @param ArticuloCaracteristicasProps
 * @returns JSX.Element
 */
export const ArticuloCaracteristicas = ({
  control,
  append,
  fields,
  errors,
  deshabilitado,
  setValue,
  getValues,
  articuloId,
  setArticulo,
  variantes,
  remove,
  articuloCaracteristicas,
}: ArticuloCaracteristicasProps): JSX.Element => {
  const classes = useStyles()
  const { errorMessage } = useFeedback()
  const { t } = useTranslation()

  const agregarArticuloCaracteristica = () => {
    if (fields.length < Number(maxItemsVariants)) {
      return append({ caracteristica: '', valor: [] })
    }

    return errorMessage(
      t(`Solo se permite agregar un máximo de ${maxItemsVariants} opciones de variantes`),
    )
  }

  const pintarArticuloCaracteristica = () => {
    if (Array.isArray(fields) && fields.length === 0) {
      return null
    }

    return fields.map((field, index) => (
      <Grid item xs={12}>
        <ArticuloCaracteristicaFormulario
          key={field.id}
          control={control}
          deshabilitado={deshabilitado}
          errors={errors}
          index={index}
          setValue={setValue}
          getValues={getValues}
          field={field}
          articuloId={articuloId}
          setArticulo={setArticulo}
          variantes={variantes}
          remove={remove}
        />
      </Grid>
    ))
  }

  return (
    <Grid
      container
      direction="column"
      alignItems="stretch"
      justifyContent="center"
      spacing={2}
      className={classes.root}
    >
      <Grid item xs={12}>
        <Grid container direction="row" justifyContent="flex-start" alignItems="flex-start">
          <Grid item>
            <Text text="Agregar nueva opción de variante" className={classes.title} />
            <br />
            <Text text="Máximo 03" className={classes.subtitle} />
          </Grid>
          <Grid item>
            {!deshabilitado && (
              <IoAddCircleOutline
                className={classes.iconAdd}
                size="2em"
                onClick={agregarArticuloCaracteristica}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container direction="column" justifyContent="center" alignItems="stretch" wrap="wrap">
          {pintarArticuloCaracteristica()}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ArticuloCaracteristicas
