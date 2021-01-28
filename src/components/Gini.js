import React from 'react'
import MouseTooltip from 'react-sticky-mouse-tooltip';

class Gini extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            selected_split: null,
            min_error: 99999,
            tooltip: false,
            calculation: '',
            split_x1: [],
            split_x2: []
        }
        this.setSplit = this.setSplit.bind(this)
    }

    componentDidMount() {
        let xsplit = this.calculate_x1(9999)
        let ysplit = this.calculate_x2(xsplit[1])
        this.setState({
            split_x1: xsplit[0],
            split_x2: ysplit[0],
            min_error: ysplit[1]
        })
    }

    get_top = (pivot, dataset) => {
        let data = []
        for(let i=0; i<dataset.length; i++) {
            if(dataset[i].x2 > pivot) {
                data.push(dataset[i])
            }
        }

        return data;
    }

    get_bottom = (pivot, dataset) => {
        let data = []
        for(let i=0; i<dataset.length; i++) {
            if(dataset[i].x2 < pivot) {
                data.push(dataset[i])
            }
        }

        return data;
    }

    get_left = (pivot, dataset) => {
        let data = []
        for(let i=0; i<dataset.length; i++) {
            if(dataset[i].x1 < pivot) {
                data.push(dataset[i])
            }
        }

        return data;
    }

    get_right = (pivot, dataset) => {
        let data = []
        for(let i=0; i<dataset.length; i++) {
            if(dataset[i].x1 > pivot) {
                data.push(dataset[i])
            }
        }
        return data;
    }

    get_class_freq = (dataset, cls) => {
        let num = 0
        dataset.forEach((data) => {
            if(data.class === cls) {
                num += 1
            }
        })
        return num
    }

    get_classes = (dataset) => {
        let classes = []
        dataset.forEach((data) => {
            if(!classes.includes(data.class)) {
                classes.push(data.class)
            }
        })

        return classes
    }

    get_gini = (dataset) => {
        let classes = this.get_classes(dataset)
        let result = {
            calculation: '',
            result: 0
        }
        classes.forEach((cls) => {
            let cls_freq = this.get_class_freq(dataset, cls)
            let cls_prob = cls_freq / dataset.length
            let gini = cls_prob * (1 - cls_prob)
            result.calculation += '(' + cls_freq + "/" + dataset.length + " * " + (dataset.length-cls_freq) + "/" + dataset.length + ') + '
            result.result += gini
        })

        result.calculation = result.calculation.substring(0, result.calculation.length - 3)
        result.calculation += " = " + Math.trunc(result.result * 100) / 100

        return result
    }

    calculate_x1 = (min_error) => {
        // Sort the dataset increasing order of x-coord
        let dataset = [...this.props.dataset];
        dataset = dataset.sort((a, b) => a.x1 > b.x1 ? 1 : -1)
        let x1_pivot = 0

        let result = []

        // For each x-coord split, calculate the left and right dataset errors
        for(let i=0; i<dataset.length; i++) {
            x1_pivot = dataset[i].x1 + 0.5
            
            // Check if already threshold has been calculated or not
            let exists = false
            for(let i=0; i<result.length; i++) {
                if(result[i].x1_pivot === x1_pivot) {
                    exists = true;
                    break;
                }
            }
            if(exists)
                continue

            let left_data = this.get_left(x1_pivot, dataset)
            let right_data = this.get_right(x1_pivot, dataset)


            let gini_left = this.get_gini(left_data)
            let gini_right = this.get_gini(right_data)

            let gini = (gini_left.result * left_data.length) + (gini_right.result * right_data.length)

            if(gini < min_error) {
                min_error = gini
            }

            result.push({
                x1_pivot: x1_pivot,
                gini: gini,
                q1: gini_left.result,
                q2: gini_right.result,
                left_data: left_data,
                right_data: right_data,
                calculation_left: gini_left.calculation,
                calculation_right: gini_right.calculation,

                preview_line: {
                    left: (x1_pivot + 0.5)*10 + "px",
                    top: this.props.subdata.coord_1[1] * 10 + 'px',
                    height: (this.props.subdata.coord_2[1] + 1)*10 - this.props.subdata.coord_1[1] * 10 + 'px',
                    width: '0px'
                }
            })
        }
        return [result, min_error]
    }

    calculate_x2 = (min_error) => {
        let dataset = [...this.props.dataset];
        dataset = dataset.sort((a, b) => a.x2 > b.x2 ? 1 : -1)
        let x2_pivot = 0

        let result = []
        for(let i=0; i<dataset.length; i++) {
            x2_pivot = dataset[i].x2 + 0.5

            // Check if already threshold has been calculated or not
            let exists = false
            for(let i=0; i<result.length; i++) {
                if(result[i].x2_pivot === x2_pivot) {
                    exists = true;
                    break;
                }
            }
            if(exists)
                continue

            let top_data = this.get_top(x2_pivot, dataset)
            let bottom_data = this.get_bottom(x2_pivot, dataset)

            let gini_top = this.get_gini(top_data)
            let gini_bottom = this.get_gini(bottom_data)

            let gini = (gini_top.result * top_data.length) + (gini_bottom.result * bottom_data.length)

            if(gini < min_error) {
                min_error = gini
            }
            result.push({
                x2_pivot: x2_pivot,
                gini: gini,
                q1: gini_bottom.result,
                q2: gini_top.result,
                top_data: top_data,
                bottom_data: bottom_data,
                calculation_bottom: gini_bottom.calculation,
                calculation_top: gini_top.calculation,

                preview_line: {
                    left: this.props.subdata.coord_1[0] * 10 + "px",
                    top: (39 - x2_pivot + 0.5)*10 + 'px',
                    height: '0px',
                    width: ((this.props.subdata.coord_2[0] + 1) * 10) - (this.props.subdata.coord_1[0]*10) + 'px'
                }
            })
        }
        return [result, min_error]
    }

    setSplit = (x, val) => {
        if(this.state.selected_split !== null && !this.props.clearSplitState) {
            return
        }
        if(this.props.clearSplitState) {
            this.props.onUpdateClearSplitState()
        }

        let selected_split = {
            'axis': x,
            'value': val
        }
        this.setState({
            selected_split: selected_split
        })

        this.props.onSplitSelected(selected_split, this.props.subdata)
    }

    preview = (subdata) => {
        this.props.onPreview(subdata)
    }

    showToolTip = (text) => {
        this.setState({
            tooltip: true,
            calculation: text
        })
    }

    hideToolTip = () => {
        this.setState({
            tooltip: false,
            calculation: ''
        })
    }

    render() {
        let split_x1 = this.state.split_x1
        let split_x2 = this.state.split_x2
        return(
            <div className="neu preview-node-container" onMouseOver={() => {this.preview(this.props.subdata)}} onMouseOut={() => this.props.onClearPreview()}>
                <h3>Node {this.props.node}</h3>
                <div className="help-text">Click on the desired threshold to split the node and create a decision boundary. After every split, new nodes are added at the bottom</div>
                <table width="100%" className="split-table">
                    <tbody>
                        <tr className="table-header">
                            <td>
                                n1
                            </td>
                            <td>
                                Q1 <br />(Left Region)
                            </td>
                            <td className="highlighted-column-1">
                                Threshold
                            </td>
                            <td>
                                n2
                            </td>
                            <td>
                                Q2 <br />(Right Region)
                            </td>
                            <td className="highlighted-column-2">
                                GINI (rounded)<br />
                                n1*Q1 + n2*Q2
                            </td>
                            <td></td>
                        </tr>
                        
                        {
                            split_x1.map((s, idx) => {
                                if(isNaN(s.q1))
                                    s.q1 = 0
                                if(isNaN(s.q2))
                                    s.q2 = 0
                                return(
                                    <tr key={idx} className={
                                        (this.state.selected_split!== null && this.state.selected_split.axis === "x1" && this.state.selected_split.value === s.x1_pivot) ? "table-data-selected": "table-data"} onClick={() => this.setSplit('x1', s.x1_pivot)}
                                        onMouseOver={() => this.props.onPreviewSplit(s.preview_line)}>
                                        <td>
                                            {s.left_data.length}
                                        </td>
                                        <td onMouseOver={() => {this.showToolTip(s.calculation_left)}} onMouseOut={() => this.hideToolTip()}>
                                            {Math.trunc(s.q1 * 100) / 100}
                                        </td>
                                        <td className={
                                        (this.state.selected_split!== null && this.state.selected_split.axis === "x1" && this.state.selected_split.value === s.x1_pivot) ? "table-data-selected": "highlighted-column-1"}>
                                            <b>x {"<"} {s.x1_pivot}</b>
                                        </td>
                                        <td>
                                            {s.right_data.length}
                                        </td>
                                        <td onMouseOver={() => {this.showToolTip(s.calculation_right)}} onMouseOut={() => this.hideToolTip()}>
                                            {Math.trunc(s.q2 * 100) /100}
                                        </td>
                                        <td className={
                                        (this.state.selected_split!== null && this.state.selected_split.axis === "x1" && this.state.selected_split.value === s.x1_pivot) ? "table-data-selected": "highlighted-column-2"}>
                                            {Math.trunc(s.gini*100) / 100}
                                        </td>
                                        <td className="recommended">
                                            {s.gini === this.state.min_error ? "Recommended" : null}
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        <tr>
                            <td colSpan="7">
                                <hr className="dashed-line" />
                            </td>
                        </tr>
                        <tr className="table-header">
                            <td>
                                n1
                            </td>
                            <td>
                                Q1 <br />(Bottom Region)
                            </td>
                            <td className="highlighted-column-1">
                                Threshold
                            </td>
                            <td>
                                n2
                            </td>
                            <td>
                                Q2 <br />(Top Region)
                            </td>
                            <td className="highlighted-column-2">
                                GINI  (rounded)<br />
                                n1*Q1 + n2*Q2
                            </td>
                            <td></td>
                        </tr>
                        

                        {
                            split_x2.map((s, idx) => {
                                if(isNaN(s.q1))
                                    s.q1 = 0
                                if(isNaN(s.q2))
                                    s.q2 = 0
                                return(
                                    <tr key={idx} className={
                                        (this.state.selected_split!== null && this.state.selected_split.axis === "x2" && this.state.selected_split.value === s.x2_pivot) ? "table-data-selected": "table-data"
                                    } onClick={() => this.setSplit('x2', s.x2_pivot)} onMouseOver={() => this.props.onPreviewSplit(s.preview_line)}>
                                        <td>
                                            {s.bottom_data.length}
                                        </td>
                                        <td onMouseOver={() => {this.showToolTip(s.calculation_bottom)}} onMouseOut={() => this.hideToolTip()}>
                                            {Math.trunc(s.q1 * 100) / 100}
                                        </td>
                                        <td className={
                                        (this.state.selected_split!== null && this.state.selected_split.axis === "x2" && this.state.selected_split.value === s.x2_pivot) ? "table-data-selected": "highlighted-column-1"}>
                                            <b>y {"<"} {s.x2_pivot}</b>
                                        </td>
                                        <td>
                                            {s.top_data.length}
                                        </td>
                                        <td onMouseOver={() => {this.showToolTip(s.calculation_top)}} onMouseOut={() => this.hideToolTip()}>
                                            {Math.trunc(s.q2 * 100) /100}
                                        </td>
                                        <td className={
                                        (this.state.selected_split!== null && this.state.selected_split.axis === "x2" && this.state.selected_split.value === s.x2_pivot) ? "table-data-selected": "highlighted-column-2"}>
                                            {Math.trunc(s.gini*100) / 100}
                                        </td>
                                        <td className="recommended">
                                            {s.gini === this.state.min_error ? "Recommended" : null}
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                
                </table>
                <div className="spacer"></div>
                <MouseTooltip
                        className="tooltip"
                        visible={this.state.tooltip}
                        offsetX={15}
                        offsetY={10}>
                        <span>{this.state.calculation}</span>
                </MouseTooltip>
            </div>
        )
    }
}

export default Gini;