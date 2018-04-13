import hashlib as hash

from django.core.files.uploadedfile import UploadedFile


def hashfile(file):
    BLOCKSIZE = 65536
    md5 = hash.md5()

    if isinstance(file, str):
        with open(file, 'rb') as f:
            file_buffer = f.read(BLOCKSIZE)
            while len(file_buffer) > 0:
                md5.update(file_buffer)
                file_buffer = f.read(BLOCKSIZE)

    elif isinstance(file, UploadedFile):
        for chunk in file.chunks():
            md5.update(chunk)

    return md5.hexdigest()
