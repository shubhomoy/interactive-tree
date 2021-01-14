import React from 'react'

class Misclassification extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            selected_split: null,
            min_error: 99999
        }
        this.setSplit = this.setSplit.bind(this)
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

    get_max_class_num = (dataset) => {
        let class_freq = {}
        let max = 0
        dataset.forEach((data) => {
            class_freq[data.class] = (class_freq[data.class] || 0) + 1
            if(class_freq[data.class] > max)
                max = class_freq[data.class]
        })
        
        return max
    }

    calculate_x1 = () => {
        let dataset = [...this.props.dataset];
        dataset = dataset.sort((a, b) => a.x1 > b.x1 ? 1 : -1)
        let x1_pivot = 0

        let result = []
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

            let missclass_left = 1 - (this.get_max_class_num(left_data) / left_data.length)
            let missclass_right = 1 - (this.get_max_class_num(right_data) / right_data.length)

            missclass_left = isNaN(missclass_left) ? 0: missclass_left
            missclass_right = isNaN(missclass_right) ? 0: missclass_right

            let missclassification = (missclass_left * left_data.length) + (missclass_right * right_data.length)
            if(missclassification < this.state.min_error) {
                this.setState({min_error: missclassification})
            }
            result.push({
                x1_pivot: x1_pivot,
                missclassification: missclassification,
                q1: missclass_left,
                q2: missclass_right,
                left_data: left_data,
                right_data: right_data
            })
        }
        return result
    }

    calculate_x2 = () => {
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

            let missclass_top = 1 - (this.get_max_class_num(top_data) / top_data.length)
            let missclass_bottom = 1 - (this.get_max_class_num(bottom_data) / bottom_data.length)

            missclass_top = isNaN(missclass_top) ? 0: missclass_top
            missclass_bottom = isNaN(missclass_bottom) ? 0: missclass_bottom

            let missclassification = (missclass_top * top_data.length) + (missclass_bottom * bottom_data.length)

            if(missclassification < this.state.min_error) {
                this.setState({min_error: missclassification})
            }
            result.push({
                x2_pivot: x2_pivot,
                missclassification: missclassification,
                q1: missclass_bottom,
                q2: missclass_top,
                top_data: top_data,
                bottom_data: bottom_data
            })
        }
        return result
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

    render() {
        let split_x1 = this.calculate_x1()
        let split_x2 = this.calculate_x2()
        return(
            <div className="neu preview-node-container">
                <h3>Node {this.props.node}</h3>
                <div className="help-text">Click on the desired threshold to split the node and create a decision boundary. After every split, new nodes are added at the bottom</div>
                <table width="100%" className="split-table" onMouseOver={() => {this.preview(this.props.subdata)}}>
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
                                Missclassification (rounded)<br />
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
                                        (this.state.selected_split!== null && this.state.selected_split.axis === "x1" && this.state.selected_split.value === s.x1_pivot) ? "table-data-selected": "table-data"} onClick={() => this.setSplit('x1', s.x1_pivot)}>
                                        <td>
                                            {s.left_data.length}
                                        </td>
                                        <td>
                                            {Math.trunc(s.q1 * 100) / 100}
                                        </td>
                                        <td className={
                                        (this.state.selected_split!== null && this.state.selected_split.axis === "x1" && this.state.selected_split.value === s.x1_pivot) ? "table-data-selected": "highlighted-column-1"}>
                                            <b>x {"<"} {s.x1_pivot}</b>
                                        </td>
                                        <td>
                                            {s.right_data.length}
                                        </td>
                                        <td>
                                            {Math.trunc(s.q2 * 100) /100}
                                        </td>
                                        <td className={
                                        (this.state.selected_split!== null && this.state.selected_split.axis === "x1" && this.state.selected_split.value === s.x1_pivot) ? "table-data-selected": "highlighted-column-2"}>
                                            {Math.trunc(s.missclassification*100) / 100}
                                        </td>
                                        <td className="recommended">
                                            {s.missclassification === this.state.min_error ? "Recommended" : null}
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
                                Missclassification (rounded)<br />
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
                                    } onClick={() => this.setSplit('x2', s.x2_pivot)}>
                                        <td>
                                            {s.bottom_data.length}
                                        </td>
                                        <td>
                                            {Math.trunc(s.q1 * 100) / 100}
                                        </td>
                                        <td className={
                                        (this.state.selected_split!== null && this.state.selected_split.axis === "x2" && this.state.selected_split.value === s.x2_pivot) ? "table-data-selected": "highlighted-column-1"}>
                                            <b>y {"<"} {s.x2_pivot}</b>
                                        </td>
                                        <td>
                                            {s.top_data.length}
                                        </td>
                                        <td>
                                            {Math.trunc(s.q2 * 100) /100}
                                        </td>
                                        <td className={
                                        (this.state.selected_split!== null && this.state.selected_split.axis === "x2" && this.state.selected_split.value === s.x2_pivot) ? "table-data-selected": "highlighted-column-2"}>
                                            {Math.trunc(s.missclassification*100) / 100}
                                        </td>
                                        <td className="recommended">
                                            {s.missclassification === this.state.min_error ? "Recommended" : null}
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                
                </table>
                <div className="spacer"></div>
            </div>
        )
    }
}

export default Misclassification;