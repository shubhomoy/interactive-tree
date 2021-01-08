import React from 'react'

class Misclassification extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            selected_split: null
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

            let left_data = this.get_left(x1_pivot, dataset)
            let right_data = this.get_right(x1_pivot, dataset)

            let missclass_left = 1 - (this.get_max_class_num(left_data) / left_data.length)
            let missclass_right = 1 - (this.get_max_class_num(right_data) / right_data.length)

            missclass_left = isNaN(missclass_left) ? 0: missclass_left
            missclass_right = isNaN(missclass_right) ? 0: missclass_right

            let missclassification = (missclass_left * left_data.length) + (missclass_right * right_data.length)

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

            let top_data = this.get_top(x2_pivot, dataset)
            let bottom_data = this.get_bottom(x2_pivot, dataset)

            let missclass_top = 1 - (this.get_max_class_num(top_data) / top_data.length)
            let missclass_bottom = 1 - (this.get_max_class_num(bottom_data) / bottom_data.length)

            missclass_top = isNaN(missclass_top) ? 0: missclass_top
            missclass_bottom = isNaN(missclass_bottom) ? 0: missclass_bottom

            let missclassification = (missclass_top * top_data.length) + (missclass_bottom * bottom_data.length)

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
                <div className="row table-header">
                    <div className="col-3">
                        Threshold
                    </div>
                    <div className="col-3">
                        Q1
                    </div>
                    <div className="col-3">
                        Q2
                    </div>
                    <div className="col-3">
                        Total Missclassification
                    </div>
                </div>

                <div className="horizontal-line"></div>

                {
                    split_x1.map((s, idx) => {
                        if(isNaN(s.q1))
                            s.q1 = 0
                        if(isNaN(s.q2))
                            s.q2 = 0
                        return(
                            <div key={idx} className="row table-data" onClick={() => this.setSplit('x1', s.x1_pivot)}>
                                <div className="col-3">
                                    x1 {"<"} {s.x1_pivot}
                                </div>
                                <div className="col-3">
                                    {Math.trunc(s.q1 * 100) / 100}
                                </div>
                                <div className="col-3">
                                    {Math.trunc(s.q2 * 100) /100}
                                </div>
                                <div className="col-3">
                                    {Math.trunc(s.missclassification*100) / 100}
                                </div>
                            </div>
                        )
                    })
                }

                <hr className="dashed-line" />

                {
                    split_x2.map((s, idx) => {
                        if(isNaN(s.q1))
                            s.q1 = 0
                        if(isNaN(s.q2))
                            s.q2 = 0
                        return(
                            <div key={idx} className="row table-data" onClick={() => this.setSplit('x2', s.x2_pivot)}>
                                <div className="col-3">
                                    x2 {"<"} {s.x2_pivot}
                                </div>
                                <div className="col-3">
                                    {Math.trunc(s.q1 * 100) / 100}
                                </div>
                                <div className="col-3">
                                    {Math.trunc(s.q2 * 100) /100}
                                </div>
                                <div className="col-3">
                                    {Math.trunc(s.missclassification*100) / 100}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

export default Misclassification;