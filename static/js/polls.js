var Align = {
    textAlign: 'center',
    fontFamily: 'EB Garamond'
};

var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var browserHistory = ReactRouter.browserHistory;

var origin = window.location.origin;

var PollForm = React.createClass({

    getInitialState: function(){
        return{
            title: '',
            option: '',
            options: [],
            all_options: []
        }
    },

    handleTitleChange: function(e){
        // Change title as user type
        this.setState({title: e.target.value});
    },

    handleOptionChange: function(e){
        this.setState({option: e.target.value});
    },

    handleOptionAdd: function(e){
        // Update poll options and reset option to null string
        this.setState({
            options: this.state.options.concat({name: this.state.option}),
            option: ''
        });
    },

    componentDidMount: function(){

        var url = origin + '/api/polls/options';
        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            success: function(data) {
              this.setState({all_options: data});
            }.bind(this),
            error: function(xhr, status, err) {
              console.error(url, status, err.toString());
            }.bind(this)
          });
    },

    handleSubmit: function(e){
        // To handle form submit
        e.preventDefault();
        var title = this.state.title;
        var options = this.state.options;
        var data = {
            'title': title,
            options: options.map((x)=>{return x.name}),
        };
        var url = origin + '/api/polls';
        //To make post request
        $.ajax({
            url: url,
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            success: function (data){
                alert(data.message);
                this.setState({
                    title: '',
                    option: '',
                    options: []
                });
                document.getElementById('poll_form').reset();
            }.bind(this),
            error: function (xhr,status,err){
                alert('Poll creation failed: '+ err.toString());
            }.bind(this)
        });

    },

    render: function(){
        var classContext="col-sm-6 col-sm-offset-3"

        var all_options = this.state.all_options.map(
            function(option){
                return(<option key={option.id} value={option.name} />)
            }
        );

        return(
            <div>
            <form id="poll_form" className="form-signin" onSubmit={this.handleSubmit}>
            <h2 className="form-signin-heading" style={Align}>Create another poll</h2>

            <div className="form-group has-success">
            <label htmlFor="title" className="sr-only">Title</label>
            <input type="text" id="title" name="title" className="form-control" placeholder="Title" onChange={this.handleTitleChange} required autoFocus />
            </div>

            <div className="form-group has-success">
            <label htmlFor="option" className="sr-only">Option</label>
            <input list="option" className="form-control" placeholder="Option" onChange={this.handleOptionChange}
            value={this.state.option? this.state.option:''} autoFocus />
            </div>

            <datalist id="option">
                {all_options}
            </datalist>

            <div className="row form-group">
            <button className="btn btn-lg btn-success btn-block" onClick={this.handleOptionAdd} type="button">Add option</button>
            <button className="btn btn-lg btn-success btn-block" type="submit">Save poll</button>
            </div>
            <br />
            </form>

            <h3 style={Align}>Live Preview</h3>
            <LivePreview title={this.state.title} options={this.state.options} classContext={classContext}/>
            </div>
        );
    }
});

var LivePreview = React.createClass({

    getInitialState: function (){
        return{
            selected_option: '',
            disabled: 0
        };
    },

    handleOptionChange: function(e){
        this.setState({selected_option: e.target.value});
    },

    voteHandler: function(e){
        e.preventDefault();

        var data={
            "poll_title": this.props.title,
            "option": this.state.selected_option
        };
        this.props.voteHandler(data);
        this.setState({disabled:1});
    },

    render: function(){
        var total_vote=0,opt;

        this.props.options.forEach(function (option){
            for (opt in option){
                if (option.hasOwnProperty(opt) && opt=='vote_count'){
                    total_vote+= option[opt];
                }
        }
        });

        var options = this.props.options.map(function(option){
        if(option.name) {

            var progress = Math.round((option.vote_count/total_vote)*100)||0 ;
            var current = {width: progress+"%"}

            return (
                <div key={option.name}>
                    <input name="options" type="radio" value={option.name} onChange={this.handleOptionChange}/> {option.name}
                    <br/>
                    <div className="progress">
                        <div className="progress-bar progress-bar-success"
                        role="progressbar" aria-valuenow={progress} aria-valuemin="0"
                        aria-valuemax="100" style={current}>
                            {progress}%
                        </div>
                    </div>
                    <br />
                </div>
                );
            }
        }.bind(this));

        return(
        <div className={this.props.classContext}>
        <div className="panel panel-success">
        <div className="panel-heading">
            <h4>{this.props.title}</h4>
        </div>
        <div className="panel-body">
            <form onSubmit={this.voteHandler}>
            {options}
            <br />
            <button type="submit" disabled={this.state.disabled} className="btn btn-success btn-outline hvr-grow">Vote!</button>
            <small>{total_vote} votes so far</small>
            </form>
        </div>
        </div>
        </div>
        )
    }
});

var LivePreviewProps = React.createClass({

    voteHandler: function (data){
        var url = origin + '/api/polls/vote';

        $.ajax({
            url: url,
            dataType: 'json',
            type: 'PATCH',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            success: function (data){
                alert(data.message);
                this.setState({selected_option: ''});
                this.props.loadPollsFromServer();
            }.bind(this),
            error: function (xhr,status,err){
                alert('Poll creation failed: '+ err.toString());
            }.bind(this)
        });
    },

    render: function (){

        var polls = this.props.polls.Polls.map(function (poll){
            return (
                <LivePreview key={poll.title} title={poll.title}
                    options={poll.options}
                    // total_vote_count={poll.total_vote_count}
                    voteHandler = {this.voteHandler} classContext={this.props.classContext}/>
            );
        }.bind(this));

        return(
            <div>
                <h1 style={Align}>{this.props.header}</h1>
                <br/>
                <div className="row">{polls}</div>
            </div>
        );

    }

});

var AllPolls = React.createClass({

    getInitialState: function (){
        return {
            polls: {
                'Polls': [],
            },
            header : '',
            classContext : ''
        };
    },

    loadPollsFromServer: function (){

        var pollName = this.props.routeParams.pollName;
        if (pollName){
            var url= origin + '/api/polls' + pollName;
            this.setState({
            classContext: 'col-sm-6 col-sm-offset-3'
        })
        }
        else{
            var url= origin + '/api/polls';
            this.setState({
            header: 'Latest polls',
            classContext: 'col-sm-6'
            })
        }

        $.ajax({
            url: url,
            dataType: 'json',
            type: 'GET',
            cache: false,
            success: function (data){
                this.setState({
                    polls: data
                });
            }.bind(this),
            error: function (xhr,status,err){
                console.error(url,status,err.toString());
            }.bind(this)
        });
    },

    componentDidMount: function (){
        this.loadPollsFromServer();
    },

    render: function (){
        if(!this.state.polls.message){
            return(
                <LivePreviewProps polls={this.state.polls}
                loadPollsFromServer={this.loadPollsFromServer}
                classContext={this.state.classContext}
                header = {this.state.header}/>
            );
        }
        else{
            return(
                <div style={Align}>
                    <h1>Poll not found</h1>
                    <p>You may check out other <a href="/">polls.</a></p>
                </div>
            );
        }
    }
});

ReactDOM.render((
    <Router history={browserHistory}>
        <Route path="/" component={AllPolls} />
        <Route path="/polls" component={PollForm} />
        <Route path="/polls/:pollName" component={AllPolls} />
    </Router>
),
document.getElementById('container')
);