import { Color, ColorProps } from 'ink'
import * as React from 'react'

export const dots = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
export const ellipsis = ['', '.', '..', '...']

export interface LoadingProps {
  values?: Array<string>
  interval?: number
  on?: boolean
  show?: boolean
  color?: ColorProps
}

export const LoadingIcon = (props: LoadingProps) => {
  const {
    values = ellipsis,
    interval = 300,
    on = true,
    show = true,
    color = {}
  } = props
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      index >= values.length - 1 ? setIndex(0) : setIndex(index + 1)
    }, interval)
    return () => {
      clearInterval(timer)
    }
  })
  return show ? <Color {...color}>{values[index]} </Color> : null
}
