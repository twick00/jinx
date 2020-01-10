import * as React from 'react'
import { Box, Color, Text } from 'ink'
import { noop } from 'lodash'
import { dots, ellipsis, LoadingIcon } from '../util-components/loadingIcon'
import { Confirm } from '../util-components/input/confirm'
import { Exit } from '../util-components/exit'
import { asyncGetAllProjects, getJsonFile } from '../../utils'
import { CreateFile } from '../util-components/files/createFile'
import { BuildConfig } from '../configuration/buildConfig'
import { join } from 'path'
import JiraClient from 'jira-connector'

export interface JiraCredentials {
  host: string
  email: string
  apiKey?: string
}

enum Status {
  CheckingConfig,
  ConfigInvalid,
  ConfigNotLoaded,
  ConfigLoaded,
  ConfigNotFound,
  ConfigBeingBuilt,
  ConfigBeingWritten
}

interface ConfiguratorProps {
  config?: {
    path: string
  }
  setJiraCredentials: (credentials: JiraCredentials) => void
}

export const ConfiguratorComponent = (props: ConfiguratorProps) => {
  const { setJiraCredentials, config: cfg } = props
  const [config, setConfig] = React.useState(null)
  const [status, setStatus] = React.useState<Status>(Status.ConfigNotLoaded)
  const [message, setMessage] = React.useState()
  const pathToConfigFile = join(cfg.path, 'config.json')

  const validateConfig = (onValid = noop, onInvalid = noop) => {
    const jiraConnector = new JiraClient({
      host: config?.host,
      basic_auth: {
        email: config?.email,
        api_token: config?.apiKey
      }
    })
    asyncGetAllProjects(jiraConnector)
      .then(data => {
        onValid(data)
      })
      .catch(error => {
        onInvalid(error)
      })
  }

  React.useEffect(() => {
    const config = getJsonFile(pathToConfigFile)
    if (config === null) {
      setStatus(Status.ConfigNotFound)
    } else {
      setStatus(Status.ConfigLoaded)
      setJiraCredentials(config)
    }
  }, [pathToConfigFile])

  const CheckRender = () => {
    switch (status) {
      case Status.ConfigNotLoaded:
        return (
          <Box>
            <Text> Searching for config file</Text>
            <LoadingIcon />
          </Box>
        )
      case Status.ConfigNotFound:
        return (
          <Box flexDirection={'column'}>
            <Text>{'Config file not found at: ' + pathToConfigFile}</Text>
            <Box>
              <Text>Do you want to create the config file? </Text>
              <Confirm
                onDeny={() => {
                  setMessage(<Exit />)
                }}
                onConfirm={() => setStatus(Status.ConfigBeingBuilt)}
              />
            </Box>
          </Box>
        )
      case Status.ConfigBeingBuilt:
        return (
          <BuildConfig
            doneConfig={config => {
              setConfig(config)
              setStatus(Status.CheckingConfig)
            }}
          />
        )
      case Status.ConfigBeingWritten:
        return (
          <CreateFile
            path={pathToConfigFile}
            fileContents={JSON.stringify(config, null, 2)}
            onResolve={() => {
              setStatus(Status.ConfigLoaded)
            }}
            onNoOverwrite={() => setMessage(<Exit />)}
          />
        )
      case Status.ConfigLoaded:
        setJiraCredentials(config)
        return (
          <Box>
            <Color green>Config found!</Color>
          </Box>
        )
      case Status.CheckingConfig:
        validateConfig(
          () => setStatus(Status.ConfigBeingWritten),
          () => setStatus(Status.ConfigInvalid)
        )
        return (
          <Box>
            <Text>Checking configuration</Text>
            <LoadingIcon values={ellipsis} />
          </Box>
        )
      case Status.ConfigInvalid:
        return (
          <Box>
            <Text>Authentication failed, </Text>
            <Confirm
              onConfirm={() => {
                setStatus(Status.ConfigBeingBuilt)
              }}
              onDeny={() => {
                setMessage(<Exit />)
              }}
            />
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Box>
      <LoadingIcon color={{ yellow: true }} values={dots} interval={80} />
      {message ? message : <CheckRender />}
    </Box>
  )
}
