
const TelegramBot = require('node-telegram-bot-api')
const {log, logError} = require('./tools/logger')
require('dotenv').config({path: '../.env'})
let users = require('../trustedUsers.json')
console.log(new Date())
console.log('>> CREZERBERO is working ...')

const token = process.env.BOT_ACCESS_TOKEN // bot access token

const bot = new TelegramBot(token, {polling: true}) // creating new telegram bot

const authorizedChatId = []
const trustPassword = process.env.BOT_PASSWORD
/*
from schema:
  from:  { id: 396002206,
    is_bot: false,
    first_name: 'charles',
    last_name: 'silva',
    language_code: 'es-US' }
 */

/**
 * add new trusted user
 * @param {Object} from [description]
 */
function addTrustedUser ({id, is_bot = true, first_name, last_name}) {
  if (!is_bot) {
    if (users.trustedPeople.indexOf(id) < 0) {
      // trustedPeople is saving users id's
      users.trustedPeople.push(id)
      users.names.push({
        id,
        first_name,
        last_name
      })
      return true
    }
  } else {
    return false
  }
}

function isTrusted (id) {
  return (users.trustedPeople.indexOf(id) >= 0)
}

/**
 * Show 'Abrir' button
 * @param  {integer} chatId telegram chat id
 * @return {boolean}        message shown
 */
async function showOpenDoorButton (chatId) {
  try {
    await bot.sendMessage(chatId, 'Presiona el boton o escribe "/Alohomora" para abrir la puerta', { // show 'Abrir' button
      'reply_markup': {
        'keyboard': [['/Alohomora']]
      }
    })
    return true
  } catch (error) {
    throw new Error('Coldn´t be able to show OpenDoor message ', error)
  }
}

/**
 * Show wellcome message and 'Abrir' button
 * @param  {integer} chatId telegram chat id
 * @param  {string} msg     telegram message object
 * @return {boolean}        message shown
 */
async function showWelcomeMessage (chatId, msg) {
  try {
    await bot.sendMessage(
      chatId,
      `<b>Bienvenido ${msg.from.first_name}!</b>\n Ya puedes escribir <code> /alohomora </code> o presionar el boton para abrir la puerta`,
      {
        parse_mode: 'HTML',
        'reply_markup': {
          'keyboard': [['/Alohomora']]
        }
      }
    )
    return true
  } catch (error) {
    throw new Error('Coldn´t be able to show welcome message', error)
  }
}

/**
 * Show allowed message and 'Abrir' button
 * @param  {integer} chatId telegram chat id
 * @param  {string} msg     telegram message object
 * @return {boolean}        message shown
 */
async function showAllowedMessage (chatId, msg) {
  try {
    await bot.sendMessage(
      chatId,
      `<b>Hola ${msg.from.first_name}!</b>\n Tu ya puedes escribir <code> /alohomora </code> o presionar el boton para abrir la puerta`,
      {
        parse_mode: 'HTML',
        'reply_markup': {
          'keyboard': [['/Alohomora']]
        }
      }
    ).catch((error) => {
      console.error('ERROR: ', error)
    })
  } catch (error) {
    throw new Error('Coldn´t be able to show allowed message ', error)
  }
}

// on start
bot.onText(/^\/start/i, async (msg) => {
  try {
    const chatId = msg.chat.id
    log(chatId, msg.from, msg.text)
    await bot.sendPhoto(msg.chat.id, 'http://gph.is/1sFc0d1', {caption: `Hola ${msg.from.first_name}! bienvenido a creze!`})
    if (authorizedChatId.indexOf(chatId) < 0) { // check if chat is not a trusted chat
      await bot.sendMessage(chatId, 'Parece que aun no tienes autorizacion para entrar, que te parece si me das la contraseña?')
      await bot.sendMessage(chatId, 'debes escribir algo asi:\n/password PonAquiLaContraseña ') // request password
    } else if (authorizedChatId.indexOf(chatId) >= 0) { // check if chat is a trusted chat
      await showOpenDoorButton(chatId) // show 'Abrir' button
    } else {
      logError(chatId, msg.from, msg.text, 'On start method')
      await bot.sendMessage(chatId, new Error('On start error')) // Error message
    }
  } catch (error) {
    console.error(new Error('Couldn´t execute /start ', error))
  }
})

// validate password
bot.onText(/^\/*password/i, async (msg) => {
  try {
    const chatId = msg.chat.id
    log(chatId, msg.from, '/password attempt')
    const pass = msg.text.replace(/^\/password/i, '').trim()
    if (pass === trustPassword) {
      if (!isTrusted(msg.from.id)) {
        addTrustedUser(msg.from)
        await showWelcomeMessage(chatId, msg)
      } else {
        await showAllowedMessage(chatId, msg)
      }
    } else if (!isTrusted(msg.from.id)) {
      await bot.sendMessage(chatId, 'Password invalido.')
      await bot.sendMessage(chatId, 'Intenta de nuevo.')
    } else {
      await showAllowedMessage(chatId, msg)
    }
  } catch (error) {
    console.error(new Error('Couldn´t execute /password', error))
  }
})

// 'alohomora' command
bot.onText(/^\/*alohomora/i, async (msg) => {
  try {
    const chatId = msg.chat.id
    if (isTrusted(msg.from.id)) {
      await bot.sendPhoto(msg.chat.id, 'http://gph.is/1sFc0d1', {caption: `Hola ${msg.from.first_name}! bienvenido a creze!`})
      // @TODO: open door logic here
      await showOpenDoorButton(chatId)
    } else {
      await bot.sendMessage(chatId, 'Parece que aun no tienes autorizacion para entrar, que te parece si me das la contraseña?')
      await bot.sendMessage(chatId, 'debes escribir algo asi:\n/password PonAquiLaContraseña ') // request password
    }
  } catch (error) {
    console.error(new Error('Couldn´t execute /alohomora', error))
  }
})
