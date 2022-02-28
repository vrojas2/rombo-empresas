import MaskedInput from 'react-text-mask'

interface PhoneInputProps {
  inputRef: (ref: HTMLInputElement | null) => void
}

export const PhoneInput = (props: PhoneInputProps): JSX.Element => {
  const { inputRef, ...other } = props

  return (
    <MaskedInput
      {...other}
      ref={(ref: any) => {
        inputRef(ref ? ref.inputElement : null)
      }}
      mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
      placeholderChar={'\u2000'}
      showMask
    />
  )
}

export default PhoneInput
