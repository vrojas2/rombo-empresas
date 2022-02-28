import { Card, Grid, makeStyles, Theme, createStyles } from '@material-ui/core'
import Link from 'next/link'
import { IoChevronForwardOutline, IoPricetagsOutline, IoPersonOutline } from 'react-icons/io5'

import { Page } from '../../lib/layout/main'
import { Text } from '../../lib/components/commons'
const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexFlow: 'column wrap',
      height: '100%',
    },
    grid: {
      padding: '0 1em',
    },
    card: {
      width: '100%',
      margin: '1% 1em',
      padding: '2em 0',
      verticalAlign: 'center',
      cursor: 'pointer',
    },
    arrow: {
      textAlign: 'right',
      color: theme.palette.primary.main,
    },
    text: {
      fontSize: '1.5em',
      paddingLeft: '0.5em',
    },
    title: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignITems: 'center',
      flexFlow: 'row wrap',
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
      <Card className={classes.card}>
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          className={classes.grid}
        >
          <Grid item xs={10}>
            <Grid container direction="row" alignItems="flex-start">
              <Grid item xs={10}>
                <div className={classes.title}>
                  {icon}
                  <Text text={title} className={classes.text} />
                </div>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={2} className={classes.arrow}>
            <IoChevronForwardOutline size={ICON_SIZE} color="primary" />
          </Grid>
        </Grid>
      </Card>
    </Link>
  )
}
export const ReportesPage = (): JSX.Element => {
  const classes = useStyle()
  return (
    <Page title="Reportes">
      <div className={classes.container}>
        <CardSection
          title="Ventas por artículo"
          url="/reportes/ventas-por-articulo"
          icon={<IoPricetagsOutline size={ICON_SIZE} />}
        />
        <CardSection
          title="Ventas por cliente"
          url="/reportes/ventas-por-cliente"
          icon={<IoPersonOutline size={ICON_SIZE} />}
        />
      </div>
    </Page>
  )
}

export default ReportesPage
