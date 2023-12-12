from flask import Flask, render_template, url_for, g, jsonify, request
import subprocess
import signal
from sqlite3 import Error
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

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.before_request
def create_table():
       
    with app.app_context():
        try:
            c = get_db().cursor()
            c.execute("CREATE TABLE IF NOT EXISTS maps (id integer PRIMARY KEY,name text NOT NULL)")
            c.close()
        except Error as e:
            print(e)

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


@app.route("/mapping/cutmapping" , methods=['POST'])
def killnode():
	roslaunch_process.stop_mapping() 
	return("killed the mapping node")

@app.route("/mapping/savemap" , methods=['POST'])
def savemap():
    mapname = request.get_data().decode('utf-8')

    os.system("rosrun map_server map_saver -f"+" "+os.path.join(os.getcwd(),"static",mapname))
    os.system("convert"+" "+os.getcwd()+"/static/"+mapname+".pgm"+" "+os.getcwd()+"/static/"+mapname+".png")

    with get_db():
        try:
            c = get_db().cursor()
            c.execute("insert into maps (name) values (?)", (mapname,))
            # get_db().commit()
            c.close()
        except Error as e:
            print(e)

    return("success")

if __name__ == "__main__":
    app.run(debug=True)
