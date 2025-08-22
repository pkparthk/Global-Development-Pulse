import os
import sys

def main():
    cwd = os.getcwd()
    req_path = os.path.join('backend', 'requirements.txt')
    print('ROOT:', cwd)
    exists = os.path.exists(req_path)
    print(f"{req_path} exists: {exists}")
    if not exists:
        print('ERROR: requirements file not found at', req_path, file=sys.stderr)
        # exit non-zero so build logs make this obvious
        sys.exit(2)
    try:
        with open(req_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        print('requirements lines:', len(lines))
    except Exception as e:
        print('ERROR reading requirements:', e, file=sys.stderr)
        sys.exit(3)

if __name__ == '__main__':
    main()
import os
import sys

def main():
    cwd = os.getcwd()
    req_path = os.path.join('backend', 'requirements.txt')
    print('ROOT:', cwd)
    exists = os.path.exists(req_path)
    print(f"{req_path} exists: {exists}")
    if not exists:
        print('ERROR: requirements file not found at', req_path, file=sys.stderr)
        # exit non-zero so build logs make this obvious
        sys.exit(2)
    try:
        with open(req_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        print('requirements lines:', len(lines))
    except Exception as e:
        print('ERROR reading requirements:', e, file=sys.stderr)
        sys.exit(3)

if __name__ == '__main__':
    main()
import os
print('ROOT:', os.getcwd())
print('backend/requirements.txt exists:', os.path.exists('backend/requirements.txt'))
with open('backend/requirements.txt') as f:
    print('requirements lines:', len(f.readlines()))
