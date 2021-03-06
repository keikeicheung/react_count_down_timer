var React = require('react'),
    css = require("./main.less"),
    $ = require("imports?jQuery=jquery!exports?jQuery!flipclock"),
    DateTimeField = require('imports?jQuery=jquery!exports?DateTimeField!react-bootstrap-datetimepicker');

window.onfocus = function() {
    updateClock($('.clock'));
};

window.onblur = function() {
    $('.clock').stop();
};

var SetTimeForm = React.createClass({
    componentDidMount: function () {
        document.getElementsByClassName("form-control")[0].value = this.props.selectedTime;
        document.getElementsByClassName("excludeWeekendsCheckBox")[0].checked = this.props.excludeWeekends=="true";
    },
    render: function () {
        return (
            <form>
                <h2>Please input time</h2>
                <div className="col-sm-12">
                    <DateTimeField inputFormat="YYYY-MM-DD HH:mm:ss"/>
                    <span>
                        <label><input type="checkbox" className="excludeWeekendsCheckBox" /> Exclude Weekends</label>
                    </span>
                </div>
            </form>
        );
    }
});

var Timer = React.createClass({
    getInitialState: function () {
        return {
            editing: false
        };
    },
    save: function() {
        if (this.state.editing) {
            this.setState({editing: false});
            setCookie("title", document.getElementsByClassName("titleInput")[0].value);
            setCookie("selectedTime", document.getElementsByClassName("form-control")[0].value);
            setCookie("excludeWeekends", document.getElementsByClassName("excludeWeekendsCheckBox")[0].checked.toString());
            updateClock($('.clock'));
        }
    },
    cancel: function() {
        if (this.state.editing) {
            this.setState({editing: false});
            updateClock($('.clock'));
        }
    },
    edit: function() {
        if (!this.state.editing)
            this.setState({editing: true});
    },
    componentDidMount: function () {
        updateClock($('.clock'));
    },
    render: function () {
        var element;
        var clock = $('.clock');
        var title = $('.title');
        if (this.state.editing) {
            var selectedTime = getSelectedTime();
            var excludeWeekends = getExcludeWeekends().toString();
            element = <div>
                <input className="titleInput" type="text" defaultValue={getTitle()} />
                <SetTimeForm selectedTime={selectedTime} excludeWeekends={excludeWeekends}/>
                <button className="btn btn-primary" onClick={this.save}>Save</button>     <button className="btn btn-info" onClick={this.cancel}>Cancel</button></div>;

            title.hide();
            clock.hide();
            $('.byebyeImage').hide();
        } else {
            title.show();
            clock.show();
            updateClock(clock);
        }

        return (
            <div className="timer" onClick={this.edit}>
                <h1 className="title">{getTitle()}</h1>
                <div className="clock"/>
                <div className="byebyeImage" hidden>
                    <img src="../resources/percy_pig.jpg" />
                </div>
                {element}
            </div>
        );
    }
});

var CenterBox = React.createClass({
    render: function () {
        return (
            <div className="outer">
                <div className="middle">
                    <div className="inner">
                        <Timer />
                    </div>
                </div>
            </div>
        );
    }
});



React.render(
    <CenterBox/>,
    document.getElementById('main')
);


function getStartDate(excludeWeekends) {
    var currentDate = new Date();
    if (isWeekend(currentDate) && excludeWeekends) {
        while (isWeekend(currentDate) && excludeWeekends) {
            currentDate = new Date(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime() - oneDayInMillis());
        }
        currentDate = new Date(currentDate.getTime() + oneDayInMillis());
    }
    return currentDate;
}

function getSelectedTime() {
    var endTime = "2015-12-25 00:00:00";
    var x = getCookie("selectedTime");
    if (x != "") {
        endTime = x;
    }
    return endTime;
}


function getExcludeWeekends() {
    return getCookie("excludeWeekends") == "true";
}

function getTitle() {
    var title = "Santa Claus is coming to town";
    var x = getCookie("title");
    if (x != "") {
        title = x;
    }
    return title;
}
function setCookie(cname,cvalue) {
    document.cookie = cname+"="+cvalue+"; ";
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function calculateWeekendDays(fromDate, toDate){
    var weekendDaysCount = 0;

    while(fromDate < toDate){
        if (isWeekend(fromDate)){
            ++weekendDaysCount ;
        }
        fromDate = new Date(fromDate.getTime() + oneDayInMillis());
    }
    return weekendDaysCount ;
}

function oneDayInMillis() {
    return 1000 * 60 * 60 * 24;
}

var clockStopped = false;

function updateClock(clock) {
    var excludeWeekends = getExcludeWeekends();
    var now = getStartDate(excludeWeekends);
    var endTime = getSelectedTime();
    var title = getTitle();
    var date = new Date(endTime);
    var milisec_diff = date.getTime() - now.getTime();
    var weekendDays = 0;
    if (excludeWeekends) {
        weekendDays = calculateWeekendDays(now, date);
    }
    milisec_diff = milisec_diff - ((weekendDays * oneDayInMillis()));
    if (milisec_diff > 0) {
        clock = clock.FlipClock(milisec_diff / 1000,{
            clockFace: 'DailyCounter',
            countdown: true,
            language: window.navigator.userLanguage || window.navigator.language,
            autoStart: false,
            callbacks: {
                interval: function () {
                    var time = clock.getTime().time;
                    if (time == 0) {
                        $('.clock').hide();
                        $('.byebyeImage').show();
                    }
                }
            }
        });
        if (!isWeekend(new Date()) || !excludeWeekends) {
            clock.start();
        }
    } else {
        clock.hide();
        $('.byebyeImage').show();
    }
}

function isWeekend(date) {
    return date.getDay() == 6 || date.getDay() == 0;
}