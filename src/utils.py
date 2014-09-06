#! /usr/bin/env python
# -*- coding: utf-8 -*-

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
