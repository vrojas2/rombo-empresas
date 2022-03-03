import { Card, Grid, makeStyles, Theme, createStyles, Paper } from '@material-ui/core'
import Link from 'next/link'
import {
  IoMedalOutline,
  IoPeopleOutline,
  IoChevronForwardOutline,
  IoCardOutline,
  IoListOutline,
} from 'react-icons/io5'

import { Page } from '../../lib/layout/main'
import { Text } from '../../lib/components/commons'
const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexFlow: 'row wrap',
      height: '100%',
    },

    card: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '33%',
      border:'none',
      margin: '1% 1em',
      padding: '1em 0',
      cursor: 'pointer',
      height: '290px',
      color: '#343434',
      borderRadius: '50px',
      boxShadow: ' 1px 1px 10px #FFB23C;,1px 1px 10px #FFC443;',
      background: 'linear-gradient(45deg, #FFB23C 0%, #FFC443 67%);'
    },
    text: {
      textAlign: 'center',
      
    },
    title: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexFlow: 'column',
      fontSize:'1.7em',
    },
  }),
)

type CardProps = {
  title: string
  url: string
  icon: JSX.Element
}

const ICON_SIZE = '2em'

const CardSection = ({ title, url, icon }: CardProps) => {
  const classes = useStyle()
  if (!title && !url && !icon) {
    return null
  }
  return (
    <Link href={url}>
      <Paper className={classes.card}>
        <Grid container direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <Grid item xs={0}>
            <Grid container direction="row" alignItems="center">
              <Grid item xs={0}>
                <div className={classes.title}>
                  {icon}
                  <Text text={title} className={classes.text} />
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Link>
  )
}
export const ConfiguracionPage = (): JSX.Element => {
  const classes = useStyle()
  return (
    <Page title="Configuracion">
      <div className={classes.container}>
        <CardSection
          title="Certificados de sellos digitales"
          url="/configuracion/certificados"
          icon={<IoMedalOutline size={ICON_SIZE} />}
        />
        <CardSection
          title="Administrar Colaboradores"
          url="/configuracion/colaboradores"
          icon={<IoPeopleOutline size={ICON_SIZE} />}
        />
        <CardSection
          title="Datos de la empresa"
          url="/configuracion/empresa"
          icon={<IoListOutline size={ICON_SIZE} />}
        />

        <CardSection
          title="Subscripción"
          url="/configuracion/subscripcion"
          icon={<IoCardOutline size={ICON_SIZE} />}
        />
      </div>
    </Page>
  )
}

export default ConfiguracionPage
