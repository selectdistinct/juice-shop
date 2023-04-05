/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
//File path constants
const appRoutingFile = "frontend/src/app/app.routing.ts"
const serverFile = "server.ts"
const easterEggFile = "ftp/eastere.gg"
const registerWebsocketEventsFile = "lib/startup/registerWebsocketEvents.ts"
const sidenavComponentFile = "frontend/src/app/sidenav/sidenav.component.html"

// https://oinam.github.io/entities/
const singleQuote = String.fromCharCode(39);
const singleBackQuote = String.fromCharCode(96);
const doubleQuote = String.fromCharCode(34);
import fs = require('fs')

customizeAdminSectionChallenge()
customizeEasterEggChallenge()
customizeDomXssChallenge()

function customizeAdminSectionChallenge(){
  replaceStringInFile(appRoutingFile,stringWithinQuotes('administration'), stringWithinQuotes('administration'+ randomInt(1000)))
}

function customizeEasterEggChallenge(){
  let easterEggURL='/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg';
  let encodedEasterEggURL='L2d1ci9xcmlmL25lci9mYi9zaGFhbC9ndXJsL3V2cS9uYS9ybmZncmUvcnR0L2p2Z3V2YS9ndXIvcm5mZ3JlL3J0dA==';
  let customizedEasterEggURL='/the/student/is/so/funny/he/modified/the/easter/egg/within/the/easter/egg/'+ randomInt(999);
  let encodedCustomizedEasterEggURL = encodeBase85(caesarCipher(customizedEasterEggURL,13))
  replaceStringInFile(serverFile, stringWithinQuotes(easterEggURL),stringWithinQuotes(customizedEasterEggURL))
  replaceStringInFile(easterEggFile, encodedEasterEggURL,encodedCustomizedEasterEggURL)
}

function customizeDomXssChallenge(){
  // '<iframe src="javascript:alert(`xss`)">'
  replaceStringInFile(registerWebsocketEventsFile,stringWithinBackQuotes('xss'), stringWithinBackQuotes('xss'+ randomInt(999)))
  let randomNumber = randomInt(999)
  replaceStringInFile(appRoutingFile,stringWithinQuotes('score-board'), stringWithinQuotes('score-board' + randomNumber))
  replaceStringInFile(sidenavComponentFile,stringWithinDoubleQuotes("/score-board"), stringWithinDoubleQuotes("/score-board" + randomNumber))
}

function replaceStringInFile(filepath: string, searchValue: string, replaceValue : string){
  let regEx = new RegExp(searchValue,"g")
  fs.readFile(filepath, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    let result = data.replace(regEx, replaceValue);
    fs.writeFile(filepath, result, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
}

function stringWithinQuotes(value: String){
  return singleQuote + value + singleQuote;
}

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function encodeBase85(value: String) {
  let b, c, d, e, f, g, h, i, j, k;
  // @ts-ignore
  for (!/[^\x00-\xFF]/.test(value), b = "\x00\x00\x00\x00".slice(value.length % 4 || 4), value += b,
    c = [], d = 0, e = value.length; e > d; d += 4) f = (value.charCodeAt(d) << 24) + (value.charCodeAt(d + 1) << 16) + (value.charCodeAt(d + 2) << 8) + value.charCodeAt(d + 3),
    0 !== f ? (k = f % 85, f = (f - k) / 85, j = f % 85, f = (f - j) / 85, i = f % 85,
      f = (f - i) / 85, h = f % 85, f = (f - h) / 85, g = f % 85, c.push(g + 33, h + 33, i + 33, j + 33, k + 33)) :c.push(122);
  return function(a, b) {
    for (var c = b; c > 0; c--) a.pop();
  }(c, b.length),  String.fromCharCode.apply(String, c);
}

function caesarCipher(x: string, y: number) {
  let result = "";
  for (let i = 0; i < x.length; i++) {
    let charCode = x.charCodeAt(i);
    let shiftedCharCode = charCode + y;
    if (charCode >= 65 && charCode <= 90) {
      if (shiftedCharCode > 90) {
        shiftedCharCode = 64 + (shiftedCharCode - 90);
      }
      result += String.fromCharCode(shiftedCharCode);
    } else if (charCode >= 97 && charCode <= 122) {
      if (shiftedCharCode > 122) {
        shiftedCharCode = 96 + (shiftedCharCode - 122);
      }
      result += String.fromCharCode(shiftedCharCode);
    } else {
      result += x.charAt(i);
    }
  }
  return result;
}

function stringWithinBackQuotes(value: String){
  return singleBackQuote + value + singleBackQuote;
}

function stringWithinDoubleQuotes(value: String){
  return  doubleQuote + value + doubleQuote;
}

