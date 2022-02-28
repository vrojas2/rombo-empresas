import { useTranslation } from 'react-i18next'

interface TextProps {
  text: string
  className?: string
}

export function Text({ text, className }: TextProps): JSX.Element {
  const { t } = useTranslation()
  return <span className={className}>{t(text)}</span>
}

export default Text
