import React from 'react';
import moment from 'moment';
import './calendar.scss';
import AppointmentForm from '../Appointments/form';
import zeroPad from 'zero-pad';

export default class Calendar extends React.Component {
    state = {
        dateContext: moment(),
        today: moment(),
        showMonthPopup: false,
        showYearPopup: false,
        selectedDay: null
    }

    constructor(props) {
        super(props);
        this.width = props.width || "100%";
        this.style = props.style || {};
        this.style.width = this.width;

        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.scheduleChecker = this.scheduleChecker.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    handleClickOutside(event) {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            this.setState({
                showMonthPopup: false,
                showYearPopup: false
            });
            document.getElementById('appointment-form-popup').className = '';
        }
    }

    weekdays = moment.weekdays(); //["Sunday", "Monday", "Tuesday", "Wednessday", "Thursday", "Friday", "Saturday"]
    weekdaysShort = moment.weekdaysShort(); // ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    months = moment.months();

    year = () => {
        return this.state.dateContext.format("Y");
    }
    month = () => {
        return this.state.dateContext.format("MMMM");
    }
    daysInMonth = () => {
        return this.state.dateContext.daysInMonth();
    }
    currentDate = () => {
        return this.state.dateContext.get("date");
    }
    currentDay = () => {
        return this.state.dateContext.format("D");
    }

    firstDayOfMonth = () => {
        let dateContext = this.state.dateContext;
        let firstDay = moment(dateContext).startOf('month').format('d'); // Day of week 0...1..5...6
        return firstDay;
    }

