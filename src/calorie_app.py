# -*- coding: utf-8 -*-
import web

urls = ["/", "IndexHandler",
        ]

def get_render():
    return web.ctx.global_render.calorie


def get_db():
    return web.ctx.global_db


def get_session():
    return web.ctx.session()


class IndexHandler(object):
    def GET(self):
        return get_render().index()


app = web.application(urls, globals())
