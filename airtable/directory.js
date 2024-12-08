// ABOUT:
//   When a new member is approved, share their details in the 
//   member directory channel on Telegram.
// SETUP INSTRUCTIONS:
// 1. Create a Config table in Airtable with these fields:
//    - Key (Single line text)
//    - Value (Single line text)
//
// 2. Add these records to Config table:
//    - TELEGRAM_BOT_TOKEN         : Your bot token from @BotFather
//    - TELEGRAM_CHAT_ID          : Your channel/group ID (e.g., -1001234567890)
//    - TELEGRAM_DIRECTORY_THREAD_ID : Your thread ID for member directory
//
// INPUT VARIABLES REQUIRED:
// This automation expects these variables in input.config():
//    - Name (text): Member's full name
//    - Profile (url): Link to member's profile
//    - Company (text): Company name
//    - City (text): City of residence
//    - Country (text): Country of residence
//    - Investments (text): Investment history/portfolio
//    - Since (text): Year started investing
//    - Amount (text): Investment amount range per startup
//    - Times (text): Number of investments per year
//    - Areas (text): Investment focus areas
//    - Skills (text): Expertise areas
//    - Learn (text): Areas of interest for learning

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
let message = "<a href='" + form.Profile + "'>" + form.Name + "</a>\n" 
    + "" + form.Company + "\n\n"
    + "- Location: " + form.City + ", " + form.Country + "\n"
    + "- Investments: " + form.Investments + "\n"
    + "- Investor since: " + form.Since + "\n"
    + "- Amount per startup: " + form.Amount + "\n"
    + "- Times per year: " + form.Times + "\n"
    + "- Areas to invest: " + form.Areas + "\n"
    + "- Skills: " + form.Skills + "\n "
    + "- Looking to learn: " + form.Learn + "\n ";

let response = await fetch(url, 
    {
        method: 'POST', 
        body: JSON.stringify({
            text: message, 
            parse_mode: "HTML", 
            chat_id: config.TELEGRAM_CHAT_ID, 
            message_thread_id: config.TELEGRAM_DIRECTORY_THREAD_ID
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    }
);
console.log(await response.text());