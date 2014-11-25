/** @jsx React.DOM */

var App = App || {};

(function(exports) {

    var TaskConstants = Diagnosis.keyMirror({
        SAVE_NEW_TASK: null,
        DELETE_DONE_TASKS: null,
        CHANGE_TASK_STATE: null,
        TASKS_CHANGED: null,
        SERVER_TASKS_CHANGED: null,
        TASKS_ADDED: null
    });

    var TaskActions = {
        saveNewTask: function(text, email) {
            TaskDispatcher.trigger(TaskConstants.SAVE_NEW_TASK, {text: text, email: email});
        },
        deleteDone: function() {
            TaskDispatcher.trigger(TaskConstants.DELETE_DONE_TASKS, {});
        },
        changeTaskState: function(id, done, userId) {
            TaskDispatcher.trigger(TaskConstants.CHANGE_TASK_STATE, {id: id, done: done, userId: userId});
        }
    };

    var ServerActions = {
        updateTasks: function() {
            TaskDispatcher.trigger(TaskConstants.SERVER_TASKS_CHANGED, {});
        }
    };

    var TaskDispatcher = _.extend({}, Backbone.Events);

    var TaskStore = (function() {

        var root = "/TodoFrontend/api/front/";
        var tasks = [];
        var users  =[];
        var notifier = _.extend({}, Backbone.Events);

        function notifyChanges() {
            notifier.trigger(TaskConstants.TASKS_CHANGED, tasks);
        }
                
        function updateStore() {
            return $.ajax({
                url: root + 'users',
                type: 'GET',
                success: function(data) {
                    console.log(data);
                    users = data;
                }
            }).then(function() {
                return $.ajax({
                    url: root + 'tasks',
                    type: 'GET',
                    success: function(data) {
                        tasks = data;
                        notifyChanges();
                    }
                }); 
            });
        }

        function createNewTask(text, email) {
            $.ajax({
                url: root + 'tasks',
                type: 'POST',
                data: {
                    name: text,
                    userId: email
                },
                success: function(data) {
                    notifier.trigger(TaskConstants.TASKS_ADDED);
                    updateStore();
                }
            });
        }

        function deleteAllDone() {
            $.ajax({
                url: root + 'tasks/done',
                type: 'DELETE',
                success: function() {
                    updateStore();
                }
            });
        }

        function flipTaskState(id, done, userId) {
            $.ajax({
                url: root + 'tasks/' + id,
                type: 'PUT',
                data: {
                    done: done,
                    userId: userId
                },
                success: function() {
                    updateStore();
                }
            });
        }

        TaskDispatcher.on(TaskConstants.SAVE_NEW_TASK, function(data) {
            createNewTask(data.text, data.email);
        });
        TaskDispatcher.on(TaskConstants.DELETE_DONE_TASKS, function() {
            deleteAllDone();
        });
        TaskDispatcher.on(TaskConstants.CHANGE_TASK_STATE, function(data) {
            flipTaskState(data.id, data.done, data.userId);
        });
        TaskDispatcher.on(TaskConstants.SERVER_TASKS_CHANGED, function() {
            updateStore();
        });

        return {
            init: function(baseRoot) {
                Diagnosis.on('update-ui', function() {
                    ServerActions.updateTasks();
                });
                updateStore();
            },
            on: function(what, callback) {
                notifier.on(what, callback);
            },
            off: function(what, callback) {
                notifier.off(what, callback);
            },
            getAllTasks: function() {
                return tasks;
            },
            getAllUsers: function() {
                return users;
            }
        };
    })();

    var TaskItem =  React.createClass({
        getInitialState: function () {
            return {
                done: this.props.task.done
            };
        },
        change: function() {
            console.log('Flip state of task ' + this.props.task.id);
            TaskActions.changeTaskState(this.props.task.id, !this.state.done, this.props.task.userId);
            this.setState({
                done: !this.state.done
            });
        },
        render: function () {
            var cx = React.addons.classSet;
            var classes = cx({
                'label': true,
                'label-success': this.state.done,
                'label-default': !this.state.done
            });
            return (
                <li className="list-group-item">
                    <div className="row">
                        <div className="col-md-10">
                            {this.props.task.name} ({this.props.task.userId})
                        </div>
                        <div className="col-md-2">
                            <span onClick={this.change} className={classes}>Done</span>
                        </div>
                    </div>
                </li>
            );
        }
    });

    var NewTask = React.createClass({
        getInitialState: function() {
            return {
                taskName: '',
                users: TaskStore.getAllUsers()
            };
        },
        clearTaskName: function() {
            console.log('Cleanup text');
            this.setState({
                taskName: ''
            });
        },
        reloadUsers: function() {
            this.setState({
                users: TaskStore.getAllUsers()
            });
        },
        componentDidMount: function() {
            TaskStore.on(TaskConstants.TASKS_ADDED, this.clearTaskName);
            TaskStore.on(TaskConstants.TASKS_CHANGED, this.reloadUsers);
        },
        componentWillUnmount: function() {
            TaskStore.off(TaskConstants.TASKS_ADDED, this.clearTaskName);
            TaskStore.off(TaskConstants.TASKS_CHANGED, this.reloadUsers);
        },
        updateName: function(e) {
            this.setState({taskName: e.target.value});
        },
        save: function() {
            if (this.state.taskName !== '') {
                TaskActions.saveNewTask(this.state.taskName, this.state.selectedUser);
            }
        },
        deleteAll: function() {
            TaskActions.deleteDone();
        },
        keyPress: function(e) {
            if (e.key === 'Enter') {
                this.save();
                e.preventDefault();
            }
        },
        setUser: function(e) {
            this.setState({
                selectedUser: e.target.value
            });
        },
        render: function() {
            var userOpts = _.map(this.state.users, function(user) {
                return <option value={user.email}>{user.name} - {user.email}</option>;
            });
            return (
                <div>
                    <div className="row">
                        <form role="form">
                            <div className="form-group col-md-12">
                                <label>User</label>&nbsp;&nbsp;&nbsp;<select onChange={this.setUser}>
                                <option>--</option>
                                {userOpts}
                                </select>
                            </div>
                        </form>
                        <form role="form">
                            <div className="form-group col-md-10">
                                <input placeholder="What do you have to do ?" type="text" className="form-control" value={this.state.taskName} onChange={this.updateName} onKeyPress={this.keyPress}/>
                            </div>
                            <div className="form-group">
                                <div className="btn-group">
                                    <button type="button" onClick={this.save} className="btn btn-success"><span className="glyphicon glyphicon-floppy-saved"></span></button>
                                    <button type="button" onClick={this.deleteAll} className="btn btn-danger"><span className="glyphicon glyphicon-trash"></span></button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }
    });

    var TodoApp = React.createClass({
        getInitialState: function() {
            return {
                tasks: TaskStore.getAllTasks()
            };
        },
        reloadTasks: function() {
            console.log('Re-render tasks');
            this.setState({
                tasks: TaskStore.getAllTasks()
            });
        },
        componentDidMount: function() {
            TaskStore.init(this.props.baseRoot);
            TaskStore.on(TaskConstants.TASKS_CHANGED, this.reloadTasks);
        },
        componentWillUnmount: function() {
            TaskStore.off(TaskConstants.TASKS_CHANGED, this.reloadTasks);
        },
        render: function() {
            var displayedTasks = _.map(this.state.tasks, function(item) {
                return (<TaskItem key={item.id} task={item}/>);
            });
            return (
                <div>
                    <h3>Todo List</h3>
                    <NewTask />
                    <ul className="list-group">
                    {displayedTasks}
                    </ul>
                </div>
            );
        }
    });

    exports.TodoMicroServices = TodoApp;
})(App);
