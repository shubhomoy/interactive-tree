import React from 'react'

class Classes extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            classes: [],
            colors: ['red', 'blue', 'green', '#9c27b0', '#ffc107'],
        }
    }

    // Adds class input fields
    createClass = () => {
        let classes = [...this.state.classes]
        let used_colors = []
        let assigned_color = null;
        
        classes.forEach((cls) => {
            used_colors.push(cls.color)
        })

        this.state.colors.reverse().forEach((color) => {
            let u = false
            used_colors.forEach((used) => {
                if(used === color)
                    u = true
            })

            if(!u) {
                assigned_color = color
                return
            }
        })
        

        classes.push({
            name: '',
            color: assigned_color,
            error: '',
            msg: ''
        })

        this.setState({
            classes: classes
        })

        this.props.onClassUpdate(classes)
    }

    removeClass = (c) => {
        // Remove every point from the plot
        let data = this.props.data;
        for(let i=0; i<data.length; i++) {
            for(let j=0; j<data[i].length; j++) {
                if(data[i][j] !== null && data[i][j].name === c.name) {
                    data[i][j] = null;
                }
            }
        }

        // Remove the class from state
        let classes = [...this.state.classes];
        classes = classes.filter((cls) => {
            return cls.name !== c.name
        })

        this.setState({
            data: data,
            classes: classes,
            activeClass: null
        })

        this.props.onClassUpdate(classes)

        // clear decision boundaries
        // this.clearSplits()
        // this.removeDataset(c)
    }

    showCreateClassButton = () => {
        if(this.state.classes.length < 5) {
            return(
                <div className="row">
                    <div className="col-12-sm" style={{textAlign: "center"}}>
                        <button className="create-class-btn" onClick={(e) => this.createClass()}>
                            Create Class
                        </button>
                    </div>
                </div>
            )
        }
        return null
    }

    updateChange = (e, idx, attr) => {
        let classes = [...this.state.classes]
        classes[idx][attr] = e
        this.setState({
            classes: classes
        })
    }

    updateActiveClass = (c, idx) => {
        let classes = [...this.state.classes]
        if(c.name !== "") {
            let exists = false
            classes.forEach((cls) => {
                if(cls.name === c.name && cls.color !== c.color) {
                    exists = true
                    return
                }
            })

            if(exists) {
                classes[idx].error = "Class already exist. Try different name"
                classes[idx].msg = ""
            }else{
                classes[idx].msg = "You can now start adding data corresponding to this class in the plot"
                classes[idx].error = ""
                this.setState({
                    'activeClass': c
                });

                this.props.onSelectedActiveClass(c)
            }
        }else{
            classes[idx].error = "Specify name first"
            classes[idx].msg = ""
        }
        this.setState({
            'classes': classes
        });
    }

    render() {
        return(
            <div className="neu-2 class-entry-container">
                {this.state.classes.map((cls, key) => {
                    return(
                        <div key={key} className="class-container">
                            <div className="row">
                                <div className="col-12">
                                    <div className="selected_color" style={{backgroundColor: cls.color}}></div>
                                    <input className="class-text" type="text" placeholder="Class Name" value={this.state.classes[key].name} onChange={e => this.updateChange(e.target.value, key, 'name')}/>
                                    <div className="remove-class-btn" onClick={() => this.removeClass(cls)}>X</div>
                                </div>
                            </div>
                            <div className="row">    
                                <div className="col-12-sm">
                                    <center>
                                    <button className={this.state.activeClass === cls ? "add-to-graph-selected": "add-to-graph"} onClick={() => this.updateActiveClass(cls, key)}>
                                        {this.state.activeClass === cls ? "Selected": "Add to plot"}
                                    </button>
                                    </center>
                                </div>
                            </div>
                            <div className="row">    
                                <div className="col-12-sm">
                                    <center>
                                    {this.state.activeClass === cls ? cls.msg: cls.error}
                                    </center>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {this.showCreateClassButton()}
            </div>
        )
    }
}

export default Classes;