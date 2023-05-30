import requests
from bs4 import BeautifulSoup
url = 'https://warthunder.com/en/community/claninfo/Angels%20Of%20Death'  # Replace with the actual URL of the webpage
response = requests.get(url)
html_content = response.text
#print(html_content)
soup = BeautifulSoup(html_content, 'html.parser')

# Find the container element that holds the grid items using a CSS selector
container = soup.select_one('.squadrons-members__grid')

# Extract the individual grid items
grid_items = container.find_all('div', class_='squadrons-members__grid-item')

# Process and use the extracted data
entries = []
entry = {}
header_count = 0

for item in grid_items:
    text = item.get_text(strip=True)
    
    # Skip empty items
    if not text:
        continue
    
    # Assign headers
    if header_count < 6:
        header_count += 1
        continue
    
    # Assign values for each entry
    if len(entry) < 6:
        if 'num' not in entry:
            entry['num'] = text
        elif 'player' not in entry:
            entry['player'] = text
        elif 'rating' not in entry:
            entry['rating'] = text
        elif 'activity' not in entry:
            entry['activity'] = text
        elif 'role' not in entry:
            entry['role'] = text
        elif 'date' not in entry:
            entry['date'] = text
            entries.append(entry)
            entry = {}

# Print the filtered entries
for entry in entries:
    print(entry)