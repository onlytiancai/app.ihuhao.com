# -*- coding: utf-8 -*-
import web
import uuid
import urlparse
import json
import logging

from .oauth import OAuth

qqOAuth = None
qq_callback = None
qq_app_id = None
qq_on_logined = None  # 登录成功后回调的函数，参数有openid, access_token, nickname 

def init(app_id, app_key, callback, on_logined):
    '使用前先初始化'
    global qqOAuth, qq_callback, qq_app_id, qq_on_logined

    qq_app_id = app_id
    qq_callback = callback
    qq_on_logined = on_logined
    qqOAuth = OAuth(
        name='qq',
        client_id=app_id,
        client_secret=app_key,
        base_url='https://graph.qq.com',
        access_token_url='https://graph.qq.com/oauth2.0/token',
        authorize_url='https://graph.qq.com/oauth2.0/authorize')


class qqlogin(object):
    '点击登录按钮跳转到登录页'
    def GET(self):
        state = uuid.uuid1()
        web.setcookie('qqstate', state)
        url = qqOAuth.get_authorize_url(response_type='code',
                                        redirect_uri=qq_callback,
                                        state=state)
        return web.redirect(url)


class qqcallback(object):
    'oauth回调处理'
    def get_access_token(self, code):
        result = qqOAuth.get_access_token('GET',
                                          code=code,
                                          grant_type='authorization_code',
                                          redirect_uri=qq_callback)
        result = dict(urlparse.parse_qsl(result))
        if 'access_token' not in result:
            raise web.badrequest()
        return result['access_token']

    def get_openid(self, access_token):
        result = qqOAuth.request('GET', '/oauth2.0/me', access_token=access_token)
        result = result.lstrip("callback( ")
        result = result.rstrip(" );\n")
        result = json.loads(result)
        if 'openid' not in result:
            raise web.forbidden()
        return result['openid']

    def get_nickname(self, access_token, openid):
        result = qqOAuth.request('GET', '/user/get_user_info',
                                 access_token=access_token,
                                 openid=openid,
                                 oauth_consumer_key=qq_app_id)
        result = json.loads(result)
        return result['nickname']

    def GET(self):
        import uuid
        import datetime

        web.header('Content-Type', 'text/html; charset=utf-8', unique=True)
        code = web.input().code
        state = web.input().state
        cookie_state = web.cookies().get('qqstate')
        if state != cookie_state:
            raise web.Forbidden()

        if code:
            access_token = self.get_access_token(code)
            openid = self.get_openid(access_token)
            nickname = self.get_nickname(access_token, openid)
            qq_on_logined(openid, access_token, nickname)

            return web.found('/')
