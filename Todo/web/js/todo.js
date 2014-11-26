var Student = Student || {};
(function(exports) {
    function displayUI() {
        
        function template(task) {
            var done = task.done ? 'label-success' : 'label-default';
            return '<li  class="list-group-item">' +
                    '<div  class="row">' +
                    '    <div  class="col-md-10">' + task.name + '</div>' +
                    '    <div  class="col-md-2">' +
                    '        <span data-taskid="' + task.id + '" class="label ' + done + '" style="cursor: pointer;">Done</span>' +
                    '    </div>' +
                    '</div>' +
                    '</li>';
        }
        
        var tasks = [];

        function reloadAndRedraw() {
            console.log('reload');
            $.get('/Todo/api/tasks', function(data) {
                tasks = data;
                console.log(tasks);
                var html = _.map(tasks, function(task) {
                    return template(task);
                }).join('');
                $('#tasks').html(html);
            });
        }

        $('#save').click(function(e) {
            e.preventDefault();
            if ($('#name').val() !== '') {
                $.post('/Todo/api/tasks', {name: $('#name').val()}, function() {
                    reloadAndRedraw();
                });
            }
        });
        $('#delete').click(function(e) {
            e.preventDefault();
            $.ajax({ url: '/Todo/api/tasks/done', type: 'delete', success: function() {
                reloadAndRedraw();
            }});
        });
        $('body').on('click', '.label', function() {
            var id = $(this).data('taskid');
            var task = _.find(tasks, function(task) {
                return task.id === id;
            });
            $.ajax({ url: '/Todo/api/tasks/' + id, type: 'put', data: {done: !task.done}, success: function() {
                reloadAndRedraw();
            }});
        });
        reloadAndRedraw();
    }
    exports.displayUI = displayUI;
})(Student);