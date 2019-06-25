import React from 'react';
import moment from 'moment';

export default class Appointments extends React.Component {
   
    formatDateTime(appointment) {
        let d = appointment.date.split('-');
        const date = moment().date(d[2]).month(d[1]-1).year(d[0]).format("MMMM Do, YYYY");
        return date +  ' @ ' + appointment.start_hour + ':' + appointment.start_minute + appointment.start_meridiem +
                 '-' + appointment.end_hour + ':' + appointment.end_minute + appointment.end_meridiem
    }

    render() {

        let collection = [];
        let appointments = (<div className="text-muted">No appointments yet.</div>);

        Object.keys(this.props.appointments).forEach(key => {
            collection.push(this.props.appointments[key]);
        });

        if (collection.length) {
            appointments = collection.map((appointment, key) => {
                return (
                    <div key={key} className="appointment-item">
                        <ul>
                            <li><small>Date: {this.formatDateTime(appointment)}</small></li>
                            <li><small>Notes:</small> {appointment.notes}</li>
                        </ul>
                    </div>
                )
            });
        }

        return (
            <div className="list">
                <h4>My Appointments</h4>
                {appointments}
            </div>
        );
    }
}
