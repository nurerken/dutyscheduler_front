import React, { Component } from 'react';
import { getDutyItems } from '../util/APIUtils';
import { createDutyItem } from '../util/APIUtils';
import { getDutyComments } from '../util/APIUtils';
import { createComment } from '../util/APIUtils';
import { getUserInfo } from '../util/APIUtils';
import { formatDate } from '../util/Helpers';
import LoadingIndicator  from '../common/LoadingIndicator';
import NotFound from '../common/NotFound';

import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import '../contextmenu/react-contextmenu.css'
import '../contextmenu/custom.css'

import ServerError from '../common/ServerError';
import {Link, withRouter } from 'react-router-dom';
import './DutyTable.css';
import { Layout, Menu, Dropdown, Icon, Select, Button, notification, Input} from 'antd';

import { API_BASE_URL, ACCESS_TOKEN } from '../constants';
import Modal from "react-responsive-modal";

const Option = Select.Option;
const { TextArea } = Input

class DutyTable extends Component {
  constructor(props){
    super(props);
    this.state={
      weeks:[],
      calendars:[],
      month:(new Date()).getMonth(),
      year:(new Date()).getFullYear(),
      calendarId:1,
      isLoading: false
    }

    this.loadDutyTable = this.loadDutyTable.bind(this);   
    this.handleMonthChange = this.handleMonthChange.bind(this);    
    this.handleYearChange = this.handleYearChange.bind(this);   
    this.handleCalendarChange = this.handleCalendarChange.bind(this);      
  }

  loadDutyTable(year, month, calId) {
      this.setState({
            isLoading: true,
            weeks:[]
      });

      getDutyItems(year, month, calId)
      .then(response => {      
            const weeks = this.state.weeks.slice();
            this.setState({
                weeks: weeks.concat(response.weeks),
                calendars: response.calendars,  
                isLoading: false
            });

        }).catch(error => {
            if(error.status === 404) {
                this.setState({
                    notFound: true,
                    isLoading: false
                });
            }
            else if(error.status === 403){
                this.setState({
                    notAuthenticated: true,
                    isLoading: false
                });        
            }
            else if(error == 'SyntaxError: Unexpected end of JSON input'){
              this.setState({
                    notAuthenticated: true,
                    isLoading: false
                });  
                localStorage.removeItem(ACCESS_TOKEN);      
            }
            else {                
                this.setState({
                    serverError: true,
                    isLoading: false
                });        
            }
        });
  }

  handleMonthChange(event) {
    this.setState({month: event.target.value});
    this.loadDutyTable(this.state.year, event.target.value, this.state.calendarId);
  }

  handleYearChange(event) {
    this.setState({year: event.target.value});
    this.loadDutyTable(event.target.value, this.state.month, this.state.calendarId);
  }

  handleCalendarChange(event) {
    this.setState({calendarId: event.target.value});
    this.loadDutyTable(this.state.year, this.state.month, event.target.value);
  }

  componentDidMount() {
    this.loadDutyTable(this.state.year, this.state.month, 1);
  }

  

