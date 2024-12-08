/*
PURPOSE:
This script handles the workflow when a member is approved to join our group:
1. Takes the member details from Airtable (where member form data is stored)
2. Formats and posts the member to our Telegram member directory channel

WORKFLOW:
1. Member fills out a private member signup form
2. Form data is saved to Airtable
3. This automation runs to post the member details to Telegram

The script requires a Config table in Airtable with bot token and channel details.
The member directory channel uses Telegram Topics for better organization.
*/

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
//    - name (text): Member's full name
//    - profile (url): Link to member's profile
//    - company (text): Company name
//    - city (text): City of residence
//    - country (text): Country of residence
//    - investments (text): Investment history/portfolio
//    - since (text): Year started investing
//    - amount (text): Investment amount range per startup
//    - times (text): Number of investments per year
//    - areas (text): Investment focus areas
//    - skills (text): Expertise areas
//    - learn (text): Areas of interest for learning

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
let message = "<a href='" + form.profile + "'>" + form.name + "</a>\n" 
    + "" + form.company + "\n\n"
    + "- Location: " + form.city + ", " + form.country + "\n"
    + "- Investments: " + form.investments + "\n"
    + "- Investor since: " + form.since + "\n"
    + "- Amount per startup: " + form.amount + "\n"
    + "- Times per year: " + form.times + "\n"
    + "- Areas to invest: " + form.areas + "\n"
    + "- Skills: " + form.skills + "\n "
    + "- Looking to learn: " + form.learn + "\n ";

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