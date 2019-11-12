import * as React from "react";
import {ConfiguratorComponent, JiraCredentials} from "./components/pages/configuratorComponent";
import {Box, Color, render} from "ink";
import {TodoComponent} from "./components/pages/todoComponent";
import {noop} from "lodash";
import JiraClient from "jira-connector";
import Divider from "ink-divider";

export const DebugContext = React.createContext(noop);

const Debugger = ({ children }) => {
  const [message, setMessage] = React.useState();
  const [counter, setCounter] = React.useState(0);
  const setDebugMessage = (...message) => {
    setMessage(message.join(""));
    setCounter(counter + 1);
  };
  return (
    <DebugContext.Provider value={setDebugMessage}>
      <Box flexDirection={"column"}>
        <Box width={"50%"}>{[children]}</Box>
        <Divider title={"Debug Info"} />
        <Color bgRed={true}>
          <Box flexDirection={"row"}>
            <Box width={"25%"}>Debugger Ran: {counter}</Box>
            <Box width={"25%"}>{message ?? "Empty"}</Box>
          </Box>
        </Color>
      </Box>
    </DebugContext.Provider>
  );
};

export const JiraConnector = React.createContext({ jira: null, setJira: noop });

const JiraProvider = ({ children }) => {
  const [jira, setJira] = React.useState(null);
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
    <JiraConnector.Provider value={{ jira, setJira: buildJira }}>
      {children}
    </JiraConnector.Provider>
  );
};
export const useJiraAuthenticator = () => React.useContext(JiraConnector);

export const App = () => {
  const { jira, setJira } = useJiraAuthenticator();
  const overrideSetJira = () => {

  }
  return (
    <>
      <Box flexDirection={"column"}>
        {!jira ? (
          <ConfiguratorComponent setJiraCredentials={setJira} />
        ) : (
          <TodoComponent />
        )}
      </Box>
    </>
  );
};

render(
  <JiraProvider>
    <App />
  </JiraProvider>,
  { experimental: true }
);
