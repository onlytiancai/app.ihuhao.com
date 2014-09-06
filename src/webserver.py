# -*- coding: utf-8 -*-
import os
import web
import logging

import config
import utils
import oauth.qqlogin as qqlogin 


urls = ["/", 'IndexHandler',
        "/error_test", 'ErrorTestHandler',

        "/qq_login", 'oauth.qqlogin.qqlogin',
        "/qq_callback", 'oauth.qqlogin.qqcallback',
        ]

app = web.application(urls, globals())
db = web.database(dbn='sqlite', db=config.sqlite_db_path, ) 
if web.config.get('_session') is None:
    session = web.session.Session(app, web.session.DiskStore(config.session_file_path), 
                                  initializer={'logined': False})
    web.config._session = session
else:
    session = web.config._session
render = web.template.render('templates', base='layout', globals={'session': session})


class IndexHandler(object):
    def GET(self):
        return render.index()


class ErrorTestHandler(object):
    def GET(self):
        raise Exception('opps')



def on_qq_logined(openid, access_token, nickname):
    logging.info("%s %s", openid, nickname)
    session.logined = True
    session.openid = openid
    session.access_token = access_token
    session.nickname = nickname


def header_html():
    web.header('Content-Type', 'text/html; charset=UTF-8')


def notfound():
    web.ctx.status = '404 Not Found'
    return web.notfound(str(render._404()))


def internalerror():
    web.ctx.status = '500 Internal Server Error'
    logging.exception("this is an internalerror")
    return web.internalerror(str(render._500()))


app.notfound = notfound
app.internalerror = internalerror
app.add_processor(web.loadhook(header_html))
app.add_processor(web.loadhook(utils.filter_input_loadhook))
wsgiapp = app.wsgifunc()

if __name__ == '__main__':
    utils.init_logger(config.log_path, config.log_level, console=True) 
    qqlogin.init(config.qq_app_id, config.qq_app_key, config.qq_callback, on_qq_logined)
    app.run()
