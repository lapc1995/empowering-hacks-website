---
---
/*
function GitHubHelperOld() {}

GitHubHelper.tasks = [];

GitHubHelper.login = async function(username, password, callback, error) {
    GitHubHelper.getPreviousAuthorization(username, password, (authId) => {
        if(authId == null) {
            GitHubHelper.getNewAuthorization(username, password, callback, error);
        } else {
            GitHubHelper.deleteAuthorization (username, password, authId, () => {
                GitHubHelper.getNewAuthorization(username, password, callback, error);
            }, error);
        }
    }, error);
}

GitHubHelper.logout = (callback) =>  {
    sessionStorage.removeItem('_u');
    sessionStorage.removeItem('_t');
    sessionStorage.setItem("isLoggedIn", false);
    callback();
}

GitHubHelper.getNewAuthorization = async function(username, password, callback, error) {
    $.ajax({
        type: 'POST',
        url: 'https://api.github.com/authorizations',
        headers: { 
            Authorization: 'Basic ' + btoa(`${username}:${password}`),
            Accept: 'application/json'
        },
        dataType: 'json',
        data: JSON.stringify({
                "scopes": [
                    "repo",
                ],
                "note": "empoweringhacks"
            }),
        success: function(data) {
            if (typeof(Storage) !== "undefined") {
                console.log(data);
                sessionStorage.setItem("_u", username);
                sessionStorage.setItem("_t", data.token);
                sessionStorage.setItem("isLoggedIn", true);
                console.log("Login successful");
                callback(data)
            } else {
                console.log("Sorry, your browser does not support Web Storage...");
                error("Sorry, your browser does not support Web Storage...");
            }
        },
        error: function(data) {
            console.log("Login failed");
            error(data)
        }
    });
}

GitHubHelper.getPreviousAuthorization = async function(username, password, callback, error) {
    $.ajax({
        type: 'GET',
        url: 'https://api.github.com/authorizations',
        headers: { 
            Authorization: 'Basic ' +  btoa(`${username}:${password}`),
            Accept: 'application/json'
        },
        dataType: 'json',
        success: function(data) {
            let authId = null;
            for(var i = 0; i < data.length && authId == null; i++) {
                if(data[i].note == "empoweringhacks") 
                    authId = data[i].id;
            }
            callback(authId);
        },
        error: function(data) {
            console.log("Login failed");
            error(-1)
        }
    });
}

GitHubHelper.deleteAuthorization = async function(username, password, authId, callback, error) {
    $.ajax({
        type: 'DELETE',
        url: 'https://api.github.com/authorizations/'+ authId,
        headers: { 
            Authorization: 'Basic ' + btoa(`${username}:${password}`),
            Accept: 'application/json'
        },
        dataType: 'json',
        success: callback,
        error: error
    });
}

GitHubHelper.isLoggedIn = () => {
    return (
        (typeof(Storage) !== "undefined") && 
        (sessionStorage.getItem('isLoggedIn') != null) &&
        (sessionStorage.getItem('isLoggedIn') == 'true') &&
        (sessionStorage.getItem('_u') != null) && 
        (sessionStorage.getItem('_t') != null)
   );
}

GitHubHelper.get = () => {
    return GitHubHelper.isLoggedIn() ? new GitHub({username: sessionStorage.getItem('_u'), token: sessionStorage.getItem('_t')}) : null;
}

GitHubHelper.writeFile = (content, path, message, encode) => {
    GitHubHelper.tasks.push({ action: "write", body: { path,content,message,encode } });
}

GitHubHelper.deleteFile = (path) => {
    console.log(path);
    GitHubHelper.tasks.push({ action: "delete", body: { path } });
}

GitHubHelper.commit = () => {
    return new Promise( async (resolve, reject) => {

        let tasks = GitHubHelper.tasks.length;
        let successes = 0;
        let errors = 0;
        let writes = 0;
        let deletes = 0;
    
        let gh = GitHubHelper.get();
        if(gh != null) {
            for(let i = 0; i < GitHubHelper.tasks.length; i++) {
                let task = GitHubHelper.tasks[i];
                if(task.action == "write") {
                    writes++;
                    await gh.getRepo(sessionStorage.getItem('_u'), 'empowering-hacks-website')
                    .writeFile('master', task.body.path, task.body.content, task.body.message, { encode: task.body.encode }, (error, result, request) => {
                        if(error != null)
                            errors++;
                        else {
                            if(String(request.status).charAt(0) == '2')
                                successes++;
                            else 
                                errors++;
                        }
                    });
                } else if (task.action == "delete") {
                    deletes++;

                    let path = task.body.path.charAt(0) == '/' ? task.body.path.substr(1) : task.body.path;

                    await gh.getRepo(sessionStorage.getItem('_u'), 'empowering-hacks-website')
                    .deleteFile('master', path, (error, result, request) => {
                        if(error != null) {
                            console.log(error);
                            errors++;
                        } else {
                            if(String(request.status).charAt(0) == '2')
                                successes++;
                            else 
                                errors++;
                        }
                    });
                }
            }

            GitHubHelper.tasks.length = 0;

            if(successes == 0 && errors > 0) {
                reject({tasks, successes, errors, writes, deletes});
            } else {
                resolve({tasks, successes, errors, writes, deletes});
            }
        } else {
            reject({tasks, successes, errors, writes, deletes});
        }
    });    
}
*/


