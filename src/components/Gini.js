import React from 'react'

class Gini extends React.Component {

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
        let result = 0
        classes.forEach((cls) => {
            let cls_freq = this.get_class_freq(dataset, cls)
            let cls_prob = cls_freq / dataset.length
            let gini = cls_prob * (1 - cls_prob)
            result += gini
        })

        return result
    }

    calculate_x1 = () => {
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

            let gini = (gini_left * left_data.length) + (gini_right * right_data.length)

            if(gini < this.state.min_error) {
                this.setState({min_error: gini})
            }
            result.push({
                x1_pivot: x1_pivot,
                gini: gini,
                q1: gini_left,
                q2: gini_right,
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

            let gini_top = this.get_gini(top_data)
            let gini_bottom = this.get_gini(bottom_data)

            let gini = (gini_top * top_data.length) + (gini_bottom * bottom_data.length)

            if(gini < this.state.min_error) {
                this.setState({min_error: gini})
            }
            result.push({
                x2_pivot: x2_pivot,
                gini: gini,
                q1: gini_bottom,
                q2: gini_top,
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

    render() {
        let split_x1 = this.calculate_x1()
        let split_x2 = this.calculate_x2()
        return(
            <div className="neu">
                <h3>Node {this.props.node}</h3>
                <div className="help-text">Click on the desired threshold to split the node and create a decision boundary. After every split, new nodes are added at the bottom</div>
                <table width="100%" className="split-table">
                    <tbody>
                        <tr className="table-header">
                            <td>
                                Threshold Values
                            </td>
                            <td>
                                n1
                            </td>
                            <td>
                                Q1 <br />(Left or Bottom Region)
                            </td>
                            <td>
                                n2
                            </td>
                            <td>
                                Q2 <br />(Right or Top Region)
                            </td>
                            <td>
                                GINI
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
                                            x {"<"} {s.x1_pivot}
                                        </td>
                                        <td>
                                            {s.left_data.length}
                                        </td>
                                        <td>
                                            {Math.trunc(s.q1 * 100) / 100}
                                        </td>
                                        <td>
                                            {s.right_data.length}
                                        </td>
                                        <td>
                                            {Math.trunc(s.q2 * 100) /100}
                                        </td>
                                        <td>
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
                                            y {"<"} {s.x2_pivot}
                                        </td>
                                        <td>
                                            {s.bottom_data.length}
                                        </td>
                                        <td>
                                            {Math.trunc(s.q1 * 100) / 100}
                                        </td>
                                        <td>
                                            {s.top_data.length}
                                        </td>
                                        <td>
                                            {Math.trunc(s.q2 * 100) /100}
                                        </td>
                                        <td>
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
            </div>
        )
    }
}

export default Gini;