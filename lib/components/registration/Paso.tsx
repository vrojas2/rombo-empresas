import { Theme, Typography, withStyles } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { useRegistrationForm } from './RegistrationContext'

const Paso = withStyles((theme: Theme) => ({
  paso: {
    color: theme.palette.info.main,
    fontWeight: theme.typography.fontWeightBold,
  },
  de: {
    color: theme.palette.grey[600],
    fontWeight: theme.typography.fontWeightBold,
  },
}))(({ classes }: { classes: any }) => {
  const { getSwipableState } = useRegistrationForm()
  const { t } = useTranslation()
  return (
    <Typography>
      <span className={classes.paso}>{`${t('Paso')} ${getSwipableState() + 1}`}</span>
      <span className={classes.de}>{` ${t('de 3')}`}</span>
    </Typography>
  )
})

export default Paso
