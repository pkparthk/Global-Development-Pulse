import os
print('ROOT:', os.getcwd())
print('backend/requirements.txt exists:', os.path.exists('backend/requirements.txt'))
with open('backend/requirements.txt') as f:
    print('requirements lines:', len(f.readlines()))
