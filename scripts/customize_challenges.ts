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
const challengesYamlFile = "data/static/challenges.yml"
const privacyPolicyComponentFile = "frontend/src/app/privacy-policy/privacy-policy.component.html"
const fileUploadFile = "routes/fileUpload.ts"
const verifyFile = "routes/verify.ts"

// https://oinam.github.io/entities/
const singleQuote = String.fromCharCode(39);
const singleBackQuote = String.fromCharCode(96);
const doubleQuote = String.fromCharCode(34);
import fs = require('fs')
import * as fsPromise from 'fs/promises';

customizeAdminSectionChallenge()
customizeEasterEggChallenge()
customizeDomXssChallenge()
customizePrivacyPolicyInspectionChallenge()
customizeXXEDataAccessChallenge()

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
  let randomNumber1 = randomInt(999)
  let randomNumber2 = randomInt(999)
  let challengeDescription = 'Perform a <i>DOM</i> XSS attack with <code>&lt;iframe src="javascript:alert\\(' + stringWithinBackQuotes('xss')+'\\)"&gt;</code>.'
  let challengeDescriptionWithRandomNumber = 'Perform a <i>DOM</i> XSS attack with <code>&lt;iframe src="javascript:alert(`xss'+ randomNumber2 + '`)"&gt;</code>.'

  replaceStringInFile(appRoutingFile, stringWithinQuotes('score-board'), stringWithinQuotes('score-board' + randomNumber1))
  replaceStringInFile(sidenavComponentFile, stringWithinDoubleQuotes("/score-board"), stringWithinDoubleQuotes("/score-board" + randomNumber1))

  replaceStringInFile(registerWebsocketEventsFile, stringWithinBackQuotes('xss'), stringWithinBackQuotes('xss'+ randomNumber2))
  replaceStringInFile(challengesYamlFile, challengeDescription, challengeDescriptionWithRandomNumber)
}

function customizePrivacyPolicyInspectionChallenge(){
  let randomNumber = randomInt(99)
  let newParagraph = '<p>For further legal information of collectiong your data, please have a look at article ' +
    '<span class="hot">'+ randomNumber +'</span>of the DSGVO at the <a href="https://dsgvo-gesetz.de/" aria-label="Link to the DSGVO">DSGVO website</a> </p> </section>'
  let privacyPolicyLink = '/we/may/also/instruct/you/to/refuse/all/reasonably/necessary/responsibility'
  if(!fileContainsString(privacyPolicyComponentFile, "DSGVO")){
    replaceStringInFile(privacyPolicyComponentFile, '\<\/section\>',newParagraph)
    replaceStringInFile(serverFile, stringWithinQuotes(privacyPolicyLink), stringWithinQuotes(privacyPolicyLink + '/' + randomNumber))
  }
}

async function customizeXXEDataAccessChallenge(){
  let randomNumber = randomInt(9999)
  let challengeUtilString = 'challengeUtils.solveIf\\(challenges.xxeFileDisclosureChallenge'

  //delete the current solve logic for the challenge
  if(!fileContainsString(fileUploadFile,'\/\/'+ challengeUtilString)) {
    await replaceStringInFile(fileUploadFile, challengeUtilString, '\/\/' + challengeUtilString)
  }

  //add a new solving logic to the verify.ts file
  let dlpPastebinChallengeRegexCode ='notSolved\\(challenges.dlpPastebinDataLeakChallenge\\)\\) '
    +'{\r\n    dlpPastebinDataLeakChallenge\\(\\)\r\n  }'
  let dlpPastebinChallengeReplacementCode ='notSolved\(challenges.dlpPastebinDataLeakChallenge\)\) ' +
    '{\r\n    dlpPastebinDataLeakChallenge\(\)\r\n  }'
  let xxeFileDisclosureChallengeCode='\r\n  if \(challengeUtils.notSolved\(challenges.xxeFileDisclosureChallenge\)\) ' +
    '{\r\n    xxeFileDisclosureChallenge\(\)\r\n  }'

  if (!fileContainsString(verifyFile,'notSolved\(challenges.xxeFileDisclosureChallenge\)')){
    await replaceStringInFile(verifyFile, dlpPastebinChallengeRegexCode,dlpPastebinChallengeReplacementCode + xxeFileDisclosureChallengeCode)
  }

  let newFileDisclosureChallengeFunction = 'function xxeFileDisclosureChallenge \(\) {\n' +
    '  FeedbackModel.findAndCountAll\({ where: { comment: { [Op.like]: \'%' + randomNumber + '%\' } } }\n' +
    '  \).then\(\({ count }: { count: number }\) => {\n' +
    '    if \(count > 0\) {\n' +
    '      challengeUtils.solve\(challenges.xxeFileDisclosureChallenge\)\n' +
    '    }\n' +
    '  }\).catch\(\(\) => {\n' +
    '    throw new Error\(\'Unable to get data for known vulnerabilities. Please try again\'\)\n' +
    '  })\n' +
    '  ComplaintModel.findAndCountAll\({ where: { message: { [Op.like]: \'%' + randomNumber + '%\' } } }\n' +
    '  \).then\(\({ count }: { count: number }\) => {\n' +
    '    if \(count > 0\) {\n' +
    '      challengeUtils.solve\(challenges.xxeFileDisclosureChallenge\)\n' +
    '    }\n' +
    '  }\).catch\(\(\) => {\n' +
    '    throw new Error\(\'Unable to get data for known vulnerabilities. Please try again\'\)\n' +
    '  }\)\n' +
    '}\n\n' +
    'function changeProductChallenge'

  if(!fileContainsString(verifyFile,'function xxeFileDisclosureChallenge')){
    await replaceStringInFile(verifyFile,'function changeProductChallenge', newFileDisclosureChallengeFunction)
    //create a new file where a password has to be extracted from
    createFolderAndFile('scripts','password.txt','Password: \'' + randomNumber + '\'')
  }

  //update the challenge description
  let oldDescription = '<code>C:\\\\Windows\\\\system\\.ini</code> or <code>/etc/passwd</code> from the server\\.'
  let newDescription = '<code>' + __dirname + '\\password.txt'+'</code> from the server and send us the password in the feedback or complaint Form.'
  await replaceStringInFile(challengesYamlFile, oldDescription, newDescription)
}

async function replaceStringInFile(filePath: string, searchValue: string, replaceValue : string){
  const regEx = new RegExp(searchValue,"g");
  try {
    const data = await fsPromise.readFile(filePath, 'utf8');
    const result = data.replace(regEx, replaceValue);
    await fsPromise.writeFile(filePath, result, 'utf8');
  } catch (err) {
    console.log(err);
  }
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

function fileContainsString(filePath: string, searchValue: string): boolean {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    return fileContents.includes(searchValue);
  } catch (error) {
    console.error(`Error reading file: ${error}`);
    return false;
  }
}

function createFolderAndFile(folderPath: string, fileName: string, fileContent: string) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
  const filePath = `${folderPath}/${fileName}`;
  fs.writeFileSync(filePath, fileContent, 'utf8');
}
