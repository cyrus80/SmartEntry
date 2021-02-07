import requests


class ClientModule:
    def __init__(self):
        self.base_ulr = "https://1lmgs.sse.codesandbox.io/"

    def reset(self):
        requests.get(self.base_ulr + 'reset_db')

    def log_enter(self, name, enter, time):
        log_url = self.base_ulr + 'log'
        res = requests.post(log_url,
                            json={'name': name,
                                  'type': 'enter' if enter else 'exit',
                                  'time': str(time)},
                            headers={'Content-Type': 'application/json'})
