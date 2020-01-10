import {
  closeSync,
  existsSync,
  openSync,
  PathLike,
  readFile,
  readFileSync,
  writeFile
} from 'fs'
import { mapKeys, mapValues, isEmpty, noop } from 'lodash'
import JiraClient from 'jira-connector'
import { ColorProps } from 'ink'
import * as React from 'react'
import * as process from 'process'

const os = require('os')

export const absoluteFromRelative = (path: string) => {
  const checkPath =
    path.startsWith('.') || path.startsWith('~') ? path.slice(1) : path
  return os.homedir() + checkPath
}

export const getFileType = (file: string) => {
  return file.split('.').pop()
}

export interface JiraTable {
  headers: string[]
  rows: string[][]
  start?: number
  end?: number
}

// TODO WIP Terminal Measurements
export const useTerminalMeasurements = (
  callback?: (measurements: { width: number; height: number }) => void
) => {
  const cbFn = callback ? callback : noop
  const [measurements, setMeasuremenst] = React.useState({
    width: process.stdout.rows,
    height: process.stdout.columns
  })
  process.stdout.on('resize', () => {
    setMeasuremenst({
      width: process.stdout.columns,
      height: process.stdout.rows
    })
  })
  React.useEffect(() => {
    cbFn(measurements)
  }, [measurements])
}

export const getJiraTables = (input: string | string[]) => {
  const splitInput = Array.isArray(input) ? input : input.split('\n')
  let tables: JiraTable[] = []
  const headerRegEx = /\|\|\*.+[^|*]\*\|\|$/
  const rowsRegEx = /\|(.+[^|*]\|)+/
  const removeEmpty = arr => {
    return arr.filter(val => !!val)
  }
  splitInput.forEach((line, idx, arr) => {
    if (headerRegEx.test(line)) {
      const splitHeader = line.split(/\*?\|\|\*?/)
      const table = {
        headers: removeEmpty(splitHeader),
        rows: [],
        start: idx,
        end: 0
      }
      let increment = 1
      while (rowsRegEx.test(arr[idx + increment])) {
        const splitRows = arr[idx + increment].split('|')
        table.rows.push(removeEmpty(splitRows))
        increment += 1
      }
      table.end = idx + increment - 1
      tables.push(table)
    }
  })
  return tables
}

interface ReplaceTables {
  input: string
  tables: JiraTable[]
  headReplacerFn?: (
    value: string[],
    raw: React.ReactComponentElement<any>
  ) => React.ReactComponentElement<any>
  rowReplacerFn?: (
    value: string[],
    raw: React.ReactComponentElement<any>
  ) => React.ReactComponentElement<any>
}

// const replaceTables = ({
//   input,
//   tables,
//   headReplacerFn,
//   rowReplacerFn
// }: ReplaceTables) => {
//   const splitInput: React.ReactComponentElement<any>[] = input.split('\n')
//   tables.forEach(table => {
//     const header = headReplacerFn(table.headers, splitInput[table.start])
//     if (header) {
//       splitInput[table.start] = header
//     }
//     table.rows.forEach((row, idx) => {
//       splitInput[idx + 1 + table.start] = rowReplacerFn(
//         row,
//         splitInput[idx + 1 + table.start]
//       ) //?
//     })
//   })
//   return splitInput
// }

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
      return '❇️ ' // This emoji takes us more space for some reason
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
    displayName: string
    emailAddress: string
  }
  reporter: {
    displayName: string
    emailAddress: string
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
    subtask: string
  }
  project: {
    name: string
  }
  priority: {
    name: string
  }
  creator: {
    email: string
    displayName: string
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
  updated: string
  attachments: any[]
}

export interface Issue {
  key: string
  self: string
  fields: IssueFields
}

const referenceIssue: Issue = {
  fields: {
    assignee: {
      emailAddress: '',
      displayName: ''
    },
    attachments: [],
    creator: {
      displayName: '',
      email: ''
    },
    comment: { comments: [], total: 0 },
    created: '',
    description: '',
    issuetype: { name: '', subtask: '' },
    priority: {
      name: ''
    },
    project: { name: '' },
    reporter: { displayName: '', emailAddress: '' },
    status: { name: '' },
    subtasks: [],
    summary: '',
    updated: ''
  },
  key: '',
  self: ''
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
