import * as React from 'react'
import { Box, Text } from 'ink'
import { LoadingIcon } from '../loadingIcon'
import * as fs from 'fs'
import { Confirm } from '../input/confirm'
import { noop } from 'lodash'
import * as fp from 'path'

interface CreateFileProps {
  path: string
  fileContents: string
  onResolve: (error: NodeJS.ErrnoException, buffer: Buffer) => void
  onReject?: (error: NodeJS.ErrnoException) => void
  onNoOverwrite?: () => void
}

export const CreateFile = (props: CreateFileProps) => {
  const {
    path,
    fileContents,
    onResolve,
    onReject = noop,
    onNoOverwrite = noop
  } = props
  const [message, setMessage] = React.useState(null)

  const writeFile = () => {
    const dir = fp.dirname(path)
    fs.mkdir(dir, { recursive: true }, () => {
      fs.writeFile(path, fileContents, err => {
        if (err) {
          onReject(err)
          return
        }
        fs.readFile(path, onResolve)
      })
    })
  }

  React.useEffect(() => {
    if (fs.existsSync(props.path)) {
      setMessage(
        <Box>
          <Text>That file already exists. Do you want to overwrite it? </Text>
          <Confirm onConfirm={writeFile} onDeny={onNoOverwrite} />
        </Box>
      )
    } else {
      setMessage(
        <Box>
          <Text>Creating file</Text>
          <LoadingIcon color={{ blue: true }} />
        </Box>
      )
      writeFile()
    }
  }, [props.path])

  return message
}
