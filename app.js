var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var port = process.env.PORT || 3000;

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');
var flash = require('connect-flash');
var session = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/users');

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'shhsecret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

var User = require('./models/user');
app.post('/setTask', function (req, res) {
    var UserId = req.body.idUser;

    var NewTask = {
        from: req.body.from,
        task: req.body.textTask,
        date_start: req.body.date_start,
        date_end: req.body.date_end,
        status: "0"
    };
    User.findById(UserId, function (err, user) {
        user.local.tasks.push(NewTask);
        user.save();
        console.log(user.local.email);
        console.log(user.local.tasks);
    });
    //res.render('profile.ejs');

    res.redirect('back');
});

app.post('/changestatus', function (req, res) {
    var UserId = req.body.idUser;
    var status = req.body.status;
    var task_name = req.body.task_name;

    var namet = "local.tasks." + 1;
    User.update({
            _id: UserId,
            "local.tasks.task": task_name
        }, {
            $set: {
                "local.tasks.$.status": status
            }
        },
        function (err, tank) {
            if (err) return handleError(err);
            console.log(tank);
        }
    );

    //res.render('tasks.ejs');     
    res.redirect('back');
});



require('./config/passport')(passport);

app.use('/', routes);
app.use('/users', users);

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
        });
    });
}


app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
    });
});

app.listen(port);

module.exports = app;