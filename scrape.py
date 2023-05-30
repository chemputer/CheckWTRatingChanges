#!/usr/bin/env python3
# Copyright (c) 2023, Chemputer, All rights reserved.

import requests
from bs4 import BeautifulSoup
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Set up Google Sheets API credentials
credentials = ServiceAccountCredentials.from_json_keyfile_name('sa-key.json', ['https://www.googleapis.com/auth/spreadsheets'])
client = gspread.authorize(credentials)


spreadsheet_id = '1hPILjBhLC-Ov_3Xnhki4WDtpKdBzbvD6t56b3OzS-Gs'
# Open the Google Sheet by its title
sheet = client.open_by_key(spreadsheet_id).sheet1  # Replace 'sheet1' with the name of your worksheet


url = 'https://warthunder.com/en/community/claninfo/Angels%20Of%20Death'  # Replace with the actual URL of the webpage
response = requests.get(url)
html_content = response.text
print(html_content)
soup = BeautifulSoup(html_content, 'html.parser')

# Find the table using a CSS selector
# Find the container element that holds the grid items using a CSS selector
container = soup.select_one('.squadrons-members__table')
print(container)
# Extract the individual grid items
grid_items = container.find_all('div', class_='squadrons-members__grid-item')

# Process and format the data for Google Sheets
headers = ['num', 'player', 'rating', 'activity', 'role', 'date']
rows = []
current_row = []

for item in grid_items:
    text = item.get_text(strip=True)
    
    # Skip empty items
    if not text:
        continue
    
    # Assign headers
    if len(current_row) < len(headers):
        current_row.append(text)
    else:
        rows.append(current_row)
        current_row = [text]

# Append the last row
rows.append(current_row)

# Add headers as the first row
#rows.insert(0, headers)

# Add the data to the Google Sheet
sheet.clear()  # Clear the existing content in the sheet
sheet.insert_rows(rows)

print("Data added to Google Sheet.")