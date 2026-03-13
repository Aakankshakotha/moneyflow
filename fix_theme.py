import glob

replacements = [
    ("border: '1px solid var(--border-color)'", "border: '1px solid', borderColor: 'divider'"),
    ("borderBottom: '1px solid var(--border-color)'", "borderBottom: '1px solid', borderBottomColor: 'divider'"),
    ("borderTop: '1px solid var(--border-color)'", "borderTop: '1px solid', borderTopColor: 'divider'"),
    ("borderBottom: '2px solid var(--border-color)'", "borderBottom: '2px solid', borderBottomColor: 'divider'"),
    ("borderBottom: '2px solid var(--primary-color)'", "borderBottom: '2px solid', borderBottomColor: 'primary.main'"),
    ("borderColor: 'var(--border-color)'", "borderColor: 'divider'"),
    ("borderColor: 'var(--border-color-hover)'", "borderColor: 'divider'"),
    ("borderColor: error ? 'error.main' : 'var(--border-color)'", "borderColor: error ? 'error.main' : 'divider'"),
    ("boxShadow: 'var(--shadow-soft)'", "boxShadow: 2"),
    ("backgroundColor: 'var(--input-background)'", "backgroundColor: 'background.paper'"),
    ("backgroundColor: 'var(--input-background-focus)'", "backgroundColor: 'background.paper'"),
    ("backgroundColor: 'var(--button-hover-background)'", "backgroundColor: 'action.hover'"),
    ("backgroundColor: 'var(--surface-elevated)'", "backgroundColor: 'background.paper'"),
    # Tokens needing useTheme — placeholder so we can find them
    ("'3px solid var(--primary-color)'", "__PRIMARY_BORDER_3PX__"),
    ("'inset 4px 0 0 var(--primary-color)'", "__INSET_PRIMARY__"),
    ("'2px solid var(--primary-color)'", "__PRIMARY_BORDER_2PX__"),
]

root = '/Users/aakanksha.kotha/Desktop/Pet_Projects/Expenses/src'
files = glob.glob(root + '/**/*.tsx', recursive=True)
count = 0
for f in files:
    if 'MuiAppThemeProvider' in f:
        continue
    with open(f, 'r') as fh:
        content = fh.read()
    new = content
    for old, new_val in replacements:
        new = new.replace(old, new_val)
    if new != content:
        with open(f, 'w') as fh:
            fh.write(new)
        count += 1
        print(f"Updated: {f.replace(root + '/', '')}")

print(f"\nTotal files updated: {count}")
