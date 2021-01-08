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
            'sub_data': []
        }

        this.updateActiveClass = this.updateActiveClass.bind(this);
        this.updateChange = this.updateChange.bind(this);
        this.updateClassColor = this.updateClassColor.bind(this);
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

    updateActiveClass = (c) => {
        this.setState({
            'activeClass': c
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
        classes.push({
            name: '',
            color: ''
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

    updateClassColor = (e, value) => {
        value.color = e
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
                        {this.state.classes.map((cls, key) => {
                            return(
                                <div key={key} className="row">
                                    <div className="col-5-sm">
                                        Class Name 
                                        <input type="text" value={this.state.classes[key].name} onChange={e => this.updateChange(e.target.value, key, 'name')}/>
                                    </div>
                                    <div className="col-3-sm">
                                        Color
                                        <input type="text" value={this.state.classes[key].color} onChange={e => this.updateChange(e.target.value, key, 'color')}/>
                                    </div>
                                    <div className="col-2-sm">
                                        <div className="plot-btn" onClick={() => this.updateActiveClass(cls)}>Plot</div>
                                    </div>
                                    <div className="col-2-sm">
                                        <div className="plot-btn red" onClick={() => this.removeClass(cls)}>X</div>
                                    </div>
                                </div>
                            )
                        })}
                        <div className="row">
                            <div className="col-12-sm" style={{textAlign: "center"}}>
                                <div className="create-class-btn" onClick={this.createClass}>
                                    Create Class
                                </div>
                            </div>
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