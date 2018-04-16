import os

from django.conf import settings
from django.http import JsonResponse, StreamingHttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .core.fileparse import hashfile
from .core.gif import Gif

DEBUG = settings.DEBUG
FIlE_DIR = settings.FILE_DIR
ORIGIN_FILE_DIR = os.path.join(FIlE_DIR, 'origin')
OUTPUT_FILE_DIR = os.path.join(FIlE_DIR, 'output')


# Create your views here.

def parse_file_url(filename):
    if DEBUG:
        filename = os.path.join(OUTPUT_FILE_DIR, filename)
        return 'file://{}'.format(filename)
    else:
        return '/file/output/{}'.format(filename)


def index(request):
    return render(request, 'index.html')


def download_file(request, filename):
    pass
    outfile = os.path.join(OUTPUT_FILE_DIR, filename)
    return StreamingHttpResponse()


@csrf_exempt
def make_gif(request):
    file = request.FILES['file']
    text_data_str = request.POST['text']

    hash_file_name = '{}.gif'.format(hashfile(file))
    filename = os.path.join(ORIGIN_FILE_DIR, hash_file_name)

    if not os.path.exists(filename):
        with open(filename, 'wb+') as f:
            for chunk in file.chunks():
                f.write(chunk)

    # 图片处理
    gif_imf = Gif(hash_file_name)

    output_filename = gif_imf.draw_subtitles(text_data_str)
    output_url = parse_file_url(output_filename)

    return JsonResponse({'file': output_url})
