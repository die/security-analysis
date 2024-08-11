const GUILD = '343704644712923138'
const MOD_PARSE_HISTORY = '777323038559436841'
const VERI_PENDING = '471711541465579521'
const VERI_PENDING_VETERANS = '556936182974644262'
const RECEPTION = '634484425911959572'
const MOD_MAIL_REVIEW = '525683068745547776'
const MOD_LOGS = '362714467257286656'
const MOD_BOT_COMMANDS = '464829705728819220'
const BOTTO_SLIME = '1206302876985458768'

function run() {

  // date logic
  const now = new Date()
  const startWeek = new Date(now)
  startWeek.setDate(now.getDate() - now.getDay())
  startWeek.setHours(0, 0, 0, 0)

  // start of the previous week (sunday midnight)
  const startPreviousWeek = new Date(startWeek);
  startPreviousWeek.setDate(startPreviousWeek.getDate() - 7);

  const endPreviousWeek = new Date(startPreviousWeek);
  endPreviousWeek.setDate(startPreviousWeek.getDate() + 6); // move forward to Saturday
  endPreviousWeek.setHours(23, 59, 59, 999);
  
  const startSnowflake = timestampToSnowflakeId(startPreviousWeek)
  const endSnowflake = timestampToSnowflakeId(endPreviousWeek)

  // query for mod-parse-history
  let data = queryMessages(GUILD, MOD_PARSE_HISTORY, timestampToSnowflakeId(now), startSnowflake, null, BOTTO_SLIME)

  // get csv
  const csv = UrlFetchApp.fetch(data.messages[0]?.[0]?.attachments[0]?.url).getContentText().trim().split('\n')

  // maybe do smth with this
  const headers = csv.shift()

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Automation")

  for (let i = 0; i < csv.length; i++) {
    const line = csv[i]
    const start = Date.now()
    
    Logger.log(line)
    const arr = line.split(',')
    const id = arr[0]
    // use primary ign if theres an alt
    const nick = arr[1].split(' | ')[0].replace(/[^a-zA-Z]/g, '')
    const total = arr[2]
    
    ////////////////////////////////
    /// parse through channels
    ////////////////////////////////

    data = queryMessages(GUILD, VERI_PENDING, endSnowflake, startSnowflake, nick, BOTTO_SLIME)
    const totalVeris = data?.total_results || 0
    Logger.log('Finished veri pending')

    data = queryMessages(GUILD, VERI_PENDING_VETERANS, endSnowflake, startSnowflake, nick, BOTTO_SLIME)
    const totalVetVeris = data?.total_results || 0
    Logger.log('Finished vet veri pending')

    data = queryMessages(GUILD, RECEPTION, endSnowflake, startSnowflake, null, id)
    const totalReception = data?.total_results || 0
    Logger.log('Finished reception')

    data = queryMessages(GUILD, MOD_MAIL_REVIEW, endSnowflake, startSnowflake, `Response by ${nick}`, BOTTO_SLIME)
    const totalModmailResponds = data?.total_results || 0
    Logger.log('Finished modmail')

    data = queryMessages(GUILD, MOD_LOGS, endSnowflake, startSnowflake, id, BOTTO_SLIME)
    const sentByBot = data?.total_results || 0
    Logger.log('Finished bot logs')
    data = queryMessages(GUILD, MOD_LOGS, endSnowflake, startSnowflake, null, id)
    const sentByUser = data?.total_results || 0
    Logger.log('Finished user logs')
    const totalModLogs = sentByBot + sentByUser

    data = queryMessages(GUILD, MOD_BOT_COMMANDS, endSnowflake, startSnowflake, null, id)
    const totalModBotCommands = data?.total_results || 0
    Logger.log('Finished mod bot commands')

    const end = Date.now();
    Logger.log(`Took ${end - start} ms to run`)
    const results = [
        [nick], 
        [total], 
        [totalVeris], 
        [totalVetVeris], 
        [totalReception], 
        [totalModmailResponds], 
        [totalModLogs], 
        [totalModBotCommands]
      ];
    const range = sheet.getRange(1, i + 1, results.length, 1);
    range.setValues(results);
  }
}


function queryMessages(guild, channel, max, min, content, author) {
  // arbitrary
  Utilities.sleep(2000)

  const options = {
    method: 'get',
    muteHttpExceptions: true,
    headers: {
      'Authorization': 'insert here',
      'Content-Type': 'application/json'
    }
  }

  let url = `https://discord.com/api/v9/guilds/${guild}/messages/search?channel_id=${channel}&max_id=${max}&min_id=${min}`

  if (content) url += `&content=${content}`
  if (author) url += `&author_id=${author}`

  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  if (data.message) {
    const retry = parseFloat(data.retry_after) * 1000.00
    Logger.log(`Rate limited, retrying to query for ${channel} in ${retry} ms`)
    Utilities.sleep(retry)
    return queryMessages(guild, channel, max, min, content, author)
  } else {
    return data;
  }
}

function timestampToSnowflakeId(timestamp) {
  const DISCORD_EPOCH = BigInt(1420070400000)
  const timestampMs = BigInt(new Date(timestamp).getTime())
  const snowflakeId = (timestampMs - DISCORD_EPOCH) << BigInt(22)

  return snowflakeId.toString();
}
