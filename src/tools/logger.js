module.exports = {
  /**
  * logger function
  * @param  {integer} chatId   telegram chat id
  * @param  {string} userName  telegram user name
  * @param  {string} text      message text
  * @return {boolean}          log done
  */
  log (chatId, userName, text) {
    console.log(`[${new Date()}] -> Chat: ${chatId}; UserName ${userName} ; Text: ${text}`)
    return true
  },
  /**
   * error logger function
   * @param  {integer} chatId   telegram chat id
   * @param  {string} userName  telegram user name
   * @param  {string} text      message text
   * @param  {string} info      extra information (ussually method)
   */
  logError (chatId, userName, text, info) {
    console.error(`ERROR: [${new Date()}] -> Chat: ${chatId}; UserName ${userName} ; Text: ${text} ; Info: ${info}`)
  }
}
