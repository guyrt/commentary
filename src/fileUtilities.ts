import { normalize, parse, join, sep } from "path";
import fs = require("fs");
import * as vscode from 'vscode';
import { IParsedPath } from "./models";
import { homedir } from "os";
import { Uri } from "vscode";


function findGitRoot(filePath : string) : IParsedPath {
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
                repositoryHasCommentary: fs.existsSync(join(potentialRoot, ".commentary")),
                repositoryRootFolderName: dir.pop() ?? "",
                fileName: `${parsedPath.name}${parsedPath.ext}`
            };
        };
    }

    const rootName = filePath.split(sep).pop() ?? "";

    return {
        filePath: "",
        repositoryRoot: filePath,
        repositoryRootFolderName: rootName,
        repositoryHasCommentary: false,
        fileName: `${parsedPath.name}.${parsedPath.ext}`
    };
}


function createPath(path : IParsedPath) {
    const config = vscode.workspace.getConfiguration("commentary");
    const useGlobalRoot = config.get("useGlobalRoot");
    let fullpath = "";
    if (useGlobalRoot && !path.repositoryHasCommentary) {
        fullpath = config.get("globalRoot") || "";
        if (fullpath.length > 0 && fullpath[0] === '~') {
            fullpath = homedir() + fullpath.slice(1);
        }
        fullpath = normalize(fullpath);

        if (fullpath === "") {
            throw new Error("Cannot set empty global root.");
        }

        fullpath = join(fullpath, path.repositoryRootFolderName);
    } else {
        fullpath = join(path.repositoryRoot, '.commentary');
    }

    fullpath = join(fullpath, path.filePath, path.fileName);

    return fullpath;
}


function createFile(path : IParsedPath, filename: string, defaultContent = "" ) : string{

    const fullpath = createPath(path);

    fs.mkdirSync(fullpath, {
        recursive: true
    });
    const fileName = join(fullpath, filename);
    if (!fs.existsSync(fileName)) {
        fs.writeFileSync(fileName, defaultContent);
    }
    return fileName;
}


export function createCommentaryFile(docUri : Uri, fileName : string) : string {
        // get the commentary doc location
    const gitRoot = findGitRoot(docUri.fsPath);

    const commentaryFile = createFile(gitRoot, fileName);
    return commentaryFile;
}