function GitHubHelper() {}

GitHubHelper.tasks = [];

GitHubHelper.octokit = undefined;

GitHubHelper.login = async function(username, password, callback, error) {

    if(username == '' || username == undefined || password == '' || password == undefined)
        error("Fields Empty");
    else {
        GitHubHelper.getPreviousAuthorization(username, password, (authId) => {
            if(authId == null) {
                GitHubHelper.getNewAuthorization(username, password, callback, error);
            } else {
                GitHubHelper.deleteAuthorization (username, password, authId, () => {
                    GitHubHelper.getNewAuthorization(username, password, callback, error);
                }, error);
            }
        }, error);
    }

}

GitHubHelper.logout = (callback) =>  {
    sessionStorage.removeItem('_u');
    sessionStorage.removeItem('_t');
    sessionStorage.setItem("isLoggedIn", false);
    GitHubHelper.octokit = undefined;
    callback();
}

GitHubHelper.getNewAuthorization = (username, password, callback, error) => {
    $.ajax({
        type: 'POST',
        url: 'https://api.github.com/authorizations',
        headers: { 
            Authorization: 'Basic ' + btoa(`${username}:${password}`),
            Accept: 'application/json'
        },
        dataType: 'json',
        data: JSON.stringify({
                "scopes": [
                    "repo",
                ],
                "note": "empoweringhacks"
            }),
        success: function(data) {
            if (typeof(Storage) !== "undefined") {
                console.log(data);
                sessionStorage.setItem("_u", username);
                sessionStorage.setItem("_t", data.token);
                sessionStorage.setItem("isLoggedIn", true);

                GitHubHelper.octokit = new Octokit({
                    auth: data.token
                });

                console.log("Login successful");
                callback(data)
            } else {
                console.log("Sorry, your browser does not support Web Storage...");
                error("Sorry, your browser does not support Web Storage...");
            }
        },
        error: (data) => {
            console.log("Login failed");
            error(data)
        }
    });
}

GitHubHelper.getPreviousAuthorization = async function(username, password, callback, error) {
    $.ajax({
        type: 'GET',
        url: 'https://api.github.com/authorizations',
        headers: { 
            Authorization: 'Basic ' +  btoa(`${username}:${password}`),
            Accept: 'application/json'
        },
        dataType: 'json',
        success: function(data) {
            let authId = null;
            for(var i = 0; i < data.length && authId == null; i++) {
                if(data[i].note == "empoweringhacks") 
                    authId = data[i].id;
            }
            callback(authId);
        },
        error: function(data) {
            console.log("Login failed");
            error(-1)
        }
    });
}

GitHubHelper.deleteAuthorization = async function(username, password, authId, callback, error) {
    $.ajax({
        type: 'DELETE',
        url: 'https://api.github.com/authorizations/'+ authId,
        headers: { 
            Authorization: 'Basic ' + btoa(`${username}:${password}`),
            Accept: 'application/json'
        },
        dataType: 'json',
        success: callback,
        error: error
    });
}

GitHubHelper.isLoggedIn = () => {
    return (
        (typeof(Storage) !== "undefined") && 
        (sessionStorage.getItem('isLoggedIn') != null) &&
        (sessionStorage.getItem('isLoggedIn') == 'true') &&
        (sessionStorage.getItem('_u') != null) && 
        (sessionStorage.getItem('_t') != null)
    );
}

GitHubHelper.getFile = async (path) => {
    return GitHubHelper.octokit.repos.getContents({
        owner: sessionStorage.getItem('_u'),
        repo: 'empowering-hacks-website',
        path
      });
}

GitHubHelper.getUserData = () => {

    if(!GitHubHelper.isLoggedIn())
        return "Not Logged In";

    if(GitHubHelper.octokit == undefined) {
        GitHubHelper.octokit = new Octokit({
            auth: sessionStorage.getItem('_t')
        });
    }

    return GitHubHelper.octokit.users.getAuthenticated();
}