  render() {

    if(this.state.isLoading) {
      return <LoadingIndicator />;
    }

    /*if(this.state.notAuthenticated) {
      return (
        <div>
          Вы не авторизованы. Необходимо 
          <Link to="/login"> войти в систему</Link>
        </div>
      );
    }*/

    if(this.state.notFound) {
      return <NotFound />;
    }

    if(this.state.serverError) {
      return <ServerError />;
    }
        
   const weekItems = [];
   this.state.weeks.forEach((week, itemIndex) => {
     weekItems.push(<Week value={week}/>)            
   });   

   const calOptions = [];
   this.state.calendars.map(function (cal) {
     calOptions.push(<option value={cal.id}>{cal.name}</option>);
   })

    return(

      <React.Fragment>  
        <table>
          <tr>
            <td>Месяц:</td>
            <td>
              <select value={this.state.month} onChange={this.handleMonthChange}>
                <option value="0">Январь</option>
                <option value="1">Февраль</option>
                <option value="2">Март</option>
                <option value="3">Апрель</option>
                <option value="4">Май</option>
                <option value="5">Июнь</option>
                <option value="6">Июль</option>
                <option value="7">Август</option>
                <option value="8">Сентябрь</option>
                <option value="9">Октябрь</option>
                <option value="10">Ноябрь</option>
                <option value="11">Декабрь</option>
              </select>  
            </td>
            <td>Год:</td>
            <td>
              <select value={this.state.year} onChange={this.handleYearChange}>
                <option value="2018">2018</option>
                <option value="2019">2019</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
              </select> 
            </td>
            <td>Календарь:</td>
            <td>
              <select value={this.state.calendarId} onChange={this.handleCalendarChange}>
                {calOptions}
              </select> 
            </td>
            <td>
              <a href={`${API_BASE_URL}/dutiesReportExcel?year=${this.state.year}&month=${this.state.month}&calId=${this.state.calendarId}`}>&nbsp;Excel отчет</a>
            </td>
          </tr>
        </table>
      
        <br/>
        <table border="1">          
              <tr>
                <td></td>
                <td>Система</td>
                <td>Понедельник</td>
                <td>Вторник</td>
                <td>Среда</td>
                <td>Четверг</td>
                <td>Пятница</td>
                <td>Суббота</td>
                <td>Воскресенье</td>
              </tr>  
              {weekItems}
        </table>        
      </React.Fragment>  
      );
  }
}

class Week extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    return(      
       <React.Fragment>
         <DateRow value={this.props.value.dates}/>
         <DutyRow value={this.props.value.users}/>
       </React.Fragment>      
      );
  }
}

class DateRow extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    return(            
        <tr className="dutydate">
           <td></td>
           <td></td>
            {this.props.value.map((val) =>
              <td>{val.replace('-','.').replace('-','.')}</td>
            )}
          </tr>  
      );
  }
}

class DutyRow extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    return( 
    <React.Fragment>        
      {this.props.value.map((val) =>
        <tr>
          <User value={val}/>
          <Duty value={val.duties}/>
        </tr>
      )}
      </React.Fragment>             
    );
  }
}

class User extends React.Component {
  constructor(props){
    super(props);

    var randomString = require('random-string');
    const userInfoDivId_ = randomString({length: 20});

    this.state = {
      open: false,
      hover: false,
      userInfoDivId: userInfoDivId_
    }
  }

  onOpenUserInfoModal = (divId, userId) => {
    this.setState({ open: true });

    getUserInfo(userId)
      .then(response => {             
          var userInfo = '';
          
          userInfo += ('<h3>' + response.lastName + ' ' + response.firstName + '<br/></h3>');
          userInfo += response.title + '<br/>';
          userInfo += response.department + '<br/>';
          userInfo += response.email + '<br/>';          
          userInfo += response.phone + '<br/>';          
          userInfo += response.address + '<br/>';
              
          document.getElementById(divId).innerHTML = userInfo;
        }).catch(error => {            
            notification.error({
              message: '',
              description: error.message || 'Sorry! Something went wrong. Please try again!'
            });            
        });
  };

  onCloseUserInfoModal = () => {
    this.setState({ open: false });
  };

  mouseOver(){
    this.setState({hover: true})
  }

  mouseOut(){
    this.setState({hover: false})
  }

  render() {
    let td_class = this.state.hover ? "hovered" : "unhovered";

    const { open } = this.state;

    return(         
        <React.Fragment>         
            <Modal open={open} onClose={this.onCloseUserInfoModal} center>                                        
              <div id={this.state.userInfoDivId}></div>  
            </Modal>     

          <td className={td_class} onMouseOver={this.mouseOver.bind(this)} onMouseOut={this.mouseOut.bind(this)}             
               onClick={() => this.onOpenUserInfoModal(this.state.userInfoDivId, this.props.value.id)}>
            {this.props.value.name}
          </td>
          <td>{this.props.value.responsibleSystems}</td>
        </React.Fragment>             
      );
  }
}

class Duty extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    return(            
        <React.Fragment>        
          {this.props.value.map((val) =>            
              <DutyItem value={val}/>         
          )}
        </React.Fragment>             
    );    
  }
}

