import * as fs from "fs";

const os = require("os");

export const absoluteFromRelative = (path: string) => {
  const checkPath = path.startsWith(".") ? path.slice(1) : path;
  return os.homedir() + checkPath;
};

export const getFileType = (file: string) => {
  return file.split(".").pop();
};

export const getJsonFile = (path: string) => {
  if (fs.existsSync(path)) {
    const buf = fs.readFileSync(path).toString();
    return JSON.parse(buf);
  } else {
    return null;
  }
};