    setMonth = (month) => {
        let monthNo = this.months.indexOf(month);
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).set("month", monthNo);
        this.setState({
            dateContext: dateContext
        });
    }

    nextMonth = () => {
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).add(1, "month");
        this.setState({
            dateContext: dateContext
        });
        this.props.onNextMonth && this.props.onNextMonth();
    }

    prevMonth = () => {
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).subtract(1, "month");
        this.setState({
            dateContext: dateContext
        });
        this.props.onPrevMonth && this.props.onPrevMonth();
    }

    onSelectChange = (e, data) => {
        this.setMonth(data);
        this.props.onMonthChange && this.props.onMonthChange();

    }
    SelectList = (props) => {
        let popup = props.data.map((data) => {
            return (
                <div key={data}>
                    <button onClick={(e)=> {this.onSelectChange(e, data)}}>
                        {data}
                    </button>
                </div>
            );
        });

        return (
            <div className="month-popup">
                {popup}
            </div>
        );
    }

    onChangeMonth = (e, month) => {
        this.setState({
            showMonthPopup: !this.state.showMonthPopup
        });
    }

    MonthNav = () => {
        return (
            <span className="label-month"
                onClick={(e)=> {this.onChangeMonth(e, this.month())}}>
                {this.month()}
                {this.state.showMonthPopup &&
                 <this.SelectList data={this.months} />
                }
            </span>
        );
    }

    showYearEditor = () => {
        this.setState({
            showYearNav: true
        });
    }

    hideYearEditor = (e) => {
        this.setState({
            showYearNav: false
        });
    }

    setYear = (year) => {
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).set("year", year);
        this.setState({
            dateContext: dateContext
        })
    }
    onYearChange = (e) => {
        this.setYear(e.target.value);
        this.props.onYearChange && this.props.onYearChange(e, e.target.value);
    }

    onKeyUpYear = (e) => {
        if (e.which === 13 || e.which === 27) {
            this.setYear(e.target.value);
            this.setState({
                showYearNav: false
            })
        }
    }

    YearNav = () => {
        return (
            this.state.showYearNav ?
            <input
                defaultValue = {this.year()}
                className="editor-year"
                ref={(yearInput) => { this.yearInput = yearInput}}
                onKeyUp= {(e) => this.onKeyUpYear(e)}
                onChange = {(e) => this.onYearChange(e)}
                onBlur = { (e) => this.hideYearEditor(e)}
                type="number"
                placeholder="year"/>
            :
            <span
                className="label-year"
                onClick={(e)=> { this.showYearEditor()}}>
                {this.year()}
            </span>
        );
    }

    onDayClick = (e, day, isBefore) => {

        if (isBefore) {
            alert('Cannot set an appointment in the past.');
            return false;
        }

        this.showPopup(e);

        this.setState({
            selectedDay: day,
            appointment: {
                id: null,
                date:  this.state.dateContext.date(day).format("YYYY-MM-DD"),
                start_hour: '9',
                start_minute: '00',
                start_meridiem: 'AM',
                end_hour: '10',
                end_minute: '00',
                end_meridiem: 'AM',
                notes: ''
            }
        });
    }

    onEventClick = (e, appointment) => {
        this.showPopup(e);
        this.setState({
            appointment: appointment
        });
        e.stopPropagation();
    }

    showPopup(e) {
        const popup = document.getElementById('appointment-form-popup');
        popup.className = 'in';
        popup.style.top = (e.clientY - 50) + 'px';
        popup.style.left = (e.clientX - 70) + 'px';
    }

    appointmentEntries = (displayKey) => {
        let entries = '';
        let appointmentsByDate = {};

        Object.keys(this.props.appointments).forEach(key => {
            if (appointmentsByDate[this.props.appointments[key].date]) {
                appointmentsByDate[this.props.appointments[key].date].push(this.props.appointments[key]);
            } else {
                appointmentsByDate[this.props.appointments[key].date] = [this.props.appointments[key]];
            }
        });

        if (appointmentsByDate[displayKey]) {
            entries = appointmentsByDate[displayKey].map((appt, i) => {
                    return (
                        <div key={appt.date + i} className='calendar-item' onClick={(e)=>{this.onEventClick(e, appt)}}>
                            <small className='float-right text-muted'>
                                {appt.start_hour + ':' + appt.start_minute + ' ' + appt.start_meridiem}
                            </small>
                            <small className='preview'>{appt.notes}</small>
                        </div>
                    );
            });
        }

        return entries;
    }

    scheduleChecker(appointment) {

        let hasConflict = false;
        let times = Object.values(this.props.appointments).map(item => {
            if (appointment.id && appointment.id === item.id) {
                return null;
            }

            let start_hour = (item.start_meridiem === 'PM') ? item.start_hour + 12 : item.start_hour;
            let end_hour = (item.start_meridiem === 'PM') ? item.end_hour + 12 : item.end_hour;

            let start = moment(item.date).hour(start_hour).minute(item.start_minute).unix();
            let end = moment(item.date).hour(end_hour).minute(item.end_minute).unix();

            return [start, end];
        });


        times.forEach(spread => {
            if (spread) {
                if (appointment.timestamp > spread[0] && appointment.timestamp < spread[1]) {
                    hasConflict = true;
                    return;
                }
            }
        });

        return hasConflict;
    }

    render() {

        // Map the weekdays i.e Sun, Mon, Tue etc as <td>
        let weekdays = this.weekdaysShort.map((day) => {
            return (
                <td key={day} className="week-day">{day}</td>
            )
        });

        let blanks = [];
        for (let i = 0; i < this.firstDayOfMonth(); i++) {
            blanks.push(<td key={i * 80} className="emptySlot">
                {""}
                </td>
            );
        }

        let dateContext = this.state.dateContext;
        let displayYear = dateContext.year();
        let displayMonth = dateContext.month() + 1;

        let daysInMonth = [];
        let appts = null;


        for (let d = 1; d <= this.daysInMonth(); d++) {
            let className = (d === parseInt(this.currentDay(), 10) ? "day current-day": "day");
            let selectedClass = (d === parseInt(this.state.selectedDay,10) ? " selected-day " : "");
            let displayKey = displayYear + '-' + zeroPad(displayMonth) + '-' + zeroPad(d);
            appts = this.appointmentEntries(displayKey);

            let isBefore = moment(displayKey).isBefore(this.state.today.format('YYYY-MM-DD'));

            if (isBefore) {
                className += ' not-allowed';
            }

            daysInMonth.push(
                <td key={d} className={className + selectedClass} onClick={(e)=>{this.onDayClick(e, d, isBefore)}}>
                    <small className="date-num">{d}</small>
                    { appts }
                </td>
            );
        }

        //fill in empty days for fuller design
        const remaining = (7 - (blanks.length + daysInMonth.length) % 7);
        if (remaining < 7) {
            for(let i=0;i<remaining;i++) {
                daysInMonth.push(<td key={i} className='emptySlot'></td>);
            }
        }

        var totalSlots = [...blanks, ...daysInMonth];
        let rows = [];
        let cells = [];

        totalSlots.forEach((row, i) => {
            if ((i % 7) !== 0) {
                cells.push(row);
            } else {
                let insertRow = cells.slice();
                rows.push(insertRow);
                cells = [];
                cells.push(row);
            }
            if (i === totalSlots.length - 1) {
                let insertRow = cells.slice();
                rows.push(insertRow);
            }
        });

        let trElems = rows.map((d, i) => {
            return (
                <tr key={i*100}>
                    {d}
                </tr>
            );
        })

        return (
            <div className="calendar-container" style={this.style} ref={this.setWrapperRef}>
                <AppointmentForm onListUpdate={this.props.onListUpdate} appointment={this.state.appointment} scheduleChecker={this.scheduleChecker}/>

                <h2>Welcome to Appointment Scheduler. To request an appointment, click on a date from the calender below.</h2>
                <table className="calendar">
                    <thead>
                        <tr className="calendar-header">
                            <td colSpan="5">
                                <this.MonthNav />
                                <this.YearNav />
                            </td>
                            <td colSpan="2" className="nav-month">
                                <button className="next fa fa-fw fa-chevron-right"
                                    onClick={(e)=> {this.prevMonth()}}>‹ Prev</button>
                                <button className="prev fa fa-fw fa-chevron-left"
                                    onClick={(e)=> {this.nextMonth()}}> Next ›</button>

                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {weekdays}
                        </tr>
                        {trElems}
                    </tbody>
                </table>
            </div>
        );
    }
}