class DutyItem extends React.Component {
  constructor(props){
    super(props);
    
    var randomString = require('random-string');
    const commentID = randomString({length: 20});
    const commentDivID_ = randomString({length: 20});

    this.state = {
      open: false,      
      comID:commentID,
      commentDivID:commentDivID_
    };

    this.handleCommentClick = this.handleCommentClick.bind(this); 
  }

  onOpenModal = (divId, userid, calid, date) => {
    this.setState({ open: true });

    let date_ = date.split('-');
    let dateNew = date_[2] + '-' + date_[1] + '-' + date_[0];

    const commentForm = {
        userId: userid,
        date: dateNew,
        calId: calid
    };

    getDutyComments(commentForm)
      .then(response => {  
            if(response.result == 'SUCCESS'){    
              const comments = response.comments.slice();

               var commentItems = '';
               comments.map(function (com) {
                 commentItems += (com.authorName + ' (' + com.insertDate.substring(0,10) + '): ' + com.text + '<br/>');
               })

              document.getElementById(divId).innerHTML = commentItems;      
            }

        }).catch(error => {
            if(error.status === 401 || error.status === 403) {
              notification.error({
                    message: '',
                    description: 'Авторизуйтесь чтобы внести изменения в таблицу'
                });  
            } else {
                notification.error({
                    message: '',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });              
            }
        });    
  };
 
  onCloseModal = () => {
    this.setState({ open: false });
  };

  handleCommentClick(userId, calId, date) {

    let comment =  document.getElementById(this.state.comID).value;
    let date_ = date.split('-');
    let dateNew = date_[2] + '-' + date_[1] + '-' + date_[0];
    
    const commentData = {
        userId: userId,
        date: dateNew,
        calId: calId,
        text: comment
    };

    createComment(commentData)
        .then(response => {
            
            if(response.Result == 'SUCCESS') {
              this.onCloseModal();
              notification.success({
                message: '',
                description: "Добавлено!",
              });
            }
            else{
                notification.error({
                    message: '',
                    description: response.Result
                }); 
            }          
        }).catch(error => {
            if(error.status === 401 || error.status === 403) {
              notification.error({
                    message: '',
                    description: 'Авторизуйтесь чтобы внести изменения в таблицу'
                });  
            } else {
                notification.error({
                    message: '',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });              
            }
        });   
  }

