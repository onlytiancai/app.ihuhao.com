# -*- coding: utf-8 -*-
import os
import web
import logging

import config
import utils
import oauth.qqlogin as qqlogin 

render = web.template.render('templates', base='layout')


class index(object):
    def GET(self):
        return render.index()

urls = ["/", index,

        "/qq_login", 'oauth.qqlogin.qqlogin',
        "/qq_callback", 'oauth.qqlogin.qqcallback',
        ]

def on_qq_logined(openid, access_token, nickname):
    logging.info("%s %s", openid, nickname)


app = web.application(urls, globals())
wsgiapp = app.wsgifunc()

if __name__ == '__main__':
    utils.init_logger(config.log_path, config.log_level, console=True) 
    qqlogin.init(config.qq_app_id, config.qq_app_key, config.qq_callback, on_qq_logined)
    app.run()
