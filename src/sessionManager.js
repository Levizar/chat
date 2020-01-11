"use strict";

/**
 * @author Louis Wicket
 */

module.exports = {
    sessions: {},

    /**
     * @description Check if the SID is defined in the cookies
     * @param { String } cookies The cookies from the request headers
     * @returns { (Object | null) } If defined return the SID, otherwise return null
     */
    checkSession(cookies) {
        const sid = /(?<=sid=)[^(;|^)]+/.exec(cookies);
        if (sid && this.sessions[sid[0]]) 
            return this.sessions[sid[0]];
        else 
            return null;
    },

    /**
     * @description Create a new user session object and push it into a IMDB
     * @param { http.ServerResponse } res The response object to a HTTP request
     * @param { Object } data Some required data about the user to handle the session
     */
    newSession(res, data) {
        const sid = Math.random().toString(36).substring(2);
        res.setHeader("Set-Cookie", `sid=${sid}; HttpOnly`);
        this.sessions[sid] = data;
    }
};