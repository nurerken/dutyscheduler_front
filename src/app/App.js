import React, { Component } from 'react';
import './App.css';
import {
  Route,
  withRouter,
  Switch
} from 'react-router-dom';

import { getCurrentUser } from '../util/APIUtils';
import { ACCESS_TOKEN } from '../constants';
import DutyTable from '../calendar/DutyTable';
import Login from '../user/login/Login';
import AppHeader from '../common/AppHeader';
import NotFound from '../common/NotFound';
import LoadingIndicator from '../common/LoadingIndicator';
import PrivateRoute from '../common/PrivateRoute';

import { Layout, notification } from 'antd';
const { Content } = Layout;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      isAuthenticated: false,
      isLoading: false
    }
    this.handleLogout = this.handleLogout.bind(this);
    this.loadCurrentUser = this.loadCurrentUser.bind(this);
    this.handleLogin = this.handleLogin.bind(this);

    notification.config({
      placement: 'topRight',
      top: 70,
      duration: 3,
    });    
  }

  loadCurrentUser() {
    this.setState({
      isLoading: true
    });
    getCurrentUser()
    .then(response => {         
      this.setState({
        currentUser: response,
        isAuthenticated: true,
        isLoading: false
      });
    }).catch(error => {
      this.setState({
        isLoading: false
      });  
    });
  }

  componentDidMount() {
    this.loadCurrentUser();
  }

  handleLogout(redirectTo="/", notificationType="success", description="Вы успешно вышли из системы.") {
    localStorage.removeItem(ACCESS_TOKEN);

    this.setState({
      currentUser: null,
      isAuthenticated: false
    });

    this.props.history.push(redirectTo);
    
    notification[notificationType]({
      message: '',
      description: description,
    });
  }

  handleLogin() {
    notification.success({
      message: '',
      description: "Вы успешно вошли в систему.",
    });
    this.loadCurrentUser();
    this.props.history.push("/");
  }

  render() {
    if(this.state.isLoading) {
      return <LoadingIndicator />
    }
    return (
        <Layout className="app-container">
          <AppHeader isAuthenticated={this.state.isAuthenticated} currentUser={this.state.currentUser} onLogout={this.handleLogout} />

          <Content className="app-content">
            <div className="container">
              <Switch>      
                <Route exact path="/" 
                  render={(props) => <DutyTable isAuthenticated={this.state.isAuthenticated} currentUser={this.state.currentUser} value={props}/>}>
                </Route>
                <Route path="/login" 
                  render={(props) => <Login onLogin={this.handleLogin} {...props} />}>
                </Route>                            
                <Route component={NotFound}></Route>
              </Switch>
            </div>
          </Content>
        </Layout>
    );
  }
}

export default withRouter(App);
