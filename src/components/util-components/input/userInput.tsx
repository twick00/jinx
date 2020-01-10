import * as React from 'react'
import { Text, Box, Color, useInput } from 'ink'
import TextInput from 'ink-text-input'
import validate = WebAssembly.validate

interface InputProps {
  output: string | React.ReactNode
  onResolve: (input: string) => void
  validate?: (input: string) => boolean
  placeholder?: string
  required?: boolean
}

export const UserInput = (props: InputProps) => {
  const [input, setInput] = React.useState('')
  const [message, setMessage] = React.useState('')
  const { output, onResolve, required = true, placeholder, validate } = props
  useInput((i, key) => {
    if (key.return) {
      if (validate && !validate(input.trim())) {
        setMessage('Format invalid, try again')
        return
      }
      if (required && input.trim() === '') {
        setMessage('Input is required')
        return
      }
      onResolve(input.trim())
    }
  })

  return (
    <Box flexDirection={'column'}>
      <Text>
        {output}{' '}
        <TextInput
          placeholder={placeholder}
          value={input}
          onChange={setInput}
        />
      </Text>
      {message && <Color red>{message}</Color>}
    </Box>
  )
}
