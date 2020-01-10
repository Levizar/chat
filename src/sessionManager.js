"use strict";

/**
 * @author Louis Wicket
 */

module.exports = {
    sessions: {},

    /**
     * Check if the SID is defined in the cookies
     * @param cookies The cookies from the request headers
     * @returns { (Object | null) } Return the sid if defined, otherwise return null
     */
    checkSession(cookies) {
        const sid = /(?<=sid=)[^(;|^)]+/.exec(cookies);
        if (sid && this.sessions[sid[0]]) 
            return this.sessions[sid[0]];
        else 
            return null;
    },
    
    newSession(res, data) {
        const sid = Math.random().toString(36).substring(2);
        res.setHeader("Set-Cookie", `sid=${sid}; HttpOnly`);
        this.sessions[sid] = data;
    }
};