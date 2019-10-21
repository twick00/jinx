"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
exports.absoluteFromRelative = (path) => {
    const checkPath = path.startsWith(".") ? path.slice(1) : path;
    return os.homedir() + checkPath;
};
exports.getFileType = (file) => {
    return file.split('.').pop();
};
//# sourceMappingURL=index.js.map