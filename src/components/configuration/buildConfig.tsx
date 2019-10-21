import * as React from "react";
import { Reducer } from "react";
import { Box, Color } from "ink";
import { LoadingIcon } from "../util-components/loadingIcon";
import { JiraCreds } from "../pages/configuratorComponent";
import { noop } from "lodash";
import { UserInput } from "../util-components/input/userInput";

interface Action {
  type: "host" | "email" | "apiKey";
  value: string;
}

interface BuildConfigProps {
  setConfig: (config: JiraCreds) => void;
}

export const BuildConfig = (props: BuildConfigProps) => {
  const { setConfig = noop } = props;
  const [config, dispatch] = React.useReducer<Reducer<JiraCreds, Action>>(
    reducer,
    {
      email: null,
      host: null,
      apiKey: null
    }
  );
  if (config.apiKey === null) {
    return (
      <UserInput
        key={1}
        output={"Enter your Jira API Key: "}
        onResolve={value => dispatch({ type: "apiKey", value })}
      />
    );
  } else if (config.email === null) {
    return (
      <UserInput
        key={2}
        output={"Enter your associated Email: "}
        onResolve={value => dispatch({ type: "email", value })}
      />
    );
  } else if (config.host === null) {
    return (
      <UserInput
        key={3}
        output={"Enter the host endpoint: "}
        onResolve={value => dispatch({ type: "host", value })}
      />
    );
  } else {
    setConfig(config);
    return (
      <Box>
        <Color green>Building Config</Color>
        <LoadingIcon color={{ green: true }} />
      </Box>
    );
  }
};

const reducer = (state, action: Action) => {
  const { value, type } = action;
  switch (type) {
    case "host":
      return {
        ...state,
        host: value
      };
    case "email":
      return {
        ...state,
        email: value
      };
    case "apiKey":
      return {
        ...state,
        apiKey: value
      };
  }
};
