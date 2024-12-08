/*
PURPOSE:
This script handles the workflow when a startup submits their details through our website:
1. Takes the submission details from Airtable (where website form data is stored)
2. Formats and posts the submission to our Telegram submissions channel
3. Saves the Telegram message ID back to the Airtable record for reference

WORKFLOW:
1. Startup fills out submission form on website
2. Form data is saved to Airtable
3. This automation runs to post the submission to Telegram
4. Message ID is saved back to the original Airtable record

The script requires a Config table in Airtable with bot token and channel details.
The submission channel uses Telegram Topics for better organization.
*/

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
//    - recordId (text): The Airtable record ID to update
//    - name (text): Name of the submitter
//    - pitch (text): The pitch/submission content 
//    - link (text): URL or reference link
//    - referrerId (text, optional): Telegram user ID of referrer
//    - referrerName (text, optional): Telegram username of referrer

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
let message = "<b>" + form.name + "</b>\n"
    + "<i>" + form.pitch + "</i>";

if (form.referrerId?.toString().trim()) {
    message += "\n\nReferred by <a href='tg://user?id=" + form.referrerId + "'>@" + form.referrerName + "</a>";
}

message += "\n\n" + form.link;

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

// Parse the response
let responseData = await response.json();

// Check if the message was sent successfully
if (responseData.ok) {
    // Get the message ID
    let messageId = responseData.result.message_id;
    
    // Update the existing record with just the message ID
    let submissionsTable = base.getTable('Submissions');
    await submissionsTable.updateRecordAsync(form.recordId, {
        'Telegram message ID': messageId.toString()
    });
    
    console.log('Message sent successfully. Message ID:', messageId);
} else {
    console.error('Failed to send message:', responseData);
    throw new Error('Failed to send Telegram message');
}