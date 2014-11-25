var Student = Student || {};
(function(exports) {
    function displayUI() {
        // TODO : votre code ici ;-)
        var el = '<li class="list-group-item" style="background-color:white;" ><div class="row"><div class="col-md-9"><h3><span>Votre application ici ;-)</span></h3></div><div class="col-md-3"></div></div></li>';
        $('#todo').html(el);
    }
    exports.displayUI = displayUI;
})(Student);