"use strict";

/**
 * @author Louis Wicket
 */

module.exports = {
    sessions: {},
    failedAttempts: {},

    getIp(req) {
        try {
            const ip = (req.headers["x-forwarded-for"] || "").split(",").pop() ||
                      req.connection.remoteAddress ||
                      req.socket.remoteAddress ||
                      req.connection.socket.remoteAddress;
            return ip;
        } catch {
            console.error("\x1b[1m\x1b[31m%s\x1b[0m", "Cannot get the IP if this user");
            return null;
        }
    },

    /**
     * @description Check if the given IP is blacklisted. An IP is blacklisted when it reaches a defined amount of failed login attempts
     * @param { String } ip The IP obtained from the getIp() method
     * @returns { Boolean } Return true if the user has to be blocked, otherwise return false
     */
    isBlacklisted(ip) {
        if (typeof ip === "string") return this.failedAttempts[ip] >= 10;
        else return false;
    },

    getSid(cookies) {
        const sid = /(?<=sid=)[^(;|^)]+/.exec(cookies);
        return sid ? sid[0] : null;
    },

    /**
     * @description Check if the SID is defined in the cookies
     * @param { String } cookies The cookies from the request headers
     * @returns { (Object | null) } If defined return the SID, otherwise return null
     */
    checkSession(cookies) {
        const sid = this.getSid(cookies);
        if (sid && this.sessions[sid]) 
            return this.sessions[sid];
        else 
            return null;
    },

    /**
     * @description Create a new user session object and push it into a IMDB
     * @param { http.ServerResponse } res The response object to a HTTP request
     * @param { Object } data Some required data about the user to handle the session
     * @returns { Object } The new session
     */
    newSession(res, data) {
        const sid = Math.random().toString(36).substring(2);
        res.setHeader("Set-Cookie", `sid=${sid}; HttpOnly`);
        this.sessions[sid] = data;
        return this.sessions[sid];
    }
};