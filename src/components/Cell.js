import React from 'react'
import MouseTooltip from 'react-sticky-mouse-tooltip';

class Cell extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            tooltip: false,
            current_coord: ''
        }
    }

    showToolTip = () => {
        if(this.state.tooltip) {
            return(
                <div>
                    sdfds
                </div>
                // <MouseTooltip
                //     className="tooltip"
                //     visible={true}
                //     offsetX={15}
                //     offsetY={10}>
                //     <span>{this.state.current_coord}</span>
                // </MouseTooltip>
            )
        }
    }

    render() {
        return(
            <div>
                <div 
                key={this.props.value} 
                className={"cell " + this.props.rightBorder + " " + this.props.topBorder} 
                onClick={() => this.getCoord(this.props.i, this.props.j)} 
                onMouseOver={(e) => this.setState({tooltip: true, current_coord: "x=" + this.props.j + ", y=" + (39-this.props.i)})}
                onMouseOut={(e) => this.setState({tooltip: false})}
            >
                {this.props.cell ? <div className="assigned" style={{backgroundColor: this.props.cell.color}}></div> : ''}
                </div>

                {this.showToolTip()}                
            </div>
            
        )
    }
}

export default Cell