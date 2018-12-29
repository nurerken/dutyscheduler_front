import { API_BASE_URL, POLL_LIST_SIZE, ACCESS_TOKEN } from '../constants';

const request = (options) => {
    const headers = new Headers({
        'Content-Type': 'application/json',
    })
    
    if(localStorage.getItem(ACCESS_TOKEN)) {
        headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
    }

    const defaults = {headers: headers};
    options = Object.assign({}, defaults, options);

    return fetch(options.url, options)
    .then(response => 
        response.json().then(json => {
            if(!response.ok) {
                return Promise.reject(json);
            }           
            return json;
        })
    );
};

export function login(loginRequest) {
    return request({
        url: API_BASE_URL + "/login",
        method: 'POST',
        body: JSON.stringify(loginRequest)
    });
}

export function getCurrentUser() {
    if(!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }

    return request({
        url: API_BASE_URL + "/currentUser",
        method: 'GET'
    });
}

export function getDutyItems(year, month, calId){
    return request({
        url: API_BASE_URL + '/dutiesByDate?year=' + year + '&month=' + month + '&calId=' + calId,
        method: 'GET'
    });
}

export function createDutyItem(dutyData) {
    return request({
        url: API_BASE_URL + "/duty",
        method: 'POST',
        body: JSON.stringify(dutyData)         
    });
}


export function createComment(commentData) {
    return request({
        url: API_BASE_URL + "/comment",
        method: 'POST',
        body: JSON.stringify(commentData)         
    });
}

export function getDutyComments(commentForm){
    return request({
        url: API_BASE_URL + "/commentsByDuty",
        method: 'POST',
        body: JSON.stringify(commentForm) 
    });
}
