import * as React from 'react'
import { Box, Color, Text, useInput } from 'ink'
import JiraClient from 'jira-connector'
import {
  absoluteFromRelative,
  asyncGetCurrentOpenIssues,
  getInProgressEmoji,
  getIssueColor,
  Issue,
  useCacheable
} from '../../utils'
import { ellipsis, LoadingIcon } from '../util-components/loadingIcon'
import SelectInput from 'ink-select-input'
import { JiraConnector } from '../context/jira'
import { isEmpty, noop } from 'lodash'
import Divider from 'ink-divider'
import Link from 'ink-link'

export function TicketsList() {
  return <h1>Hello world</h1>
}

export function Ticket(props: { ticket: Issue }) {
  const { ticket } = props
  return <Text>{ticket.key}</Text>
}

interface TabProps {
  label: string
  name?: string
  children?: React.ReactComponentElement<any> | string
}

const Tab = (props: TabProps): React.ReactComponentElement<any> => {
  const { children } = props
  return <Box>{children}</Box>
}

interface TabsProps {
  children: React.FunctionComponentElement<TabProps>[]
  onChange?: ({ name }: { name: string }) => void
}

const Tabs = (props: TabsProps) => {
  const { children, onChange = noop } = props
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const totalChildren = children.filter(child => !!child).length

  useInput((input, key) => {
    if (key.leftArrow) {
      setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : 0)
    }
    if (key.rightArrow) {
      setSelectedIndex(
        selectedIndex < totalChildren - 1 ? selectedIndex + 1 : selectedIndex
      )
    }
  })

  React.useEffect(() => {
    const currentlySelectedChild = children[selectedIndex]
    onChange({ name: currentlySelectedChild?.props.name })
  }, [selectedIndex])

  return (
    <Box flexDirection="column">
      <Box>
        {'  '}
        {children.map((child, index) => {
          if (!child) return

          return (
            <Box key={index} textWrap="truncate-end">
              <Text bold={index === selectedIndex}>{child.props.label}</Text>
              {index < totalChildren - 1 ? '  |  ' : null}
            </Box>
          )
        })}
      </Box>
      {children[selectedIndex] && (
        <Box flexDirection="column">
          <Divider />
          <Box>{children[selectedIndex].props.children}</Box>
        </Box>
      )}
    </Box>
  )
}

export function TodoComponent(props) {
  const { jira }: { jira: JiraClient } = React.useContext(JiraConnector)
  const [loading, setLoading] = React.useState(true)
  const [myTickets, setMyTickets] = React.useState<Issue[]>([])
  const [selectedTicket, setSelectedTicket] = React.useState<Issue>()
  const [activeTab, setActiveTab] = React.useState<string>()
  const getCacheableCurrentOpenIssues = useCacheable(
    absoluteFromRelative('~/.jira.d/cached_issues.json'),
    asyncGetCurrentOpenIssues
  )
  const customFields = false

  React.useEffect(() => {
    const getMyTickets = async () => {
      setLoading(true)
      getCacheableCurrentOpenIssues(jira)
        .then(result => {
          setMyTickets(result)
        })
        .catch(e => {
          if (isEmpty(e)) {
            throw Error(e)
          }
          setMyTickets(e)
        })
    }
    getMyTickets()
  }, [jira])
  const items = React.useMemo(() => {
    const longestTicketNumber = myTickets.reduce(
      (prev, curr) => {
        if (curr.key && curr.key.length > prev?.key.length) {
          return curr
        }
        return prev
      },
      { key: '' }
    )
    return myTickets.map(ticket => {
      let color = getIssueColor(ticket.fields.issuetype.name)

      return {
        label: (
          <>
            <Color {...color}>
              {ticket.key.padEnd(longestTicketNumber.key.length)}
            </Color>{' '}
            - {getInProgressEmoji(ticket.fields.status.name)} -{' '}
            {ticket.fields.summary}
          </>
        ),
        value: ticket.key
      }
    })
  }, [myTickets])
  React.useEffect(() => {
    if (myTickets.length > 0) {
      setLoading(false)
    }
  }, [myTickets])

  const selectTicket = ticketNumber => {
    setSelectedTicket(myTickets.find(issue => issue.key === ticketNumber))
  }
  const buildCustomFields = () => {
    return <Text>HELLO FROM CUSTOM FIELDS</Text>
  }
  const getUrl = (path: string) => {
    const jiraRestPath = jira.buildURL('').split('//')
    jiraRestPath.pop()
    return jiraRestPath.join('//') + path
  }

  return (
    <Box flexDirection={'row'}>
      {loading && myTickets ? (
        <>
          Fetching tickets
          <LoadingIcon values={ellipsis} />
        </>
      ) : (
        <Box flexDirection={'column'}>
          <SelectInput
            itemComponent={({ isSelected, label }) => {
              return <Color bold={isSelected}>{label}</Color>
            }}
            items={items as any}
            onSelect={item => selectTicket(item.value)}
          />
          {selectedTicket ? (
            <>
              <Divider />
              <Box flexDirection={'column'}>
                <Tabs>
                  <Tab label="Summary" name="summary">
                    {selectedTicket.fields.summary}
                  </Tab>
                  <Tab label="Details" name="details">
                    <Box flexDirection="column">
                      <Box>
                        Issue:{' '}
                        <Link url={getUrl('/browse/' + selectedTicket.key)}>
                          {selectedTicket.key}
                        </Link>
                      </Box>
                      <Box>
                        Details (Not Implemented Yet{' '}
                        <Link
                          url={'https://github.com/twick00/jinx/issues/new'}
                        >
                          Submit Ideas To Github
                        </Link>
                        )
                      </Box>
                    </Box>
                  </Tab>
                  <Tab label="Description" name="description">
                    {selectedTicket.fields.description}
                  </Tab>
                  {customFields ? (
                    <Tab label="Custom">{buildCustomFields()}</Tab>
                  ) : (
                    undefined
                  )}
                </Tabs>
              </Box>
            </>
          ) : null}
        </Box>
      )}
    </Box>
  )
}
