from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('make_gif/', views.make_gif, name='make_gif'),
    path('^files/(?P<filename>\w{0,50})/$', views.download_file, name='file'),
]
