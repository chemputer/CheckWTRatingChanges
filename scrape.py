#!/usr/bin/env python3
# Copyright (c) 2023, Chemputer, All rights reserved.

import requests
from bs4 import BeautifulSoup
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import re
from datetime import datetime
from pytz import timezone

fmt = "%Y-%m-%d %H:%M:%S %Z%z"
now_time = datetime.now(timezone('US/Eastern'))
time_str = now_time.strftime(fmt)

def decode_cf_email(cf_email):
    parts = []
    r = int(cf_email[:2], 16)
    for i in range(2, len(cf_email), 2):
        char_code = int(cf_email[i:i+2], 16) ^ r
        parts.append(chr(char_code))
    return ''.join(parts)


# Set up Google Sheets API credentials
credentials = ServiceAccountCredentials.from_json_keyfile_name('/home/turnerb/repos/scrape_wt/sa-key.json', ['https://www.googleapis.com/auth/spreadsheets'])
client = gspread.authorize(credentials)

spreadsheet_id = '1hPILjBhLC-Ov_3Xnhki4WDtpKdBzbvD6t56b3OzS-Gs'
# Open the Google Sheet by its title
sheet = client.open_by_key(spreadsheet_id).sheet1  # Replace 'sheet1' with the name of your worksheet

url = 'https://warthunder.com/en/community/claninfo/Angels%20Of%20Death'  # Replace with the actual URL of the webpage
response = requests.get(url)
html_content = response.text
#print(html_content)
soup = BeautifulSoup(html_content, 'html.parser')

# Find the table using a CSS selector
container = soup.select_one('.squadrons-members__table')
#print(container)
# Extract the individual grid items
grid_items = container.find_all('div', class_='squadrons-members__grid-item')

# Process and format the data for Google Sheets
headers = ['num', 'player', 'rating', 'activity', 'role', 'date']
rows = []
current_row = []

for item in grid_items:
    nickname_element = item.select_one('span.__cf_email__')
    if nickname_element:
        nickname = nickname_element['data-cfemail']
        nickname = decode_cf_email(nickname)
        current_row.append(nickname)
    else:
        text = item.get_text(strip=True)
        current_row.append(text)
    
    if len(current_row) == len(headers):
        rows.append(current_row)
        current_row = []

# Clear the existing content in the sheet
sheet.clear()

# Paste the values to the sheet
# header_range = sheet.range('A1:F1')  # Update the range to the first row of headers
# for i in range(len(header_range)):
#     header_range[i].value = headers[i]

# sheet.update_cells(header_range)

data_range = sheet.range('A1:F{}'.format(len(rows) + 1))  # Adjust the range to start from the first row
for i in range(len(rows)):
    for j in range(len(rows[i])):
        data_range[i * len(headers) + j].value = rows[i][j]

sheet.update_cells(data_range)



# Freeze the first row
sheet.frozen_rows = 1
sheet.update_cell(1,7, f"Python Script Last Run: {time_str}")
print(f"Data added to Google Sheet on {time_str}.")

