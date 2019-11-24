import * as React from 'react';
import { noop } from 'lodash';
import { JiraCredentials } from '../pages/configuratorComponent';
import JiraClient from 'jira-connector';
import * as os from 'os';

export const JiraConnector = React.createContext({
  jira: null,
  setJira: noop,
  config: {
    path: os.homedir() + '/.jira.d/'
  }
});

const JiraProvider = ({ children }: { children: React.ReactNode }) => {
  const [jira, setJira] = React.useState(null);
  const config_path = os.homedir() + '/.jira.d/';
  const buildJira = (credentials: JiraCredentials) => {
    const jiraConnector = new JiraClient({
      host: credentials.host,
      basic_auth: {
        email: credentials.email,
        api_token: credentials.apiKey
      }
    });
    setJira(jiraConnector);
  };
  return (
    <JiraConnector.Provider
      value={{ jira, setJira: buildJira, config: { path: config_path } }}
    >
      {children}
    </JiraConnector.Provider>
  );
};

export const withJira = WrappedComponent => {
  return () => (
    <JiraProvider>
      <WrappedComponent />
    </JiraProvider>
  );
};

export const useJiraAuthenticator = () => React.useContext(JiraConnector);
