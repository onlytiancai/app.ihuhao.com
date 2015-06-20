# -*- coding: utf-8 -*-
import web
import json

urls = ["/", "IndexHandler",
        "/api/most_foods", "MostFoodsHandler",
        ]

def get_render():
    return web.ctx.global_render.csvchart


def get_db():
    return web.ctx.global_db


def get_session():
    return web.ctx.session()


class IndexHandler(object):
    def GET(self):
        return get_render().index()


class MostFoodsHandler(object):
    def GET(self):
        web.header('Content-Type', 'text/json; charset=UTF-8')
        ret = [(u"白饭1碗", 263), (u"米粉(干)100g", 360)]
        return json.dumps(ret)


app = web.application(urls, globals())
