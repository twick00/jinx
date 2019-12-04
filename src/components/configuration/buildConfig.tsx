import * as React from 'react'
import { Box, Color, Text } from 'ink'
import { LoadingIcon } from '../util-components/loadingIcon'
import { JiraCredentials } from '../pages/configuratorComponent'
import { noop } from 'lodash'
import { UserInput } from '../util-components/input/userInput'
import Link from 'ink-link'
import { checkValidEmail } from '../../utils'

interface Questions {
  type: 'host' | 'email' | 'apiKey'
  output: string | React.ReactNode
  applyPost?: (value: string) => string
  validate?: (value: string) => boolean
  placeholder?: string
}

interface BuildConfigProps {
  doneConfig: (config: JiraCredentials) => void
}

export const BuildConfig = (props: BuildConfigProps) => {
  const { doneConfig = noop } = props
  const [config, setConfig] = React.useState({
    apiKey: null,
    email: null,
    host: null
  })
  const questions: Array<Questions> = [
    {
      type: 'email',
      validate: email => {
        return checkValidEmail(email)
      },
      output: 'Enter your associated Email:',
      placeholder: 'user@example.com'
    },
    {
      type: 'apiKey',
      output: (
        <Text>
          <Link url={'https://id.atlassian.com/manage/api-tokens'}>
            Enter your Jira API Key
          </Link>
          :
        </Text>
      ),
      placeholder: 'XXXXXXXXXXXXXXXXXXXXXXXX'
    },
    {
      type: 'host',
      output: 'Enter the host endpoint:',
      // Strip 'http://' and 'https://'
      applyPost: value => value.replace(/(^\w+:|^)\/\//, ''),
      placeholder: 'id.atlassian.com'
    }
  ]

  const getQuestion = () => {
    const nextQuestion = questions.find(value => {
      return config[value.type] === null
    })
    return nextQuestion ? (
      <UserInput
        key={nextQuestion.type}
        output={nextQuestion.output}
        validate={nextQuestion.validate}
        placeholder={nextQuestion.placeholder}
        onResolve={value => {
          let input = value
          if (nextQuestion.applyPost) {
            input = nextQuestion.applyPost(value)
          }
          setConfig({
            ...config,
            [nextQuestion.type]: input
          })
        }}
      />
    ) : null
  }
  const nextQuestion = getQuestion()
  if (nextQuestion) {
    return nextQuestion
  } else {
    doneConfig(config)
    return (
      <Box>
        <Color green>Building Config</Color>
        <LoadingIcon color={{ green: true }} />
      </Box>
    )
  }
}
