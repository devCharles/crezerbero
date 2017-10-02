
const TelegramBot = require('node-telegram-bot-api')
const {log, logError} = require('./tools/logger')
require('dotenv').config()
let users = require('../trustedUsers.json')
let device = require('../deviceStatus.json')
device.turnedOn = new Date()
console.log(device.turnedOn)

console.log('>> CREZERBERO is working ...')
const bot = new TelegramBot(process.env.BOT_ACCESS_TOKEN, {polling: true}) // creating new telegram bot

const trustPassword = process.env.BOT_PASSWORD
const adminPassword = process.env.ADMIN_BOT_PASSWORD

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

function addTrustedAdmin ({id, is_bot = true, first_name, last_name}) {
  if (!is_bot) {
    if (users.trustedAdmins.indexOf(id) < 0) {
      // trustedPeople is saving users id's
      users.trustedAdmins.push(id)
      users.adminNames.push({
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

function isAdmin (id) {
  return (users.trustedAdmins.indexOf(id) >= 0)
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
    if (!isTrusted(msg.from.id)) { // check if chat is not a trusted chat
      await bot.sendMessage(chatId, 'Parece que aun no tienes autorizacion para entrar, que te parece si me das la contraseña?')
      await bot.sendMessage(chatId, 'debes escribir algo asi:\n/password PonAquiLaContraseña ') // request password
    } else if (isTrusted(msg.from.id)) { // check if chat is a trusted chat
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
bot.onText(/^\/password/i, async (msg) => {
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
    log(chatId, msg.from, msg.text)
    if (isTrusted(msg.from.id) && device.isActivated) {
      await bot.sendPhoto(msg.chat.id, 'http://gph.is/1sFc0d1', {caption: `Hola ${msg.from.first_name}! bienvenido a creze!`})
      // @TODO: open door logic here
      await showOpenDoorButton(chatId)
    } else if (!device.isActivated) {
      await bot.sendMessage(chatId, 'Parece que el bot esta desactivado por ahora, pidele a un administrador que lo active o espera a que alguien abra la puerta')
    } else {
      await bot.sendMessage(chatId, 'Parece que aun no tienes autorizacion para entrar, que te parece si me das la contraseña?')
      await bot.sendMessage(chatId, 'debes escribir algo asi:\n/password PonAquiLaContraseña ') // request password
    }
  } catch (error) {
    console.error(new Error('Couldn´t execute /alohomora', error))
  }
})

bot.onText(/^\/becomeAdmin/i, async (msg) => {
  try {
    const chatId = msg.chat.id
    log(chatId, msg.from, 'becomeAdmin attempt')
    const pass = msg.text.replace(/^\/becomeAdmin/i, '').trim()
    if (pass === adminPassword && !isAdmin(msg.from.id)) {
      addTrustedAdmin(msg.from)
      await bot.sendMessage(chatId, `Felicidades ${msg.from.first_name} ahora eres admin`)
    } else if (isAdmin(msg.from.id)) {
      await bot.sendMessage(chatId, `Hola ${msg.from.first_name} tu ya eres admin`)
    } else {
      await bot.sendMessage(chatId, `Lo siento ${msg.from.first_name} password incorrecto, intenta de nuevo`)
    }
  } catch (error) {
    console.error(new Error('Couldn´t execute /becomeAdmin', error))
  }
})

// list users [ADMIN]
bot.onText(/^\/*listUsers/i, async (msg) => {
  try {
    const chatId = msg.chat.id
    log(chatId, msg.from, msg.text + '[ADMIN]')
    if (isAdmin(msg.from.id)) {
      await bot.sendMessage(chatId, `${msg.from.first_name} esta es la lista de usuarios y administradores:`)
      let usersReport = ''
      await users.names.forEach((user) => {
        usersReport += '---\n'
        usersReport += `id: ${user.id}\n`
        usersReport += `name: ${user.first_name} ${user.last_name}\n`
      })
      await bot.sendMessage(chatId, `Users:\n${usersReport}`)
      let adminsReport = ''
      await users.adminNames.forEach((admin) => {
        adminsReport += '---\n'
        adminsReport += `id: ${admin.id}\n`
        adminsReport += `name: ${admin.first_name} ${admin.last_name}\n`
      })
      await bot.sendMessage(chatId, `Admins:\n${adminsReport}`)
    } else {
      await bot.sendMessage(chatId, `${msg.from.first_name} necesitas ser administrador para ejecutar esta tarea, usa el comando:\n/becomeAdmin {password}\npara volverte admin`)
    }
  } catch (error) {
    console.error(new Error('Couldn´t execute /listUsers', error))
  }
})

// turn on device
bot.onText(/\/*turnOn/i, async (msg) => {
  try {
    const chatId = msg.chat.id
    log(chatId, msg.from, msg.text + '[ADMIN]')
    if (isAdmin(msg.from.id)) {
      device.isActivated = true;
      await bot.sendMessage(chatId, `${msg.from.first_name} el dispositivo fue activado`)
    } else {
      await bot.sendMessage(chatId, `${msg.from.first_name} necesitas ser administrador para ejecutar esta tarea, usa el comando:\n/becomeAdmin {password}\npara volverte admin`)
    }
  } catch (error) {
    console.error(new Error('Couldn´t execute /turnOn', error))
  }
})

// turn off device
bot.onText(/\/*turnOff/i, async (msg) => {
  try {
    const chatId = msg.chat.id
    log(chatId, msg.from, msg.text + '[ADMIN]')
    if (isAdmin(msg.from.id)) {
      device.isActivated = false;
      await bot.sendMessage(chatId, `${msg.from.first_name} el dispositivo fue desactivado`)
    } else {
      await bot.sendMessage(chatId, `${msg.from.first_name} necesitas ser administrador para ejecutar esta tarea, usa el comando:\n/becomeAdmin {password}\npara volverte admin`)
    }
  } catch (error) {
    console.error(new Error('Couldn´t execute /turnOn', error))
  }
})
