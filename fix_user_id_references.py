"""
Script to fix all current_user["_id"] references to current_user["user_id"]
"""
import os
import re

def fix_file(filepath):
    """Fix user_id references in a file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Replace all occurrences
    content = content.replace('current_user["_id"]', 'current_user["user_id"]')
    content = content.replace("current_user['_id']", "current_user['user_id']")
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    routes_dir = 'backend/api/routes'
    fixed_files = []
    
    for filename in os.listdir(routes_dir):
        if filename.endswith('.py') and filename != '__init__.py':
            filepath = os.path.join(routes_dir, filename)
            if fix_file(filepath):
                fixed_files.append(filename)
                print(f"✅ Fixed: {filename}")
    
    if fixed_files:
        print(f"\n🎉 Fixed {len(fixed_files)} files:")
        for f in fixed_files:
            print(f"   - {f}")
    else:
        print("✅ No files needed fixing")

if __name__ == "__main__":
    main()
