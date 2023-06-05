#!/usr/bin/env python3
# Copyright (c) 2023, Chemputer, All rights reserved.
# Last Updated: 6/4/2023

import requests
from bs4 import BeautifulSoup
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime
from pytz import timezone

fmt = "%Y-%m-%d %H:%M:%S %Z%z"
now_time = datetime.now(timezone('US/Eastern'))
time_str = now_time.strftime(fmt)

# This function takes a Cloudflare encoded email as input
def decode_cf_email(cf_email):
    # We initialize an empty list to hold the parts of the email
    parts = []
    # We extract the first two hexadecimal digits as integer r
    r = int(cf_email[:2], 16)
    # We loop through the remaining hex digits in pairs
    for i in range(2, len(cf_email), 2):
        # We extract the next two hexadecimal digits as integer char_code
        char_code = int(cf_email[i:i+2], 16) ^ r
        # We append the character represented by char_code to the parts list
        parts.append(chr(char_code))
    # We return the concatenation of all the parts as a decoded email string
    return ''.join(parts)



# Set up Google Sheets API credentials
credentials = ServiceAccountCredentials.from_json_keyfile_name('sa-key.json', ['https://www.googleapis.com/auth/spreadsheets'])

# Authorize the client with the credentials
client = gspread.authorize(credentials)

# Set the spreadsheet ID
spreadsheet_id = '1hPILjBhLC-Ov_3Xnhki4WDtpKdBzbvD6t56b3OzS-Gs'

# Open the Google Sheet by its ID and select the first sheet
sheet = client.open_by_key(spreadsheet_id).sheet1  # Replace 'sheet1' with the name of your worksheet

# Set the URL of the webpage to scrape
url = 'https://warthunder.com/en/community/claninfo/Angels%20Of%20Death'  # Replace with the actual URL of the webpage

# Send a GET request to the URL and store the response
response = requests.get(url)

# Get the content of the response in HTML format
html_content = response.text

# Parse the HTML content with BeautifulSoup
soup = BeautifulSoup(html_content, 'html.parser')

# Find the table using a CSS selector
container = soup.select_one('.squadrons-members__table')

# Extract the individual grid items from the table
grid_items = container.find_all('div', class_='squadrons-members__grid-item')

# Set the headers for the data to be added to the Google Sheet
headers = ['num', 'player', 'rating', 'activity', 'role', 'date']

# Initialize an empty list to hold the rows of data
rows = []

# Initialize an empty list to hold the current row being processed
current_row = []

# Loop through each grid item
for item in grid_items:
    nickname_element = item.select_one('span.__cf_email__')

    # If the grid item contains an email-encrypted nickname, decode it and add it to the current row
    if nickname_element:
        nickname = nickname_element['data-cfemail']
        nickname = decode_cf_email(nickname)
        current_row.append(nickname)
    # If the grid item does not contain an email-encrypted nickname, add its text content to the current row
    else:
        text = item.get_text(strip=True)
        current_row.append(text)

    # If the current row is complete (i.e., its length matches the number of headers), add it to the list of rows and reset the current row
    if len(current_row) == len(headers):
        rows.append(current_row)
        current_row = []

# Clear the existing content in the sheet
sheet.clear()

# Set the range for the data to be added to the sheet
data_range = sheet.range('A1:F{}'.format(len(rows) + 1))  # Adjust the range to start from the first row

# Loop through each row of data
for i in range(len(rows)):
    # Loop through each column of data in the current row
    for j in range(len(rows[i])):
        # Calculate the cell index for the current data point and set its value in the data range
        data_range[i * len(headers) + j].value = rows[i][j]

# Update the sheet with the data range
sheet.update_cells(data_range)

# Freeze the first row
sheet.frozen_rows = 1

sheet.update_cell(1,7, f"Python Script Last Run: {time_str}")
print(f"Data added to Google Sheet on {time_str}.")

