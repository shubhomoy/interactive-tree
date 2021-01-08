import React from 'react'
import Misclassification from './Misclassification'

class Dataset extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            dataset_table_open: false,
            calculate: false,
            classes: []
        }
        this.construct_dataset = this.construct_dataset.bind(this);
        this.toggleDatasetPanel = this.toggleDatasetPanel.bind(this);
        this.clearClassification = this.clearClassification.bind(this)
    }

    toggleDatasetPanel = (e) => {
        this.setState({
            dataset_table_open: !this.state.dataset_table_open
        })
    }

    construct_dataset = () => {
        let data = []
        for(let i=0; i<this.props.data.length; i++) {
            for(let j=0; j<this.props.data[i].length; j++) {
                if(this.props.data[i][j] !== null) {
                    data.push({
                        x1: j,
                        x2: this.props.data.length - 1 - i,
                        class: this.props.data[i][j].name,
                        color: this.props.data[i][j].color
                    })

                    if(!this.state.classes.includes(this.props.data[i][j].name)) {
                        let c = this.state.classes
                        c.push(this.props.data[i][j].name)
                        this.setState({
                            classes: c
                        })
                    }
                }
            }
        }

        return data
    }

    construct_dataset_from_data = (subdata) => {
        let main_data = this.props.data
        let data = []

        for(let i=subdata.coord_1[1]; i<=subdata.coord_2[1]; i++) {
            for(let j=subdata.coord_1[0]; j<=subdata.coord_2[0]; j++) {
                if(main_data[i][j] !== null) {
                    data.push({
                        x1: j,
                        x2: this.props.data.length - 1 - i,
                        class: this.props.data[i][j].name,
                        color: this.props.data[i][j].color
                    })
                }
            }
        }

        return data
    }

    showDataset = () => {
        let dataset = this.construct_dataset()

        if(dataset.length === 0) {
            return(
                <div className="row table-header" style={{padding: "20px"}}>
                    There is no data. <br />Create class and plot in the above graph to generate dataset.
                </div>
            )
        }
        return(
            <div>
            <h2>Dataset</h2>
            <div className="row table-header">
                <div className="col-3-sm">
                    X1
                </div>
                <div className="col-3-sm">
                    X2
                </div>
                <div className="col-3-sm">
                    Class
                </div>
                <div className="col-3-sm">
                    Color
                </div>
            </div>

            <div className="horizontal-line"></div>

            {dataset.map((d, idx) => {
                return(
                    <div className="row table-data" key={idx}>
                        <div className="col-3-sm">
                            {d.x1}
                        </div>
                        <div className="col-3-sm">
                            {d.x2}
                        </div>
                        <div className="col-3-sm">
                            {d.class}
                        </div>
                        <div className="col-3-sm">
                            <div className="color" style={{backgroundColor: d.color}}></div>
                        </div>
                    </div>
                )
            })}
            <div className="spacer"></div>
            </div>
        )
    }

    getSplits = (split, sub_data) => {
        this.props.onSplitSelected(split, sub_data)
    }

    clearClassification = () => {
        this.setState({
            calculate: false
        })

        this.props.onClearClassification()
    }

    showCalculation = () => {
        if(this.state.calculate) {
            return(
                <div>
                    {
                        this.props.subdata.map((data, idx) => {
                            return(
                                <div key={idx}>
                                    <Misclassification dataset={this.construct_dataset_from_data(data)} subdata={data} onSplitSelected={this.getSplits} />
                                    <div className="spacer"></div>
                                </div>
                            )
                        })
                    }

                    <div className="row" onClick={(e)=>this.clearClassification()}>
                        <div className="col-12-sm">
                            <div className="collapsible-button-negative">Clear Classification</div>
                        </div>
                    </div>
                </div>
            )
        }
        if(this.construct_dataset().length>0) {
            if(this.state.classes.length > 1) {
                return(
                    <div className="row" onClick={(e)=>this.setState({calculate: true})}>
                        <div className="col-12-sm">
                            <div className="collapsible-button-positive">Start Classification</div>
                        </div>
                    </div>
                )
            }
        }
        
    }

    render() {
        return(
            <div>
                
                <div className="row">
                    <div className="col-12-sm">
                        <div className="collapsible-button" onClick={(e)=>this.toggleDatasetPanel(e)}>
                            {this.state.dataset_table_open ? "Hide" : "Show"} Dataset
                        </div>
                    </div>
                </div>
                <div className="neu">
                    {this.state.dataset_table_open ? this.showDataset() : null}
                </div>
                {this.state.dataset_table_open ? <div className="spacer"></div> : null}
                

                {
                    this.showCalculation()
                }
                
            </div>
            
        )
    }
}

export default Dataset