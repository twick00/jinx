import * as React from 'react';
import { Box, Color, Text } from 'ink';
import { noop } from 'lodash';
import { dots, LoadingIcon } from '../util-components/loadingIcon';
import { Confirm } from '../util-components/input/confirm';
import { Exit } from '../util-components/exit';
import { getJsonFile } from '../../utils';
import { CreateFile } from '../util-components/files/createFile';
import { BuildConfig } from '../configuration/buildConfig';
import { join } from 'path';

export interface JiraCredentials {
  host: string;
  email: string;
  apiKey?: string;
}

enum Status {
  ConfigNotLoaded,
  ConfigLoaded,
  ConfigNotFound,
  ConfigBeingBuilt,
  ConfigBeingWritten
}

interface ConfiguratorProps {
  config?: {
    path: string;
  };
  setJiraCredentials: (credentials: JiraCredentials) => void;
}

export const ConfiguratorComponent = (props: ConfiguratorProps) => {
  const { setJiraCredentials = noop, config: cfg } = props;
  const [configFile, setConfigFile] = React.useState(null);
  const [config, setConfig] = React.useState(null);
  const [status, setStatus] = React.useState<Status>(Status.ConfigNotLoaded);
  const [message, setMessage] = React.useState(null);
  const pathToConfigFile = join(cfg.path, 'config.json');
  React.useEffect(() => {
    configure();
  }, []);

  React.useEffect(() => {
    if (configFile) {
      setJiraCredentials(configFile);
    }
  }, [configFile, setJiraCredentials]);

  React.useEffect(() => {
    if (config) {
      setStatus(Status.ConfigBeingWritten);
    }
  }, [config]);

  const configure = () => {
    const config = getJsonFile(pathToConfigFile);
    if (config === null) {
      setStatus(Status.ConfigNotFound);
    } else {
      setConfigFile(config);
    }
  };

  const buildConfig = () => {
    return (
      <BuildConfig
        doneConfig={config => {
          setConfig(config);
        }}
      />
    );
  };

  const writeConfig = () => {
    return (
      <CreateFile
        path={pathToConfigFile}
        fileContents={JSON.stringify(config, null, 2)}
        onResolve={() => {
          configure();
        }}
      />
    );
  };

  const CheckRender = () => {
    switch (status) {
      case Status.ConfigNotLoaded:
        return (
          <Box>
            <Text> Searching for config file</Text>
            <LoadingIcon />
          </Box>
        );
      case Status.ConfigNotFound:
        return (
          <Box flexDirection={'column'}>
            <Text>{'Config file not found at: ' + pathToConfigFile}</Text>
            <Box>
              <Text>Do you want to create the config file? </Text>
              <Confirm
                onDeny={() => {
                  setMessage(<Exit />);
                }}
                onConfirm={() => setStatus(Status.ConfigBeingBuilt)}
              />
            </Box>
          </Box>
        );
      case Status.ConfigBeingBuilt:
        return buildConfig();
      case Status.ConfigBeingWritten:
        return writeConfig();
      case Status.ConfigLoaded:
        return (
          <Box>
            <Color green>Config found!</Color>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <LoadingIcon color={{ yellow: true }} values={dots} interval={80} />
      {message ? message : <CheckRender />}
    </Box>
  );
};
