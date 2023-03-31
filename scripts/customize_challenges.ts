/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
//File path constants
const appRoutingFile = "frontend/src/app/app.routing.ts"
const singleQuote = String.fromCharCode(39);

import fs = require('fs')

customizeAdminSectionChallenge()

function customizeAdminSectionChallenge(){
  replaceStringInFile(appRoutingFile,stringWithinQuotes('administration'), stringWithinQuotes('administration'+ getRandomInt(1000)))
}

function replaceStringInFile(filepath: string, searchValue: string, replaceValue : string){
  let regEx = new RegExp(searchValue,"g")
  fs.readFile(filepath, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    let result = data.replace(regEx, replaceValue);
    fs.writeFile(appRoutingFile, result, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
}

function stringWithinQuotes(value: String){
  return singleQuote + value + singleQuote;
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}