GitHubHelper.writeFile = (content, path, message, encode) => {
    GitHubHelper.tasks.push({ action: "write", body: { path,content,message,encode } });
}

GitHubHelper.deleteFile = (path, message) => {
    GitHubHelper.tasks.push({ action: "delete", body: { path, message } });
}

GitHubHelper.commit = () => {
    return new Promise( async (resolve, reject) => {

        if(!GitHubHelper.isLoggedIn())
            reject("Not Logged In");

        if(GitHubHelper.octokit == undefined) {
            GitHubHelper.octokit = new Octokit({
                auth: sessionStorage.getItem('_t')
            });
        }

        let tasks = GitHubHelper.tasks.length;
        let successes = [];
        let errors = [];
        let writes = 0;
        let deletes = 0;

        for(let i = 0; i < GitHubHelper.tasks.length; i++) {
            let task = GitHubHelper.tasks[i];
            switch(task.action) {

                case "write": {

                    writes++;
                    try {
                        let { status, data:{sha} } = await GitHubHelper.getFile(task.body.path);
                        if(status == 200) {
                            let result = await GitHubHelper.octokit.repos.createOrUpdateFile({
                                owner: sessionStorage.getItem('_u'),
                                repo: '{{ site.repo }}',
                                branch: '{{ site.branch }}',
                                path: task.body.path,
                                message: task.body.message,
                                content: task.body.encode ? btoa(task.body.content) : task.body.content,
                                sha
                            });
                            successes.push(result);
                        } else {
                            errors.push(e);
                        }
                    } catch ({status, name, message}) {
                        if(status == 404) {
                            try {
                                let result = await GitHubHelper.octokit.repos.createOrUpdateFile({
                                    owner: sessionStorage.getItem('_u'),
                                    repo: '{{ site.repo }}',
                                    branch: '{{ site.branch }}',
                                    path: task.body.path,
                                    message: task.body.message,
                                    content: task.body.encode ? btoa(task.body.content) : task.body.content,
                                });
                                successes.push(result);
                            } catch (e) {
                                errors.push(e);
                            }
                        } else {
                            errors.push({status, name, message});
                        }
                    }
                    break;
                }

                case "delete": {
                    deletes++;
                    let path = task.body.path.charAt(0) == '/' ? task.body.path.substr(1) : task.body.path;
                    try {
                        let { status, data:{sha} } = await GitHubHelper.getFile(task.body.path);
                        if(status == 200) {
                            let result = await GitHubHelper.octokit.repos.deleteFile({
                                owner: sessionStorage.getItem('_u'),
                                repo: '{{ site.repo }}',
                                branch: '{{ site.branch }}',
                                path: path,
                                message: task.body.message,
                                sha
                            });
                            successes.push(result);
                        } else {
                            errors.push(e);
                        }
                    } catch({status, name, message}) {
                        if(status == 403) {
                            try {
                                let {data:{commit:{sha: branchSha}}} = await GitHubHelper.octokit.repos.getBranch({
                                    owner: sessionStorage.getItem('_u'),
                                    repo: '{{ site.repo }}',
                                    branch: '{{ site.branch }}',
                                })

                                let {data:{tree:{sha: treeSha}}} = await GitHubHelper.octokit.git.getCommit({
                                    owner: sessionStorage.getItem('_u'),
                                    repo: '{{ site.repo }}',
                                    commit_sha: branchSha,
                                });

                                let {data:{tree}} = await GitHubHelper.octokit.git.getTree({
                                    owner: sessionStorage.getItem('_u'),
                                    repo: '{{ site.repo }}',
                                    tree_sha: treeSha,
                                    recursive: 1,
                                });

                                let {sha: fileSha} = tree.find(element => {
                                    if(element.path == path || element.path == `_${path}`)
                                        return element;
                                })

                                let result = await GitHubHelper.octokit.repos.deleteFile({
                                    owner: sessionStorage.getItem('_u'),
                                    repo: '{{ site.repo }}',
                                    branch: '{{ site.branch }}',
                                    path: path,
                                    message: task.body.message,
                                    sha: fileSha,
                                });
                                successes.push(result);
                            } catch(e) {
                                errors.push(e);
                            }
                        } else {
                            errors.push({status, name, message});
                        }
                    }
                    break;
                }            
            }
        }

        GitHubHelper.tasks.length = 0;

        if(successes.length == 0 && errors.length > 0) {
            reject({tasks,  writes, deletes, successes, errors});
        } else {
            resolve({tasks, writes, deletes, successes, errors});
        }

    });    
}