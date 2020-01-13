"use strict";

/**
 * @author Louis Wicket
 */

const sanitizationRules = {
    "username"    : {
        "minLength" : 3,
        "maxLength" : 20,
        "regex"     : /^\w+$/
    },
    "email"       : {
        "minLength" : 6,
        "maxLength" : 100,
        "regex"     : /^[A-Z0-9](\.?[A-Z0-9])+@[A-Z0-9](\.?[A-Z0-9])+\.[A-Z]{2,4}$/i
    },
    "password"    : {
        "minLength" : 6,
        "maxLength" : 30,
        "regex"     : null
    }
};

/**
 * @description Sanitize data according to pre-defined rules
 * @param { String } type Type of data to sanitize
 * @param { String } v Variable to sanitize
 * @returns { (String | Error) } Return the sanitized variable or return an error if the provided variable isn't valid
 */
exports.sanitize = (type, v) => {
    const { minLength, maxLength, regex } = sanitizationRules[type];
    if (typeof v !== "string") return new TypeError(type + " should be typeof String");
    v = v.trim();
    const length = v.length;
    if (length < minLength && length > maxLength) return new RangeError();
    if (regex !== null) return regex.test(v) ? v : new SyntaxError();
    else return v;
};