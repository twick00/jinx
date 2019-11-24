import {
  closeSync,
  existsSync,
  openSync,
  PathLike,
  readFileSync,
  writeFile
} from 'fs';
import { mapValues } from 'lodash';
import JiraClient from 'jira-connector';
import { ColorProps } from 'ink';

const os = require('os');

export const absoluteFromRelative = (path: string) => {
  const checkPath = path.startsWith('.') ? path.slice(1) : path;
  return os.homedir() + checkPath;
};

export const getFileType = (file: string) => {
  return file.split('.').pop();
};

export const getJsonFile = (path: PathLike) => {
  if (existsSync(path)) {
    const buf = readFileSync(path).toString();
    return JSON.parse(buf);
  } else {
    return null;
  }
};

export const getIssueColor = taskName => {
  let color: ColorProps = {};
  switch (taskName) {
    case 'Story':
      color = { ...color, green: true };
      break;
    case 'Task':
      color = { ...color, blue: true };
      break;
    case 'Engineering Debt':
      color = { ...color, white: true };
      break;
    case 'Bug':
      color = { ...color, red: true };
      break;
    case 'Epic':
      color = { ...color, magenta: true };
      break;
    case 'Sub-task':
      color = { ...color, blueBright: true };
      break;
    case 'Customer Feedback':
      color = { ...color, gray: true };
      break;
  }
  return color;
};

export const getInProgressEmoji = (progressName: ProgressName) => {
  switch (progressName) {
    case 'In Progress':
      return '⌛️';
    case 'QA':
      return '❇️';
    case 'Staging':
      return '✅';
    case 'Blocked':
      return '💸';
    case 'Reopened':
      return '⚠️';
    case 'Code Review':
      return '♻️';
    case 'QA Review':
      return '❎';
    case 'PM Review':
      return '💬';
    case 'Done':
      return '💯';
    default:
      return '❔';
  }
};

export type ProgressName =
  | 'In Progress'
  | 'QA'
  | 'Staging'
  | 'Blocked'
  | 'Reopened'
  | 'Code Review'
  | 'QA Review'
  | 'PM Review'
  | 'Done'
  | string;

export interface Issue {
  key: string;
  self: string;
  fields: {
    assignee: {
      emailAddress: string;
      displayName: string;
    };
    reporter: {
      emailAddress: string;
      displayName: string;
    };
    subtasks: any[];
    issuetype: {
      name:
        | 'Story'
        | 'Task'
        | 'Engineering Debt'
        | 'Bug'
        | 'Epic'
        | 'Sub-task'
        | 'Customer Feedback'
        | string;
    };
    project: {
      name: string;
    };
    description: string;
    summary: string;
    comment: {
      comments: any[];
      total: number;
    };
    status: {
      name: ProgressName;
    };
    created: string;
    attachments: any[];
  };
}

const referenceIssue: Issue = {
  key: '',
  self: '',
  fields: {
    attachments: [],
    comment: { comments: [], total: 0 },
    created: '',
    description: '',
    issuetype: { name: '' },
    project: { name: '' },
    reporter: { displayName: '', emailAddress: '' },
    status: { name: '' },
    subtasks: [],
    summary: '',
    assignee: {
      emailAddress: '',
      displayName: ''
    }
  }
};

export const stripUnusedIssueFields = (issue: Issue): Issue => {
  return mapValues(referenceIssue, (n, e) => {
    return issue[e];
  });
};

export const asyncGetIssue = async (
  issueNumber: string,
  jira: JiraClient,
  parse = true
) => {
  const issue = await jira.issue.getIssue({ issueKey: issueNumber });
  console.log(JSON.stringify(issue));
  if (parse) {
    return stripUnusedIssueFields(issue);
  }
  return issue;
};

export const asyncGetProject = async (
  projectIdOrKey: string,
  jira: JiraClient
) => {
  return await jira.project.getProject({ projectIdOrKey });
};

export const asyncGetCurrentOpenIssues = async (
  jira: JiraClient
): Promise<Issue[] | string> => {
  let myIssues: { issues?: [unknown & Issue] } = await jira.search.search({
    jql:
      'assignee = currentUser() AND resolution = Unresolved order by updated DESC'
  });
  return myIssues.issues.map(issue => stripUnusedIssueFields(issue));
};

export function createFileIfNotExist(filePath: PathLike) {
  // create file if not exists, fails if directory not exist
  closeSync(openSync(filePath, 'a'));
}

export async function useCacheable<T>(
  filePath,
  promise: PromiseLike<T>
): Promise<T | string> {
  createFileIfNotExist(filePath);

  return await promise.then(
    value => {
      writeFile(filePath, value, err => {
        if (err) {
          throw err;
        }
      });
      return value;
    },
    reject => {
      return readFileSync(filePath, { encoding: 'utf8' });
    }
  );
}

export function has<T extends object>(
  obj: T,
  property: string | number | symbol
): property is keyof T {
  return property in obj;
}
