// ABOUT:
//   When a startup submits their details on our site, share it with the
//   submissions channel on Telegram.
// SETUP INSTRUCTIONS:
// 1. Create a Config table in Airtable with these fields:
//    - Key (Single line text)
//    - Value (Single line text)
//
// 2. Add these records to Config table:
//    - TELEGRAM_BOT_TOKEN         : Your bot token from @BotFather
//    - TELEGRAM_CHAT_ID          : Your channel/group ID (e.g., -1001234567890)
//    - TELEGRAM_SUBMISSIONS_THREAD_ID : Your thread ID for submissions
//
// INPUT VARIABLES REQUIRED:
// This automation expects these variables in input.config():
//    - Name (text): Name of the submitter
//    - Pitch (text): The pitch/submission content 
//    - Link (text): URL or reference link
//    - ReferrerID (text, optional): Telegram user ID of referrer
//    - ReferrerName (text, optional): Telegram username of referrer

// First, get config values
let configTable = base.getTable('Config');
let configQuery = await configTable.selectRecordsAsync();
let configRecords = configQuery.records;

// Create a config object from the results
let config = {};
for (let record of configRecords) {
    config[record.getCellValue('Key')] = record.getCellValue('Value');
}

// Your main automation code
let form = input.config();

let url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`;
let message = "<b>" + form.Name + "</b>\n"
    + "<i>" + form.Pitch + "</i>";

if (form.ReferrerID?.toString().trim()) {
    message += "\n\nReferred by <a href='tg://user?id=" + form.ReferrerID + "'>@" + form.ReferrerName + "</a>";
}

message += "\n\n" + form.Link;

let response = await fetch(url, 
    {
        method: 'POST', 
        body: JSON.stringify({
            text: message, 
            parse_mode: "HTML", 
            chat_id: config.TELEGRAM_CHAT_ID, 
            message_thread_id: config.TELEGRAM_SUBMISSIONS_THREAD_ID
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    }
);
console.log(await response.text());