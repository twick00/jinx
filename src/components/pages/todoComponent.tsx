import * as React from "react";
import {Box, Color, Text} from "ink";
import {JiraConnector} from "../../index";
import JiraClient from "jira-connector";
import {asyncGetCurrentOpenIssues, getInProgressEmoji, getIssueColor, Issue} from "../../utils";
import {ellipsis, LoadingIcon} from "../util-components/loadingIcon";
import SelectInput from "ink-select-input";

export function TicketsList() {
  return <h1>Hello world</h1>;
}

export function Ticket(props: { ticket: Issue }) {
  const { ticket } = props;
  return <Text>{ticket.key}</Text>;
}

export function TodoComponent(props) {
  const { jira }: { jira: JiraClient } = React.useContext(JiraConnector);
  const [loading, setLoading] = React.useState(true);
  const [myTickets, setMyTickets] = React.useState<Issue[]>([]);
  const [selectedTicket, setSelectedTicket] = React.useState<Issue>();
  React.useEffect(() => {
    const getMyTickets = async () => {
      setLoading(true);
      const result: Issue[] = await asyncGetCurrentOpenIssues(jira);
      setMyTickets(result);
    };
    getMyTickets();
  }, []);
  const items = React.useMemo(() => {
    return myTickets.map(ticket => {
      let color = getIssueColor(ticket.fields.issuetype.name);

      return {
        label: (
          <>
            <Color {...color}>{ticket.key.padEnd(8)}</Color> -{" "}
            {getInProgressEmoji(ticket.fields.status.name)} -{" "}
            {ticket.fields.summary}
          </>
        ),
        value: ticket.key
      };
    });
  }, [myTickets]);
  React.useEffect(() => {
    if (myTickets.length > 0) {
      setLoading(false);
    }
  }, [myTickets]);

  const selectTicket = ticketNumber => {
    setSelectedTicket(myTickets.find(issue => issue.key === ticketNumber));
  };
  return (
    <Box flexDirection={"row"}>
      {loading && myTickets ? (
        <>
          Fetching tickets
          <LoadingIcon values={ellipsis} />
        </>
      ) : (
        <Box flexDirection={"column"}>
          <SelectInput
            itemComponent={({ isSelected, label }) => {
              return <Color bold={isSelected}>{label}</Color>;
            }}
            items={items as any}
            onSelect={item => selectTicket(item.value)}
          />
          <Box flexDirection={"column"}>
            {selectedTicket ? (
                <>
                  <Text>{selectedTicket.key}</Text>
                  <Color gray={true}>{selectedTicket.fields.description}</Color>
                </>
            ) : null}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// 08SbciAUsHxec6RcVJWiEADE
