import React from 'react';
import moment from 'moment';
import zeroPad from 'zero-pad';
import uniqid from 'uniqid';

export default class AppointmentForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            appointment: {}
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.appointment !== this.props.appointment){
            this.setState({ appointment: nextProps.appointment});
        }
    }

    closeForm() {
        document.getElementById('appointment-form-popup').className = '';
    }

    timeSelector(label) {
        let name = label.split(' ')[0].toLowerCase();
        let hours = this.hourDropdown(name);
        let minutes = this.minuteDropdown(name);
        let meridiem = this.meridiemDropdown(name);
        return (
            <div className="form-group">
                <label> {label}: </label>
                {hours} : {minutes} {meridiem}
            </div>
        );
    }

    hourDropdown(name) {
        const options = []
        for (let h=1;h<13;h++) {
            options.push(<option key={h} value={h}>{zeroPad(h)}</option>);
        }
        return (<select name={name + '_hour'}
                    value={this.state.appointment[name + '_hour'] || ''}
                    onChange={(e)=>this.setHour(e)}>{options}</select>);
    }

    minuteDropdown(name) {
        const options = ['00','15', '30', '45'].map(a=> {
                return(<option key={a} value={a}>{a}</option>)
        });
        return (<select name={name + '_minute'}
                    value={this.state.appointment[name + '_minute'] || ''}
                    onChange={(e)=>this.setMinute(e)}>{options}</select>);
    }

    meridiemDropdown(name) {
        const options = ['AM','PM'].map(a=> {
                return(<option key={a} value={a}>{a}</option>)
            });
        return (<select name={name + '_meridiem'}
                    value={this.state.appointment[name + '_meridiem'] || ''}
                    onChange={(e)=>this.setMeridiem(e)}>{options}</select>);
    }

    formatDate(str) {
        if (str) {
            const d = str.split('-');
            return moment().date(d[2]).month(d[1]-1).year(d[0]).format("MMMM Do, YYYY");
        } else {
            return '';
        }
    }

    setHour(e) {
        // sets 'ends at' hour to one hour ahead if not set yet..
        let appointment = Object.assign({}, this.state.appointment);

        if (e.target.name === 'start_hour') {
            appointment.start_hour = parseInt(e.target.value, 10);
            appointment.end_hour = (parseInt(e.target.value, 10) + 1)
        } else {
            appointment.end_hour = e.target.value;
        }

        this.setState({ appointment: appointment });
    }

    setMinute(e) {
        // sets 'ends at' minute to match if not set yet..
        let appointment = Object.assign({}, this.state.appointment);
        if (e.target.name === 'start_minute') {
            appointment.start_minute = e.target.value;
            appointment.end_minute = e.target.value;
        } else {
            appointment.end_minute = e.target.value;
        }
        this.setState({ appointment: appointment });
    }

    setMeridiem(e) {
        // sets 'ends at' meridiem to match if not set yet..
        let appointment = Object.assign({}, this.state.appointment);
        if (e.target.name === 'start_meridiem') {
            appointment.start_meridiem = e.target.value;
            appointment.end_meridiem = e.target.value
        } else {
            appointment.end_meridiem = e.target.value;
        }
        this.setState({ appointment: appointment });
    }

    setNotes(e) {
        let appointment = Object.assign({}, this.state.appointment);
        appointment.notes = e.target.value;
        this.setState({ appointment: appointment });
    }

    onSubmit(e) {
        e.preventDefault();
        let appointment = {};
        const form = new FormData(e.target);
        for(var pair of form.entries()) {
            appointment[pair[0]] = pair[1];
        }

        if (!appointment.id) {
            appointment.id = uniqid();
        }

        let hour = (appointment.start_meridiem === 'PM') ? appointment.start_hour + 12 : appointment.start_hour;

        appointment.timestamp = moment(appointment.date).hour(hour).minute(appointment.start_minute).unix();

        if (this.props.scheduleChecker(appointment)) {
            alert('The time you request conflicts with another item on your calendar');
            return false;
        }
        
        localStorage.setItem(appointment.id, JSON.stringify(appointment));

        this.setState({ appointment: appointment });
        this.props.onListUpdate && this.props.onListUpdate();
        this.closeForm();
        return false;
    }

    updateNotes(e) {
        let appointment = Object.assign({}, this.props.appointment);
        appointment.notes = e.target.value;
        this.setState({ appointment: appointment });
    }
    
    deleteEntry(e, id) {
        localStorage.removeItem(id);
        this.props.onListUpdate && this.props.onListUpdate();
        this.closeForm();
    }

    render() {

        const start_time = this.timeSelector('Start at');
        const end_time = this.timeSelector('End at');

        return (
            <div id="appointment-form-popup">
                <button className="close-btn" onClick={(e) => this.closeForm() }>✕</button>
                <h4>Request an appointment on:</h4>
                <div className="form-horizontal">
                    <form id="request-form" onSubmit={(e) => this.onSubmit(e)} type="post">
                        <div className="form-group">
                            <label>Date:</label>
                            <span className='display-value'>{this.formatDate(this.state.appointment.date)}</span>
                            <input type="hidden" name="date" defaultValue={this.state.appointment.date}/>
                            <input type="hidden" name="id" defaultValue={this.state.appointment.id ||''}/>
                         </div>

                        {start_time}
                        {end_time}

                        <div className="form-group">
                            <label> Notes: </label>
                            <textarea name="notes" rows="3" value={this.state.appointment.notes||''} onChange={(e)=>this.setNotes(e)}/>
                        </div>
                        <div className="form-group">
                            <label>&nbsp;</label>
                            <button type='submit' className="btn btn-primary">Submit</button>

                            {this.state.appointment.id &&
                            <button type='button' onClick={(e)=> this.deleteEntry(e, this.state.appointment.id)} className="btn btn-danger">Delete</button> }
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
// 1561542300
// 1561572900
