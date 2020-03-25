from flask import (
    Flask,
    render_template,
    request,redirect,
    flash,
    url_for,
    session,
    jsonify
)

import config
# from flask_session import Session

from werkzeug.security import generate_password_hash, check_password_hash

from models import db,Users,Topics,Polls,Options

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

        # Simple validations to check if all values are properly selected
        for key,value in poll.items():
            if not value:
                return jsonify({'error': 'value for {} is empty'.format(key)})

        title = poll['title']
        options_query = lambda option : Options.query.filter(Options.name.like(option))

        options = [Polls(options=Options(name=option))
                    if options_query(option).count==0
                    else Polls(option=options_query(option).first())
                    for option in poll['option']]

        new_topic = Topics(title=title, options=options)
        db.session.add(new_topic)
        db.session.commit()

        return jsonify({'message': 'Poll was created successfully'})

    else:

        polls = Topics.query.join(Polls).all()

        all_polls = {'Polls': [poll.to_json() for poll in polls]}
        return jsonify(all_polls)

@voter.route('/api/polls/options')
def api_polls_options():

    app_options = [options.to_json() for option in Options.query.all()]
    return jsonify(all_options)

@voter.route('/api/polls/vote', methods=['PATCH'])
def api_poll_vote():

    poll = request.get_json()

    poll_title, option = (poll['poll_title'],poll['option'])

    join_tables = Polls.query.join(Topics).join(Options)

    option = join_tables.filter(Topics.title.like(poll_title)).filter(Options.name.like(option)).first

    if option:
        option.vote_count +=1
        db.session.commit()

        return jsonify({'message': 'Thank you for voting'})
    else:
        return jsonify({'message': 'Option or poll was not found. Please try again'})

if __name__ == "__main__":

    voter.run(debug=True)
