import * as React from 'react'
import { Box, Text } from 'ink'

interface Props {
  description: string
}

export const DescriptionComponent = ({
  description
}: Props): React.ReactComponentElement<any> => {
  const [output, setOutput] = React.useState([])

  React.useEffect(() => {
    const splitDescription = description.split('\n')
    setOutput(splitDescription)
  }, [description])

  return (
    <Box flexDirection="column">
      {output.map((line, idx) => (
        <Text key={idx}>{line}</Text>
      ))}
    </Box>
  )
}
