from flask import Flask, render_template
app = Flask(__name__)

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