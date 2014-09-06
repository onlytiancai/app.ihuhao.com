# -*- coding: utf-8 -*-

qq_app_id = '101152576'
qq_app_key = ''
qq_callback = 'http://app.ihuhao.com/qq_callback'

log_path = '/data/log/app-ihuhao.com.log'
log_level = 'info'

sqlite_db_path = '/data/app-ihuhao.com.db'

session_file_path = '/data/app-ihuhao.com.session'

def reload_config():
    '加载真实配置'
    try:
        app_config = __import__('config_real')
        items = [(k, v) for k, v in app_config.__dict__.items()
                 if not k.startswith('__')]
        globals().update(dict(items))
    except ImportError:
        pass

reload_config()
