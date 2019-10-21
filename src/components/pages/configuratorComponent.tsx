import * as React from "react";
import {Box, Color, Text} from "ink";
import {noop} from "lodash";
import * as os from "os";
import {dots, LoadingIcon} from "../util-components/loadingIcon";
import {Confirm} from "../util-components/input/confirm";
import {Exit} from "../util-components/exit";
import {getJsonFile} from "../../utils";
import {CreateFile} from "../util-components/files/createFile";
import {BuildConfig} from "../configuration/buildConfig";

const config_path = os.homedir() + "/.jira.d/config.json";

export interface JiraCreds {
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
  setJiraCredentials: (credentials: JiraCreds) => void;
}

export const ConfiguratorComponent = (props: ConfiguratorProps) => {
  const { setJiraCredentials = noop } = props;
  const [configFile, setConfigFile] = React.useState(null);
  const [config, setConfig] = React.useState(null);
  const [status, setStatus] = React.useState<Status>(Status.ConfigNotLoaded);
  const [message, setMessage] = React.useState(null);

  React.useEffect(() => {
    configure();
  }, []);

  React.useEffect(() => {
    if (configFile) {
      setJiraCredentials(configFile);
    }
  }, [configFile]);

  React.useEffect(() => {
    if (config) {
      setStatus(Status.ConfigBeingWritten);
    }
  });

  const configure = () => {
    const config = getJsonFile(config_path);
    if (config === null) {
      setStatus(Status.ConfigNotFound);
    } else {
      setConfigFile(config);
    }
  };

  const buildConfig = () => {
    return (
      <BuildConfig
        setConfig={config => {
          setConfig(config);
        }}
      />
    );
  };

  const writeConfig = () => {
    if (config) {
      return (
        <CreateFile
          path={config_path}
          fileContents={JSON.stringify(config, null, 2)}
          onResolve={() => {
            configure();
          }}
        />
      );
    } else {
    }
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
          <Box flexDirection={"column"}>
            <Text>{"Config file not found at: " + config_path}</Text>
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
