import sys

with open('src/lib/schedule-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

with open('sections10_18.ts', 'r', encoding='utf-8') as f:
    sections_content = f.read()

target = '      "19": {'
new_content = content.replace(target, sections_content + '\n' + target)

with open('src/lib/schedule-data.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Replaced successfully.')
