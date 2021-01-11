import React from 'react'
import Dataset from './Dataset'
import MouseTooltip from 'react-sticky-mouse-tooltip';
import {Animated} from 'react-animated-css'

class Plot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            'activeClass': null,
            'classes': [],
            'data': [],
            'lines': [],
            'sub_data': [],
            'colors': ['red', 'blue', 'green', '#9c27b0', '#ffc107'],
            'dataset': [],
            'clear_split': false,
            'num_data': 0,
            'announcement': null,
            'tooltip': false,
            'current_coord': null,
            'showMoreNodesPopup': false
        }

        this.updateActiveClass = this.updateActiveClass.bind(this);
        this.updateChange = this.updateChange.bind(this);
        this.createClass = this.createClass.bind(this);
        this.getCoord = this.getCoord.bind(this);
        this.construct_dataset = this.construct_dataset.bind(this)
    }

    componentDidMount() {
        let cells = [];
        for(let i=0; i<this.props.height; i++) {
            let row = [];
            for(let j=0; j<this.props.width; j++) {
                row.push(null)
            }
            cells.push(row);
        }
        let sub_data = [{
            coord_1: [0, 0],
            coord_2: [39, 39]
        }]

        this.setState({
            data: cells,
            sub_data: sub_data
        })
    }

    getCoord = (i, j) => {
        if(this.state.classes.length === 0)
            return

        let data = [...this.state.data]
        let num_data = this.state.num_data

        if(data[i][j] !== null) {
            data[i][j] = null
            num_data -= 1
        }else {
            if(num_data >= 40) {
                this.setState({
                    announcement: "No more datapoints can be plotted. Please remove existing datapoints."
                })
                setTimeout(() => {this.setState({
                    announcement: null
                })}, 5000)
                return
            }
            data[i][j] = this.state.activeClass
            num_data += 1
        }
            
        this.setState({
            data: data,
            num_data: num_data
        })

        this.construct_dataset()
    }

    updateActiveClass = (c, idx) => {
        let classes = this.state.classes
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
            }
        }else{
            classes[idx].error = "Specify name first"
            classes[idx].msg = ""
        }
        this.setState({
            'classes': classes
        });
    }

    removeClass = (c) => {
        // Remove every point from the plot
        let data = this.state.data;
        for(let i=0; i<data.length; i++) {
            for(let j=0; j<data[i].length; j++) {
                if(data[i][j] !== null && data[i][j].name === c.name) {
                    data[i][j] = null;
                }
            }
        }

        // Remove the class from state
        let classes = this.state.classes;
        classes = classes.filter((cls) => {
            return cls.name !== c.name
        })

        this.setState({
            data: data,
            classes: classes
        })

        // clear decision boundaries
        this.clearSplits()
        this.removeDataset(c)
    }

    removeDataset = (c) => {
        let dataset = [...this.state.dataset]
        dataset = dataset.filter((d) => {
            return d.class !== c.name
        })

        this.setState({
            dataset: dataset
        })
    }

    // Adds class input fields
    createClass = () => {
        let classes = this.state.classes
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
    }

    updateChange = (e, idx, attr) => {
        let classes = this.state.classes
        classes[idx][attr] = e
        this.setState({
            classes: classes
        })
    }

    draw_cell = (i, j, cell) => {
        let rightBorder = ''
        let topBorder = ''

        this.state.lines.forEach((line) => {
            let x1 = line.x1
            let x2 = line.x2

            if(i >= x2[0] && i <= x2[1] && j >= x1[0] && j <= x1[1]) {

                for(let i2=x2[0]; i2<=x2[1]; i2++) {
                    for(let j2=x1[0]; j2<=x1[1]; j2++) {
                        if(i === i2 && j === j2) {
                            if(line.type === 'h') {
                                topBorder = 'top-border'
                            }else{
                                rightBorder = 'right-border'
                            }
                            return
                        }
                    }
                }
            }
        })

        return(
            <div key={i + " - " + j} className={"cell " + rightBorder + " " + topBorder} onClick={() => this.getCoord(i, j)} 
                onMouseOver={(e) => this.setState({tooltip: true, current_coord: "x=" + j + ", y=" + (39-i)})}
                onMouseOut={(e) => this.setState({tooltip: false})}>
                {cell ? <div className="assigned" style={{backgroundColor: cell.color}}></div> : ''}
            </div>
        )
    }

    getSplits = (split, sub_data) => {
        let lines = this.state.lines
        let q1 = null, q2 = null

        if(split.axis === 'x1') {
            let col = split.value - 0.5
            lines.push({
                x1: [col, col],
                x2: [sub_data.coord_1[1], sub_data.coord_2[1]],
                type: 'v'
            })

            // left part
            if(col > 0) {
                q1 = {
                    coord_1: [...sub_data.coord_1],
                    coord_2: [col, sub_data.coord_2[1]]
                }
            }

            // right part
            if(col < 39) {
                q2 = {
                    coord_1: [col + 1, sub_data.coord_1[1]],
                    coord_2: [...sub_data.coord_2]
                }
            }
            
        }else{
            let row = split.value - 0.5
            lines.push({
                x1: [sub_data.coord_1[0], sub_data.coord_2[0]],
                x2: [39 - row, 39 - row],
                type: 'h'
            })

            // bottom part
            if(row > 0) {
                q1 = {
                    coord_1: [sub_data.coord_1[0], 39 - row],
                    coord_2: [...sub_data.coord_2]
                }
            }

            // top part
            if(row < 39) {
                q2 = {
                    coord_1: [...sub_data.coord_1],
                    coord_2: [sub_data.coord_2[0], 39 - row - 1]
                }
            }
        }

        let data = [...this.state.sub_data]
        
        if(q1 !== null)
            data.push(q1)

        if(q2 !== null)
            data.push(q2)

        this.setState({
            lines: lines,
            sub_data: data,
            showMoreNodesPopup: true
        })

        setTimeout(() => {
            this.setState({showMoreNodesPopup: false})
        }, 5000)
    }

    clearSplits = () => {
        let subdata = [...this.state.sub_data]
        subdata = subdata.slice(0, 1)
        this.setState({
            lines: [],
            sub_data: subdata,
            clear_split: true
        })
    }

    showCreateClassButton = () => {
        return(
            <div className="row">
                <div className="col-12-sm" style={{textAlign: "center"}}>
                    <button className="create-class-btn" onClick={this.createClass}>
                        Create Class
                    </button>
                </div>
            </div>
        )
    }

    construct_dataset = () => {
        let data = []
        for(let i=0; i<this.state.data.length; i++) {
            for(let j=0; j<this.state.data[i].length; j++) {
                if(this.state.data[i][j] !== null) {
                    data.push({
                        x1: j,
                        x2: this.state.data.length - 1 - i,
                        class: this.state.data[i][j].name,
                        color: this.state.data[i][j].color
                    })
                }
            }
        }

        this.clearSplits()

        this.setState({
            dataset: data
        })
    }

    updateClearSplitState = () => {
        if (this.state.clear_split) {
            this.setState({
                clear_split: false
            })
        }
    }

    showAnnouncement = () => {
        if(this.state.announcement != null) {
            return(
                <div className="row">
                    <div className="col-12 announcement">
                        {this.state.announcement}
                    </div>
                </div>
            )
        }
    }

    render() {
        return(
            <div>
                <div className="row">
                    <div className="col-7">
                        <div style={{minWidth: "440px"}}>
                            <div className="tick-x2-container">
                                <div className="x2-tick" style={{paddingTop: "35px"}}>35</div>
                                <div className="x2-tick">30</div>
                                <div className="x2-tick">25</div>
                                <div className="x2-tick" style={{paddingTop: "27px"}}>20</div>
                                <div className="x2-tick">15</div>
                                <div className="x2-tick" style={{paddingTop: "27px"}}>10</div>
                                <div className="x2-tick" style={{height: "85px"}}>5</div>
                            </div>
                            <div className="plot-container">
                                {
                                    this.state.data.map((row, i) => {
                                        return row.map((cell, j) => {
                                            return this.draw_cell(i, j, cell)
                                        })
                                    })
                                }
                            </div>
                            <div className="tick-x1-container">
                                <div className="x1-tick" style={{width: "10px"}}>0</div>
                                <div className="x1-tick" style={{width: "50px"}}>5</div>
                                <div className="x1-tick" style={{width: "55px"}}>10</div>
                                <div className="x1-tick">15</div>
                                <div className="x1-tick">20</div>
                                <div className="x1-tick">25</div>
                                <div className="x1-tick">30</div>
                                <div className="x1-tick">35</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-5">
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

                            {this.state.classes.length < 5 ? this.showCreateClassButton(): null}
                        </div>
                    </div>

                    <MouseTooltip
                        className="tooltip"
                        visible={this.state.tooltip}
                        offsetX={15}
                        offsetY={10}>
                        <span>{this.state.current_coord}</span>
                    </MouseTooltip>

                </div>
                {/* Eng of class and plot */}
                
                {this.showAnnouncement()}

                <Dataset 
                    data={this.state.data} 
                    subdata={this.state.sub_data} 
                    dataset={this.state.dataset} 
                    classes={this.state.classes}
                    clearSplitState={this.state.clear_split} 
                    onSplitSelected={this.getSplits} 
                    onClearClassification={this.clearSplits}
                    onUpdateClearSplitState={this.updateClearSplitState} />
                <div className="spacer"></div>


                
                <div className="popup-message-container row">
                    <div className="col-3"></div>
                    <Animated animationIn="bounceInUp" animationOut="bounceOutDown" isVisible={this.state.showMoreNodesPopup}>
                    <div className="popup-message col-6">
                        Split has been made in the plot and more nodes are added at the bottom!
                    </div>
                    </Animated>
                    <div className="col-3"></div>
                </div>
                
            </div>
        )
    }
}

export default Plot;