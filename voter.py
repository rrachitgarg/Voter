from flask import (
    Flask,
    render_template,
    request,redirect,
    flash,
    url_for,
    session,
)

import config
# from flask_session import Session

from werkzeug.security import generate_password_hash, check_password_hash

from models import db,Users

voter = Flask(__name__,
            static_url_path='',
            static_folder='static',
            template_folder='templates'
            )
# sess = Session()

voter.secret_key = "something only you know"
voter.config.from_object(config)

db.init_app(voter)
db.create_all(app=voter)

@voter.route('/')
def home():
    return render_template('index.html')

@voter.route('/signup',methods=['GET', 'POST'])
def signup():

    if request.method == 'POST':
        print('Heyyyy')
        email = request.form['email']
        print(email)
        username = request.form['username']
        print(username)
        password = request.form['password']
        password = generate_password_hash(password)
        print(password)

        user = Users(email=email,username=username,password=password)
        db.session.add(user)
        db.session.commit()
        flash('Thanks for signing up....Please login')
        return redirect(url_for('home'))

    return render_template('signup.html')

@voter.route('/login',methods=['POST'])
def login():

    username = request.form['username']
    password = request.form['password']

    user = Users.query.filter_by(username=username).first()
    if user:
        password_hash = user.password

        if check_password_hash(password_hash,password):
            session['user'] = username
            flash('Login succesfull')
    else:
        flash('Username or password incorrect')

    return redirect(url_for('home'))

@voter.route('/logout')
def logout():
    if 'user' in session:
        session.pop('user')
        flash('Hope to see you again')

    return redirect(url_for('home'))

@voter.route('/polls')
def polls():
    return render_template('polls.html')


@voter.route('/api/polls', methods=['GET','POST'])
def api_polls():
    if request.method=='POST':
        poll = request.get_json()

        return "The title of the poll is {} and the options are {} and {}".format(poll['title'],poll['options'])

    else:
        all_polls={}
        topics = Topics.query.all()

        for topic in topics:
            all_polls['topic.title']={'options':
                [poll.option.name for poll in Polls.query.filter_by(topic=topic)]
                                    }
        return jsonify(all_polls)


if __name__ == "__main__":

    voter.run(debug=True)
