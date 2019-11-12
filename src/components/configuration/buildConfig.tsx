import * as React from "react";
import {Box, Color} from "ink";
import {LoadingIcon} from "../util-components/loadingIcon";
import {JiraCredentials} from "../pages/configuratorComponent";
import {noop} from "lodash";
import {UserInput} from "../util-components/input/userInput";

interface Questions {
  type: "host" | "email" | "apiKey";
  output: string;
}

interface BuildConfigProps {
  doneConfig: (config: JiraCredentials) => void;
}

export const BuildConfig = (props: BuildConfigProps) => {
  const { doneConfig = noop } = props;
  const [config, setConfig] = React.useState({
    apiKey: null,
    email: null,
    host: null
  });
  const questions: Array<Questions> = [
    {
      type: "apiKey",
      output: "Enter your Jira API Key: "
    },
    {
      type: "email",
      output: "Enter your associated Email: "
    },
    {
      type: "host",
      output: "Enter the host endpoint: "
    }
  ];
  //TODO: FIX PASTING
  //TODO: STRIP EMAIL OF HTTP:// and HTTPS://
  const getQuestion = () => {
    const nextQuestion = questions.find(value => {
      return config[value.type] === null;
    });
    return nextQuestion ? (
      <UserInput
        key={nextQuestion.type}
        output={nextQuestion.output}
        onResolve={value =>
          setConfig({
            ...config,
            [nextQuestion.type]: value
          })
        }
      />
    ) : null;
  };
  const nextQuestion = getQuestion();
  if (nextQuestion) {
    return nextQuestion;
  } else {
    doneConfig(config);
    return (
      <Box>
        <Color green>Building Config</Color>
        <LoadingIcon color={{ green: true }} />
      </Box>
    );
  }
};
