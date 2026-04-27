import os

comp_path = r"c:\Users\Admin\Downloads\WEB 2.0\components.jsx"
app_path = r"c:\Users\Admin\Downloads\WEB 2.0\app.jsx"

with open(comp_path, 'r', encoding='utf-8') as f:
    comp_content = f.read()

with open(app_path, 'r', encoding='utf-8') as f:
    app_lines = f.readlines()

# The first 2 lines of app.jsx are the imports/globals
globals_lines = app_lines[:2]
# The components were injected up to line 398.
# We want the rest of the app.jsx logic from line 398 (0-indexed line 398 is the 399th line)
logic_lines = app_lines[398:]

merged_content = "".join(globals_lines) + "\n\n" + comp_content + "\n\n" + "".join(logic_lines)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(merged_content)

print("Merge complete")
