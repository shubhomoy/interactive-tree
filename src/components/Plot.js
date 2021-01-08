import React from 'react'
import Dataset from './Dataset'

class Plot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            'activeClass': null,
            'classes': [],
            'data': [],
            'lines': [],
            'sub_data': [],
            'colors': ['red', 'blue', 'green', '#9c27b0', '#ffc107']
        }

        this.updateActiveClass = this.updateActiveClass.bind(this);
        this.updateChange = this.updateChange.bind(this);
        this.createClass = this.createClass.bind(this);
        this.getCoord = this.getCoord.bind(this);
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

        let data = this.state.data
        if(data[i][j] !== null)
            data[i][j] = null
        else
            data[i][j] = this.state.activeClass

        this.setState({
            data: data
        })
    }

    updateActiveClass = (c, idx) => {
        let classes = this.state.classes
        if(c.name !== "") {
            classes[idx].msg = "You can now start adding data corresponding to this class in the plot"
            classes[idx].error = ""
            this.setState({
                'activeClass': c
            });
        }else{
            classes[idx].error = "Specify name first"
            classes[idx].msg = ""
        }
        this.setState({
            'classes': classes
        });
    }

    removeClass = (c) => {
        let data = this.state.data;
        for(let i=0; i<data.length; i++) {
            for(let j=0; j<data[i].length; j++) {
                if(data[i][j] !== null && data[i][j].name === c.name) {
                    data[i][j] = null;
                }
            }
        }

        let classes = this.state.classes;
        classes = classes.filter((cls) => {
            return cls.name !== c.name
        })

        this.setState({
            data: data,
            classes: classes
        })

        this.clearSplits()
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
            <div key={i + " - " + j} className={"cell " + rightBorder + " " + topBorder} onClick={() => this.getCoord(i, j)}>
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
            sub_data: data
        })
    }

    clearSplits = () => {
        this.setState({
            lines: [],
            sub_data: []
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

    render() {
        return(
            <div>
                <div className="row">
                    <div className="col-7">
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
                </div>
                {/* Eng of class and plot */}
                
                <Dataset data={this.state.data} subdata={this.state.sub_data} onSplitSelected={this.getSplits} />
                <div className="spacer"></div>
            </div>
        )
    }
}

export default Plot;