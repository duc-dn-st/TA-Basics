from flask import Flask, render_template
import subprocess
import signal

app = Flask(__name__)

class roslaunch_process():
    @classmethod
    def start_mapping(self):
        self.process_mapping = subprocess.Popen (["roslaunch", "--wait", "turtlebot3_slam", "turtlebot3_slam.launch"])
    
    @classmethod
    def stop_mapping(self):

        self.process_mapping.send_signal(signal.SIGINT)    


@app.route('/startmapping')
def start_mapping():
    roslaunch_process.start_mapping()

    return "success"


@app.route('/stopmapping')
def stop_mapping():
    roslaunch_process.stop_mapping()

    return "success"

@app.route('/')
def main():
    html = render_template('main.html')
    return html

@app.route('/mapping')
def mapping():
    mapping = render_template('mapping.html', title='Mapping')
    return mapping

if __name__ == "__main__":
    app.run(debug=True)
