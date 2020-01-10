import * as React from 'react'
import { ConfiguratorComponent } from './components/pages/configuratorComponent'
import { Box, render } from 'ink'
import { TodoComponent } from './components/pages/todoComponent'
import { useJiraAuthenticator, withJira } from './components/context/jira'

export const App = () => {
  const { jira, setJira, config } = useJiraAuthenticator()
  return (
    <>
      <Box flexDirection={'column'}>
        {!jira ? (
          <ConfiguratorComponent config={config} setJiraCredentials={setJira} />
        ) : (
          <TodoComponent />
        )}
      </Box>
    </>
  )
}

let Application = App
Application = withJira(Application)
// Application = withDebugger(Application)

render(<Application />, { experimental: true })
