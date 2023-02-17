import { normalize, parse, join, sep } from "path";
import fs = require("fs");
import * as vscode from 'vscode';
import { IParsedPath } from "./models";

export function findGitRoot(filePath : string) : IParsedPath {
    filePath = normalize(filePath);
    const parsedPath = parse(filePath);
    const dir = parsedPath.dir.split(sep);
    const dirLength = dir.length;
    const remainingItems = [];
    for (let c = 0; c < dirLength; c++) {
        remainingItems.unshift(dir.pop() as string);
        const potentialRoot = join(...dir);
        if (fs.existsSync(join(potentialRoot, ".git"))) {
            return {
                filePath: join(...remainingItems),
                repositoryRoot: potentialRoot,
                fileName: `${parsedPath.name}${parsedPath.ext}.md`
            };
        };
    }

    return {
        filePath: "",
        repositoryRoot: filePath,
        fileName: `${parsedPath.name}.${parsedPath.ext}`
    };
}


export function createRoot(path : IParsedPath) {

    const config = vscode.workspace.getConfiguration("commentary");
    const useGlobalRoot = config.get("useGlobalRoot");
    let fullpath = "";
    if (useGlobalRoot) {
        fullpath = config.get("globalRoot") || "";
        if (fullpath === "") {
            throw new Error("Cannot set empty global root.");
        }

        fullpath = join(fullpath, path.filePath);
    } else {
        fullpath = join(path.repositoryRoot, '.commentary', path.filePath);
    }
    fs.mkdirSync(fullpath, {
        recursive: true
    });
    const fileName = join(fullpath, path.fileName);
    if (!fs.existsSync(fileName)) {
        fs.writeFileSync(fileName, "this is a commentary file!");
    }
    return fileName;
}
