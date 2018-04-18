import hashlib as hash
import json
import os

from PIL import Image, ImageSequence, ImageDraw, ImageFont
from django.conf import settings

FIlE_DIR = settings.FILE_DIR
ORIGIN_FILE_DIR = os.path.join(FIlE_DIR, 'origin')
OUTPUT_FILE_DIR = os.path.join(FIlE_DIR, 'output')
FONT_PATH = os.path.join(settings.BASE_DIR, 'SourceHanSansCN-Regular.otf')


class Gif():
    def __init__(self, filename):
        file_path = os.path.join(ORIGIN_FILE_DIR, filename)
        with Image.open(file_path) as img:
            self.img = img
            self.frames = [f.copy() for f in ImageSequence.Iterator(img)]
            self.font = ImageFont.truetype(FONT_PATH, size=24)
            self.size = img.size
            self.filename = filename

    def draw_subtitles(self, text_data_str):
        text_data = json.loads(text_data_str)

        md5 = hash.md5()
        md5.update(self.filename.encode('utf-8'))
        md5.update(bytes(text_data_str.encode('utf-8')))
        output_filename = '{}.gif'.format(md5.hexdigest())

        output_filepath = os.path.join(OUTPUT_FILE_DIR, output_filename)

        self.output_filename = output_filename
        if not os.path.exists(output_filepath):
            for duration_text in text_data:
                self.draw_subtitle(duration_text['timeDuration'], duration_text['text'])
            self.frames[0].save(output_filepath, save_all=True, append_images=self.frames[1:])

        os.system('gifsicle {} -o {}'.format(output_filepath,output_filepath))
        return output_filename

    def draw_subtitle(self, duration, text):
        a, z = duration

        for index in range(int(a), int(z) + 1):
            frame = self.frames[index]
            draw = ImageDraw.Draw(frame)
            w, h = self.size
            t_width, t_height = self.font.getsize(text)
            draw.text(((w - t_width) / 2, h - t_height), text, 255, font=self.font)
            # frame.palette.dirty = 0


if __name__ == '__main__':
    image_path = '/Users/mayne/workspace/happygif/files/yeshila.gif'

    gif = Gif(image_path)
    gif.draw_subtitles((0, 1), '职业平衡做的好嘛？')
