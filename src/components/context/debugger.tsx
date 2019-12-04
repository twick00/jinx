import * as React from 'react'
import { noop } from 'lodash'
import { Box, Color } from 'ink'
import Divider from 'ink-divider'

export const DebugContext = React.createContext(noop)

export const Debugger = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = React.useState()
  const [counter, setCounter] = React.useState(0)
  const setDebugMessage = (...message) => {
    setMessage(message.join(''))
    setCounter(counter + 1)
  }
  return (
    <DebugContext.Provider value={setDebugMessage}>
      <Box flexDirection={'column'}>
        <Box width={'50%'}>{[children]}</Box>
        <Divider title={'Debug Info'} />
        <Color bgRed={true}>
          <Box flexDirection={'row'}>
            <Box width={'50%'}>Debugger Ran: {counter}</Box>
            <Box width={'50%'}>{`Message: ${message}` ?? 'Empty'}</Box>
          </Box>
        </Color>
      </Box>
    </DebugContext.Provider>
  )
}

export const withDebugger = WrappedComponent => {
  return () => <Debugger>{WrappedComponent}</Debugger>
}
