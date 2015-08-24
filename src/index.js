var React = require('react'),
    css = require("./main.less"),
    $ = require("imports?jQuery=jquery!exports?jQuery!flipclock"),
    DateTimeField = require('imports?jQuery=jquery!exports?DateTimeField!react-bootstrap-datetimepicker');

var SetTimeForm = React.createClass({
    componentDidMount: function () {
        document.getElementsByClassName("form-control")[0].value = this.props.selectedTime;
        document.getElementsByClassName("excludeWeekendsCheckBox")[0].checked = this.props.excludeWeekends=="true";
    },
    render: function () {
        return (
            <form>
                <h2>Please input time</h2>
                <DateTimeField />
                <label><input type="checkbox" className="excludeWeekendsCheckBox" /> Exclude Weekends</label>
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
        this.setState({editing: !this.state.editing});
        setCookie("selectedTime",document.getElementsByClassName("form-control")[0].value);
        setCookie("excludeWeekends", document.getElementsByClassName("excludeWeekendsCheckBox")[0].checked.toString());
        updateClock($('.clock'));
    },
    cancel: function() {
        this.setState({editing: !this.state.editing});
        updateClock($('.clock'));
    },
    edit: function() {
        if (!this.state.editing)
            this.setState({editing: !this.state.editing});
    },
    componentDidMount: function () {
        updateClock($('.clock'));
    },
    render: function () {
        var element;
        if (this.state.editing) {
            var selectedTime = getSelectedTime();
            var excludeWeekends = getExcludeWeekends().toString();
            element = <div>
                <SetTimeForm selectedTime={selectedTime} excludeWeekends={excludeWeekends}/>
                <button className="btn btn-primary" onClick={this.save}>Save</button>     <button className="btn btn-info" onClick={this.cancel}>Cancel</button></div>;
            $('.clock').hide();
        } else {
            updateClock($('.clock'));
            $('.clock').show();
        }

        return (
            <div className="timer" onClick={this.edit}>
                <div className="clock"/>
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


function currentDate() {
    var currentDate = new Date();
    while (currentDate.getDay == 6 || currentDate.getDay == 0) {
        currentDate = new Date(new Date(currentDate.getFullYear(),currentDate.getMonth(), currentDate.getDate()).getTime() - oneDayInMillis());
    }
    return currentDate;
}

function getSelectedTime() {
    var endTime = "2015-09-01 18:00:00";
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
    return getCookie("title");
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
        if (fromDate.getDay() == 0 || fromDate.getDay() == 6){
            ++weekendDaysCount ;
        }
        fromDate = new Date(fromDate.getTime() + oneDayInMillis());
    }
    return weekendDaysCount ;
}

function oneDayInMillis() {
    return 1000 * 60 * 60 * 24;
}


function updateClock(clock) {
    var now = currentDate();
    var endTime = getSelectedTime();
    var excludeWeekends = getExcludeWeekends();
    var title = getTitle();
    var date = new Date(endTime);
    var milisec_diff = date.getTime() - now.getTime();
    var weekendDays = 0;
    if (excludeWeekends) {
        weekendDays = calculateWeekendDays(now, date);
    }
    milisec_diff = milisec_diff - ((weekendDays * oneDayInMillis()));
    var days = Math.floor(milisec_diff / oneDayInMillis());
    if (days < 100) {
        clock.addClass('twoDayDigits');
    } else {
        clock.addClass('threeDayDigits');
    }
    if (milisec_diff > 0) {
        clock.FlipClock(milisec_diff / 1000, {
            clockFace: 'DailyCounter',
            countdown: true
            //language: window.navigator.userLanguage || window.navigator.language
        });
    }
}