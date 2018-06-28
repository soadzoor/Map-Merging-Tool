
//"dependencies": {
//	"fs": "0.0.2",
//	"fs-extra": "^0.16.3",
//	"typescript": "^1.4.1"
//}

//
// Needs node v.0.12 for execSync
//

var fs = require("fs");
var fse = require("fs-extra");
var shell = require("shelljs");

var path = require("path");
var child_process = require("child_process");

var NODE_MODULES_PATH = process.cwd() + "/node_modules";

// not needed as it will be required in tsc() below
//var ts = require("typescript");

// ----------------------------------------------------------------------------------------------------------
// Reading

function read(path) {
	return fs.readFileSync(path, {encoding: "utf-8"});
}

/**
 * Returns an array containing the content of the directory.
 * TODO return absolute path or relative to path?
 */
function list_files(path) {

	return list(path).filter(function(file) {
		return !is_dir(path + "/" + file);
	});
}

function list_dirs(path) {

	if (!exists(path)) {
		return [];
	}

	return list(path).filter(function(file) {
		return is_dir(path + "/" + file);
	});
}

function list(path) {
	return fs.readdirSync(path);
}

// TODO these recursive ones dont work yet

function list_files_recursive(path) {

	return list_recursive(path).filter(function(file) {
		return !is_dir(path + "/" + file);
	});
}

function list_dirs_recursive(path) {

	return list_recursive(path).filter(function(file) {
		return is_dir(path + "/" + file);
	});
}

function list_recursive(path, parent) {

	var result = [];
	var files = list(path);

	parent = parent || "";

	for (var i = 0; i < files.length; ++i) {

		var file = files[i];

		var filePath = path + "/" + file;

		//console.log("filePath", filePath);

		if (is_dir(filePath)) {
			var fileList = list_recursive(filePath, file);
			//console.log("fileList", fileList);
			result = result.concat(fileList);
		} else {
			result.push(parent + "/" + file);
		}


	}

	return result;
}

/**
 * Returns if the given path is directory or not.
 */
function is_dir(path) {

	var stats = fs.lstatSync(path);
	return stats.isDirectory();
}

function is_empty_dir(path) {

	var folders = fs.readdirSync(folder);
	folders = folders.filter(function(file) {

		return file.indexOf(".") === -1;
	});

	return folders.length === 0;
}

function exists(path) {
	return fs.existsSync(path);
}


// ----------------------------------------------------------------------------------------------------------
// Writing

function mkdir(path) {
	fse.mkdirsSync(path);
}

// copies src to dst if src exists
function cp(src_path, dst_path) {

	if (exists(src_path)) {
		fse.copySync(src_path, dst_path);
	}
}

function write(path, content) {

	return fse.outputFileSync(path, content);
}

function append(src_path, content, dst_path) {

	dst_path = dst_path || src_path;

	var existing_content = read(src_path);
	var new_content = existing_content + content;

	write(dst_path, new_content);
}

function appendFile(src_path, src_path2, dst_path) {

	var content = read(src_path2);

	return append(src_path, content, dst_path);
}

// ----------------------------------------------------------------------------------------------------------
// Deleting

/**
 * Removes all content in the directory, but not the directory.
 * If the directory doesn't exist it creates it.
 * Internally this is done by deleting and creating the dir.
 */
function clean_dir(path) {
	rm(path);
	mkdir(path);
}

/**
 * Removes a folder/file if it exists.
 */
function rm(path) {
	fse.removeSync(path);
}

// ----------------------------------------------------------------------------------------------------------
// Exec

function exec(command, args) {

	args = args || "";

	// http://stackoverflow.com/questions/30134236/use-child-process-execsync-but-keep-output-in-console
	// https://nodejs.org/api/child_process.html#child_process_child_stdio

	var stdio = [
		0,
		1, // !
		2
	];

	try {
		var result = require("child_process").execSync(command + " " + args, {stdio: stdio});

	} catch (e) {
		// this is needed for messages to display when from the typescript watcher
		throw e;

		//throw new Error(e.message);

		//process.stdout.write(e.message);
		//console.log(e.message);

		//console.log(e.options.stdio[0].prototype);

		//console.log("Error", e.options.stdio[0]);
	}
	//console.log(stdio);

	return result;
}

function exec_async(command, args, onComplete) {

	child_process.exec(command + " " + args, function (error, stdout, stderror) {
		if (error !== null) {
			//console.log(stdout);
			process.stderr.write(stdout + '\n');
			process.exit(1);
			// onComplete && onComplete(stderror);
		} else {
			onComplete && onComplete(stdout)
		}
		console.log(stdout);
	});
}

function exec_module(module, args) {

	return exec(NODE_MODULES_PATH + '/.bin/' + module, args);
}

function tsc(args) {

	return exec_module("tsc", args);
}


//function tsc(args, onComplete) {
//	var tsc_bin = path.resolve(path.dirname(require.resolve("typescript")), "tsc");
//	var command = "node " + tsc_bin + " " + args;
//	exec(command, undefined, onComplete);
//}

/**
 * Creates a lib.ts file which includes references to all ts files within a folder.
 *
 * Example:
 * ts_create_lib("myproject/src", "myproject/lib.ts")
 * This will create lib.ts that references all files in src
 *
 */
function ts_create_lib(path, target) {

	var ts_files = shell.ls("-R", path).filter(function(file) {

		if (file === "lib.ts") return false;

		return file.match(/\.ts$/);
	});

	var fileContent = "\n\
// Generated by a build script\n";

	var previous_path = "";
	var previous_first_path = "";

	for (var i = 0; i < ts_files.length; ++i) {

		var file = ts_files[i];
		var path_a = file.split("/");
		path_a.pop();
		var path = path_a.join("/");
		var first_path = path_a[0];

		// add a new line if we're in a new directory
		if (path !== previous_path) {
			fileContent += "\n";
			previous_path = path;
		}
		// add a title if the first folder is different
		if (first_path !== previous_first_path) {
			fileContent += "\n// --------------------------------------------------------------------------------------";
			fileContent += "\n// " + first_path + "\n\n";
			previous_first_path = first_path;
		}

		fileContent += '///<reference path="' + file + '"/>' + "\n";
	}

	fse.outputFileSync(target, fileContent);
}


// ----------------------------------------------------------------------------------------------------------
// Export

module.exports = {
	read: read,
	list: list,
	list_dirs: list_dirs,
	list_files: list_files,
	list_recursive: list_recursive,
	list_dirs_recursive: list_dirs_recursive,
	list_files_recursive: list_files_recursive,
	is_dir: is_dir,
	is_empty_dir: is_empty_dir,
	exists: exists,
	mkdir: mkdir,
	cp: cp,
	append: append,
	appendFile: appendFile,
	clean_dir: clean_dir,
	rm: rm,
	exec: exec,
	exec_module: exec_module,
	tsc: tsc,
	ts_create_lib: ts_create_lib,
	fs: fs,
	shell: shell
};