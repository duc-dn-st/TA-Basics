from flask import Flask, render_template
import subprocess
import signal
import sqlite3
import os
import time

app = Flask(__name__)

DATABASE = os.path.join(os.getcwd(), "static", "database.db")

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

class roslaunch_process():
    @classmethod
    def start_mapping(self):
        self.process_mapping = subprocess.Popen (["roslaunch", "--wait", "turtlebot3_slam", "turtlebot3_slam.launch"])
    
    @classmethod
    def stop_mapping(self):

        self.process_mapping.send_signal(signal.SIGINT)    

@app.route('/')
def main():
    html = render_template('main.html')
    return html

@app.route('/mapping')
def mapping():
    roslaunch_process.start_mapping()

    mapping = render_template('mapping.html', title='Mapping')
    return mapping

if __name__ == "__main__":
    app.run(debug=True)
