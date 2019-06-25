import React, { Component } from 'react';
import Calendar from './Components/Calendar/';

import Appointments from './Components/Appointments/';

import './App.scss';

class App extends Component {

    constructor(props) {
        super(props);

        this.updateList = this.updateList.bind(this);
    }

    state = {
        appointments: {}
    }

    componentDidMount() {
        const appointments = this.allStorage();

        this.setState({
            appointments: appointments
        })
    }

    allStorage() {
        let values = [], hash = {},
            keys = Object.keys(localStorage),
            i = keys.length;
        while (i--) {
            values.push(JSON.parse(localStorage.getItem(keys[i])));
        }

        values.sort((a, b) => (a.timestamp > b.timestamp) ? 1 : -1).forEach(value => hash[value.id] = value)
        return hash;
    }

    updateList() {
        const appointments = this.allStorage();
        this.setState({
            appointments: appointments
        })
    }

    render() {
        return (
          <div className="container">
            <header>
             <h1>Appointment Scheduler</h1>
            </header>

            <div className="layout">
              <div className="col appointment-list">
                <Appointments appointments={this.state.appointments}/>
              </div>

              <div className="col appointment-calendar">
                <Calendar appointments={this.state.appointments} onListUpdate={this.updateList} />
              </div>
            </div>
          </div>
       );
  }
}

export default App;
