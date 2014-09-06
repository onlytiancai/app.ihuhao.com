#! /usr/bin/env python
# -*- coding: utf-8 -*-
import web

def init_logger(log_filename, level='info', console=False):
    import logging.handlers
    logger = logging.getLogger()
    logger.propagate = False
    level = logging._levelNames.get(level.upper(), logging.INFO)
    logger.setLevel(level)
    handler = logging.handlers.RotatingFileHandler(log_filename, maxBytes=100 * 1000 * 1000, backupCount=10)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s -[%(module)s](%(funcName)s): %(message)s')
    handler.setFormatter(formatter)
    if console:
        consoleHandler = logging.StreamHandler()
        consoleHandler.setFormatter(formatter)
        logger.addHandler(consoleHandler)
    logger.addHandler(handler)


def filter_input_loadhook():
    i = web.input()
    # 请求太大，直接返回http 400
    for k in i:
        if len(i[k]) > 102400:
            raise web.badrequest('request to large.')


def get_clientip():
    return web.ctx.env.get('HTTP_X_REAL_IP', web.ctx.ip)