  render() {
  
    const handleClick = (event, data) => {

      let date = data.date.split('-');
      let dateNew = date[2] + '-' + date[1] + '-' + date[0];
      let tdId = data.tdId;
      let divId = data.divId;
                  
      const dutyData = {
        dutyId: data.id,
        userId: data.userid,
        date: dateNew,
        dutyType: data.type,
        dayType: data.dayType,
        calId: data.calid,
      };

      createDutyItem(dutyData)
        .then(response => {

            if(response.Result == 'SUCCESS') {

              if(response.dutyID == -1){
                document.getElementById(tdId).className = 'idle';
                document.getElementById(divId).className = dutyData.dayType == 1 ? '' : 'invisible';
                document.getElementById(divId).textContent = (dutyData.dayType == 1 ? 'В' : '-');
              }
              else if(dutyData.dutyType == 0){
                document.getElementById(tdId).className = 'vacation';
                document.getElementById(divId).className = '';
                document.getElementById(divId).textContent = (dutyData.dayType == 1 ? 'В отпуск' : 'отпуск')
              }
              else if(dutyData.dutyType == 1){                
                document.getElementById(tdId).className = 'mainduty';
                document.getElementById(divId).className = dutyData.dayType == 1 ? '' : 'invisible'
                document.getElementById(divId).textContent = (dutyData.dayType == 1 ? 'В' : '-');
              }
              else if(dutyData.dutyType == 2){
                document.getElementById(tdId).className = 'secondduty';
                document.getElementById(divId).className = dutyData.dayType == 1 ? '' : 'invisible'
                document.getElementById(divId).textContent = (dutyData.dayType == 1 ? 'В' : '-');
              }                   
            }
            else{
                notification.error({
                    message: '',
                    description: response.Result
                }); 
            }
          
        }).catch(error => {
            if(error.status === 401 || error.status === 403) {
              notification.error({
                    message: '',
                    description: 'Авторизуйтесь чтобы внести изменения в таблицу'
                });  
            } else {
                notification.error({
                    message: '',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });              
            }
        });       
    }

    var randomString = require('random-string');
    const ID = randomString({length: 20});
    const tdID = randomString({length: 20});
    const divID = randomString({length: 20});
        
    const attributes = {
      className: 'custom-root',
      disabledClassName: 'custom-disabled',
      dividerClassName: 'custom-divider',
      selectedClassName: 'custom-selected'
    }

    let mainDutyClassName = 'mainDutyMenu';
    let secondDutyClassName = 'secondDutyMenu';
    let vacationClassName = 'vacationMenu';

    let tdClassName = 'idle';
    let textClassName = 'invisible';
    var text = '-';
        
    if (this.props.value.type == 1) {
      tdClassName ='mainduty';
    }
    else if (this.props.value.type == 2) {
      tdClassName ='secondduty';
    }
    else if (this.props.value.type == 0) {
      tdClassName ='vacation';
      text='отпуск';
      textClassName = '';
    }

    if (this.props.value.dayType == 1) {
      text='В';
      if (this.props.value.type == 0){
        text += '  отпуск';
      }

      textClassName = '';
    }
       
  const { open } = this.state;
  
    return(
        <React.Fragment> 
        
            <Modal open={open} onClose={this.onCloseModal} center>
              <h3>Добавить комментарий</h3>
              <TextArea       
                      id = {this.state.comID}               
                      placeholder="Введите комментарий"
                      style = {{ fontSize: '16px' }} 
                      autosize={{ minRows: 3, maxRows: 6 }} 
                      name = "comment"
              />
              <br/>
              <Button  onClick={() => this.handleCommentClick(this.props.value.userId, this.props.value.calId, this.props.value.date)}>Добавить</Button>
              <br/><br/>              
              <div id={this.state.commentDivID}>комментарий отсутсвует</div>  
            </Modal>  

            <td className={tdClassName} type={this.props.value.type} date={this.props.value.date} dutyid={this.props.value.id} userid= {this.props.value.userId} calid={this.props.value.calId} comments={this.props.value.comments} id={tdID}>

              <ContextMenuTrigger id={ID}>
                <div id = {divID} className={textClassName}>{text}</div>   
              </ContextMenuTrigger>
                <ContextMenu id={ID}>
                  <MenuItem
                    data={{type: 1, date: this.props.value.date, id: this.props.value.id, userid: this.props.value.userId, calid: this.props.value.calId, tdId: tdID, oldtype: this.props.value.type, dayType: this.props.value.dayType, divId: divID}}
                    onClick={handleClick}
                    attributes={attributes}>
                      <span className={mainDutyClassName}>&nbsp;</span>&nbsp;Дежурный                      
                  </MenuItem>
                  <MenuItem
                    data={{type: 2, date: this.props.value.date, id: this.props.value.id, userid: this.props.value.userId, calid: this.props.value.calId, tdId: tdID, oldtype: this.props.value.type, dayType: this.props.value.dayType, divId: divID}}
                    onClick={handleClick}
                    attributes={attributes}>
                      <span className={secondDutyClassName}>&nbsp;</span>&nbsp;Второй дежурный
                  </MenuItem>
                  <MenuItem
                    data={{type: 0, date: this.props.value.date, id: this.props.value.id, userid: this.props.value.userId, calid: this.props.value.calId, tdId: tdID, oldtype: this.props.value.type, dayType: this.props.value.dayType, divId: divID}}
                    onClick={handleClick}
                    attributes={attributes}>
                    <span className={vacationClassName}>&nbsp;</span>&nbsp;Отпуск
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem
                    onClick={() => this.onOpenModal(this.state.commentDivID, this.props.value.userId, this.props.value.calId, this.props.value.date)}
                    attributes={attributes}>
                    Комментарии
                  </MenuItem>
                </ContextMenu>
            </td>
       </React.Fragment>  
      );              
  }
}

export default withRouter(DutyTable);
