from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand
from voter import voter,db


manager = Manager(voter)
migrate = Migrate(voter, db)

manager.add_command('db',MigrateCommand)


if __name__ == "__main__":
    manager.run()