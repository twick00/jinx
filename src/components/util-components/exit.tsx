import * as React from 'react'
import { Color, useApp } from 'ink'
import { ellipsis, LoadingIcon } from './loadingIcon'

export const exitGracefully = (time?: number) => {
  setTimeout(() => process.exit(0), time || 1000)
}

export interface ExitProps {
  time?: number
  message?: string
}

export const Exit = (props: ExitProps) => {
  const { time, message = null } = props
  const app = useApp()
  React.useEffect(() => {
    app.exit()
  })
  return message !== null ? (
    <Color blue>{message}</Color>
  ) : (
    <Color green>
      Exiting
      <LoadingIcon interval={300} values={ellipsis} color={{ green: true }} />
    </Color>
  )
}
