"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapPromiseAsync2m = exports.wrapPromiseAsync1m = exports.wrapPromiseAsync3 = exports.wrapPromiseAsync2 = exports.wrapPromiseAsync1 = exports.wrapPromiseAsync0 = void 0;
var Future = require('fibers/future');
/**
 * Convert an asynchronous function that returns a promise to use node-style callbacks
 *
 * @param promiseFunction       The function to wrap. Must have no arguments, and return a promise.
 * @param context The context to run the function on.
 */
function wrapPromise0(promiseFunction, context) {
    return function (callback) {
        // console.log('Executing promise function 0');
        promiseFunction.apply(context).then(function (value) { return callback(null, value); }, function (reason) { return callback(reason, null); });
    };
}
/**
 * Convert an asynchronous function that returns a promise into a synchronous function,
 * using Futures.
 *
 * @param promiseFunction The function to wrap. Must have no arguments, and return a promise.
 * @param context         The context to run a function on.
 */
function wrapPromiseAsync0(promiseFunction, context) {
    var cbFunction = wrapPromise0(promiseFunction, context);
    var futureFunction = Future.wrap(cbFunction);
    var simpleFunction = function () { return Future.task(function () { return futureFunction().wait(); }).wait(); };
    return simpleFunction;
}
exports.wrapPromiseAsync0 = wrapPromiseAsync0;
/**
 * Convert an asynchronous function that returns a promise to use node-style callbacks
 *
 * @param promiseFunction The function to convert. Must have one argument, and return a promise.
 * @param context         The context to run the function on.
 */
function wrapPromise1(promiseFunction, context) {
    return function (data, callback) {
        // console.log('Executing promise function 1, data:', data, 'callback:', callback);
        // console.trace();
        promiseFunction.apply(context, [data]).then(function (value) { return callback(null, value); }, function (reason) { return callback(reason, null); });
    };
}
/**
 * Convert an asynchronous function that returns a promise to a synchronous function
 *
 * @param promiseFunction The function to convert. Must have one argument, and return a promise.
 * @param context         The context to run the function on.
 */
function wrapPromiseAsync1(promiseFunction, context) {
    var cbFunction = wrapPromise1(promiseFunction, context);
    var futureFunction = Future.wrap(cbFunction);
    var simpleFunction = function (data) {
        return Future.task(function () { return futureFunction(data).wait(); }).wait();
    };
    return simpleFunction;
}
exports.wrapPromiseAsync1 = wrapPromiseAsync1;
/**
 * Convert an asynchronous function that returns a promise to use node-style callbacks
 *
 * @param promiseFunction The function to convert. Must have two arguments, and return a promise.
 * @param context         The context to run the function on.
 */
function wrapPromise2(promiseFunction, context) {
    return function (data1, data2, callback) {
        promiseFunction.apply(context, [data1, data2]).then(function (value) { return callback(null, value); }, function (reason) { return callback(reason, null); });
    };
}
/**
 * Convert an asynchronous function that returns a promise to a synchronous function
 *
 * @param promiseFunction The function to convert. Must have two arguments, and return a promise.
 * @param context         The context to run the function on.
 */
function wrapPromiseAsync2(promiseFunction, context) {
    var cbFunction = wrapPromise2(promiseFunction, context);
    var futureFunction = Future.wrap(cbFunction);
    var simpleFunction = function (data1, data2) {
        return Future.task(function () { return futureFunction(data1, data2).wait(); }).wait();
    };
    return simpleFunction;
}
exports.wrapPromiseAsync2 = wrapPromiseAsync2;
/**
 * Convert an asynchronous function that returns a promise to use node-style callbacks
 *
 * @param promiseFunction The function to convert. Must have three arguments, and return a promise.
 * @param context         The context to run the function on.
 */
function wrapPromise3(promiseFunction, context) {
    return function (data1, data2, data3, callback) {
        promiseFunction.apply(context, [data1, data2, data3]).then(function (value) { return callback(null, value); }, function (reason) { return callback(reason, null); });
    };
}
/**
 * Convert an asynchronous function that returns a promise to a synchronous function
 *
 * @param promiseFunction The function to convert. Must have three arguments, and return a promise.
 * @param context         The context to run the function on.
 */
function wrapPromiseAsync3(promiseFunction, context) {
    var cbFunction = wrapPromise3(promiseFunction, context);
    var futureFunction = Future.wrap(cbFunction);
    var simpleFunction = function (data1, data2, data3) {
        return Future.task(function () { return futureFunction(data1, data2, data3).wait(); }).wait();
    };
    return simpleFunction;
}
exports.wrapPromiseAsync3 = wrapPromiseAsync3;
function wrapMaybe1(f, defaultValue) {
    return function (data) {
        var realData = data === undefined ? defaultValue : data;
        return f(realData);
    };
}
function wrapPromiseAsync1m(f, defaultValue, context) {
    return wrapMaybe1(wrapPromiseAsync1(f, context), defaultValue);
}
exports.wrapPromiseAsync1m = wrapPromiseAsync1m;
function wrapMaybe2(f, defaultValue) {
    return function (d1, d2) { return f(d1, d2 === undefined ? defaultValue : d2); };
}
function wrapPromiseAsync2m(f, defaultValue, context) {
    return wrapMaybe2(wrapPromiseAsync2(f, context), defaultValue);
}
exports.wrapPromiseAsync2m = wrapPromiseAsync2m;
