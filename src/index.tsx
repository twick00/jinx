import * as React from "react";
import {
  ConfiguratorComponent,
  JiraCreds
} from "./components/pages/configuratorComponent";
import { render } from "ink";

export const App = () => {
  const [credentials, setCredentials] = React.useState<JiraCreds | null>(null);
  return (
    <>
      {/*<Banner />*/}
      {!credentials ? (
        <ConfiguratorComponent setJiraCredentials={setCredentials} />
      ) : null}
    </>
  );
};

render(<App />);
