import TextField, { TextFieldProps } from '@mui/material/TextField';

interface CustomTextInputProps {
  height?: number;
}

type TextInputProps = CustomTextInputProps & TextFieldProps;

function TextInput({ height, ...props }: TextInputProps) {
  return (
    <TextField
      {...props}
      sx={{
        backgroundColor: '#fff',
        'label.Mui-focused': {
          color: '#0073E0',
        },
        '.Mui-error': {
          color: '#FF2E1F',
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: '#ff2e1f',
          },
        },
        '.MuiInputBase-root ': {
          height: height,
          '&::placeholder': {
            textOverflow: 'ellipsis !important',
            fontStyle: 'italic',
          },
        },
        '.MuiOutlinedInput-root': {
          '&.Mui-focused fieldset': {
            borderWidth: '1px',
            borderColor: '#3874CB',
          },
        },
        '.MuiFormHelperText-contained': {
          fontStyle: 'italic',
        },
      }}
    />
  );
}

export default TextInput;
