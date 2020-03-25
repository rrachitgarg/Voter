from flask_sqlalchemy import SQLAlchemy

#create a new sqlalchemy object
db = SQLAlchemy()

# Base model with common fields
class Base(db.Model):
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    date_modified = db.Column(db.DateTime, default=db.func.current_timestamp(),
                    onupdate=db.func.current_timestamp())

class Topics(Base, db.Model):

    title = db.Column(db.String(500))

    def __repr__(self):
        return self.title

class Options(Base, db.Model):
    name = db.Column(db.String(200))


class Polls(Base, db.Model):

    topic_id = db.Column(db.Integer,db.ForeignKey('topics.id'))
    option_id = db.Column(db.Integer,db.ForeignKey('options.id'))
    vote_count = db.Column(db.Integer,default=0)
    status = db.Column(db.Boolean)      # whether poll is opened or closed


    # To define relationship b/w diff models
    topic = db.relationship('Topics', foreign_keys=[topic_id], backref=db.backref('options', lazy='dynamic'))
    option = db.relationship('Options',foreign_keys=[option_id])

    def __repr__(self):
        return self.option.name


class Users(Base):

    email = db.Column(db.String(100),unique=True)
    username = db.Column(db.String(50),unique=True)
    password = db.Column(db.String(200))
