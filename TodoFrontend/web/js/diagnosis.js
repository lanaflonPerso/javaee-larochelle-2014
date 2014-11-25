var Diagnosis = Diagnosis || {};
(function(exports) {

    function uuid() {
        var d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
    }

    var DiagnosisConsole;
    var Dispatcher = _.extend({}, Backbone.Events);

    var StepsStore = (function() {
        var steps = [];
        var notifier = _.extend({}, Backbone.Events);

        function errors() {
            return _.filter(steps, function(step) {
                if (step.type) {
                    return step.type === 'ERROR';
                }
                return false;
            });
        }

        function success() {
            return _.filter(steps, function(step) {
                if (step.type) {
                    return step.type === 'SUCCESS';
                }
                return false;
            });
        }

        function containsErrors() {
            return errors().length > 0;
        }

        return {
            containsErrors: containsErrors,
            errors: errors,
            success: success,
            push: function(what) {
                what._id = uuid();
                steps.push(what);
                notifier.trigger('update', steps);
            },
            pop: function() {
                steps.pop();
            },
            steps: function() {
                return _.filter(steps, function(step) {
                    if (step.type) {
                        return true;
                    }
                    return false;
                });
            },
            reset: function() {
                steps = [];
                notifier.trigger('update', steps);
            },
            on: function(what, callback) {
                notifier.on(what, callback);
            },
            off: function(what, callback) {
                notifier.off(what, callback);
            }
        }
    })();

    var lastId = -1;

    var Validators = {
        http200: function(resp, data, xhr) {
            if (xhr.status >= 200 && xhr.status < 300) {
                return true;
            }
            return 'Status code not good ' + xhr.status;
        },
        emptyArray: function(resp, data) {
            if (_.isArray(data) && data.length === 0) {
                return true;
            } else {
                return 'Array not empty';
            }
        },
        arrayOf: function(size) {
            return function(resp, data) {
                if (_.isArray(data) && data.length === size) {
                    return true;
                } else {
                    return 'Array not good size ' + data.length;
                }
            }
        },
        saveId: function(resp, data, xhr) {
            try {
                if (xhr.status >= 200 && xhr.status < 300) {
                    lastId = data.id;
                    return true;
                }
                return 'Status code not good ' + xhr.status;
            } catch(e) {
                return 'Error ' + e;
            }
        },
        isDone: function(resp, data, xhr) {
            console.log(data);
            if (data.done === true) {
                return true;
            }
            return "Task is not done";
        }
    };
    function asFunction(obj) {
        return function() {
            return obj;
        }
    }
    function getScenario() {    // TODO : add tip
        return [
            {
                title: "Delete all tasks",
                verb: "DELETE",
                url: '/TodoFrontend/api/front/tasks',
                validator: Validators.http200
            },
            {
                title: "Get all tasks to check if 0",
                verb: "GET",
                url: '/TodoFrontend/api/front/tasks',
                validator: Validators.emptyArray
            },
            {
                title: "Create new task",
                verb: "POST",
                url: '/TodoFrontend/api/front/tasks',
                payload: {name: "Task1", userId: "mathieu2.ancelin@foo.bar"},
                validator: Validators.http200
            },
            {
                title: "Get all tasks to check if 1",
                verb: "GET",
                url: '/TodoFrontend/api/front/tasks',
                validator: Validators.arrayOf(1)
            },
            {
                checkForErrors: true
            },
            {
                title: "Delete all tasks",
                verb: "DELETE",
                url: '/TodoFrontend/api/front/tasks',
                validator: Validators.http200
            },
            {
                title: "Get all tasks to check if 0",
                verb: "GET",
                url: '/TodoFrontend/api/front/tasks',
                validator: Validators.emptyArray
            },
            {
                title: "Create new task",
                verb: "POST",
                url: '/TodoFrontend/api/front/tasks',
                payload: {name: "Task1", userId: "mathieu2.ancelin@foo.bar"},
                validator: Validators.saveId
            },
            function() { return {
                title: "Change state of task " + lastId,
                verb: "PUT",
                url: '/TodoFrontend/api/front/tasks/' + lastId,
                payload: {
                    userId: "mathieu2.ancelin@foo.bar",
                    done: true
                },
                validator: Validators.http200
            }},
            function() { return {
                title: "Check state of task " + lastId,
                verb: "GET",
                url: '/TodoFrontend/api/front/tasks/' + lastId + '?userId=mathieu2.ancelin%40foo.bar',
                validator: Validators.isDone
            }},
            {
                checkForErrors: true
            },
            {
                title: "Delete all tasks",
                verb: "DELETE",
                url: '/TodoFrontend/api/front/tasks',
                validator: Validators.http200
            },
            {
                title: "Get all tasks to check if 0",
                verb: "GET",
                url: '/TodoFrontend/api/front/tasks',
                validator: Validators.emptyArray
            },
            {
                checkForErrors: true
            },
            {
                title: "Create new task",
                verb: "POST",
                url: '/TodoFrontend/api/front/tasks',
                payload: {name: "Task1", userId: "mathieu2.ancelin@foo.bar"},
                validator: Validators.saveId
            },
            {
                title: "Create new task",
                verb: "POST",
                url: '/TodoFrontend/api/front/tasks',
                payload: {name: "Task2", userId: "mathieu2.ancelin@foo.bar"},
                validator: Validators.saveId
            },
            {
                title: "Create new task",
                verb: "POST",
                url: '/TodoFrontend/api/front/tasks',
                payload: {name: "Task3", userId: "mathieu2.ancelin@foo.bar"},
                validator: Validators.saveId
            },
            function() { return {
                title: "Change state of task " + lastId,
                verb: "PUT",
                url: '/TodoFrontend/api/front/tasks/' + lastId,
                payload: {
                    userId: "mathieu2.ancelin@foo.bar",
                    done: true
                },
                validator: Validators.http200
            }},
            {
                checkForErrors: true
            },
            {
                title: "Delete all done tasks ",
                verb: "DELETE",
                url: '/TodoFrontend/api/front/tasks/done',
                validator: Validators.http200
            },
            {
                title: "Get all tasks to check if 2",
                verb: "GET",
                url: '/TodoFrontend/api/front/tasks',
                validator: Validators.arrayOf(2)
            },
            {
                title: "Delete all tasks",
                verb: "DELETE",
                url: '/TodoFrontend/api/front/tasks',
                validator: Validators.http200
            },
            {
                title: "Create new task",
                verb: "POST",
                url: '/TodoFrontend/api/front/tasks',
                payload: {name: "LastTask", userId: "mathieu2.ancelin@foo.bar"},
                validator: Validators.saveId
            },
            function() { return {
                title: "Delete task " + lastId,
                verb: "DELETE",
                url: '/TodoFrontend/api/front/tasks/' + lastId + '?userId=mathieu2.ancelin%40foo.bar',
                validator: Validators.http200
            }},
            {
                title: "Get all tasks to check if 0",
                verb: "GET",
                url: '/TodoFrontend/api/front/tasks',
                validator: Validators.arrayOf(0)
            },
            {
                checkForErrors: true
            }
        ].reverse();
    }
    var rank = 0;
    function next(scenario) {
        rank++;
        function schedule() {
            Dispatcher.trigger('update-ui', {});
            setTimeout(function() { next(scenario); }, 300);
        }
        if (scenario.length > 0) {
            var slug = scenario.pop();
            if (_.isFunction(slug)) {
                slug = slug();
            }
            if (slug.checkForErrors) {
                if (StepsStore.containsErrors()) {
                    Dispatcher.trigger('diagnosis-finished', {});
                    console.log('Stopping tests because of errors');
                    console.log(StepsStore.errors());
                } else {
                    schedule();
                }
            } else {
                var opts = {
                    url: slug.url,
                    type: slug.verb,
                    error: function(xhr, status, error) {
                        StepsStore.push({
                            rank: rank,
                            type: 'ERROR',
                            title: slug.title,
                            at: moment(),
                            error: error,
                            status: status,
                            url: slug.url,
                            verb: slug.verb
                        });
                        schedule();
                    },
                    success: function(data, status, xhr) {
                        var res = slug.validator(status, data, xhr);
                        if (res === true) {
                            StepsStore.push({
                                rank: rank,
                                type: 'SUCCESS',
                                title: slug.title,
                                at: moment(),
                                status: status,
                                url: slug.url,
                                verb: slug.verb
                            });
                            schedule();
                        } else {
                            StepsStore.push({
                                rank: rank,
                                type: 'ERROR',
                                title: slug.title,
                                at: moment(),
                                error: res,
                                status: status,
                                url: slug.url,
                                verb: slug.verb
                            });
                            schedule();
                        }
                    }
                };
                if (slug.payload) {
                    opts.data = slug.payload;
                }
                if (slug.contentType) {
                    opts.data = slug.contentType;
                }
                $.ajax(opts);
            }
        } else {
            Dispatcher.trigger('diagnosis-finished', {});
            console.log("Success !!!!");
            console.log(StepsStore.success());
        }
    }

    function runDiagnosis() {
        rank = 0;
        StepsStore.reset();
        Dispatcher.trigger('diagnosis-started', {});
        next(getScenario());
    }

    var Step = React.createClass({
        render: function() {
            var cx = React.addons.classSet;
            var classes = cx({
                'list-group-item': true,
                'list-group-item-success': this.props.step.type === 'SUCCESS',
                'list-group-item-danger': this.props.step.type === 'ERROR'
            });
            var title = this.props.step.title;
            if (this.props.step.type === 'ERROR') {
                title = [
                    <b>{this.props.step.title}</b>,
                    <br/>,
                    <small>{this.props.step.error}</small>
                ]
            }
            return (
                <li className={classes}>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="row">
                                <div className="col-md-3">
                                    {this.props.step.rank}: {this.props.step.verb}
                                </div>
                                <div className="col-md-9">
                                    <span>{this.props.step.url}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            {title}
                        </div>
                    </div>
                </li>
            );
        }
    });

    DiagnosisConsole = React.createClass({
        getInitialState: function () {
            return {
                steps: [],
                showBar: false,
                color: 'white'
            };
        },
        reloadSteps: function () {
            this.setState({
                steps: StepsStore.steps()
            });
        },
        showBar: function () {
            this.setState({
                color: 'white',
                showBar: true
            });
        },
        hideBar: function () {
            if (StepsStore.errors().length > 0) {
                this.setState({
                    showBar: false,
                    color: 'rgb(242, 222, 222)'
                });
            } else {
                this.setState({
                    showBar: false,
                    color: 'rgb(223, 240, 216)'
                });
            }
        },
        componentDidMount: function () {
            StepsStore.on("update", this.reloadSteps);
            Dispatcher.on('diagnosis-started', this.showBar);
            Dispatcher.on('diagnosis-finished', this.hideBar);
        },
        componentWillUnmount: function () {
            StepsStore.off("update", this.reloadSteps);
        },
        render: function () {
            var steps = _.map(this.state.steps, function (step) {
                return <Step key={step.key} step={step}/>
            });
            var style = {
                'marginTop': '10px',
                'marginBottom': '10px'
            };
            var style2 = {
                maxHeight: '500px',
                overflowY: 'auto'
            };
            var fullLength = _.filter(getScenario(), function (item) {
                if (item.checkForErrors) return false;
                return true;
            }).length;
            var styleBar = {
                width: ((steps.length * 100) / fullLength) + '%'
            };
            var progress = (
                <div className="progress">
                    <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45"
                        aria-valuemin="0" aria-valuemax="100" style={styleBar}>
                        <span className="sr-only"></span>
                    </div>
                </div>
            );
            if (!this.state.showBar) {
                progress = undefined;
            }
            if (steps.length === 0) {
                steps.push(
                    <li key="nothing" className="list-group-item list-group-item-warning">
                        <p>Nothing to show, you should run the diagnosis !!!</p>
                    </li>
                );
            }
            steps = steps.reverse();
            var errors = StepsStore.errors().length;
            var titleStyle = {
                backgroundColor: this.state.color
            };
            return (
                <div>
                    <ul className="list-group">
                        <li key="title" className="list-group-item" style={titleStyle}>
                            <div className="row">
                                <div className="col-md-9">
                                    <h3>Diagnosis console ({errors} {errors > 1 ? 'errors' : 'error'})</h3>
                                </div>
                                <div className="col-md-3">
                                    <button type="button" style={style} className="btn btn-primary pull-right" onClick={runDiagnosis}>Run diagnosis</button>
                                </div>
                            </div>
                        </li>
                    </ul>
                    {progress}
                    <div style={style2}>
                        <ul className="list-group">{steps}</ul>
                    </div>
                </div>
            );
        }
    });
    exports.init = function(node) {
        React.render(React.createElement(DiagnosisConsole), node);
    };
    exports.on = function(what, callback) {
        Dispatcher.on(what, callback);
    };
    exports.off = function(what, callback) {
        Dispatcher.off(what, callback);
    };
    exports.uuid = uuid;
    exports.keyMirror = function(obj) {
        var ret = {};
        var key;
        if (!(obj instanceof Object && !Array.isArray(obj))) {
            throw new Error('keyMirror(...): Argument must be an object.');
        }
        for (key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }
            ret[key] = key;
        }
        return ret;
    };
})(Diagnosis);