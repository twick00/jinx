import {
  closeSync,
  existsSync,
  openSync,
  PathLike,
  readFile,
  readFileSync,
  writeFile
} from 'fs'
import { mapKeys, mapValues, isEmpty } from 'lodash'
import JiraClient from 'jira-connector'
import { ColorProps } from 'ink'

const os = require('os')

export const absoluteFromRelative = (path: string) => {
  const checkPath =
    path.startsWith('.') || path.startsWith('~') ? path.slice(1) : path
  return os.homedir() + checkPath
}

export const getFileType = (file: string) => {
  return file.split('.').pop()
}

export const getJsonFile = (path: PathLike) => {
  if (existsSync(path)) {
    const buf = readFileSync(path).toString()
    return JSON.parse(buf)
  } else {
    return null
  }
}

export const getIssueColor = taskName => {
  //Todo: make externally configurable
  let color: ColorProps = {}
  switch (taskName) {
    case 'Story':
      color = { ...color, green: true }
      break
    case 'Task':
      color = { ...color, blue: true }
      break
    case 'Engineering Debt':
      color = { ...color, white: true }
      break
    case 'Bug':
      color = { ...color, red: true }
      break
    case 'Epic':
      color = { ...color, magenta: true }
      break
    case 'Sub-task':
      color = { ...color, blueBright: true }
      break
    case 'Customer Feedback':
      color = { ...color, gray: true }
      break
  }
  return color
}

export const getInProgressEmoji = (progressName: ProgressName) => {
  //Todo: make externally configurable
  switch (progressName) {
    case 'In Progress':
      return '🧨'
    case 'QA':
      return '❇️'
    case 'Staging':
      return '✅'
    case 'Blocked':
      return '💸'
    case 'Backlog':
      return '🗄 '
    case 'Reopened':
      return '⚠️'
    case 'Code Review':
      return '♻️'
    case 'QA Review':
      return '❎'
    case 'PM Review':
      return '💬'
    case 'Done':
      return '💯'
    default:
      return '❔'
  }
}

export type ProgressName =
  | 'In Progress'
  | 'QA'
  | 'Staging'
  | 'Blocked'
  | 'Backlog'
  | 'Reopened'
  | 'Code Review'
  | 'QA Review'
  | 'PM Review'
  | 'Done'
  | string

export interface CustomIssueFields {
  [key: string]: any
}

interface IssueFields extends CustomIssueFields {
  assignee: {
    emailAddress: string
    displayName: string
  }
  reporter: {
    emailAddress: string
    displayName: string
  }
  subtasks: any[]
  issuetype: {
    name:
      | 'Story'
      | 'Task'
      | 'Engineering Debt'
      | 'Bug'
      | 'Epic'
      | 'Sub-task'
      | 'Customer Feedback'
      | string
  }
  project: {
    name: string
  }
  description: string
  summary: string
  comment: {
    comments: any[]
    total: number
  }
  status: {
    name: ProgressName
  }
  created: string
  attachments: any[]
}

export interface Issue {
  key: string
  self: string
  fields: IssueFields
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
}

//Todo: Add title field for rendering readable description
interface CustomFields {
  [key: string]: {
    label: string
  }
}

/**
 * transformCustomFields applies custom transforms to the queried object
 *
 * Example:
 * originalIssue:
 * {...,
 *    fields: {
 *        customfield_17139: null,
 *        customfield_17140: 3,
 *        customfield_17141: null,
 *        ...
 *    }
 * }
 *
 * path: ~/jira.d/custom_fields.json
 *
 * custom_fields.json:
 * {
 *    customfield_17140: {
 *      label: storyPoints
 *    }
 * }
 *
 * transformCustomFields return value:
 *  * {...,
 *    fields: {
 *        customfield_17139: null,
 *        storyPoints: 3,
 *        customfield_17141: null,
 *        ...
 *    }
 * }
 *
 * @param originalIssue - Jira object pre-transformed
 * @param path - path to external configuration file that defines transformation
 */
export const transformCustomFields = (
  originalIssue: IssueFields,
  path: PathLike
): IssueFields => {
  const customFieldsFile: CustomFields = getJsonFile(path)
  if (!customFieldsFile) return originalIssue
  return mapKeys<IssueFields>(originalIssue, (val, key) => {
    console.log(customFieldsFile)
    if (customFieldsFile[key]) {
      return customFieldsFile[key].label
    }
    return key
  }) as IssueFields
}

export const stripUnusedIssueFields = (issue: Issue): Issue => {
  return mapValues(referenceIssue, (n, e) => {
    return issue[e]
  })
}

export const asyncGetIssue = async (
  issueNumber: string,
  jira: JiraClient,
  stripUnused = true
) => {
  const issue = await jira.issue.getIssue({ issueKey: issueNumber })
  console.log(JSON.stringify(issue))
  if (stripUnused) {
    return stripUnusedIssueFields(issue)
  }
  return issue
}

export const asyncGetProject = async (
  projectIdOrKey: string,
  jira: JiraClient
) => {
  return jira.project.getProject({ projectIdOrKey })
}

export const asyncGetAllProjects = async (jira: JiraClient) => {
  return jira.project.getAllProjects()
}

export const asyncGetCurrentOpenIssues = async (
  jira: JiraClient,
  customFieldsFile?: PathLike
): Promise<Issue[]> => {
  const { issues }: { issues?: [Issue] } = await jira.search.search({
    jql:
      'assignee = currentUser() AND resolution = Unresolved order by updated DESC'
  })
  const customIssueFields = !!customFieldsFile
    ? issues.map<Issue>(issue => {
        return {
          ...issue,
          fields: transformCustomFields(issue.fields, customFieldsFile)
        }
      })
    : issues

  return customIssueFields.map(issue => stripUnusedIssueFields(issue))
}

export const checkValidEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
    email
  )
}

export function has<T extends object>(
  obj: T,
  property: string | number | symbol
): property is keyof T {
  return property in obj
}

export function createFileIfNotExist(filePath: PathLike) {
  closeSync(openSync(filePath, 'a')) // Create file if none exist
}

export function useCacheable<T, H extends any[]>(
  filePath: PathLike,
  promiseFunction: (...args: H) => Promise<T>,
  dataTransformFunction?: (data: T) => any
): (...args: H) => Promise<T> {
  return async (...args: H) => {
    createFileIfNotExist(filePath)
    return new Promise(resolve => {
      return promiseFunction(...args).then(
        value => {
          if (!isEmpty(value)) {
            const savedValue = dataTransformFunction
              ? dataTransformFunction(value)
              : JSON.stringify(value, null, 2)
            writeFile(filePath, savedValue, err => {
              if (err) {
                throw err
              }
            })
            resolve(value)
          }
          return value
        },
        _rejected => {
          readFile(filePath, (err, data) => {
            const output = JSON.parse(data.toString('utf8'))
            resolve(output)
          })
        }
      )
    })
  }
}
