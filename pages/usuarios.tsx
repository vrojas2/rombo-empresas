import { useTranslation } from 'react-i18next'
import { Page } from '../lib/layout/main'

const UsuariosPage = (): JSX.Element => {
  const { t } = useTranslation()
  return (
    <Page title={t('usuarios')}>
      {/*<div style={{ height: `calc(100vh - ${drawerWidth / 2}px)` }}>
        <GridTable
          showAuditFields
          fields={[
            {
              field: 'nombre',
              headerName: 'Empresa',
              width: 160,
            },
          ]}
          resource="empresas"
        />
        </div>*/}
    </Page>
  )
}

export default UsuariosPage
