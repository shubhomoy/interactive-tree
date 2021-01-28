import React from 'react'
import Dataset from './Dataset'
import Footer from './Footer'
import MouseTooltip from 'react-sticky-mouse-tooltip';
import {Animated} from 'react-animated-css'
import Cell from './Cell';


class Plot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            'data': [],
            'lines': [],
            'sub_data': [],
            'dataset': [],
            'clear_split': false,
            'num_data': 0,
            'announcement': null,
            'tooltip': false,
            'current_coord': null,
            'showMoreNodesPopup': false,
            'preview_left': '0px',
            'preview_top': '0px',
            'preview_width': '0px',
            'preview_height': '0px',

            'preview_line_top': '0px',
            'preview_line_left': '0px',
            'preview_line_height': '0px',
            'preview_line_width': '0px',
        }

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
        if(this.props.classes.length === 0)
            return

        let data = [...this.props.data]
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
            data[i][j] = this.props.activeClass
            num_data += 1
        }
            
        this.setState({
            num_data: num_data
        })

        // this.construct_dataset()
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

    updateToolTip = (visible, coord) => {
        this.setState({
            tooltip: visible,
            coord: coord
        })
    }

    draw_cell = (i, j, cell) => {
        console.log(cell)
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
            <Cell key={i + " - " + j} i={i} j={j} rightBorder={rightBorder} topBorder={topBorder} />
            // <div key={i + " - " + j} className={"cell " + rightBorder + " " + topBorder} onClick={() => this.getCoord(i, j)} 
            //     onMouseOver={(e) => this.setState({tooltip: true, current_coord: "x=" + j + ", y=" + (39-i)})}
            //     onMouseOut={(e) => this.setState({tooltip: false})}>
            //     {cell ? <div className="assigned" style={{backgroundColor: cell.color}}></div> : ''}
            // </div>
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
            clear_split: true,
            preview_height: '0px',
            preview_width: '0px',
            preview_left: '0px',
            preview_top: '0px'
        })
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

    showNodePopup = () => {
        return(
            <div className="popup-message-container row">
                <div className="col-3"></div>
                <Animated animationIn="bounceInUp" animationOut="bounceOutDown" isVisible={this.state.showMoreNodesPopup}>
                <div className="popup-message col-6">
                    Split has been made in the plot and more nodes are added at the bottom!
                </div>
                </Animated>
                <div className="col-3"></div>
            </div>
        )
    }

    previewSplit = (subdata) => {
        this.setState({
            preview_left: subdata.coord_1[0] * 10 + 'px',
            preview_top: subdata.coord_1[1] * 10 + 'px',
            preview_width: (subdata.coord_2[0] + 1)*10 - subdata.coord_1[0] * 10 + 'px',
            preview_height: (subdata.coord_2[1] + 1)*10 - subdata.coord_1[1] * 10 + 'px'
        })
    }

    previewSplitLine = (preview_line) => {
        // this.setState({
        //     preview_line_left: preview_line.left,
        //     preview_line_top: preview_line.top,
        //     preview_line_height: preview_line.height,
        //     preview_line_width: preview_line.width
        // })
        // if(axis === 'x') {
        //     let pivot = split.x1_pivot
        //     this.setState({
        //         preview_line_left: (pivot + 0.5)*10 + "px",
        //         preview_line_top: subdata.coord_1[1] * 10 + 'px',
        //         preview_line_height: (subdata.coord_2[1] + 1)*10 - subdata.coord_1[1] * 10 + 'px',
        //         preview_line_width: '0px'
        //     })
        // }else {
        //     let pivot = split.x2_pivot
        //     this.setState({
        //         preview_line_left: subdata.coord_1[0] * 10 + "px",
        //         preview_line_top: (39 - pivot + 0.5)*10 + 'px',
        //         preview_line_height: '0px',
        //         preview_line_width: ((subdata.coord_2[0] + 1) * 10) - (subdata.coord_1[0]*10) + 'px'
        //     })
        // }
    }

    clearPreview = () => {
        this.setState({
            'preview_left': '0px',
            'preview_top': '0px',
            'preview_width': '0px',
            'preview_height': '0px',

            'preview_line_top': '0px',
            'preview_line_left': '0px',
            'preview_line_height': '0px',
            'preview_line_width': '0px'
        })
    }

    render() {
        return(
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
                    <div className="preview-container">
                        <div className="preview-line" style={{left: this.state.preview_line_left, top: this.state.preview_line_top, width: this.state.preview_line_width, height: this.state.preview_line_height}}></div>
                        <div className="preview-overlay" style={{left: this.state.preview_left, top: this.state.preview_top, width: this.state.preview_width, height: this.state.preview_height}}></div>
                    </div>
                    
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
        )
    }
}

export default Plot;