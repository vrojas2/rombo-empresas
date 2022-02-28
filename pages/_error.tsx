import { Box, Card, CardContent, Divider, Grid, Typography } from '@material-ui/core'
import { TFunction } from 'i18next'
import { NextPage } from 'next'
import { useTranslation } from 'react-i18next'
import { Page } from '../lib/layout/main'

const mapStatusCode = (statusCode: number, t: TFunction) => {
  switch (statusCode) {
    case 404:
      return t('La página que buscas no existe')
    default:
      return t('¡Ha habido un error! Intenta más tarde')
  }
}

const ErrorPage: NextPage<{ statusCode: number }> = ({ statusCode }) => {
  const { t } = useTranslation()
  return (
    <Page title={`Error ${statusCode}`}>
      <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
        <Grid item xs={12}>
          <Box mt={5} mb={3}>
            <img src="/logo.png" alt="rombo" />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography color="textPrimary" variant="h5">
            {mapStatusCode(statusCode, t)}
          </Typography>

          <br />
        </Grid>
        <Grid item xs={12}>
          <Typography color="error" variant="h3">
            ERROR: {statusCode}
            <Divider />
          </Typography>
        </Grid>
      </Grid>
    </Page>
  )
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default ErrorPage
